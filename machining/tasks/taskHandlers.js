// --- taskHandlers.js ---
// Timer event handlers for task functionality

import { state, saveTimerState, stopTimerShared, logTimeToJiraShared } from '../machiningService.js';
import { syncServerTime, getSyncedNow } from '../../timeService.js';
import { navigateTo, ROUTES } from '../../authService.js';
import { startTimer, markTaskAsDone, logManualTime, performSoftReload } from './taskLogic.js';
import { getUIElements, setActiveTimerUI, setInactiveTimerUI, updateTimerDisplay } from './taskUI.js';

// ============================================================================
// TIMER EVENT HANDLERS
// ============================================================================

export function setupStartStopHandler() {
    const { startBtn } = getUIElements();
    
    startBtn.onclick = async () => {
        if (!state.timerActive) {
            await syncServerTime();
            // Start timer
            state.startTime = getSyncedNow();
            state.timerActive = true;
            setActiveTimerUI();
            state.intervalId = setInterval(updateTimerDisplay, 1000);
            saveTimerState();
            
            try {
                const startData = await startTimer();
                state.currentTimerId = startData.id;
            } catch (error) {
                console.error('Error starting timer:', error);
                alert("Zamanlayıcı başlatılırken hata oluştu.");
            }
        } else {
            // Stop timer and log to Jira
            clearInterval(state.intervalId);
            let elapsed = Math.round((getSyncedNow() - state.startTime) / 1000);
            if (elapsed < 60) elapsed = 60;
            
            state.finish_time = getSyncedNow();
            state.timerActive = false;
            startBtn.disabled = true;
            startBtn.textContent = 'İşleniyor...';
            saveTimerState();
            
            try {
                stopTimerShared({ timerId: state.currentTimerId, finishTime: state.finish_time, syncToJira: true });
                const logged = await logTimeToJiraShared({ issueKey: state.currentIssueKey, baseUrl: state.base, startTime: state.startTime, elapsedSeconds: elapsed });
                
                if (logged) {
                    // Reset UI immediately after successful stop
                    setInactiveTimerUI();
                    await performSoftReload();
                } else {
                    alert("Hata oluştu. Lütfen tekrar deneyin.");
                    setInactiveTimerUI();
                }
            } catch (error) {
                console.error('Error stopping timer:', error);
                alert("Hata oluştu. Lütfen tekrar deneyin.");
                setInactiveTimerUI();
            }
        }
    };
}

export function setupStopOnlyHandler() {
    const { stopOnlyBtn } = getUIElements();
    
    stopOnlyBtn.onclick = async () => {
        state.timerActive = false;
        clearInterval(state.intervalId);
        setInactiveTimerUI();
        
        try {
            await stopTimerShared({ timerId: state.currentTimerId, finishTime: getSyncedNow(), syncToJira: false });
            // UI is already reset above, just perform soft reload
            await performSoftReload();
        } catch (error) {
            console.error('Error stopping timer:', error);
            alert("Zamanlayıcı durdurulurken hata oluştu.");
        }
    };
}

export function setupBackHandler() {
    const { backBtn } = getUIElements();
    
    backBtn.onclick = () => {
        if (state.timerActive) {
            if (!confirm("Zamanlayıcı aktif. Geri dönmek istediğinize emin misiniz?")) {
                return;
            }
            clearInterval(state.intervalId);
            setInactiveTimerUI();
        }
        navigateTo(ROUTES.MACHINING);
    };
}

export function setupManualLogHandler() {
    const { manualBtn } = getUIElements();
    
    manualBtn.onclick = async () => {
        await logManualTime();
    };
}

export function setupMarkDoneHandler() {
    const { doneBtn } = getUIElements();
    
    doneBtn.onclick = async () => {
        if (!confirm(`${state.selectedIssue.customfield_10187} adetin hepsini tamamladınız mı?`)) {
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
    };
}

// ============================================================================
// TIMER SETUP
// ============================================================================

export function setupTimerHandlers(restoring = false) {
    if (restoring) {
        state.startTime = parseInt(state.startTime);
        state.timerActive = true;
        updateTimerDisplay();
        state.intervalId = setInterval(updateTimerDisplay, 1000);
        setActiveTimerUI();
    } else {
        setInactiveTimerUI();
        state.timerActive = false;
        state.startTime = null;
        saveTimerState();
    }
    
    // Setup all event handlers
    setupStartStopHandler();
    setupStopOnlyHandler();
    setupBackHandler();
    setupManualLogHandler();
    setupMarkDoneHandler();
} 