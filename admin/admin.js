import { initNavbar } from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';
import { enforceAuth, isAdmin } from '../authService.js';
import { showUserCreateForm } from './createUser.js';
import { showUserList } from './listUsers.js';
import { showMesaiTalebiForm } from './mesaiTalebi.js';
import { showMachiningLiveReport } from './machiningReport.js';
import { showMachineList } from './machineList.js';
import { fetchMachines } from '../machining/machiningService.js';
import { showJiraSettings } from './jiraSettings.js';

export const state = {
    machines: [],
    activeTimers: []
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
    const machines = await fetchMachines();
    state.machines = machines;
    // On page load, show a welcome or blank page
    const mainContent = document.querySelector('.admin-main-content .container-fluid');
    if (mainContent) {
        mainContent.innerHTML = `<div class="row"><div class="col-12 text-center mt-5"><h3>Yönetim Paneline Hoşgeldiniz</h3></div></div>`;
    }

    const sidebarRoot = document.getElementById('sidebar-root');
    if (sidebarRoot) {
        const sidebar = new Sidebar(sidebarRoot);
        sidebar.addItem('Özet');
        sidebar.addItem('Kullanıcılar', { subItems: ['Kullanıcı Ekle', 'Kullanıcı Listesi'] });
        sidebar.addItem('Mesailer', { subItems: ['Mesai Talebi Gönder', 'Mesai Taleplerim'] });
        sidebar.addItem('Talaşlı İmalat', { subItems: ['Canlı Takip', 'Makine Listesi'] });
        sidebar.addItem('Kaynaklı İmalat', { subItems: ['Makine Ekle', 'Makine Listesi'] });
        sidebar.addItem('CNC Kesim', { subItems: ['Makine Ekle', 'Machine Listesi'] });  
        sidebar.addItem('Ayarlar', { subItems: ['Jira Ayarları'] });

        const kullaniciEkleItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Kullanıcı Ekle');
        if (kullaniciEkleItem) {
            kullaniciEkleItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showUserCreateForm();
            });
        }

        const mesaiTalebiGonderItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Mesai Talebi Gönder');
        if (mesaiTalebiGonderItem) {
            mesaiTalebiGonderItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showMesaiTalebiForm();
            });
        }

        const kullaniciListesiItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Kullanıcı Listesi');
        if (kullaniciListesiItem) {
            kullaniciListesiItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showUserList();
            });
        }

        // Add event for Talaşlı İmalat > Canlı Takip
        const canliTakipItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Canlı Takip');
        if (canliTakipItem) {
            canliTakipItem.addEventListener('click', async (e) => {
                e.stopPropagation();
                showMachiningLiveReport();
            });
        }

        // Add event for Talaşlı İmalat > Makine Listesi
        const makinaListesiItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Makine Listesi');
        if (makinaListesiItem) {
            makinaListesiItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showMachineList();
            });
        }

        // Add event for Ayarlar > Jira Ayarları
        const jiraAyarItem = Array.from(document.querySelectorAll('.sidebar-subitem')).find(el => el.textContent.trim() === 'Jira Ayarları');
        if (jiraAyarItem) {
            jiraAyarItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showJiraSettings();
            });
        }
    }
});