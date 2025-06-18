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

import { syncServerTime } from '../timeService.js';
import { filters } from '../globalVariables.js';

import { initNavbar } from '../components/navbar.js';
import { checkAuth } from '../auth.js';

// Check authentication before initializing the page
if (checkAuth()) {
    initNavbar();
}

async function loadAndRender(filterId) {
  const issues = await fetchIssuesByFilter(filterId);
  renderTaskList(issues, () => {
    // Timer functionality is handled in task.js
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  
  await syncServerTime();
  
  // Check if we have a task parameter
  const urlParams = new URLSearchParams(window.location.search);
  
  setupMachineFilters(filters, loadAndRender);
  setupSearchInput();
});
