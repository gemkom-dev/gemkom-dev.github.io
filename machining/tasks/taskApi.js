// --- taskApi.js ---
// API calls and data fetching for task functionality

import { state } from '../machiningService.js';
import { proxyBase, backendBase, jiraBase } from '../../base.js';
import { authedFetch, navigateTo } from '../../authService.js';
import { mapJiraIssueToTask } from '../../helpers.js';

// ============================================================================
// TASK DATA FETCHING
// ============================================================================

export function getTaskKeyFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}

export async function fetchTaskDetails(taskKey=null) {
    const params = new URLSearchParams(window.location.search);

    const storedTaskJSON = sessionStorage.getItem('selectedTask');
    if (storedTaskJSON) {
        try {
            return JSON.parse(storedTaskJSON);
        } catch (error) {
            console.error('Error parsing stored task:', error);
        }
    }
    else if(params.get('hold') !== '1'){
        const response = await authedFetch(proxyBase + encodeURIComponent(`${jiraBase}/rest/api/3/issue/${taskKey}`), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Task not found');
        }
        
        return mapJiraIssueToTask(await response.json());
    } else {
        return {
                    key: params.get('key'),
                    name: params.get('name') || params.get('key'),                    // Task name
                    job_no: params.get('name') || params.get('key'),           // RM260-01-12
                    image_no: null,         // 8.7211.0005
                    position_no: null,      // 107
                    quantity: null,         // 6
                    machine: null,   // COLLET (optional)
                };
    }
    
}

export async function getActiveTimer(taskKey) {
    const response = await authedFetch(`${backendBase}/machining/timers?issue_key=${taskKey}&is_active=true`);
    
    if (!response.ok) {
        return null;
    }
    
    const timerList = await response.json();
    const activeTimer = timerList[0];
    
    return activeTimer && activeTimer.finish_time === null ? activeTimer : null;
}

// ============================================================================
// TIMER OPERATIONS
// ============================================================================

export async function startTimer() {
    if (!sessionStorage.getItem('selectedMachineId')){
        navigateTo(ROUTES.MACHINING);
        return;
    }
    const timerData = {
        issue_key: state.currentIssue.key,
        start_time: getSyncedNow(),
        machine: state.currentMachine.name,
        machine_fk: state.currentMachine.id,
        job_no: state.currentIssue.job_no,
        image_no: state.currentIssue.image_no,
        position_no: state.currentIssue.position_no,
        quantity: state.currentIssue.quantity
    }
    const response = await authedFetch(`${backendBase}/machining/timers/start/`, {
        method: 'POST',
        body: JSON.stringify(timerData)
    });
    
    return response.json();
}

export async function createManualTimeEntry(startDateTime, endDateTime) {
    if (!sessionStorage.getItem('selectedMachineId')){
        navigateTo(ROUTES.MACHINING);
        return;
    }
    const response = await authedFetch(`${backendBase}/machining/manual-time/`, {
        method: 'POST',
        body: JSON.stringify({
            issue_key: state.currentIssue.key,
            start_time: startDateTime.getTime(),
            finish_time: endDateTime.getTime(),
            machine: state.currentIssue.customfield_11411?.value || '',
            machine_fk: sessionStorage.getItem('selectedMachineId'),
            job_no: state.currentIssue.customfield_10117 || '',
            image_no: state.currentIssue.customfield_10184 || '',
            position_no: state.currentIssue.customfield_10185 || '',
            quantity: state.currentIssue.customfield_10187 || ''
        })
    });
    
    return response.ok;
}

// ============================================================================
// JIRA OPERATIONS
// ============================================================================

export async function markTaskAsDone() {
    const url = `${jiraBase}/rest/api/3/issue/${state.currentIssue.key}/transitions`;
    const response = await authedFetch(proxyBase + encodeURIComponent(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            transition: {
                id: '41'
            }
        })
    });
    
    // Also notify backend to set completed_by and completion_date
    authedFetch(`${backendBase}/machining/tasks/mark-completed/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            key: state.currentIssue.key
        })
    });
    
    return response.ok;
}


export async function getMachine(machineId) {
    const response = await authedFetch(`${backendBase}/machines/${machineId}/`);
    return response.json();
}

// ============================================================================
// MAINTENANCE CHECKING
// ============================================================================

export async function checkMachineMaintenance(machineId) {
    const response = await authedFetch(`${backendBase}/machines/${machineId}/`);
    
    if (!response.ok) {
        return false;
    }
    
    const machine = await response.json();
    return machine ? machine.is_under_maintenance : false;
} 