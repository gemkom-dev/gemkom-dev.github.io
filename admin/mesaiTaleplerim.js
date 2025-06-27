import { authedFetch } from '../authService.js';
import { proxyBase } from '../base.js';

const JIRA_BASE = 'https://gemkom-1.atlassian.net'; // Use your actual Jira base URL

export async function showMesaiTaleplerim() {
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (!mainContent) return;
    mainContent.innerHTML = '<div class="text-center mt-4">Yükleniyor...</div>';

    // 1. Fetch all MES epics and their stories for current user
    const jql = `project=MES AND reporter=currentUser() AND (issuetype=Epic OR "Epic Link" is not EMPTY)`;
    const fields = 'summary,key,issuetype,"Epic Link",customfield_11172,customfield_11173';
    const jiraUrl = `${JIRA_BASE}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${encodeURIComponent(fields)}`;
    const url = proxyBase + encodeURIComponent(jiraUrl);
    let issues = [];
    try {
        const res = await authedFetch(url);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        issues = data.issues || [];
    } catch (e) {
        mainContent.innerHTML = '<div class="text-danger">Veriler alınamadı.</div>';
        return;
    }

    // 2. Separate epics and stories
    const epics = issues.filter(i => i.fields.issuetype.name === 'Epic');
    const stories = issues.filter(i => i.fields["Epic Link"]);

    // 3. Sort epics by customfield_11172 (start date, latest first)
    epics.sort((a, b) => {
        const aDate = a.fields.customfield_11172 ? new Date(a.fields.customfield_11172) : 0;
        const bDate = b.fields.customfield_11172 ? new Date(b.fields.customfield_11172) : 0;
        return bDate - aDate;
    });

    // 4. Render epics as collapsible, with stories inside
    mainContent.innerHTML = '<h4 class="mb-4">Mesai Taleplerim</h4>';
    if (epics.length === 0) {
        mainContent.innerHTML += '<div class="text-muted">Hiç mesai talebi bulunamadı.</div>';
        return;
    }
    epics.forEach((epic, idx) => {
        const epicStories = stories.filter(s => s.fields["Epic Link"] === epic.key);
        const start = epic.fields.customfield_11172 ? formatDateTime(epic.fields.customfield_11172) : '-';
        const end = epic.fields.customfield_11173 ? formatDateTime(epic.fields.customfield_11173) : '-';
        const epicId = `epic-${epic.key}`;
        mainContent.innerHTML += `
        <div class="card mb-2">
          <div class="card-header" style="cursor:pointer;" data-bs-toggle="collapse" data-bs-target="#${epicId}">
            <b>${epic.fields.summary}</b> <span class="text-secondary">(${epic.key})</span>
            <span class="ms-2">Başlangıç: <b>${start}</b></span>
            <span class="ms-2">Bitiş: <b>${end}</b></span>
            <span class="float-end">${epicStories.length} story</span>
          </div>
          <div id="${epicId}" class="collapse${idx===0?' show':''}">
            <ul class="list-group list-group-flush">
              ${epicStories.length === 0 ? '<li class="list-group-item text-muted">Hiç story yok.</li>' :
                epicStories.map(story => `
                  <li class="list-group-item">
                    <b>${story.fields.summary}</b> <span class="text-secondary">(${story.key})</span>
                    <span class="ms-2">Başlangıç: <b>${story.fields.customfield_11172 ? formatDateTime(story.fields.customfield_11172) : '-'}</b></span>
                    <span class="ms-2">Bitiş: <b>${story.fields.customfield_11173 ? formatDateTime(story.fields.customfield_11173) : '-'}</b></span>
                  </li>
                `).join('')}
            </ul>
          </div>
        </div>
        `;
    });
    // Bootstrap collapse support
    setTimeout(() => {
      document.querySelectorAll('.card-header[data-bs-toggle="collapse"]').forEach(header => {
        header.onclick = () => {
          const target = document.getElementById(header.getAttribute('data-bs-target').replace('#',''));
          if (target.classList.contains('show')) {
            target.classList.remove('show');
          } else {
            target.classList.add('show');
          }
        };
      });
    }, 100);
}

function formatDateTime(dt) {
    // Jira date format: 2024-06-01T08:00:00.000+0300
    const d = new Date(dt);
    if (isNaN(d)) return '-';
    return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
} 