import { authedFetch } from '../authService.js';
import { backendBase } from '../base.js';

// admin/bulkTaskCreate.js
export function showBulkTaskCreate() {
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (!mainContent) return;
    // Columns for bulk creation (no key)
    const columns = [
        { key: 'name', label: 'Ad' },
        { key: 'job_no', label: 'İş No' },
        { key: 'image_no', label: 'Resim No' },
        { key: 'position_no', label: 'Pozisyon No' },
        { key: 'quantity', label: 'Adet' },
        { key: 'estimated_hours', label: 'Tahmini Saat' },
        { key: 'machine_fk', label: 'Makine' },
        { key: 'finish_time', label: 'Bitiş Tarihi' }
    ];
    let rows = [Object.fromEntries(columns.map(c => [c.key, '']))];
    let machines = []; // Store machines list
    let hasUnsavedChanges = false; // Track unsaved changes
    let initialRows = JSON.stringify(rows); // Store initial state
    
    async function loadMachines() {
        try {
            const { fetchMachines } = await import('../generic/machines.js');
            machines = await fetchMachines('machining');
        } catch (error) {
            console.error('Error loading machines:', error);
            machines = [];
        }
    }
    
    // Function to check if there are unsaved changes
    function checkForUnsavedChanges() {
        const currentRows = JSON.stringify(rows);
        hasUnsavedChanges = currentRows !== initialRows;
        return hasUnsavedChanges;
    }
    
    // Function to update initial state (called after successful save)
    function updateInitialState() {
        initialRows = JSON.stringify(rows);
        hasUnsavedChanges = false;
    }
    
    // Add beforeunload event listener
    function setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (checkForUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?';
                return 'Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?';
            }
        });
    }
    
    // Remove beforeunload event listener when leaving the page
    function cleanupBeforeUnload() {
        window.removeEventListener('beforeunload', setupBeforeUnload);
    }
    
    function renderTable() {
        let html = `<h4>Toplu Görev Oluştur</h4><form id="bulk-task-form"><div class="table-responsive"><table class="table table-bordered table-sm"><thead><tr>`;
        for (const col of columns) {
            html += `<th>${col.label}</th>`;
        }
        html += `<th>İşlem</th></tr></thead><tbody>`;
        rows.forEach((row, i) => {
            html += `<tr>`;
            for (const col of columns) {
                if (col.key === 'machine_fk') {
                    // Render machine dropdown
                    html += `<td><select class="form-control bulk-input" data-row="${i}" data-key="${col.key}">`;
                    html += `<option value="">Makine seçin...</option>`;
                    machines.forEach(machine => {
                        const selected = row[col.key] == machine.id ? 'selected' : '';
                        html += `<option value="${machine.id}" ${selected}>${machine.name}</option>`;
                    });
                    html += `</select></td>`;
                } else {
                    html += `<td><input type="${col.key === 'quantity' || col.key === 'estimated_hours' ? 'number' : (col.key === 'finish_time' ? 'date' : 'text')}" class="form-control bulk-input" data-row="${i}" data-key="${col.key}" value="${row[col.key] || ''}"></td>`;
                }
            }
            html += `<td>
                <button type="button" class="btn btn-sm btn-secondary bulk-duplicate" data-row="${i}">Kopyala</button>
                <button type="button" class="btn btn-sm btn-danger bulk-remove" data-row="${i}" ${rows.length === 1 ? 'disabled' : ''}>Sil</button>
            </td></tr>`;
        });
        html += `</tbody></table></div>
        <button type="button" class="btn btn-success" id="bulk-add-row">Satır Ekle</button>
        <button type="submit" class="btn btn-primary ms-2">Oluştur</button>
        </form>`;
        mainContent.innerHTML = html;
        
        // Setup beforeunload event listener
        setupBeforeUnload();
        
        // Add event listeners
        document.querySelectorAll('.bulk-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = parseInt(input.getAttribute('data-row'));
                const key = input.getAttribute('data-key');
                rows[row][key] = input.value;
                checkForUnsavedChanges(); // Check for changes after input
            });
        });
        document.querySelectorAll('.bulk-input').forEach(select => {
            select.addEventListener('change', (e) => {
                const row = parseInt(select.getAttribute('data-row'));
                const key = select.getAttribute('data-key');
                rows[row][key] = select.value;
                checkForUnsavedChanges(); // Check for changes after selection
            });
        });
        document.querySelectorAll('.bulk-duplicate').forEach(btn => {
            btn.addEventListener('click', () => {
                const rowIdx = parseInt(btn.getAttribute('data-row'));
                const newRow = { ...rows[rowIdx] };
                rows.splice(rowIdx + 1, 0, newRow);
                checkForUnsavedChanges(); // Check for changes after duplication
                renderTable();
            });
        });
        document.querySelectorAll('.bulk-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const rowIdx = parseInt(btn.getAttribute('data-row'));
                if (rows.length > 1) {
                    rows.splice(rowIdx, 1);
                    checkForUnsavedChanges(); // Check for changes after removal
                    renderTable();
                }
            });
        });
        document.getElementById('bulk-add-row').onclick = () => {
            rows.push(Object.fromEntries(columns.map(c => [c.key, ''])));
            checkForUnsavedChanges(); // Check for changes after adding row
            renderTable();
        };
        document.getElementById('bulk-task-form').onsubmit = async (e) => {
            e.preventDefault();
            // Prepare payload, remove key, convert types
            const payload = rows.map(row => ({
                name: row.name,
                job_no: row.job_no,
                image_no: row.image_no,
                position_no: row.position_no,
                quantity: row.quantity ? parseInt(row.quantity) : null,
                estimated_hours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
                machine_fk: row.machine_fk ? parseInt(row.machine_fk) : null,
                finish_time: row.finish_time || null
            }));
            try {
                const resp = await authedFetch(`${backendBase}/machining/tasks/bulk-create/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) throw new Error('Toplu görev oluşturulamadı');
                alert('Görevler başarıyla oluşturuldu!');
                rows = [Object.fromEntries(columns.map(c => [c.key, '']))];
                updateInitialState(); // Reset unsaved changes state
                renderTable();
            } catch (err) {
                alert('Hata: ' + err.message);
            }
        };
    }
    
    // Load machines first, then render table
    loadMachines().then(() => {
        renderTable();
    });
    
    // Cleanup function to remove event listeners when leaving the page
    return () => {
        cleanupBeforeUnload();
    };
} 