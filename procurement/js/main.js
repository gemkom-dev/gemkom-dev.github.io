// Main Procurement Module
import { guardRoute } from '../../authService.js';
import { initNavbar } from '../../components/navbar.js';
import Sidebar from '../../components/sidebar.js';
import { SupplierManagement } from './supplierManagement.js';
import { ProcurementProcesses } from './procurementProcesses.js';

class ProcurementMain {
    constructor() {
        this.supplierManagement = new SupplierManagement();
        this.procurementProcesses = new ProcurementProcesses();
        this.currentModule = null;
    }

    init() {
        if (!guardRoute()) {
            return;
        }

        // Initialize navbar
        initNavbar();

        // Initialize sidebar
        this.initSidebar();

        // Show main dashboard
        this.showMainDashboard();
    }

    initSidebar() {
        const sidebarContainer = document.getElementById('sidebar-root');
        if (!sidebarContainer) return;

        const sidebar = new Sidebar(sidebarContainer);
        
        // Add sidebar items for procurement
        sidebar.addItem('Ana Sayfa', {
            subItems: [
                'Genel Bakış',
                'Dashboard',
                'Raporlar'
            ]
        });
        
        sidebar.addItem('Tedarik Yönetimi', {
            subItems: [
                'Tedarikçi Listesi',
                'Tedarikçi Değerlendirme',
                'Sözleşmeler',
                'Performans Analizi'
            ]
        });
        
        sidebar.addItem('Satın Alma Süreçleri', {
            subItems: [
                'Talep Yönetimi',
                'Teklif Toplama',
                'Sipariş Yönetimi',
                'Teslimat Takibi'
            ]
        });
        
        sidebar.addItem('Stok Yönetimi', {
            subItems: [
                'Stok Durumu',
                'Minimum Stok Seviyeleri',
                'Stok Hareketleri',
                'Envanter Sayımı'
            ]
        });
        
        sidebar.addItem('Maliyet Yönetimi', {
            subItems: [
                'Bütçe Planlama',
                'Maliyet Analizi',
                'Fiyat Karşılaştırma',
                'Tasarruf Raporları'
            ]
        });
        
        sidebar.addItem('Kalite Kontrol', {
            subItems: [
                'Kalite Standartları',
                'Kontrol Süreçleri',
                'Red/Onay İşlemleri',
                'Kalite Raporları'
            ]
        });
        
        sidebar.addItem('Raporlar', {
            subItems: [
                'Satın Alma Raporları',
                'Tedarikçi Raporları',
                'Maliyet Raporları',
                'Performans Raporları'
            ]
        });
        
        sidebar.addItem('Ayarlar', {
            subItems: [
                'Kullanıcı Yönetimi',
                'Sistem Ayarları',
                'Bildirim Ayarları',
                'Yedekleme'
            ]
        });

        // Add click handlers for sidebar items
        this.setupSidebarHandlers(sidebar);
    }

