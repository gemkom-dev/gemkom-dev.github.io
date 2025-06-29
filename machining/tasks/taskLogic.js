// --- taskLogic.js ---
// Pure business logic for task functionality

import { state, restoreTimerState, formatTime, formatJiraDate, saveTimerState, stopTimerShared, logTimeToJiraShared } from '../machiningService.js';
import { syncServerTime, getSyncedNow } from '../../timeService.js';
import { proxyBase, backendBase } from '../../base.js';
import { authedFetch, navigateTo, ROUTES } from '../../authService.js';
import { TimerWidget } from '../../components/timerWidget.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getTaskKeyFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}

// ============================================================================
// API CALLS
// ============================================================================

export async function fetchTaskDetails(taskKey) {
    const response = await authedFetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${taskKey}`), {
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error('Task not found');
    }
    
    return response.json();
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

export async function startTimer() {
    const response = await authedFetch(`${backendBase}/machining/timers/start/`, {
        method: 'POST',
        body: JSON.stringify({
            issue_key: state.currentIssueKey,
            start_time: state.startTime,
            machine: state.selectedIssue.customfield_11411?.value || '',
            job_no: state.selectedIssue.customfield_10117 || '',
            image_no: state.selectedIssue.customfield_10184 || '',
            position_no: state.selectedIssue.customfield_10185 || '',
            quantity: state.selectedIssue.customfield_10187|| ''
        })
    });
    
    return response.json();
}

export async function markTaskAsDone() {
    const url = `${state.base}/rest/api/3/issue/${state.currentIssueKey}/transitions`;
    const response = await authedFetch(proxyBase + encodeURIComponent(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            transition: {
                id: '41'
            }
        })
    });
    
    return response.ok;
}

// ============================================================================
// MANUAL TIME LOGGING
// ============================================================================

export function createManualTimeModal() {
    const modal = document.createElement('div');
    modal.className = 'manual-time-modal';
    
    // Set default values to current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Set end time to 1 hour later
    const endDateTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    modal.innerHTML = `
        <div class="manual-time-modal-content" lang="tr">
            <div class="manual-time-modal-header">
                <h3>Manuel Zaman Girişi</h3>
                <button class="manual-time-close" id="manual-time-close">&times;</button>
            </div>
            <div class="manual-time-modal-body">
                <div class="time-input-group">
                    <label>Başlangıç:</label>
                    <div class="datetime-inputs">
                        <input type="date" id="start-date" value="${currentDate}" required>
                        <input type="time" id="start-time" value="${currentTime}" required>
                    </div>
                </div>
                <div class="time-input-group">
                    <label>Bitiş:</label>
                    <div class="datetime-inputs">
                        <input type="date" id="end-date" value="${currentDate}" required>
                        <input type="time" id="end-time" value="${endTimeStr}" required>
                    </div>
                </div>
                <div class="manual-time-preview" id="time-preview">
                    Süre: <span id="duration-preview">01:00:00</span>
                </div>
            </div>
            <div class="manual-time-modal-footer">
                <button class="btn btn-secondary" id="manual-time-cancel">İptal</button>
                <button class="btn btn-primary" id="manual-time-submit">Kaydet</button>
            </div>
        </div>
    `;
    
    // Add event listeners for real-time duration calculation
    const startDate = modal.querySelector('#start-date');
    const startTime = modal.querySelector('#start-time');
    const endDate = modal.querySelector('#end-date');
    const endTime = modal.querySelector('#end-time');
    const durationPreview = modal.querySelector('#duration-preview');
    
    function updateDuration() {
        try {
            const startDateTime = new Date(`${startDate.value}T${startTime.value}`);
            const endDateTime = new Date(`${endDate.value}T${endTime.value}`);
            
            if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime()) && endDateTime > startDateTime) {
                const elapsedSeconds = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 1000);
                durationPreview.textContent = formatTime(elapsedSeconds);
            } else {
                durationPreview.textContent = '00:00:00';
            }
        } catch (error) {
            durationPreview.textContent = '00:00:00';
        }
    }
    
    startDate.addEventListener('change', updateDuration);
    startTime.addEventListener('change', updateDuration);
    endDate.addEventListener('change', updateDuration);
    endTime.addEventListener('change', updateDuration);
    
    // Initial calculation
    updateDuration();
    
    return modal;
}

export async function logManualTime() {
    // Create and show the modal
    const modal = createManualTimeModal();
    document.body.appendChild(modal);
    
    // Return a promise that resolves when the user submits or cancels
    return new Promise((resolve) => {
        const submitBtn = modal.querySelector('#manual-time-submit');
        const cancelBtn = modal.querySelector('#manual-time-cancel');
        const closeBtn = modal.querySelector('#manual-time-close');
        
        function closeModal() {
            document.body.removeChild(modal);
            resolve();
        }
        
        submitBtn.onclick = async () => {
            const startDate = modal.querySelector('#start-date').value;
            const startTime = modal.querySelector('#start-time').value;
            const endDate = modal.querySelector('#end-date').value;
            const endTime = modal.querySelector('#end-time').value;
            
            if (!startDate || !startTime || !endDate || !endTime) {
                alert("Lütfen tüm alanları doldurun.");
                return;
            }
            
            try {
                // Parse the dates
                const startDateTime = new Date(`${startDate}T${startTime}`);
                const endDateTime = new Date(`${endDate}T${endTime}`);
                
                // Validate dates
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                    alert("Geçersiz tarih formatı.");
                    return;
                }
                
                if (endDateTime <= startDateTime) {
                    alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
                    return;
                }
                
                // Calculate elapsed time in seconds
                const elapsedSeconds = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 1000);
                
                if (elapsedSeconds < 60) {
                    alert("Minimum 1 dakika çalışma süresi gereklidir.");
                    return;
                }
                
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'Kaydediliyor...';
                
                // Create timer in database
                const timerResponse = await authedFetch(`${backendBase}/machining/manual-time/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        issue_key: state.currentIssueKey,
                        start_time: startDateTime.getTime(),
                        finish_time: endDateTime.getTime(),
                        machine: state.selectedIssue.customfield_11411?.value || '',
                        job_no: state.selectedIssue.customfield_10117 || '',
                        image_no: state.selectedIssue.customfield_10184 || '',
                        position_no: state.selectedIssue.customfield_10185 || '',
                        quantity: state.selectedIssue.customfield_10187 || ''
                    })
                });
                
                if (!timerResponse.ok) {
                    throw new Error('Failed to create timer in database');
                }
                
                // Log to Jira
                const started = formatJiraDate(startDateTime.getTime());
                const startDateStr = `${startDate} ${startTime}`;
                const endDateStr = `${endDate} ${endTime}`;
                
                const jiraResponse = await authedFetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${state.currentIssueKey}/worklog`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        started,
                        timeSpentSeconds: elapsedSeconds,
                        comment: {
                            type: 'doc',
                            version: 1,
                            content: [{
                                type: 'paragraph',
                                content: [{
                                    type: 'text',
                                    text: `Manuel giriş: ${formatTime(elapsedSeconds)} (${startDateStr} - ${endDateStr})`
                                }]
                            }]
                        }
                    })
                });
                
                if (jiraResponse.ok) {
                    alert(`Manuel zaman girişi başarılı: ${formatTime(elapsedSeconds)}`);
                    
                    // Trigger timer widget update
                    TimerWidget.triggerUpdate();
                    
                    // Trigger soft reload
                    window.dispatchEvent(new CustomEvent('softReload'));
                } else {
                    alert("Jira'ya kayıt yapılırken hata oluştu.");
                }
                
                // Close modal and resolve
                closeModal();
                
            } catch (error) {
                console.error('Error logging manual time:', error);
                alert("Hata oluştu. Lütfen tekrar deneyin.");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kaydet';
            }
        };
        
        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
    });
}

// ============================================================================
// SOFT RELOAD HANDLING
// ============================================================================

export async function performSoftReload(resetUI = true) {
    console.log('Performing soft reload...');
    try {
        // Clear any existing timer state
        clearInterval(state.intervalId);
        state.timerActive = false;
        state.startTime = null;
        state.currentTimerId = null;
        state.finish_time = null;
        
        // Clear localStorage timer state
        localStorage.removeItem('jira-timer-state');
        
        // Check if there's still an active timer for this task
        const taskKey = getTaskKeyFromURL();
        if (taskKey) {
            console.log('Checking for active timer for task:', taskKey);
            const activeTimer = await getActiveTimer(taskKey);
            if (activeTimer) {
                console.log('Found active timer, restoring...');
                // There's still an active timer, restore it
                await syncServerTime();
                state.currentIssueKey = activeTimer.issue_key;
                state.currentTimerId = activeTimer.id;
                state.startTime = activeTimer.start_time;
                state.timerActive = true;
                state.selectedIssue = {
                    customfield_11411: activeTimer.machine,
                    customfield_10117: activeTimer.job_no,
                    customfield_10184: activeTimer.image_no,
                    customfield_10185: activeTimer.position_no,
                    customfield_10187: activeTimer.quantity
                };
                
                return true; // Indicate timer was restored
            } else {
                console.log('No active timer found, setting up inactive state');
                // If resetUI is true, we need to reset the UI to inactive state
                if (resetUI) {
                    // Import UI functions dynamically to avoid circular imports
                    const { setInactiveTimerUI } = await import('./taskUI.js');
                    setInactiveTimerUI();
                }
                return false; // Indicate no timer was restored
            }
        }
        console.log('Soft reload completed successfully');
        return false;
    } catch (error) {
        console.error('Error during soft reload:', error);
        throw error;
    }
} 