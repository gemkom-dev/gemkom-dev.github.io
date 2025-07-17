// --- machiningService.js ---
import { backendBase } from '../base.js';
import { authedFetch } from '../authService.js';
import { extractResultsFromResponse } from '../generic/paginationHelper.js';

export const state = {
    intervalId: null,
    currentIssue: {
        key: null,
        name: null,
        job_no: null,
        image_no: null,
        position_no: null,
        quantity: null,
        machine_id: null,
        machine_name: null
    },
    currentTimer: {
        id: null,
        start_time: null
    },
    currentMachine: null
};


export async function fetchTasksForMachining(machineId) {
    // Fetch tasks from our backend, optionally filtered by machine
    let url = `${backendBase}/machining/tasks/?completion_date__isnull=true&ordering=key&page_size=100`;
    if (machineId) {
        url += `&machine_fk=${encodeURIComponent(machineId)}`;
    }
    const resp = await authedFetch(url);
    if (!resp.ok) throw new Error('Görevler alınamadı');
    const data = await resp.json();
    return extractResultsFromResponse(data);
}


export async function stopTimerShared({ timerId, finishTime, syncToJira }) {
    const response = await authedFetch(`${backendBase}/machining/timers/stop/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timer_id: timerId,
            finish_time: finishTime,
            synced_to_jira: syncToJira
        })
    });
    return response.ok;
}