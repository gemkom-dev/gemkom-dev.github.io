// --- taskUI.js ---
// UI management functions for task functionality

import { state} from '../machiningService.js';
import { getSyncedNow } from '../../timeService.js';
import { 
    setupStartStopHandler, 
    setupStopOnlyHandler
} from './taskHandlers.js';
import { formatTime } from '../../helpers.js';
import { setupAllHandlers } from './taskHandlers.js';

// ============================================================================
// UI MANAGEMENT
// ============================================================================

export function getUIElements() {
    return {
        startBtn: document.getElementById('start-stop'),
        stopOnlyBtn: document.getElementById('stop-only-button'),
        manualBtn: document.getElementById('manual-log-button'),
        doneBtn: document.getElementById('mark-done-button'),
        faultBtn: document.getElementById('fault-report-button'),
        backBtn: document.getElementById('back-button'),
        timerDisplay: document.getElementById('timer-display'),
        taskTitle: document.getElementById('task-title')
    };
}

export function updateTimerDisplay() {
    const elapsed = Math.round((getSyncedNow() - state.currentTimer.start_time) / 1000);
    document.getElementById('timer-display').textContent = formatTime(elapsed);
}

export function setupTaskDisplay(hasActiveTimer) {
    const { startBtn, stopOnlyBtn, manualBtn, doneBtn, faultBtn, backBtn, timerDisplay, taskTitle } = getUIElements();
    if (!taskTitle.textContent) {
        const timerContainer = document.getElementById('timer-container');
        const titleRow = document.createElement('div');
        taskTitle.textContent = state.currentIssue.key;
        titleRow.className = 'title-row';
        
        taskTitle.classList.add('task-title');
        
        const right = document.createElement('div');
        right.className = 'task-right';
        
        right.innerHTML = `
            <div class="field-row"><span class="label">İş Emri:</span><span class="value">${state.currentIssue.job_no || '-'}</span></div>
            <div class="field-row"><span class="label">Resim No:</span><span class="value">${state.currentIssue.image_no || '-'}</span></div>
            <div class="field-row"><span class="label">Poz No:</span><span class="value">${state.currentIssue.position_no || '-'}</span></div>
            <div class="field-row"><span class="label">Adet:</span><span class="value">${state.currentIssue.quantity || '-'}</span></div>
        `
        
        titleRow.appendChild(taskTitle);
        titleRow.appendChild(right);
        timerContainer.prepend(titleRow);
    }
    if (!hasActiveTimer) {
        startBtn.textContent = 'Başlat';
        startBtn.classList.remove('red');
        startBtn.classList.add('green');
        stopOnlyBtn.classList.add('hidden');
        doneBtn.style.display = 'block';
        manualBtn.style.display = 'block';
        faultBtn.style.display = 'block';
        backBtn.style.display = 'block';
        startBtn.disabled = false;
        stopOnlyBtn.disabled = false;
        timerDisplay.textContent = '00:00:00';
        setupAllHandlers();
    } else {
        startBtn.textContent = 'Durdur ve İşle';
        startBtn.classList.remove('green');
        startBtn.classList.add('red');
        stopOnlyBtn.classList.remove('hidden');
        manualBtn.style.display = 'none';
        doneBtn.style.display = 'none';
        faultBtn.style.display = 'none';
        backBtn.style.display = 'none';
        
        // Reattach handlers for visible buttons
        setupStartStopHandler();
        setupStopOnlyHandler();
    }
} 