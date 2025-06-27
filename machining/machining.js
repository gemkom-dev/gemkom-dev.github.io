// --- machining.js ---
import {
  fetchIssuesByFilter
} from './machiningService.js';

import {
  renderTaskList,
  setupMachineFilters,
  setupSearchInput
} from './machiningView.js';

import { initNavbar } from '../components/navbar.js';
import { enforceAuth } from '../authService.js';

async function loadAndRender(filterId) {
  const issues = await fetchIssuesByFilter(filterId);
  renderTaskList(issues, () => {
    // Timer functionality is handled in task.js
  });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!enforceAuth()) {
        return;
    }
    initNavbar();
  
    // Check if we have a task parameter
  const urlParams = new URLSearchParams(window.location.search);
  
  await setupMachineFilters(loadAndRender);
  setupSearchInput();
});
