import { initNavbar } from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';
import { enforceAuth, isAdmin } from '../authService.js';
import { showUserCreateForm } from './createUser.js';
import { showUserList } from './listUsers.js';
import { showMesaiTalebiForm } from './mesaiTalebi.js';
import { showMachiningLiveReport } from './machiningReport.js';
import { showMachineList } from './machineList.js';
import { showJiraSettings } from './jiraSettings.js';
import { showMesaiTaleplerim } from './mesaiTaleplerim.js';
import { showBulkUserCreateForm } from './bulkUserCreate.js';

export const state = {
    machines: [],
    activeTimers: []
}

function handleSidebarClick(label, callback) {
    return (e) => {
        e.stopPropagation();
        localStorage.setItem('admin_last_view', label);
        callback();
    };
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
    // On page load, show a welcome or blank page
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (mainContent) {
        mainContent.innerHTML = `<div class="row"><div class="col-12 text-center mt-5"><h3>Yönetim Paneline Hoşgeldiniz</h3></div></div>`;
    }

    const sidebarRoot = document.getElementById('sidebar-root');
    if (sidebarRoot) {
        const sidebar = new Sidebar(sidebarRoot);
        sidebar.addItem('Özet');
        sidebar.addItem('Kullanıcılar', { subItems: ['Kullanıcı Ekle', 'Kullanıcı Listesi', 'Çoklu Kullanıcı Ekle'] });
        sidebar.addItem('Mesailer', { subItems: ['Mesai Talebi Gönder', 'Mesai Taleplerim'] });
        sidebar.addItem('Talaşlı İmalat', { subItems: ['Canlı Takip', 'Makine Listesi'] });
        //sidebar.addItem('Kaynaklı İmalat', { subItems: ['Makine Ekle', 'Makine Listesi'] });
        //sidebar.addItem('CNC Kesim', { subItems: ['Makine Ekle', 'Machine Listesi'] });  
        sidebar.addItem('Ayarlar', { subItems: ['Jira Ayarları'] });

        const kullaniciEkleItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Kullanıcı Ekle');
        if (kullaniciEkleItem) {
            kullaniciEkleItem.addEventListener('click', handleSidebarClick('Kullanıcı Ekle', showUserCreateForm));
        }

        const cokluKullaniciEkleItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Çoklu Kullanıcı Ekle');
        if (cokluKullaniciEkleItem) {
            cokluKullaniciEkleItem.addEventListener('click', handleSidebarClick('Çoklu Kullanıcı Ekle', showBulkUserCreateForm));
        }

        const mesaiTalebiGonderItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Mesai Talebi Gönder');
        if (mesaiTalebiGonderItem) {
            mesaiTalebiGonderItem.addEventListener('click', handleSidebarClick('Mesai Talebi Gönder', showMesaiTalebiForm));
        }

        const kullaniciListesiItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Kullanıcı Listesi');
        if (kullaniciListesiItem) {
            kullaniciListesiItem.addEventListener('click', handleSidebarClick('Kullanıcı Listesi', showUserList));
        }

        // Add event for Talaşlı İmalat > Canlı Takip
        const canliTakipItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Canlı Takip');
        if (canliTakipItem) {
            canliTakipItem.addEventListener('click', handleSidebarClick('Canlı Takip', showMachiningLiveReport));
        }

        // Add event for Talaşlı İmalat > Makine Listesi
        const makinaListesiItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Makine Listesi');
        if (makinaListesiItem) {
            makinaListesiItem.addEventListener('click', handleSidebarClick('Makine Listesi', showMachineList));
        }

        // Add event for Ayarlar > Jira Ayarları
        const jiraAyarItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Jira Ayarları');
        if (jiraAyarItem) {
            jiraAyarItem.addEventListener('click', handleSidebarClick('Jira Ayarları', showJiraSettings));
        }

        // Add event for Mesai Taleplerim
        const mesaiTaleplerimItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Mesai Taleplerim');
        if (mesaiTaleplerimItem) {
            mesaiTaleplerimItem.addEventListener('click', handleSidebarClick('Mesai Taleplerim', showMesaiTaleplerim));
        }

        // Restore last view if available
        const lastView = localStorage.getItem('admin_last_view');
        if (lastView) {
            switch (lastView) {
                case 'Kullanıcı Ekle': showUserCreateForm(); break;
                case 'Kullanıcı Listesi': showUserList(); break;
                case 'Çoklu Kullanıcı Ekle': showBulkUserCreateForm(); break;
                case 'Mesai Talebi Gönder': showMesaiTalebiForm(); break;
                case 'Mesai Taleplerim': showMesaiTaleplerim(); break;
                case 'Canlı Takip': showMachiningLiveReport(); break;
                case 'Makine Listesi': showMachineList(); break;
                case 'Jira Ayarları': showJiraSettings(); break;
                // Add more as needed
                default: break;
            }
        }
    }
});