    setupSidebarHandlers(sidebar) {
        // Get all sidebar items and add click handlers
        const sidebarItems = sidebar.list.querySelectorAll('.sidebar-item');
        
        sidebarItems.forEach(item => {
            const label = item.querySelector('.sidebar-label');
            if (label) {
                label.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemText = label.textContent.trim();
                    
                    // Handle main menu items
                    switch (itemText) {
                        case 'Ana Sayfa':
                            this.showMainDashboard();
                            break;
                        case 'Tedarik Yönetimi':
                            this.supplierManagement.showSupplierManagement();
                            this.currentModule = 'supplier';
                            break;
                        case 'Satın Alma Süreçleri':
                            this.procurementProcesses.showProcurementProcesses();
                            this.currentModule = 'processes';
                            break;
                        case 'Stok Yönetimi':
                            this.showInventoryManagement();
                            break;
                        case 'Maliyet Yönetimi':
                            this.showCostManagement();
                            break;
                        case 'Kalite Kontrol':
                            this.showQualityControl();
                            break;
                        case 'Raporlar':
                            this.showReports();
                            break;
                        case 'Ayarlar':
                            this.showSettings();
                            break;
                    }
                });
            }
        });

        // Add click handlers for sub-items
        const subItems = sidebar.list.querySelectorAll('.sidebar-subitem');
        subItems.forEach(subItem => {
            subItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const subItemText = subItem.textContent.trim();
                
                // Handle sub-menu items
                switch (subItemText) {
                    case 'Tedarikçi Listesi':
                        this.supplierManagement.showSupplierList();
                        break;
                    case 'Tedarikçi Değerlendirme':
                        this.supplierManagement.showSupplierEvaluation();
                        break;
                    case 'Sözleşmeler':
                        this.supplierManagement.showContracts();
                        break;
                    case 'Performans Analizi':
                        this.supplierManagement.showPerformanceAnalysis();
                        break;
                    case 'Talep Yönetimi':
                        this.procurementProcesses.showDemandManagement();
                        break;
                    case 'Teklif Toplama':
                        this.procurementProcesses.showQuoteCollection();
                        break;
                    case 'Sipariş Yönetimi':
                        this.procurementProcesses.showOrderManagement();
                        break;
                    case 'Teslimat Takibi':
                        this.procurementProcesses.showDeliveryTracking();
                        break;
                    case 'Genel Bakış':
                        this.showMainDashboard();
                        break;
                    case 'Dashboard':
                        this.showMainDashboard();
                        break;
                    case 'Raporlar':
                        this.showReports();
                        break;
                }
            });
        });
    }

    showMainDashboard() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Satın Alma Modülü</h1>
                <p>Gelişmiş tedarik zinciri yönetimi ve satın alma süreçleri</p>
            </div>
            
            <div class="procurement-stats">
                <div class="stat-card">
                    <h3>0</h3>
                    <p>Aktif Sipariş</p>
                </div>
                <div class="stat-card">
                    <h3>0</h3>
                    <p>Bekleyen Talep</p>
                </div>
                <div class="stat-card">
                    <h3>0</h3>
                    <p>Tedarikçi</p>
                </div>
                <div class="stat-card">
                    <h3>₺0</h3>
                    <p>Aylık Satın Alma</p>
                </div>
            </div>
            
            <div class="procurement-content">
                <h2>Hoş Geldiniz!</h2>
                <p>Satın alma modülü geliştirme aşamasındadır. Bu modül aşağıdaki özellikleri içerecektir:</p>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h4>🛒 Tedarik Yönetimi</h4>
                        <ul>
                            <li>Tedarikçi kayıt ve değerlendirme</li>
                            <li>Tedarikçi performans analizi</li>
                            <li>Sözleşme yönetimi</li>
                            <li>Tedarikçi kategorilendirme</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h4>📋 Satın Alma Süreçleri</h4>
                        <ul>
                            <li>Talep yönetimi ve onay süreçleri</li>
                            <li>Teklif toplama ve değerlendirme</li>
                            <li>Sipariş oluşturma ve takibi</li>
                            <li>Teslimat ve kabul süreçleri</li>
                        </ul>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h4>📦 Stok Yönetimi</h4>
                        <ul>
                            <li>Gerçek zamanlı stok takibi</li>
                            <li>Minimum stok seviyesi uyarıları</li>
                            <li>Stok hareket geçmişi</li>
                            <li>Envanter sayım ve düzeltme</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h4>💰 Maliyet Yönetimi</h4>
                        <ul>
                            <li>Bütçe planlama ve takibi</li>
                            <li>Maliyet analizi ve raporlama</li>
                            <li>Fiyat karşılaştırma araçları</li>
                            <li>Tasarruf hedefleri ve raporları</li>
                        </ul>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h4>✅ Kalite Kontrol</h4>
                        <ul>
                            <li>Kalite standartları tanımlama</li>
                            <li>Gelen mal kontrol süreçleri</li>
                            <li>Red/onay işlemleri</li>
                            <li>Kalite raporları ve analizler</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h4>📊 Raporlar ve Analizler</h4>
                        <ul>
                            <li>Detaylı satın alma raporları</li>
                            <li>Tedarikçi performans raporları</li>
                            <li>Maliyet analiz raporları</li>
                            <li>Trend analizi ve tahminleme</li>
                        </ul>
                    </div>
                </div>
                
                <div class="alert alert-warning mt-4">
                    <strong>Geliştirme Aşamasında:</strong> Bu modül aktif olarak geliştirilmektedir. 
                    Özellikler kademeli olarak eklenecek ve güncellenecektir.
                </div>
            </div>
        `;
    }

    showInventoryManagement() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Stok Yönetimi</h1>
                <p>Stok takibi ve envanter yönetimi</p>
            </div>
            
            <div class="procurement-content">
                <div class="alert alert-info">
                    <strong>Geliştirme Aşamasında:</strong> Stok yönetimi modülü yakında eklenecektir.
                </div>
            </div>
        `;
    }

    showCostManagement() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Maliyet Yönetimi</h1>
                <p>Bütçe planlama ve maliyet analizi</p>
            </div>
            
            <div class="procurement-content">
                <div class="alert alert-info">
                    <strong>Geliştirme Aşamasında:</strong> Maliyet yönetimi modülü yakında eklenecektir.
                </div>
            </div>
        `;
    }

    showQualityControl() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Kalite Kontrol</h1>
                <p>Kalite standartları ve kontrol süreçleri</p>
            </div>
            
            <div class="procurement-content">
                <div class="alert alert-info">
                    <strong>Geliştirme Aşamasında:</strong> Kalite kontrol modülü yakında eklenecektir.
                </div>
            </div>
        `;
    }

    showReports() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Raporlar</h1>
                <p>Detaylı raporlar ve analizler</p>
            </div>
            
            <div class="procurement-content">
                <div class="alert alert-info">
                    <strong>Geliştirme Aşamasında:</strong> Raporlar modülü yakında eklenecektir.
                </div>
            </div>
        `;
    }

    showSettings() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Ayarlar</h1>
                <p>Sistem ayarları ve konfigürasyon</p>
            </div>
            
            <div class="procurement-content">
                <div class="alert alert-info">
                    <strong>Geliştirme Aşamasında:</strong> Ayarlar modülü yakında eklenecektir.
                </div>
            </div>
        `;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const procurementApp = new ProcurementMain();
    procurementApp.init();
    
    // Make modules globally available for onclick handlers
    window.supplierManagement = procurementApp.supplierManagement;
    window.procurementProcesses = procurementApp.procurementProcesses;
}); 