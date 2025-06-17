// --- adminView.js ---
import { fetchUsers, fetchActiveTimers, formatDuration } from './adminService.js';
import { syncServerTime } from '../timeService.js';

const activeRows = {};

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.onclick = () => {
            // Clear all states
            localStorage.clear();
            // Redirect to login page
            window.location.href = '/login';
        };
    }
}

async function updateActiveTimers() {
    const timers = await fetchActiveTimers();
    const tbody = document.getElementById('active-timers');
    tbody.innerHTML = '';

    timers.filter(t => {
        if (t.finish_time) {
            return false;
        }
        const matchesUser = userFilter ? t.user_id.toLowerCase() === userFilter : true;
        const matchesIssue = issueFilter ? t.issue_key.toLowerCase().includes(issueFilter) : true;
        return matchesUser && matchesIssue;
    }).forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.user_id}</td>
            <td>${t.issue_key}</td>
            <td>${new Date(t.start_time).toLocaleTimeString()}</td>
            <td>${formatDuration(t.start_time)}</td>
            <td>
                <button class="btn btn-danger btn-sm stop-timer" data-timer-id="${t.id}">Durdur</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateUsers() {
    const users = await fetchUsers();
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.is_active ? 'Aktif' : 'Pasif'}</td>
            <td>
                <button class="btn btn-${u.is_active ? 'warning' : 'success'} btn-sm toggle-user" 
                        data-user-id="${u.id}" 
                        data-current-state="${u.is_active}">
                    ${u.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let userFilter = '';
let issueFilter = '';

function setupFilters() {
    const userInput = document.getElementById('user-filter');
    const issueInput = document.getElementById('issue-filter');

    if (userInput) {
        userInput.oninput = (e) => {
            userFilter = e.target.value.toLowerCase();
            updateActiveTimers();
        };
    }

    if (issueInput) {
        issueInput.oninput = (e) => {
            issueFilter = e.target.value.toLowerCase();
            updateActiveTimers();
        };
    }
}

function setupEventListeners() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('stop-timer')) {
            const timerId = e.target.dataset.timerId;
            try {
                const res = await fetch(`${backendBase}/stop`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timer_id: timerId })
                });
                if (res.ok) {
                    updateActiveTimers();
                }
            } catch (err) {
                console.error('Error stopping timer:', err);
            }
        }

        if (e.target.classList.contains('toggle-user')) {
            const userId = e.target.dataset.userId;
            const currentState = e.target.dataset.currentState === 'true';
            try {
                const res = await fetch(`${backendBase}/user/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, is_active: !currentState })
                });
                if (res.ok) {
                    updateUsers();
                }
            } catch (err) {
                console.error('Error toggling user:', err);
            }
        }
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await syncServerTime();
    setupLogoutButton();
    setupFilters();
    setupEventListeners();
    await updateActiveTimers();
    await updateUsers();
    setInterval(updateActiveTimers, 1000);
});