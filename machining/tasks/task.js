import { state, restoreTimerState, formatTime, formatJiraDate, saveTimerState, stopTimerShared, logTimeToJiraShared } from '../machiningService.js';
import { syncServerTime, getSyncedNow } from '../../timeService.js';
import { proxyBase, backendBase } from '../../base.js';
import { initNavbar } from '../../components/navbar.js';
import { authedFetch, isLoggedIn, logout } from '../../authService.js';
import { TimerWidget } from '../../components/timerWidget.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTaskKeyFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}

// ============================================================================
// UI MANAGEMENT
// ============================================================================

function getUIElements() {
    return {
        startBtn: document.getElementById('start-stop'),
        stopOnlyBtn: document.getElementById('stop-only-button'),
        manualBtn: document.getElementById('manual-log-button'),
        doneBtn: document.getElementById('mark-done-button'),
        backBtn: document.getElementById('back-button'),
        timerDisplay: document.getElementById('timer-display'),
        taskTitle: document.getElementById('task-title')
    };
}

function updateTimerDisplay() {
    const elapsed = Math.round((getSyncedNow() - state.startTime) / 1000);
    document.getElementById('timer-display').textContent = formatTime(elapsed);
}

function setActiveTimerUI() {
    const { startBtn, stopOnlyBtn, manualBtn, doneBtn, backBtn } = getUIElements();
    
    startBtn.textContent = 'Durdur ve İşle';
    startBtn.classList.remove('green');
    startBtn.classList.add('red');
    stopOnlyBtn.classList.remove('hidden');
    manualBtn.style.display = 'none';
    doneBtn.style.display = 'none';
    backBtn.style.display = 'none';
}

function setInactiveTimerUI() {
    const { startBtn, stopOnlyBtn, manualBtn, doneBtn, backBtn, timerDisplay } = getUIElements();
    
    startBtn.textContent = 'Başlat';
    startBtn.classList.remove('red');
    startBtn.classList.add('green');
    stopOnlyBtn.classList.add('hidden');
    doneBtn.style.display = 'block';
    manualBtn.style.display = 'block';
    backBtn.style.display = 'block';
    startBtn.disabled = false;
    stopOnlyBtn.disabled = false;
    timerDisplay.textContent = '00:00:00';
}

function setupTaskInfoDisplay() {
    const { taskTitle } = getUIElements();
    taskTitle.textContent = state.currentIssueKey;
    
    const timerContainer = document.getElementById('timer-container');
    const titleRow = document.createElement('div');
    titleRow.className = 'title-row';
    
    taskTitle.classList.add('task-title');
    
    const right = document.createElement('div');
    right.className = 'task-right';
    
    right.innerHTML = `
        <div class="field-row"><span class="label">İş Emri:</span><span class="value">${state.selectedIssue.customfield_10117 || '-'}</span></div>
        <div class="field-row"><span class="label">Resim No:</span><span class="value">${state.selectedIssue.customfield_10184 || '-'}</span></div>
        <div class="field-row"><span class="label">Poz No:</span><span class="value">${state.selectedIssue.customfield_10185 || '-'}</span></div>
        <div class="field-row"><span class="label">Adet:</span><span class="value">${state.selectedIssue.customfield_10187 || '-'}</span></div>
    `
    
    titleRow.appendChild(taskTitle);
    titleRow.appendChild(right);
    timerContainer.prepend(titleRow);
}

// ============================================================================
// API CALLS
// ============================================================================

