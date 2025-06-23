import { updateActiveTimers, updateMachines } from './adminView.js';
import { filters } from '../globalVariables.js';
import { initNavbar } from '../components/navbar.js';
import { stopTimerShared, logTimeToJiraShared } from '../machining/machiningService.js';
import { isLoggedIn, logout } from '../authService.js';
import Sidebar from '../components/sidebar.js';

export const state = {
    machines: filters,
    activeTimers: []
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication before initializing the page
    if (isLoggedIn()) {
        initNavbar();
    } else {
        logout();
    }

    document.getElementById('refresh-btn').addEventListener('click', async () => {
        await updateActiveTimers();
        updateMachines();
    });

    await updateActiveTimers();
    updateMachines();
    setupEventListeners();

    const sidebarRoot = document.getElementById('sidebar-root');
    if (sidebarRoot) {
        const sidebar = new Sidebar(sidebarRoot);
        sidebar.addItem('Dashboard');
        sidebar.addItem('Users', { subItems: ['Add User', 'User List'] });
        sidebar.addItem('Machines', { subItems: ['Add Machine', 'Machine List'] });
        sidebar.addItem('Settings');
    }
});

function setupEventListeners() {
    const tbody = document.getElementById('active-timers');
    tbody.addEventListener('click', async (e) => {
        const jiraBtn = e.target.closest('.save-jira');
        const stopBtn = e.target.closest('.stop-only');
        if (jiraBtn) {
            const timerId = jiraBtn.getAttribute('data-timer-id');
            // Call logic to save to Jira and stop timer
            await handleSaveToJira(timerId);
        } else if (stopBtn) {
            const timerId = stopBtn.getAttribute('data-timer-id');
            // Call logic to just stop and save to DB
            await handleStopOnly(timerId);
        }
    });
}

async function handleSaveToJira(timerId) {
    // Find timer info from state
    const timer = state.activeTimers.find(t => t.id == timerId);
    if (!timer) {
      return alert('Timer bulunamadı!');
    }
 
    const finishTime = Date.now();
    // 1. Stop timer with syncToJira=true
    const stopped = await stopTimerShared({ timerId, finishTime, syncToJira: true });
    if (!stopped) {
      return alert('Timer durdurulamadı!');
    }
    // 2. Log to Jira
    let elapsedSeconds = Math.round((finishTime - timer.start_time) / 1000);
    elapsedSeconds = Math.max(elapsedSeconds, 60)

    const logged = await logTimeToJiraShared({ issueKey: timer.issue_key, baseUrl: 'https://gemkom-1.atlassian.net', startTime: timer.start_time, elapsedSeconds });
    if (logged) {
        alert(`Timer ${timerId} Jira'ya kaydedildi ve durduruldu!`);
    } else {
        alert('Jira kaydı başarısız!');
    }

    await updateActiveTimers();
    await updateMachines();
}

async function handleStopOnly(timerId) {
    const finishTime = Date.now();
    // Stop timer with syncToJira=false
    const stopped = await stopTimerShared({ timerId, finishTime, syncToJira: false });
    if (stopped) {
        alert(`Timer ${timerId} sadece durduruldu ve veritabanına kaydedildi!`);
    } else {
        alert('Timer durdurulamadı!');
    }
    await updateActiveTimers();
}