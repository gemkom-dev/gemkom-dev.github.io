import { state, restoreTimerState, formatTime, formatJiraDate, saveTimerState, stopTimerShared, logTimeToJiraShared } from '../machiningService.js';
import { syncServerTime, getSyncedNow } from '../../timeService.js';
import { proxyBase, backendBase } from '../../base.js';
import { initNavbar } from '../../components/navbar.js';
import { authedFetch, isLoggedIn, logout } from '../../authService.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function refreshTimerWidget() {
    if (window.timerWidget?.loadActiveTimers) {
        window.timerWidget.loadActiveTimers();
    }
}

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
    const response = await authedFetch(`${backendBase}/machining/timers?issue_key=${taskKey}&active=true`);
    
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
                const timerResponse = await authedFetch(`${backendBase}/machining/manual-entry`, {
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
                    refreshTimerWidget();
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
            // Start timer
            state.startTime = getSyncedNow();
            state.timerActive = true;
            setActiveTimerUI();
            state.intervalId = setInterval(updateTimerDisplay, 1000);
            saveTimerState();
            
            try {
                const startData = await startTimer();
                state.currentTimerId = startData.id;
                refreshTimerWidget();
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
                    refreshTimerWidget();
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
    };
}

function setupStopOnlyHandler() {
    const { stopOnlyBtn } = getUIElements();
    
    stopOnlyBtn.onclick = async () => {
        clearInterval(state.intervalId);
        setInactiveTimerUI();
        
        try {
            await stopTimerShared({ timerId: state.currentTimerId, finishTime: getSyncedNow(), syncToJira: false });
            refreshTimerWidget();
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
        if (!confirm("Bu işi tamamlandı olarak işaretlemek istediğinize emin misiniz?")) {
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
    await syncServerTime();
    
    const taskKey = getTaskKeyFromURL();
    if (!taskKey) {
        window.location.href = '/machining';
        return;
    }
    
    try {
        // Check for active timer
        const activeTimer = await getActiveTimer(taskKey);
        console.log(activeTimer);
        if (activeTimer) {
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
            refreshTimerWidget();
            console.log('Active timer loaded for task:', taskKey, activeTimer.id);
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