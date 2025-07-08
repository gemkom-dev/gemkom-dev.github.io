// --- taskLogic.js ---
// Core business logic for task functionality

import { state } from '../machiningService.js';
import { updateTimerDisplay} from './taskUI.js';
import { performSoftReload } from './taskState.js';

// ============================================================================
// TIMER SETUP
// ============================================================================

export function setupTimerHandlers(restoring = false) {
    if (restoring) {
        state.currentTimer.start_time = parseInt(state.currentTimer.start_time);
        updateTimerDisplay();
        state.intervalId = setInterval(updateTimerDisplay, 1000);
    } else {
        state.currentTimer.start_time = null;
    }
}

// ============================================================================
// SOFT RELOAD HANDLING
// ============================================================================

export async function handleSoftReload() {
    try {
        const timerRestored = await performSoftReload(false);
        
        if (timerRestored) {
            // Timer was restored, set up active state
            setupTimerHandlers(true);
        } else {
            // No timer was restored, set up inactive state
            setupTimerHandlers(false);
        }
    } catch (error) {
        console.error('Error during soft reload:', error);
        // Fallback to full page reload if soft reload fails
        window.location.reload();
    }
} 