import { updateActiveTimers, updateMachines } from './adminView.js';
import { filters } from '../globalVariables.js';
import { initNavbar } from '../components/navbar.js';
import { stopTimerShared, logTimeToJiraShared } from '../machining/machiningService.js';
import Sidebar from '../components/sidebar.js';
import { enforceAuth, isAdmin } from '../authService.js';
import { showUserCreateForm } from './createUser.js';

export const state = {
    machines: filters,
    activeTimers: []
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAdmin()) {
        window.location.href = '/';
        return;
    }
    // Check authentication before initializing the page
    if (!enforceAuth()) {
        return;
    }
    initNavbar();

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
        sidebar.addItem('Özet');
        sidebar.addItem('Kullanıcılar', { subItems: ['Kullanıcı Ekle', 'Kullanıcı Listesi'] });
        sidebar.addItem('Mesailer', { subItems: ['Makine Ekle', 'Machine Listesi'] });
        sidebar.addItem('Talaşlı İmalat', { subItems: ['Makine Ekle', 'Machine Listesi'] });
        sidebar.addItem('Kaynaklı İmalat', { subItems: ['Makine Ekle', 'Machine Listesi'] });
        sidebar.addItem('CNC Kesim', { subItems: ['Makine Ekle', 'Machine Listesi'] });  
        sidebar.addItem('Ayarlar');

        const kullaniciEkleItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Kullanıcı Ekle');
        if (kullaniciEkleItem) {
            kullaniciEkleItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showUserCreateForm();
            });
        }
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