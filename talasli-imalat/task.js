import { state, restoreTimerState } from './machiningService.js';
import { setupTimerHandlers, setupLogoutButton } from './machiningView.js';
import { syncServerTime } from '../timeService.js';
import { proxyBase } from '../base.js';

async function initializeTaskView() {
    if (!state.userId) {
        window.location.href = '/login';
        return;
    }

    await syncServerTime();
    setupLogoutButton();

    // Get the task key from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const taskKey = urlParams.get('key');
    
    if (!taskKey) {
        window.location.href = '/talasli-imalat';
        return;
    }

    // Fetch the task details
    const response = await fetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${taskKey}`), {
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        alert('Task not found');
        window.location.href = '/talasli-imalat';
        return;
    }

    const issue = await response.json();
    document.getElementById('task-title').textContent = issue.key;
    setupTimerHandlers(issue);
    restoreTimerState(setupTimerHandlers);
}

document.addEventListener('DOMContentLoaded', initializeTaskView); 