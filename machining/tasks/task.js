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

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeTaskView() {
    if (!guardRoute()) {
        return;
    }
    
    initNavbar();
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        navigateTo(ROUTES.MACHINING);
        return;
    }
    let issue = await fetchTaskDetails(taskKey);
    const activeTimer = await getActiveTimer(taskKey);
    setCurrentIssueState(issue);
    setCurrentTimerState(activeTimer);
    await setCurrentMachineState();
    setupTaskDisplay(activeTimer);
    setupAllHandlers();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskView); 