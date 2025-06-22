// --- machiningView.js ---
import {
  state,
  formatTime,
  formatJiraDate,
  saveTimerState
} from './machiningService.js';

import {
  proxyBase,
  backendBase
} from '../base.js';

import { syncServerTime, getSyncedNow } from '../timeService.js';

export function renderTaskList(issues, openTimerCallback) {
  const ul = document.getElementById('task-list');
  ul.innerHTML = '';
  issues.forEach(issue => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.onclick = () => {
      if (state.timerActive) {
        alert("Lütfen önce mevcut zamanlayıcıyı durdurun.");
        return;
      }
      // Store the full issue object in sessionStorage to use on the next page
      sessionStorage.setItem('selectedTask', JSON.stringify(issue));
      window.location.href = `/machining/tasks/?key=${issue.key}`;
    };

    const fields = issue.fields;

    const left = document.createElement('div');
    left.className = 'task-left';
    const title = document.createElement('h3');
    title.textContent = issue.key;
    const summary = document.createElement('p');
    summary.textContent = fields.summary;
    left.appendChild(title);
    left.appendChild(summary);

    const right = document.createElement('div');
    right.className = 'task-right';
    right.innerHTML = `
      <div>İş Emri: ${fields.customfield_10117 || '-'}</div>
      <div>Resim No: ${fields.customfield_10184 || '-'}</div>
      <div>Poz No: ${fields.customfield_10185 || '-'}</div>
      <div>Adet: ${fields.customfield_10187 || '-'}</div>
    `;

    card.appendChild(left);
    card.appendChild(right);
    ul.appendChild(card);
  });
}

export function setupMachineFilters(filters, onClick) {
  const select = document.getElementById('filter-select');
  select.innerHTML = '<option value="">Seçiniz...</option>'; // Reset options with placeholder

  filters.forEach(f => {
    const option = document.createElement('option');
    option.value = f.id;
    option.textContent = f.name;
    select.appendChild(option);
  });

  select.onchange = () => {
    onClick(select.value); // Call handler with selected value
  };
}

export function setupSearchInput() {
  document.getElementById('search-input').oninput = (e) => {
    const term = e.target.value.trim().toLowerCase();
    const filtered = state.allIssues.filter(issue =>
      issue.key.toLowerCase().includes(term)
    );
    renderTaskList(filtered, () => {
      // This callback is not used in the main machining view
      // Timer functionality is handled in task.js
    });
  };
}
