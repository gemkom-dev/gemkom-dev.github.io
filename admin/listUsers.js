import { fetchUsers } from '../authService.js';

export async function showUserList() {
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (!mainContent) return;
    mainContent.innerHTML = `
        <div class="row justify-content-center user-list">
            <div class="col-12 col-md-10">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Kullanıcı Listesi</h5>
                    </div>
                    <div class="card-body">
                        <div id="user-list-table-container">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    try {
        const users = await fetchUsers();
        
        // Group users by team
        const usersByTeam = {};
        users.forEach(user => {
            const teamName = user.team_label || 'Takım Belirtilmemiş';
            if (!usersByTeam[teamName]) {
                usersByTeam[teamName] = [];
            }
            usersByTeam[teamName].push(user);
        });
        
        // Sort teams alphabetically
        const sortedTeams = Object.keys(usersByTeam).sort();
        
        const tableHtml = `
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th style="width: 30px;"></th>
                        <th>Kullanıcı Adı</th>
                        <th style="text-align:center;">Admin mi?</th>
                        <th>Ad Soyad</th>
                        <th>E-posta</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTeams.map((teamName, teamIndex) => `
                        <tr class="team-header-row" data-team="${teamName}" style="background-color: #f8f9fa; font-weight: bold;">
                            <td style="text-align: center;">
                                <button class="team-toggle-btn" data-team="${teamName}" aria-label="Aç/Kapat">
                                    <span class="team-toggle-icon" data-team="${teamName}">&#8250;</span>
                                </button>
                            </td>
                            <td colspan="4">
                                <i class="bi bi-people-fill me-2"></i>
                                ${teamName} (${usersByTeam[teamName].length} kullanıcı)
                            </td>
                        </tr>
                        ${usersByTeam[teamName].map(user => `
                            <tr class="team-member-row" data-team="${teamName}" style="display: none;">
                                <td></td>
                                <td><strong>${user.username}</strong></td>
                                <td style="text-align:center; font-size:1.3em;">
                                    ${user.is_admin || user.is_superuser
                                        ? '<span style="color:green;" title="Admin">&#10004;</span>'
                                        : '<span style="color:red;" title="Kullanıcı">&#10008;</span>'}
                                </td>
                                <td>${user.first_name || ''} ${user.last_name || ''}</td>
                                <td>${user.email || ''}</td>
                            </tr>
                        `).join('')}
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('user-list-table-container').innerHTML = tableHtml;
        
        // Add event listeners for collapsible functionality
        document.querySelectorAll('.team-toggle-btn').forEach(button => {
            button.addEventListener('click', function() {
                const teamName = this.getAttribute('data-team');
                const memberRows = document.querySelectorAll(`.team-member-row[data-team="${teamName}"]`);
                const icon = document.querySelector(`.team-toggle-icon[data-team="${teamName}"]`);
                const isOpen = icon.classList.contains('open');
                
                if (isOpen) {
                    // Collapse
                    icon.classList.remove('open');
                    icon.innerHTML = '&#8250;';
                    icon.style.transform = '';
                    memberRows.forEach(row => row.style.display = 'none');
                } else {
                    // Expand
                    icon.classList.add('open');
                    icon.innerHTML = '&#8250;';
                    icon.style.transform = 'rotate(90deg)';
                    memberRows.forEach(row => row.style.display = 'table-row');
                    setTimeout(() => { memberRows.forEach(row => row.style.background = '#f6faff'); }, 80);
                }
            });
        });
    } catch (err) {
        document.getElementById('user-list-table-container').innerHTML = 'Kullanıcılar yüklenemedi.';
    }
} 