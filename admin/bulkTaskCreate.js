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
    function renderTable() {
        let html = `<h4>Toplu Görev Oluştur</h4><form id="bulk-task-form"><div class="table-responsive"><table class="table table-bordered table-sm"><thead><tr>`;
        for (const col of columns) {
            html += `<th>${col.label}</th>`;
        }
        html += `<th>İşlem</th></tr></thead><tbody>`;
        rows.forEach((row, i) => {
            html += `<tr>`;
            for (const col of columns) {
                html += `<td><input type="${col.key === 'quantity' || col.key === 'estimated_hours' ? 'number' : (col.key === 'finish_time' ? 'date' : 'text')}" class="form-control bulk-input" data-row="${i}" data-key="${col.key}" value="${row[col.key] || ''}"></td>`;
            }
            html += `<td>
                <button type="button" class="btn btn-sm btn-secondary bulk-duplicate" data-row="${i}">Kopyala</button>
                <button type="button" class="btn btn-sm btn-danger bulk-remove" data-row="${i}" ${rows.length === 1 ? 'disabled' : ''}>Sil</button>
            </td></tr>`;
        });
        html += `</tbody></table></div>
        <button type="button" class="btn btn-success" id="bulk-add-row">Satır Ekle</button>
        <button type="submit" class="btn btn-primary ms-2">Toplu Oluştur</button>
        </form>`;
        mainContent.innerHTML = html;
        // Add event listeners
        document.querySelectorAll('.bulk-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = parseInt(input.getAttribute('data-row'));
                const key = input.getAttribute('data-key');
                rows[row][key] = input.value;
            });
        });
        document.querySelectorAll('.bulk-duplicate').forEach(btn => {
            btn.addEventListener('click', () => {
                const rowIdx = parseInt(btn.getAttribute('data-row'));
                const newRow = { ...rows[rowIdx] };
                rows.splice(rowIdx + 1, 0, newRow);
                renderTable();
            });
        });
        document.querySelectorAll('.bulk-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const rowIdx = parseInt(btn.getAttribute('data-row'));
                if (rows.length > 1) {
                    rows.splice(rowIdx, 1);
                    renderTable();
                }
            });
        });
        document.getElementById('bulk-add-row').onclick = () => {
            rows.push(Object.fromEntries(columns.map(c => [c.key, ''])));
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
                machine_fk: row.machine_fk,
                finish_time: row.finish_time || null
            }));
            try {
                const resp = await fetch('/machining/tasks/bulk-create/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) throw new Error('Toplu görev oluşturulamadı');
                alert('Görevler başarıyla oluşturuldu!');
                rows = [Object.fromEntries(columns.map(c => [c.key, '']))];
                renderTable();
            } catch (err) {
                alert('Hata: ' + err.message);
            }
        };
    }
    renderTable();
} 