// --- task.js ---
// Entry point for task page - only DOM event listeners and initialization

import { state, restoreTimerState } from '../machiningService.js';
import { syncServerTime } from '../../timeService.js';
import { initNavbar } from '../../components/navbar.js';
import { guardRoute, navigateTo, ROUTES } from '../../authService.js';
import { 
    getTaskKeyFromURL, 
    fetchTaskDetails, 
    getActiveTimer,
    performSoftReload
} from './taskLogic.js';
import { 
    setupTaskInfoDisplay, 
    setActiveTimerUI, 
    setInactiveTimerUI 
} from './taskUI.js';
import { setupTimerHandlers } from './taskHandlers.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeTaskView() {
    if (!guardRoute()) {
        return;
    }
    initNavbar();
    
    // Set up soft reload listener
    window.addEventListener('softReload', async () => {
        try {
            const timerRestored = await performSoftReload(false); // Don't reset UI here, we'll handle it below
            if (timerRestored) {
                setupTaskInfoDisplay();
                setupTimerHandlers(true);
            } else {
                // No timer was restored, reset UI to inactive state
                setInactiveTimerUI();
                setupTimerHandlers(false);
            }
        } catch (error) {
            console.error('Error during soft reload:', error);
            // Fallback to full page reload if soft reload fails
            window.location.reload();
        }
    });
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        navigateTo(ROUTES.MACHINING);
        return;
    }
    
    try {
        // Check for active timer
        const activeTimer = await getActiveTimer(taskKey);
        if (activeTimer) {
            await syncServerTime();
            // Load active timer state from database
            state.currentIssueKey = activeTimer.issue_key;
            state.currentTimerId = activeTimer.id;
            state.startTime = activeTimer.start_time;
            state.timerActive = true;
            state.selectedIssue = {
                customfield_11411: activeTimer.machine,
                customfield_10117: activeTimer.job_no,
                customfield_10184: activeTimer.image_no,
                customfield_10185: activeTimer.position_no,
                customfield_10187: activeTimer.quantity
            };
            
            setupTaskInfoDisplay();
            setupTimerHandlers(true);
        } else {
            // No active timer, so we proceed to load task details
            let issue;
            const storedTaskJSON = sessionStorage.getItem('selectedTask');

            // Try to load from sessionStorage first
            if (storedTaskJSON) {
                const storedTask = JSON.parse(storedTaskJSON);
                if (storedTask.key === taskKey) {
                    issue = storedTask;
                    console.log('Loaded task details from session storage.');
                }
            }

            // If not in storage (e.g., page refresh), fetch from API as a fallback
            if (!issue) {
                console.log('Task details not in session storage, fetching from API.');
                issue = await fetchTaskDetails(taskKey);
            }
            
            state.currentIssueKey = issue.key;
            state.selectedIssue = issue.fields;
            setupTaskInfoDisplay();
            setupTimerHandlers(false);
            restoreTimerState(setupTimerHandlers);
        }
    } catch (error) {
        console.error('Error initializing task view:', error);
        alert('Task not found');
        navigateTo(ROUTES.MACHINING);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskView); 