async function fetchTaskDetails(taskKey) {
    const response = await authedFetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${taskKey}`), {
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error('Task not found');
    }
    
    return response.json();
}

async function getActiveTimer(taskKey) {
    const response = await authedFetch(`${backendBase}/machining/timers?issue_key=${taskKey}&is_active=true`);
    
    if (!response.ok) {
        return null;
    }
    
    const timerList = await response.json();
    const activeTimer = timerList[0];
    
    return activeTimer && activeTimer.finish_time === null ? activeTimer : null;
}

async function startTimer() {
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

function createManualTimeModal() {
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

async function logManualTime() {
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
                
                const jiraResponse = await fetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${state.currentIssueKey}/worklog`), {
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
                    window.location.reload();
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

async function markTaskAsDone() {
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
// TIMER EVENT HANDLERS
// ============================================================================

function setupStartStopHandler() {
    const { startBtn } = getUIElements();
    
    startBtn.onclick = async () => {
        if (!state.timerActive) {
            await syncServerTime();
            // Start timer
            state.startTime = getSyncedNow();
            state.timerActive = true;
            setActiveTimerUI();
            state.intervalId = setInterval(updateTimerDisplay, 1000);
            saveTimerState();
            
            try {
                const startData = await startTimer();
                state.currentTimerId = startData.id;
            } catch (error) {
                console.error('Error starting timer:', error);
                alert("Zamanlayıcı başlatılırken hata oluştu.");
            }
        } else {
            // Stop timer and log to Jira
            clearInterval(state.intervalId);
            let elapsed = Math.round((getSyncedNow() - state.startTime) / 1000);
            if (elapsed < 60) elapsed = 60;
            
            state.finish_time = getSyncedNow();
            state.timerActive = false;
            startBtn.disabled = true;
            startBtn.textContent = 'İşleniyor...';
            saveTimerState();
            
            try {
                await stopTimerShared({ timerId: state.currentTimerId, finishTime: state.finish_time, syncToJira: true });
                const logged = await logTimeToJiraShared({ issueKey: state.currentIssueKey, baseUrl: state.base, startTime: state.startTime, elapsedSeconds: elapsed });
                
                if (logged) {
                    window.location.reload();
                } else {
                    alert("Hata oluştu. Lütfen tekrar deneyin.");
                    setInactiveTimerUI();
                }
            } catch (error) {
                console.error('Error stopping timer:', error);
                alert("Hata oluştu. Lütfen tekrar deneyin.");
                setInactiveTimerUI();
            }
        }
        new TimerWidget();
    };
}

function setupStopOnlyHandler() {
    const { stopOnlyBtn } = getUIElements();
    
    stopOnlyBtn.onclick = async () => {
        clearInterval(state.intervalId);
        setInactiveTimerUI();
        
        try {
            await stopTimerShared({ timerId: state.currentTimerId, finishTime: getSyncedNow(), syncToJira: false });
            window.location.reload();
        } catch (error) {
            console.error('Error stopping timer:', error);
            alert("Zamanlayıcı durdurulurken hata oluştu.");
        }
    };
}

function setupBackHandler() {
    const { backBtn } = getUIElements();
    
    backBtn.onclick = () => {
        if (state.timerActive) {
            if (!confirm("Zamanlayıcı aktif. Geri dönmek istediğinize emin misiniz?")) {
                return;
            }
            clearInterval(state.intervalId);
            setInactiveTimerUI();
        }
        window.location.href = '/machining';
    };
}

function setupManualLogHandler() {
    const { manualBtn } = getUIElements();
    
    manualBtn.onclick = async () => {
        await logManualTime();
    };
}

function setupMarkDoneHandler() {
    const { doneBtn } = getUIElements();
    
    doneBtn.onclick = async () => {
        if (!confirm(`${state.selectedIssue.customfield_10187} adetin hepsini tamamladınız mı?`)) {
            return;
        }
        
        try {
            const marked = await markTaskAsDone();
            if (marked) {
                alert('Görev tamamlandı olarak işaretlendi.');
                window.location.href = '/machining';
            } else {
                alert("Hata oluştu. Lütfen tekrar deneyin.");
            }
        } catch (error) {
            console.error('Error marking as done:', error);
            alert("Hata oluştu. Lütfen tekrar deneyin.");
        }
    };
}

// ============================================================================
// TIMER SETUP
// ============================================================================

function setupTimerHandlers(restoring = false) {
    if (restoring) {
        state.startTime = parseInt(state.startTime);
        state.timerActive = true;
        updateTimerDisplay();
        state.intervalId = setInterval(updateTimerDisplay, 1000);
        setActiveTimerUI();
    } else {
        setInactiveTimerUI();
        state.timerActive = false;
        state.startTime = null;
        saveTimerState();
    }
    
    // Setup all event handlers
    setupStartStopHandler();
    setupStopOnlyHandler();
    setupBackHandler();
    setupManualLogHandler();
    setupMarkDoneHandler();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeTaskView() {
    if (!isLoggedIn()) {
        logout();
        return;
    }
    initNavbar();
    new TimerWidget();
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        window.location.href = '/machining';
        return;
    }
    
    try {
        // Check for active timer
        const activeTimer = await getActiveTimer(taskKey);
        if (activeTimer) {
            await syncServerTime();
            // Load active timer state from database
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
            
            setupTaskInfoDisplay();
            setupTimerHandlers(true);
        } else {
            // No active timer, so we proceed to load task details
            let issue;
            const storedTaskJSON = sessionStorage.getItem('selectedTask');

            // Try to load from sessionStorage first
            if (storedTaskJSON) {
                const storedTask = JSON.parse(storedTaskJSON);
                if (storedTask.key === taskKey) {
                    issue = storedTask;
                    console.log('Loaded task details from session storage.');
                }
            }

            // If not in storage (e.g., page refresh), fetch from API as a fallback
            if (!issue) {
                console.log('Task details not in session storage, fetching from API.');
                issue = await fetchTaskDetails(taskKey);
            }
            
            state.currentIssueKey = issue.key;
            state.selectedIssue = issue.fields;
            setupTaskInfoDisplay();
            setupTimerHandlers(false);
            restoreTimerState(setupTimerHandlers);
        }
    } catch (error) {
        console.error('Error initializing task view:', error);
        alert('Task not found');
        window.location.href = '/machining';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskView); 