import { guardRoute } from '../authService.js';
import { initNavbar } from '../components/navbar.js';
import Sidebar from '../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!guardRoute()) {
        return;
    }

    // Initialize navbar
    initNavbar();

    // Initialize sidebar
    const sidebarContainer = document.getElementById('sidebar-root');
    if (sidebarContainer) {
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
        setupSidebarHandlers(sidebar);
    }

    // Initialize main content
    initializeMainContent();
});

function setupSidebarHandlers(sidebar) {
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
                        showMainDashboard();
                        break;
                    case 'Tedarik Yönetimi':
                        showSupplierManagement();
                        break;
                    case 'Satın Alma Süreçleri':
                        showProcurementProcesses();
                        break;
                    case 'Stok Yönetimi':
                        showInventoryManagement();
                        break;
                    case 'Maliyet Yönetimi':
                        showCostManagement();
                        break;
                    case 'Kalite Kontrol':
                        showQualityControl();
                        break;
                    case 'Raporlar':
                        showReports();
                        break;
                    case 'Ayarlar':
                        showSettings();
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
                    showSupplierList();
                    break;
                case 'Tedarikçi Değerlendirme':
                    showSupplierEvaluation();
                    break;
                case 'Sözleşmeler':
                    showContracts();
                    break;
                case 'Performans Analizi':
                    showPerformanceAnalysis();
                    break;
                case 'Talep Yönetimi':
                    showDemandManagement();
                    break;
                case 'Teklif Toplama':
                    showQuoteCollection();
                    break;
                case 'Sipariş Yönetimi':
                    showOrderManagement();
                    break;
                case 'Teslimat Takibi':
                    showDeliveryTracking();
                    break;
                case 'Genel Bakış':
                    showMainDashboard();
                    break;
                case 'Dashboard':
                    showMainDashboard();
                    break;
                case 'Raporlar':
                    showReports();
                    break;
            }
        });
    });
}

