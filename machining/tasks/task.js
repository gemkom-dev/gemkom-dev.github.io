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
    setCurrentTimerState
} from './taskState.js';
import { 
    setupTaskDisplay
} from './taskUI.js';
import { setupAllHandlers } from './taskHandlers.js';
import { handleSoftReload } from './taskLogic.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeTaskView() {
    if (!guardRoute()) {
        return;
    }
    
    initNavbar();
    
    // Set up soft reload listener
    window.addEventListener('softReload', handleSoftReload);
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        navigateTo(ROUTES.MACHINING);
        return;
    }
    

    let issue = await fetchTaskDetails(taskKey);
    setCurrentIssueState(issue);

    const hasActiveTimer = await getActiveTimer(taskKey);
    setCurrentTimerState(hasActiveTimer);
    
    // Setup UI
    setupTaskDisplay(hasActiveTimer);
    
    // Setup handlers based on timer state
    setupAllHandlers(hasActiveTimer);
        
    // } catch (error) {
    //     console.error('Error initializing task view:', error);
    //     alert('Task not found');
    //     navigateTo(ROUTES.MACHINING);
    // }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskView); 