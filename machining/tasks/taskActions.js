// --- taskActions.js ---
// Button action handlers for task functionality

import { state, stopTimerShared, logTimeToJiraShared } from '../machiningService.js';
import { syncServerTime, getSyncedNow } from '../../timeService.js';
import { navigateTo, ROUTES } from '../../authService.js';
import { startTimer, markTaskAsDone } from './taskApi.js';
import { showManualTimeModal, createFaultReportModal } from '../../components/taskTimerModals.js';
import { updateTimerDisplay } from './taskUI.js';
import { performSoftReload } from './taskState.js';
import { TimerWidget } from '../../components/timerWidget.js';
import { checkMachineMaintenance, createManualTimeEntry, getMachine } from './taskApi.js';

// ============================================================================
// MAINTENANCE CHECKING
// ============================================================================

async function checkMaintenanceAndAlert() {
    if (await checkMachineMaintenance(state.currentMachine.id)) {
        alert('Bu makine bakımda. İşlem yapamazsınız.');
        navigateTo(ROUTES.MACHINING);
        return true;
    }
    return false;
}

// ============================================================================
// TIMER ACTIONS
// ============================================================================

export function setupStartStopHandler() {
    const startBtn = document.getElementById('start-stop');
    
    // Remove any existing listeners to prevent duplicates
    startBtn.removeEventListener('click', handleStartStopClick);
    
    // Add new event listener
    startBtn.addEventListener('click', handleStartStopClick);
}

async function handleStartStopClick() {
    const machine = await getMachine(state.currentMachine.id);
    if (machine.is_under_maintenance) {
        alert('Bu makine bakımda. İşlem yapamazsınız.');
        navigateTo(ROUTES.MACHINING);
        return;
    }
    setupTaskDisplay(machine.has_active_timer);
    if (!machine.has_active_timer) {
        await handleStartTimer();
    } else {
        await handleStopTimer();
    }
}

async function handleStartTimer() {
    try {
        state.intervalId = setInterval(updateTimerDisplay, 1000);
        await startTimer();
        TimerWidget.triggerUpdate();
        
    } catch (error) {
        console.error('Error starting timer:', error);
        alert("Zamanlayıcı başlatılırken hata oluştu.");
    }
}

async function handleStopTimer() {
    const startBtn = document.getElementById('start-stop');
    
    // Stop timer and log to Jira
    clearInterval(state.intervalId);
    let elapsed = Math.round((getSyncedNow() - state.startTime) / 1000);
    if (elapsed < 60) elapsed = 60;
    
    state.timerActive = false;
    startBtn.disabled = true;
    startBtn.textContent = 'İşleniyor...';
    
    try {
        const stopSuccess = await stopTimerShared({ 
            timerId: state.currentTimer.id, 
            finishTime: getSyncedNow(),
            syncToJira: true 
        });
        
        if (stopSuccess) {
            const logged = await logTimeToJiraShared({ 
                issueKey: state.currentIssue.key,
                startTime: state.startTime, 
                elapsedSeconds: elapsed 
            });
            
            if (logged) {
                
                // Trigger timer widget update
                TimerWidget.triggerUpdate();
                
                await performSoftReload();
            } else {
                alert("Hata oluştu. Lütfen tekrar deneyin.");
            }
        } else {
            alert("Zamanlayıcı durdurulamadı.");
        }
    } catch (error) {
        console.error('Error stopping timer:', error);
        alert("Hata oluştu. Lütfen tekrar deneyin.");
    }
}

export function setupStopOnlyHandler() {
    const stopOnlyBtn = document.getElementById('stop-only-button');
    
    // Remove any existing listeners to prevent duplicates
    stopOnlyBtn.removeEventListener('click', handleStopOnlyClick);
    
    // Add new event listener
    stopOnlyBtn.addEventListener('click', handleStopOnlyClick);
}

async function handleStopOnlyClick() {
    if (await checkMaintenanceAndAlert()) return;
    
    state.timerActive = false;
    clearInterval(state.intervalId);
    setInactiveTimerUI();
    
    try {
        const success = await stopTimerShared({ 
            timerId: state.currentTimer.id, 
            finishTime: getSyncedNow(), 
            syncToJira: false 
        });
        
        if (success) {
            // Trigger timer widget update
            TimerWidget.triggerUpdate();
            
            // UI is already reset above, just perform soft reload
            await performSoftReload();
        } else {
            alert("Zamanlayıcı durdurulamadı.");
        }
    } catch (error) {
        console.error('Error stopping timer:', error);
        alert("Zamanlayıcı durdurulurken hata oluştu.");
    }
}

// ============================================================================
// TASK ACTIONS
// ============================================================================

export function setupMarkDoneHandler() {
    const doneBtn = document.getElementById('mark-done-button');
    
    // Remove any existing listeners to prevent duplicates
    doneBtn.removeEventListener('click', handleMarkDoneClick);
    
    // Add new event listener
    doneBtn.addEventListener('click', handleMarkDoneClick);
}

async function handleMarkDoneClick() {
    if (await checkMaintenanceAndAlert()) return;
    
    if (!confirm(`${state.currentIssue.customfield_10187} adetin hepsini tamamladınız mı?`)) {
        return;
    }
    
    try {
        const marked = await markTaskAsDone();
        if (marked) {
            alert('Görev tamamlandı olarak işaretlendi.');
            navigateTo(ROUTES.MACHINING);
        } else {
            alert("Hata oluştu. Lütfen tekrar deneyin.");
        }
    } catch (error) {
        console.error('Error marking as done:', error);
        alert("Hata oluştu. Lütfen tekrar deneyin.");
    }
}

export function setupManualLogHandler() {
    const manualBtn = document.getElementById('manual-log-button');
    
    // Remove any existing listeners to prevent duplicates
    manualBtn.removeEventListener('click', handleManualLogClick);
    
    // Add new event listener
    manualBtn.addEventListener('click', handleManualLogClick);
}

async function handleManualLogClick() {
    if (await checkMaintenanceAndAlert()) return;
    
    await showManualTimeModal({createManualTimeEntry, logTimeToJiraShared});
}

export function setupFaultReportHandler() {
    const faultBtn = document.getElementById('fault-report-button');
    
    // Remove any existing listeners to prevent duplicates
    faultBtn.removeEventListener('click', handleFaultReportClick);
    
    // Add new event listener
    faultBtn.addEventListener('click', handleFaultReportClick);
}

async function handleFaultReportClick() {
    await createFaultReportModal();
}

export function setupBackHandler() {
    const backBtn = document.getElementById('back-button');
    
    // Remove any existing listeners to prevent duplicates
    backBtn.removeEventListener('click', handleBackClick);
    
    // Add new event listener
    backBtn.addEventListener('click', handleBackClick);
}

function handleBackClick() {
    if (state.timerActive) {
        if (!confirm("Zamanlayıcı aktif. Geri dönmek istediğinize emin misiniz?")) {
            return;
        }
        clearInterval(state.intervalId);
        setInactiveTimerUI();
    }
    navigateTo(ROUTES.MACHINING);
} 