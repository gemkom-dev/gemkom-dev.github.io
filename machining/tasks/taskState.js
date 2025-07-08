// --- taskState.js ---
// State management and utilities for task functionality

import { state } from '../machiningService.js';
import { getMachine, getTaskKeyFromURL } from './taskApi.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
export function setCurrentIssueState(issue) {
    state.currentIssue = {
        key: issue.key,
        name: issue.name,
        job_no: issue.job_no,
        image_no: issue.image_no,
        position_no: issue.position_no,
        quantity: issue.quantity
    };
}   

export function setCurrentTimerState(hasActiveTimer) {
    if (hasActiveTimer) {
        state.currentTimer = {
            id: activeTimer.id,
            start_time: activeTimer.start_time,
        }
    } else {
        state.currentTimer = {
            id: null,
            start_time: null
        }
    }
}

export function setCurrentMachineState() {
    const urlParams = new URLSearchParams(window.location.search);
    const machineId = urlParams.get('machine_id');
    const machine = getMachine(machineId);
    state.currentMachine = machine;
}



// ============================================================================
// SOFT RELOAD HANDLING
// ============================================================================

export async function performSoftReload(resetUI = true) {
    console.log('Performing soft reload...');
    
    try {
        clearInterval(state.intervalId); 
        const taskKey = getTaskKeyFromURL();
        hasActiveTimer = await initializeTaskState(taskKey);
        return hasActiveTimer;
        
    } catch (error) {
        console.error('Error during soft reload:', error);
        throw error;
    }
}