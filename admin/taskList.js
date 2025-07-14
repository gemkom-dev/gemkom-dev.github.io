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
    { key: 'machine_name', label: 'Makine' },
    { key: 'finish_time', label: 'Bitiş Tarihi' },
    { key: 'total_hours_spent', label: 'Harcanan Saat' },
    { key: 'completion_date', label: 'Tamamlanma Tarihi' },
    { key: 'completed_by_username', label: 'Tamamlayan' },
    { key: 'status', label: 'Durum' },
    { key: 'actions', label: '' },
];

// Track current page at module level
let currentPage = 1;
let lastQueryParams = '';
// Track ordering
let currentOrdering = { field: null, direction: 'asc' };

function buildTaskListQuery(page = 1) {
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
    params.push(`page=${page}`);
    params.push(`page_size=50`);
    // Add ordering param if set
    if (currentOrdering.field) {
        const prefix = currentOrdering.direction === 'desc' ? '-' : '';
        params.push(`ordering=${prefix}${currentOrdering.field}`);
    }
    lastQueryParams = params.join('&');
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
        currentPage = 1; // Reset to first page on new filter
        await renderTaskListTable(1);
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

async function renderTaskListTable(page = currentPage) {
    const container = document.getElementById('task-list-table-container');
    container.innerHTML = '<div>Yükleniyor...</div>';
    try {
        const query = buildTaskListQuery(page);
        const url = `${backendBase}/machining/tasks/${query}`;
        const resp = await authedFetch(url);
        if (!resp.ok) throw new Error('Liste alınamadı');
        const result = await resp.json();
        const data = result.results;
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<div>Sonuç bulunamadı.</div>';
            return;
        }
        // Pagination controls (top)
        let html = `<div class="table-responsive">`;
        html += renderPagination(result, page);
        html += `<table class="table table-bordered table-sm"><thead><tr>`;
        for (const col of columns) {
            // Only allow ordering for data columns, not 'actions'
            if (col.key !== 'actions') {
                let arrow = '';
                if (currentOrdering.field === col.key) {
                    arrow = currentOrdering.direction === 'asc' ? ' ▲' : ' ▼';
                }
                html += `<th class="sortable-col" data-key="${col.key}" style="cursor:pointer;">${col.label}${arrow}</th>`;
            } else {
                html += `<th>${col.label}</th>`;
            }
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
                    val = row.estimated_hours ? `${row.estimated_hours}` : '';
                } else if (col.key === 'total_hours_spent') {
                    val = row.total_hours_spent ? `${row.total_hours_spent}` : '';
                } else if (col.key === 'machine_name') {
                    val = row.machine_name ? row.machine_name : '';
                } else if (col.key === 'actions') {
                    val = '';
                    if (!row.completion_date) {
                        val += `<button class="btn btn-sm btn-success mark-done-btn" data-key="${row.key}">Bitir</button> `;
                    } else {
                        val += `<button class="btn btn-sm btn-warning unmark-done-btn" data-key="${row.key}">Tekrar Aç</button> `;
                    }
                    val += `<button class="btn btn-sm btn-primary edit-task-btn" data-key="${row.key}">Düzenle</button> `;
                    val += `<button class="btn btn-sm btn-danger delete-task-btn" data-key="${row.key}">Sil</button>`;
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
        html += `</tbody></table>`;
        // Pagination controls (bottom)
        html += renderPagination(result, page);
        html += `</div>`;
        // Add edit modal (hidden by default)
        if (!document.getElementById('edit-task-modal')) {
            const modalHtml = `
            <div class="modal" tabindex="-1" id="edit-task-modal" style="display:none; background:rgba(0,0,0,0.5); position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:1050; align-items:center; justify-content:center;">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Görevi Düzenle</h5>
                            <button type="button" class="btn-close" id="close-edit-modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-task-form">
                                <div class="mb-2">
                                    <label class="form-label">Ad</label>
                                    <input type="text" class="form-control" id="edit-name" required>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">İş No</label>
                                    <input type="text" class="form-control" id="edit-job_no">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Resim No</label>
                                    <input type="text" class="form-control" id="edit-image_no">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Pozisyon No</label>
                                    <input type="text" class="form-control" id="edit-position_no">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Adet</label>
                                    <input type="number" class="form-control" id="edit-quantity">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Tahmini Saat</label>
                                    <input type="number" step="0.01" class="form-control" id="edit-estimated_hours">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Makine</label>
                                    <input type="text" class="form-control" id="edit-machine_fk">
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Bitiş Tarihi</label>
                                    <input type="date" class="form-control" id="edit-finish_time">
                                </div>
                                <input type="hidden" id="edit-key">
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-edit-modal">İptal</button>
                            <button type="submit" class="btn btn-primary" id="save-edit-modal">Kaydet</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
        container.innerHTML = html;

        // Add event listeners for sortable columns
        container.querySelectorAll('.sortable-col').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.getAttribute('data-key');
                if (!key) return;
                if (currentOrdering.field === key) {
                    // Toggle direction
                    currentOrdering.direction = currentOrdering.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentOrdering.field = key;
                    currentOrdering.direction = 'asc';
                }
                currentPage = 1; // Reset to first page on ordering change
                renderTaskListTable(1);
            });
        });

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

        // Add event listeners for edit and delete buttons
        container.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                const task = data.find(t => t.key === key);
                if (!task) return;
                // Fill modal fields
                document.getElementById('edit-key').value = task.key;
                document.getElementById('edit-name').value = task.name || '';
                document.getElementById('edit-job_no').value = task.job_no || '';
                document.getElementById('edit-image_no').value = task.image_no || '';
                document.getElementById('edit-position_no').value = task.position_no || '';
                document.getElementById('edit-quantity').value = task.quantity || '';
                document.getElementById('edit-estimated_hours').value = task.estimated_hours || '';
                document.getElementById('edit-machine_fk').value = task.machine_fk || '';
                document.getElementById('edit-finish_time').value = task.finish_time ? (typeof task.finish_time === 'string' && task.finish_time.length >= 10 ? task.finish_time.substring(0,10) : '') : '';
                // Show modal
                const modal = document.getElementById('edit-task-modal');
                modal.style.display = 'flex';
            });
        });
        container.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const key = btn.getAttribute('data-key');
                if (!key) return;
                if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
                try {
                    const resp = await authedFetch(`${backendBase}/machining/tasks/${key}/`, {
                        method: 'DELETE',
                    });
                    if (!resp.ok) throw new Error('Silme başarısız');
                    await renderTaskListTable(currentPage);
                } catch (err) {
                    alert('Hata: ' + err.message);
                }
            });
        });
        // Modal event listeners
        const modal = document.getElementById('edit-task-modal');
        if (modal) {
            // Close modal
            document.getElementById('close-edit-modal').onclick = () => { modal.style.display = 'none'; };
            document.getElementById('cancel-edit-modal').onclick = () => { modal.style.display = 'none'; };
            // Save changes
            document.getElementById('save-edit-modal').onclick = async (e) => {
                e.preventDefault();
                const key = document.getElementById('edit-key').value;
                const payload = {
                    name: document.getElementById('edit-name').value,
                    job_no: document.getElementById('edit-job_no').value,
                    image_no: document.getElementById('edit-image_no').value,
                    position_no: document.getElementById('edit-position_no').value,
                    quantity: document.getElementById('edit-quantity').value ? parseInt(document.getElementById('edit-quantity').value) : null,
                    estimated_hours: document.getElementById('edit-estimated_hours').value ? parseFloat(document.getElementById('edit-estimated_hours').value) : null,
                    machine_fk: document.getElementById('edit-machine_fk').value,
                    finish_time: document.getElementById('edit-finish_time').value || null
                };
                try {
                    const resp = await authedFetch(`${backendBase}/machining/tasks/${key}/`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!resp.ok) throw new Error('Güncelleme başarısız');
                    modal.style.display = 'none';
                    await renderTaskListTable(currentPage);
                } catch (err) {
                    alert('Hata: ' + err.message);
                }
            };
        }

        // Add event listeners for pagination
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (!isNaN(page)) {
                    currentPage = page;
                    renderTaskListTable(page);
                }
            });
        });
    } catch (err) {
        container.innerHTML = `<div class="text-danger">Hata: ${err.message}</div>`;
    }
}

function renderPagination(result, currentPage) {
    // result: API response object with count, next, previous, etc.
    const pageSize = result.results.length;
    const totalCount = result.count || 0;
    const pageCount = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;
    if (pageCount <= 1) return '';
    let html = '<nav><ul class="pagination justify-content-center mt-3">';
    // Previous button
    html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}"><button class="page-link pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>Önceki</button></li>`;
    // Page numbers (show up to 5 pages, with ... if needed)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pageCount, currentPage + 2);
    if (currentPage <= 3) {
        endPage = Math.min(5, pageCount);
    }
    if (currentPage >= pageCount - 2) {
        startPage = Math.max(1, pageCount - 4);
    }
    if (startPage > 1) {
        html += `<li class="page-item"><button class="page-link pagination-btn" data-page="1">1</button></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item${i === currentPage ? ' active' : ''}"><button class="page-link pagination-btn" data-page="${i}">${i}</button></li>`;
    }
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${pageCount}">${pageCount}</button></li>`;
    }
    // Next button
    html += `<li class="page-item${currentPage === pageCount ? ' disabled' : ''}"><button class="page-link pagination-btn" data-page="${currentPage + 1}" ${currentPage === pageCount ? 'tabindex="-1" aria-disabled="true"' : ''}>Sonraki</button></li>`;
    html += '</ul></nav>';
    return html;
}
