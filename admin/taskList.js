import { backendBase, jiraBase, proxyBase } from '../base.js';
import { authedFetch } from '../authService.js';

const columns = [
    { key: 'key', label: 'TI No' },
    { key: 'name', label: 'Ad' },
    { key: 'job_no', label: 'İş No' },
    { key: 'image_no', label: 'Resim No' },
    { key: 'position_no', label: 'Pozisyon No' },
    { key: 'quantity', label: 'Adet' },
    { key: 'estimated_hours', label: 'Tahmini Saat' },
    { key: 'machine_fk', label: 'Makine' },
    { key: 'finish_time', label: 'Bitiş Tarihi' },
    { key: 'total_hours_spent', label: 'Toplam Harcanan Saat' },
    { key: 'completion_date', label: 'Tamamlanma Tarihi' },
    { key: 'completed_by_username', label: 'Tamamlayan' },
    { key: 'status', label: 'Durum' },
    { key: 'actions', label: '' },
];

function buildTaskListQuery() {
    let key = document.getElementById('key').value.trim();
    const name = document.getElementById('name').value.trim();
    const job_no = document.getElementById('job_no').value.trim();
    const image_no = document.getElementById('image_no').value.trim();
    const position_no = document.getElementById('position_no').value.trim();
    const completed_by = document.getElementById('completed_by').value.trim();
    const completion_date_gte = document.getElementById('completion_date_gte').value;
    const completion_date_lte = document.getElementById('completion_date_lte').value;
    const status = document.getElementById('status_filter').value;
    let params = [];
    // Accept numbers for TI Numarası and prepend 'TI-' if needed
    if (key) {
        if (/^\d+$/.test(key)) {
            key = 'TI-' + key;
        }
        params.push(`key=${encodeURIComponent(key)}`);
    }
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (job_no) params.push(`job_no=${encodeURIComponent(job_no)}`);
    if (image_no) params.push(`image_no=${encodeURIComponent(image_no)}`);
    if (position_no) params.push(`position_no=${encodeURIComponent(position_no)}`);
    if (completed_by) params.push(`completed_by=${encodeURIComponent(completed_by)}`);
    if (completion_date_gte) {
        const ts = new Date(completion_date_gte).getTime();
        if (!isNaN(ts)) params.push(`completion_date__gte=${ts}`);
    }
    if (completion_date_lte) {
        const ts = new Date(completion_date_lte).getTime();
        if (!isNaN(ts)) params.push(`completion_date__lte=${ts}`);
    }
    if (status === 'active') params.push('completion_date__isnull=true');
    if (status === 'completed') params.push('completion_date__isnull=false');
    return params.length ? '?' + params.join('&') : '';
}

// Add Enter key support for all filter inputs
export async function showTaskListSection() {
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (!mainContent) return;
    mainContent.innerHTML = `
        <div class="row mb-3">
            <div class="col-12">
                <h3>Talaşlı İmalat İşler</h3>
                
                <!-- TEMPORARY SYNC BUTTON - REMOVE LATER -->
                <div class="alert alert-warning mb-3">
                    <strong>Temporary Feature:</strong> 
                    <button type="button" id="sync-jira-btn" class="btn btn-warning btn-sm ms-2">
                        <i class="bi bi-arrow-repeat"></i> Sync Database with Jira
                    </button>
                    <small class="d-block mt-1">This button and its logic should be removed after use.</small>
                </div>
                <!-- END TEMPORARY SECTION -->
                
                <form id="task-list-filters" class="row g-3 align-items-end">
                    <div class="col-md-2">
                        <label for="key" class="form-label">TI Numarası</label>
                        <input type="text" class="form-control" id="key" placeholder="TI-123">
                    </div>
                    <div class="col-md-2">
                        <label for="name" class="form-label">Ad</label>
                        <input type="text" class="form-control" id="name" placeholder="Ad">
                    </div>
                    <div class="col-md-2">
                        <label for="job_no" class="form-label">İş No</label>
                        <input type="text" class="form-control" id="job_no" placeholder="İş No">
                    </div>
                    <div class="col-md-2">
                        <label for="image_no" class="form-label">Resim No</label>
                        <input type="text" class="form-control" id="image_no" placeholder="Resim No">
                    </div>
                    <div class="col-md-2">
                        <label for="position_no" class="form-label">Pozisyon No</label>
                        <input type="text" class="form-control" id="position_no" placeholder="Pozisyon No">
                    </div>
                    <div class="col-md-2">
                        <label for="completed_by" class="form-label">Tamamlayan</label>
                        <input type="text" class="form-control" id="completed_by" placeholder="Tamamlayan">
                    </div>
                    <div class="col-md-2">
                        <label for="completion_date_gte" class="form-label">Bitiş Tarihi (En Erken)</label>
                        <input type="date" class="form-control" id="completion_date_gte">
                    </div>
                    <div class="col-md-2">
                        <label for="completion_date_lte" class="form-label">Bitiş Tarihi (En Geç)</label>
                        <input type="date" class="form-control" id="completion_date_lte">
                    </div>
                    <div class="col-md-2">
                        <label for="status_filter" class="form-label">Durum</label>
                        <select class="form-select" id="status_filter">
                            <option value="">Hepsi</option>
                            <option value="active">Aktif</option>
                            <option value="completed">Tamamlanmış</option>
                        </select>
                    </div>
                    <div class="col-md-2 mt-2">
                        <button type="button" id="fetch-task-list-btn" class="btn btn-primary w-100">Listele</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div id="task-list-table-container"></div>
            </div>
        </div>
    `;

    document.getElementById('fetch-task-list-btn').addEventListener('click', async () => {
        await renderTaskListTable();
    });
    
    // TEMPORARY: Add event listener for sync button
    document.getElementById('sync-jira-btn').addEventListener('click', async () => {
        await handleJiraSync();
    });
    
    // Initial fetch
    document.getElementById('fetch-task-list-btn').click();

    // Add Enter key support for all filter inputs
    document.querySelectorAll('#task-list-filters input, #task-list-filters select').forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('fetch-task-list-btn').click();
            }
        });
    });
}

