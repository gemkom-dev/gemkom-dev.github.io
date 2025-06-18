import { updateActiveTimers, updateMachines } from './adminView.js';
import { filters } from '../globalVariables.js';
import { initNavbar } from '../components/navbar.js';
import { checkAuth } from '../auth.js';

export const state = {
    machines: filters,
    activeTimers: []
}

// Check authentication before initializing the page
if (checkAuth()) {
    initNavbar();
}

document.addEventListener('DOMContentLoaded', async () => {
    await updateActiveTimers();
    updateMachines();
    setupEventListeners();
});