function showMainDashboard() {
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

function showSupplierManagement() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Tedarik Yönetimi</h1>
            <p>Tedarikçi kayıt, değerlendirme ve performans analizi</p>
        </div>
        
        <div class="procurement-stats">
            <div class="stat-card">
                <h3>0</h3>
                <p>Toplam Tedarikçi</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Aktif Sözleşme</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Bekleyen Değerlendirme</p>
            </div>
            <div class="stat-card">
                <h3>₺0</h3>
                <p>Toplam Tedarik Değeri</p>
            </div>
        </div>
        
        <div class="procurement-content">
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>🛒 Tedarikçi İşlemleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action" onclick="showSupplierList()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Tedarikçi Listesi</h6>
                                        <small class="text-muted">0 tedarikçi</small>
                                    </div>
                                    <p class="mb-1">Kayıtlı tedarikçileri görüntüle ve yönet</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showSupplierEvaluation()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Tedarikçi Değerlendirme</h6>
                                        <small class="text-muted">0 bekleyen</small>
                                    </div>
                                    <p class="mb-1">Tedarikçi performans değerlendirmesi</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showContracts()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Sözleşmeler</h6>
                                        <small class="text-muted">0 aktif</small>
                                    </div>
                                    <p class="mb-1">Tedarikçi sözleşmelerini yönet</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showPerformanceAnalysis()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Performans Analizi</h6>
                                        <small class="text-muted">Analiz</small>
                                    </div>
                                    <p class="mb-1">Tedarikçi performans raporları</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>📊 Hızlı İstatistikler</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-primary">0</h4>
                                        <small class="text-muted">Aktif Tedarikçi</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-success">0</h4>
                                        <small class="text-muted">Yüksek Performans</small>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-warning">0</h4>
                                        <small class="text-muted">Orta Performans</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-danger">0</h4>
                                        <small class="text-muted">Düşük Performans</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showSupplierList() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Tedarikçi Listesi</h1>
            <p>Tedarikçi kayıtlarını görüntüle ve yönet</p>
        </div>
        
        <div class="procurement-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Tedarikçiler</h2>
                <button class="btn btn-primary" onclick="showAddSupplierModal()">
                    <i class="fas fa-plus"></i> Yeni Tedarikçi Ekle
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Tedarikçi Adı</th>
                                    <th>Kategori</th>
                                    <th>İletişim</th>
                                    <th>Durum</th>
                                    <th>Performans</th>
                                    <th>Son Güncelleme</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        Henüz tedarikçi kaydı bulunmamaktadır.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showSupplierEvaluation() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Tedarikçi Değerlendirme</h1>
            <p>Tedarikçi performans değerlendirme ve analizi</p>
        </div>
        
        <div class="procurement-content">
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Değerlendirme Kriterleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Kalite (40%)</h6>
                                    <div class="progress mb-3">
                                        <div class="progress-bar bg-success" style="width: 0%">0%</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Teslimat (30%)</h6>
                                    <div class="progress mb-3">
                                        <div class="progress-bar bg-info" style="width: 0%">0%</div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Fiyat (20%)</h6>
                                    <div class="progress mb-3">
                                        <div class="progress-bar bg-warning" style="width: 0%">0%</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Hizmet (10%)</h6>
                                    <div class="progress mb-3">
                                        <div class="progress-bar bg-primary" style="width: 0%">0%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Değerlendirme Durumu</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center">
                                <h3 class="text-muted">0</h3>
                                <p class="text-muted">Bekleyen Değerlendirme</p>
                            </div>
                            <hr>
                            <div class="text-center">
                                <h3 class="text-muted">0</h3>
                                <p class="text-muted">Tamamlanan Değerlendirme</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showContracts() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Sözleşmeler</h1>
            <p>Tedarikçi sözleşmelerini yönet</p>
        </div>
        
        <div class="procurement-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Sözleşme Yönetimi</h2>
                <button class="btn btn-primary" onclick="showAddContractModal()">
                    <i class="fas fa-plus"></i> Yeni Sözleşme
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Aktif Sözleşmeler</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Sözleşme No</th>
                                            <th>Tedarikçi</th>
                                            <th>Başlangıç</th>
                                            <th>Bitiş</th>
                                            <th>Değer</th>
                                            <th>Durum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="7" class="text-center text-muted">
                                                Henüz sözleşme kaydı bulunmamaktadır.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Sözleşme İstatistikleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-success">0</h4>
                                    <small class="text-muted">Aktif</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-warning">0</h4>
                                    <small class="text-muted">Yakında Bitecek</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-danger">0</h4>
                                    <small class="text-muted">Süresi Dolmuş</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-info">0</h4>
                                    <small class="text-muted">Toplam</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showPerformanceAnalysis() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Performans Analizi</h1>
            <p>Tedarikçi performans analizi ve raporları</p>
        </div>
        
        <div class="procurement-content">
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Performans Dağılımı</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center">
                                <h3 class="text-muted">Henüz veri yok</h3>
                                <p class="text-muted">Performans verileri görüntülemek için tedarikçi değerlendirmeleri yapılmalıdır.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Trend Analizi</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center">
                                <h3 class="text-muted">Henüz veri yok</h3>
                                <p class="text-muted">Trend analizi için yeterli veri bulunmamaktadır.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5>Detaylı Performans Raporu</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center">
                                <h3 class="text-muted">Rapor Hazırlanıyor</h3>
                                <p class="text-muted">Detaylı performans raporu için tedarikçi verileri gereklidir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showProcurementProcesses() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Satın Alma Süreçleri</h1>
            <p>Talep yönetimi, teklif toplama ve sipariş süreçleri</p>
        </div>
        
        <div class="procurement-stats">
            <div class="stat-card">
                <h3>0</h3>
                <p>Bekleyen Talep</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Aktif Teklif</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Açık Sipariş</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Bekleyen Teslimat</p>
            </div>
        </div>
        
        <div class="procurement-content">
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>📋 Satın Alma Süreçleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action" onclick="showDemandManagement()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Talep Yönetimi</h6>
                                        <small class="text-muted">0 bekleyen</small>
                                    </div>
                                    <p class="mb-1">Satın alma taleplerini yönet ve onayla</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showQuoteCollection()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Teklif Toplama</h6>
                                        <small class="text-muted">0 aktif</small>
                                    </div>
                                    <p class="mb-1">Tedarikçilerden teklif topla ve değerlendir</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showOrderManagement()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Sipariş Yönetimi</h6>
                                        <small class="text-muted">0 açık</small>
                                    </div>
                                    <p class="mb-1">Siparişleri oluştur ve takip et</p>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action" onclick="showDeliveryTracking()">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Teslimat Takibi</h6>
                                        <small class="text-muted">0 bekleyen</small>
                                    </div>
                                    <p class="mb-1">Teslimat durumlarını takip et</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>📊 Süreç İstatistikleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-primary">0</h4>
                                        <small class="text-muted">Onay Bekleyen</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-warning">0</h4>
                                        <small class="text-muted">Teklif Aşamasında</small>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-info">0</h4>
                                        <small class="text-muted">Sipariş Edildi</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center">
                                        <h4 class="text-success">0</h4>
                                        <small class="text-muted">Teslim Edildi</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showInventoryManagement() {
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

function showCostManagement() {
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

function showQualityControl() {
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

function showReports() {
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

function showDemandManagement() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Talep Yönetimi</h1>
            <p>Satın alma taleplerini yönet ve onayla</p>
        </div>
        
        <div class="procurement-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Satın Alma Talepleri</h2>
                <button class="btn btn-primary" onclick="showAddDemandModal()">
                    <i class="fas fa-plus"></i> Yeni Talep Ekle
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Talep Listesi</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Talep No</th>
                                            <th>Talep Eden</th>
                                            <th>Ürün/Hizmet</th>
                                            <th>Miktar</th>
                                            <th>Öncelik</th>
                                            <th>Durum</th>
                                            <th>Tarih</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="8" class="text-center text-muted">
                                                Henüz talep kaydı bulunmamaktadır.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Talep Durumu</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-warning">0</h4>
                                    <small class="text-muted">Bekleyen</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-info">0</h4>
                                    <small class="text-muted">Onaylandı</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-danger">0</h4>
                                    <small class="text-muted">Reddedildi</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success">0</h4>
                                    <small class="text-muted">Tamamlandı</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showQuoteCollection() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Teklif Toplama</h1>
            <p>Tedarikçilerden teklif topla ve değerlendir</p>
        </div>
        
        <div class="procurement-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Teklif Yönetimi</h2>
                <button class="btn btn-primary" onclick="showAddQuoteModal()">
                    <i class="fas fa-plus"></i> Yeni Teklif Talebi
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Aktif Teklif Talepleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Teklif No</th>
                                            <th>Ürün/Hizmet</th>
                                            <th>Miktar</th>
                                            <th>Teklif Sayısı</th>
                                            <th>En Düşük Fiyat</th>
                                            <th>Son Tarih</th>
                                            <th>Durum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="8" class="text-center text-muted">
                                                Henüz teklif talebi bulunmamaktadır.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Teklif İstatistikleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-primary">0</h4>
                                    <small class="text-muted">Aktif</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success">0</h4>
                                    <small class="text-muted">Tamamlandı</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-warning">0</h4>
                                    <small class="text-muted">Bekleyen</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-info">0</h4>
                                    <small class="text-muted">Ortalama Teklif</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showOrderManagement() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Sipariş Yönetimi</h1>
            <p>Siparişleri oluştur ve takip et</p>
        </div>
        
        <div class="procurement-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Sipariş Yönetimi</h2>
                <button class="btn btn-primary" onclick="showAddOrderModal()">
                    <i class="fas fa-plus"></i> Yeni Sipariş
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Açık Siparişler</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Sipariş No</th>
                                            <th>Tedarikçi</th>
                                            <th>Ürün/Hizmet</th>
                                            <th>Miktar</th>
                                            <th>Toplam Tutar</th>
                                            <th>Teslimat Tarihi</th>
                                            <th>Durum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="8" class="text-center text-muted">
                                                Henüz sipariş kaydı bulunmamaktadır.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Sipariş Durumu</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-primary">0</h4>
                                    <small class="text-muted">Açık</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-warning">0</h4>
                                    <small class="text-muted">Hazırlanıyor</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-info">0</h4>
                                    <small class="text-muted">Yolda</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success">0</h4>
                                    <small class="text-muted">Teslim Edildi</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showDeliveryTracking() {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = `
        <div class="procurement-header">
            <h1>Teslimat Takibi</h1>
            <p>Teslimat durumlarını takip et</p>
        </div>
        
        <div class="procurement-content">
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5>Bekleyen Teslimatlar</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Sipariş No</th>
                                            <th>Tedarikçi</th>
                                            <th>Ürün/Hizmet</th>
                                            <th>Planlanan Teslimat</th>
                                            <th>Güncel Durum</th>
                                            <th>Gecikme</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="7" class="text-center text-muted">
                                                Henüz teslimat kaydı bulunmamaktadır.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Teslimat İstatistikleri</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-primary">0</h4>
                                    <small class="text-muted">Bekleyen</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success">0</h4>
                                    <small class="text-muted">Zamanında</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-warning">0</h4>
                                    <small class="text-muted">Gecikmeli</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-danger">0</h4>
                                    <small class="text-muted">İptal</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showSettings() {
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

// Global functions for modal calls
window.showAddSupplierModal = function() {
    alert('Tedarikçi ekleme modalı yakında eklenecektir.');
};

window.showAddContractModal = function() {
    alert('Sözleşme ekleme modalı yakında eklenecektir.');
};

window.showAddDemandModal = function() {
    alert('Talep ekleme modalı yakında eklenecektir.');
};

window.showAddQuoteModal = function() {
    alert('Teklif ekleme modalı yakında eklenecektir.');
};

window.showAddOrderModal = function() {
    alert('Sipariş ekleme modalı yakında eklenecektir.');
};

function initializeMainContent() {
    showMainDashboard();
} 