async function renderTaskListTable() {
    const container = document.getElementById('task-list-table-container');
    container.innerHTML = '<div>Yükleniyor...</div>';
    try {
        const query = buildTaskListQuery();
        const url = `${backendBase}/machining/tasks/${query}`;
        const resp = await authedFetch(url);
        if (!resp.ok) throw new Error('Liste alınamadı');
        const result = await resp.json();
        const data = result.results;
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<div>Sonuç bulunamadı.</div>';
            return;
        }
        let html = `<div class="table-responsive"><table class="table table-bordered table-sm"><thead><tr>`;
        for (const col of columns) {
            html += `<th>${col.label}</th>`;
        }
        html += '</tr></thead><tbody>';
        for (const row of data) {
            html += '<tr>';
            for (const col of columns) {
                let val;
                if (col.key === 'status') {
                    if (!row.completion_date) {
                        val = '<span class="badge bg-success">Aktif</span>';
                    } else {
                        val = '<span class="badge bg-primary">Tamamlandı</span>';
                    }
                } else if (col.key === 'key') {
                    val = row.key ? `<a href="https://gemkom-1.atlassian.net/browse/${row.key}" target="_blank">${row.key}</a>` : '';
                } else if (col.key === 'completion_date') {
                    val = row.completion_date ? new Date(row.completion_date).toLocaleString('tr-TR') : '';
                } else if (col.key === 'finish_time') {
                    val = row.finish_time ? new Date(row.finish_time).toLocaleDateString('tr-TR') : '';
                } else if (col.key === 'estimated_hours') {
                    val = row.estimated_hours ? `${row.estimated_hours} saat` : '';
                } else if (col.key === 'total_hours_spent') {
                    val = row.total_hours_spent ? `${row.total_hours_spent} saat` : '';
                } else if (col.key === 'machine_fk') {
                    val = row.machine_fk ? row.machine_fk : '';
                } else if (col.key === 'actions') {
                    if (!row.completion_date) {
                        val = `<button class="btn btn-sm btn-success mark-done-btn" data-key="${row.key}">Tamamlandı Olarak İşaretle</button>`;
                    } else {
                        val = `<button class="btn btn-sm btn-warning unmark-done-btn" data-key="${row.key}">Tamamlanmadı Olarak İşaretle</button>`;
                    }
                } else if (col.key === 'completed_by_username'){
                    val = row['completed_by_username'] ? row['completed_by_username'] : '';
                }
                else {
                    val = row[col.key] == null ? '' : row[col.key];
                }
                html += `<td>${val}</td>`;
            }
            html += '</tr>';
        }
        html += `</tbody></table></div>`;
        container.innerHTML = html;

        // Add event listeners for mark as done buttons
        container.querySelectorAll('.mark-done-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const key = btn.getAttribute('data-key');
                btn.disabled = true;
                btn.textContent = 'Gönderiliyor...';
                try {
                    const resp = await authedFetch(`${backendBase}/machining/tasks/mark-completed/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key })
                    });
                    if (!resp.ok) throw new Error('İşaretleme başarısız');
                    btn.textContent = 'Tamamlandı';
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-secondary');
                    // Optionally refresh the table
                    await renderTaskListTable();
                } catch (err) {
                    btn.disabled = false;
                    btn.textContent = 'Tamamlandı Olarak İşaretle';
                    alert('Hata: ' + err.message);
                }
            });
        });

        // Add event listeners for unmark as done buttons
        container.querySelectorAll('.unmark-done-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const key = btn.getAttribute('data-key');
                btn.disabled = true;
                btn.textContent = 'Gönderiliyor...';
                try {
                    const resp = await authedFetch(`${backendBase}/machining/tasks/unmark-completed/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key })
                    });
                    if (!resp.ok) throw new Error('İşaretleme başarısız');
                    btn.textContent = 'Tamamlanmadı';
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-secondary');
                    // Optionally refresh the table
                    await renderTaskListTable();
                } catch (err) {
                    btn.disabled = false;
                    btn.textContent = 'Tamamlanmadı Olarak İşaretle';
                    alert('Hata: ' + err.message);
                }
            });
        });
    } catch (err) {
        container.innerHTML = `<div class="text-danger">Hata: ${err.message}</div>`;
    }
}

