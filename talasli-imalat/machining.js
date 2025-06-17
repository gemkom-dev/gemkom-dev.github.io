// --- machining.js ---
import {
  state,
  fetchIssuesByFilter,
  restoreTimerState,
  saveTimerState
} from './machiningService.js';

import {
  renderTaskList,
  setupMachineFilters,
  setupSearchInput,
  setupLogoutButton,
  setupTimerHandlers
} from './machiningView.js';

import { syncServerTime } from '../timeService.js';
import { proxyBase } from '../base.js';

const filters = [
  { id: '10698', name: 'BF-V10' },
  { id: '10697', name: 'BF-V13' },
  { id: '10696', name: 'BK-1580-L' },
  { id: '10699', name: 'Collet' },
  { id: '10694', name: 'Doosan CNC' },
  { id: '10692', name: 'Heckert' },
  { id: '10700', name: 'Hyundai CNC Torna' },
  { id: '10969', name: 'Hyundai Yatay İşleme' },
  { id: '10766', name: 'Manuel Torna 1' },
  { id: '10767', name: 'Manuel Torna 2' },
  { id: '10768', name: 'Manuel Torna 3' },
  { id: '10691', name: 'Schiess Froriep 1' },
  { id: '10690', name: 'Schiess Froriep 2' },
  { id: '10695', name: 'Toyoda Yatay' },
];

async function loadAndRender(filterId) {
  const issues = await fetchIssuesByFilter(filterId);
  renderTaskList(issues, openTimer);
}

function openTimer(issue, restoring = false) {
  setupTimerHandlers(issue, restoring);
}

async function initializeTaskView(taskKey) {
  const response = await fetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${taskKey}`), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    alert('Task not found');
    return;
  }

  const issue = await response.json();
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('timer-view').classList.remove('hidden');
  document.getElementById('task-title').textContent = issue.key;
  setupTimerHandlers(issue);
  restoreTimerState(setupTimerHandlers);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!state.userId) return (window.location.href = '/login');
  
  await syncServerTime();
  
  // Check if we have a task parameter
  const urlParams = new URLSearchParams(window.location.search);
  const taskKey = urlParams.get('task');
  
  if (taskKey) {
    await initializeTaskView(taskKey);
  } else {
    setupMachineFilters(filters, loadAndRender);
    setupSearchInput();
    setupLogoutButton();
    restoreTimerState(openTimer);
  }
});
