// --- taskActions.js ---
// Button action handlers for task functionality

import { state, logTimeToJiraShared } from '../machiningService.js';
import { navigateTo, ROUTES } from '../../authService.js';
import { markTaskAsDone } from './taskApi.js';
import { showManualTimeModal, createFaultReportModal } from '../../components/taskTimerModals.js';
import { checkMachineMaintenance, createManualTimeEntry } from './taskApi.js';
import { handleStartTimer, handleStopTimer } from './taskLogic.js';

async function checkMaintenanceAndAlert() {
    if (await checkMachineMaintenance(state.currentMachine.id)) {
        alert('Bu makine bakımda. İşlem yapamazsınız.');
        navigateTo(ROUTES.MACHINING);
        return true;
    }
    return false;
}

export async function handleStartStopClick() {
    if (state.currentMachine.is_under_maintenance) {
        alert('Bu makine bakımda. İşlem yapamazsınız.');
        navigateTo(ROUTES.MACHINING);
        return;
    }
    if (!state.currentMachine.has_active_timer) {
        await handleStartTimer();
    } else {
        await handleStopTimer(save_to_jira=true);
    }
}

export async function handleStopOnlyClick() {
    await handleStopTimer(false);
}

export async function handleMarkDoneClick() {
    if (await checkMaintenanceAndAlert()) return;
    
    if (!confirm(`${state.currentIssue.quantity} adetin hepsini tamamladınız mı?`)) {
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


export async function handleManualLogClick() {
    if (await checkMaintenanceAndAlert()) return;
    
    await showManualTimeModal({createManualTimeEntry, logTimeToJiraShared});
}


export async function handleFaultReportClick() {
    if (!state.currentMachine.id) {
        navigateTo(ROUTES.MACHINING);
        return;
    }
    await createFaultReportModal(state.currentMachine.id);
}

export function handleBackClick() {
    if (state.timerActive) {
        if (!confirm("Zamanlayıcı aktif. Geri dönmek istediğinize emin misiniz?")) {
            return;
        }
        clearInterval(state.intervalId);
        setInactiveTimerUI();
    }
    navigateTo(ROUTES.MACHINING);
} 