// ============================================================================
// TEMPORARY JIRA SYNC FUNCTION - REMOVE LATER
// ============================================================================

async function handleJiraSync() {
    const syncBtn = document.getElementById('sync-jira-btn');
    const originalText = syncBtn.innerHTML;
    
    try {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Syncing...';
        
        // First, fetch machines to map names to IDs
        const machinesResponse = await authedFetch(`${backendBase}/machines/`);
        if (!machinesResponse.ok) {
            throw new Error('Failed to fetch machines list');
        }
        const machines = await machinesResponse.json();
        
        // Create a mapping of machine names to IDs
        const machineNameToId = {};
        machines.forEach(machine => {
            machineNameToId[machine.name] = machine.id;
        });
        
        console.log('Machine mapping:', machineNameToId);
        
        const jql = `project=TI AND status="To Do"`;
        const encodedJql = encodeURIComponent(jql);
        
        const url = `${jiraBase}/rest/api/3/search?jql=${encodedJql}&maxResults=1000&fields=summary,customfield_10117,customfield_10184,customfield_10185,customfield_10187,customfield_11411,duedate,timeoriginalestimate`;
        const res = await authedFetch(proxyBase + encodeURIComponent(url), {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        console.log('Jira issues fetched:', data.issues.length);
        
        // Map Jira issues to database format
        const mappedTasks = data.issues.map(issue => {
            const fields = issue.fields;
            
            // Convert timeoriginalestimate from seconds to hours
            let estimatedHours = null;
            if (fields.timeoriginalestimate) {
                estimatedHours = Math.round((fields.timeoriginalestimate / 3600) * 100) / 100; // Convert seconds to hours, round to 2 decimal places
            }
            
            // Convert duedate to timestamp if it exists
            let finishTime = null;
            if (fields.duedate) {
                finishTime = new Date(fields.duedate).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
            }
            
            // Map machine name to machine ID
            let machineId = null;
            if (fields.customfield_11411 && fields.customfield_11411.value) {
                machineId = machineNameToId[fields.customfield_11411.value] || null;
                if (!machineId) {
                    console.warn(`Machine not found in database: ${fields.customfield_11411.value}`);
                }
            }
            
            return {
                key: issue.key,
                name: fields.summary || '',
                job_no: fields.customfield_10117 || null,
                image_no: fields.customfield_10184 || null,
                position_no: fields.customfield_10185 || null,
                quantity: fields.customfield_10187 ? parseInt(fields.customfield_10187) : null,
                estimated_hours: estimatedHours,
                finish_time: finishTime,
                machine_fk: machineId,
                is_hold_task: false // Default to false, you might want to add logic to detect hold tasks
            };
        });
        
        console.log('Mapped tasks:', mappedTasks);
        
        // Send individual PATCH requests for each task
        let updatedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const task of mappedTasks) {
            try {
                const patchResponse = await authedFetch(`${backendBase}/machining/tasks/${task.key}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                });
                
                if (patchResponse.ok) {
                    updatedCount++;
                } else {
                    const errorData = await patchResponse.json();
                    errors.push(`${task.key}: ${errorData.message || 'Update failed'}`);
                    errorCount++;
                }
            } catch (error) {
                errors.push(`${task.key}: ${error.message}`);
                errorCount++;
            }
        }
        
        // Show results
        let message = `Sync completed!\n\nProcessed: ${mappedTasks.length} issues\nUpdated: ${updatedCount} tasks\nErrors: ${errorCount} tasks`;
        
        if (errors.length > 0) {
            message += `\n\nError details:\n${errors.slice(0, 5).join('\n')}`;
            if (errors.length > 5) {
                message += `\n... and ${errors.length - 5} more errors`;
            }
        }
        
        alert(message);
        
    } catch (error) {
        console.error('Jira sync error:', error);
        alert(`Sync failed: ${error.message}`);
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = originalText;
    }
}

// ============================================================================
// END TEMPORARY SECTION
// ============================================================================ 