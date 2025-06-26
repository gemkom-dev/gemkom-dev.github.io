import { backendBase } from '../base.js';
import { authedFetch } from '../authService.js';

export async function showUserCreateForm() {
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (!mainContent) return;
    mainContent.innerHTML = `<div class="row justify-content-center user-create-form"><div class="col-12 col-md-8 col-lg-6"><div class="card"><div class="card-header"><h5 class="mb-0">Kullanıcı Ekle</h5></div><div class="card-body"><form id="user-create-form"><div class="mb-3"><label for="username" class="form-label">Kullanıcı Adı</label><input type="text" class="form-control" id="username" required></div><div class="mb-3"><label for="team" class="form-label">Takım</label><select class="form-select" id="team" required><option value="">Takım seçiniz...</option></select></div><button type="submit" class="btn btn-primary w-100">Oluştur</button><div id="user-create-error" class="text-danger mt-2" style="display:none;"></div><div id="user-create-success" class="text-success mt-2" style="display:none;"></div></form></div></div></div></div>`;
    // Fetch teams
    try {
        const res = await authedFetch(`${backendBase}/users/teams/`);
        if (res.ok) {
            const teams = await res.json();
            const teamSelect = document.getElementById('team');
            teams.forEach(team => {
                const opt = document.createElement('option');
                opt.value = team.value;
                opt.textContent = team.label;
                teamSelect.appendChild(opt);
            });
        }
    } catch (e) {}
    // Form submit
    document.getElementById('user-create-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const team = document.getElementById('team').value;
        const errorDiv = document.getElementById('user-create-error');
        const successDiv = document.getElementById('user-create-success');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        if (!username || !team) {
            errorDiv.textContent = 'Tüm alanları doldurun.';
            errorDiv.style.display = 'block';
            return;
        }
        try {
            const res = await authedFetch(`${backendBase}/users/admin/create-user/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, team })
            });
            if (res.ok) {
                successDiv.textContent = 'Kullanıcı başarıyla oluşturuldu!';
                successDiv.style.display = 'block';
                document.getElementById('user-create-form').reset();
            } else {
                const data = await res.json().catch(() => ({}));
                errorDiv.textContent = data.message || 'Kullanıcı oluşturulamadı.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            errorDiv.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            errorDiv.style.display = 'block';
        }
    });
} 