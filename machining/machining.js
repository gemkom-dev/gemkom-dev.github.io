// --- machining.js ---
import {
  state,
  fetchIssuesByFilter
} from './machiningService.js';

import {
  renderTaskList,
  setupMachineFilters,
  setupSearchInput
} from './machiningView.js';

import { filters } from '../globalVariables.js';

import { initNavbar } from '../components/navbar.js';
import { isLoggedIn, logout } from '../authService.js';
import { TimerWidget } from '../components/timerWidget.js';

async function loadAndRender(filterId) {
  const issues = await fetchIssuesByFilter(filterId);
  renderTaskList(issues, () => {
    // Timer functionality is handled in task.js
  });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        logout();
        return;
    }
    
    initNavbar();
    new TimerWidget();
  
    // Check if we have a task parameter
  const urlParams = new URLSearchParams(window.location.search);
  
  setupMachineFilters(filters, loadAndRender);
  setupSearchInput();
});
