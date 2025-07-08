// --- task.js ---
// Entry point for task page - initialization and coordination

import { initNavbar } from '../../components/navbar.js';
import { guardRoute, navigateTo, ROUTES } from '../../authService.js';
import { 
    getTaskKeyFromURL, 
    fetchTaskDetails,
    getActiveTimer
} from './taskApi.js';
import { 
    setCurrentIssueState,
    setCurrentTimerState,
    setCurrentMachineState
} from './taskState.js';
import { 
    setupTaskDisplay
} from './taskUI.js';
import { setupAllHandlers } from './taskHandlers.js';
import { handleSoftReload } from './taskLogic.js';
import { state } from '../machiningService.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeTaskView() {
    if (!guardRoute()) {
        return;
    }
    
    initNavbar();
    window.addEventListener('softReload', handleSoftReload);
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        navigateTo(ROUTES.MACHINING);
        return;
    }
    let issue = await fetchTaskDetails(taskKey);
    const hasActiveTimer = await getActiveTimer(taskKey);
    setCurrentIssueState(issue);
    setCurrentTimerState(hasActiveTimer);
    setCurrentMachineState();

    setupTaskDisplay(hasActiveTimer);
    setupAllHandlers(hasActiveTimer);
    console.log(state);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskView); 