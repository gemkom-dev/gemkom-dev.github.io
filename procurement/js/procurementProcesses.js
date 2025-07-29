// Procurement Processes Module
export class ProcurementProcesses {
    constructor() {
        this.demands = [];
        this.quotes = [];
        this.orders = [];
        this.deliveries = [];
    }

    showProcurementProcesses() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Satın Alma Süreçleri</h1>
                <p>Talep yönetimi, teklif toplama ve sipariş süreçleri</p>
            </div>
            
            <div class="procurement-stats">
                <div class="stat-card">
                    <h3>${this.demands.filter(d => d.status === 'pending').length}</h3>
                    <p>Bekleyen Talep</p>
                </div>
                <div class="stat-card">
                    <h3>${this.quotes.filter(q => q.status === 'active').length}</h3>
                    <p>Aktif Teklif</p>
                </div>
                <div class="stat-card">
                    <h3>${this.orders.filter(o => o.status === 'open').length}</h3>
                    <p>Açık Sipariş</p>
                </div>
                <div class="stat-card">
                    <h3>${this.deliveries.filter(d => d.status === 'pending').length}</h3>
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
                                    <a href="#" class="list-group-item list-group-item-action" onclick="procurementProcesses.showDemandManagement()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Talep Yönetimi</h6>
                                            <small class="text-muted">${this.demands.filter(d => d.status === 'pending').length} bekleyen</small>
                                        </div>
                                        <p class="mb-1">Satın alma taleplerini yönet ve onayla</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="procurementProcesses.showQuoteCollection()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Teklif Toplama</h6>
                                            <small class="text-muted">${this.quotes.filter(q => q.status === 'active').length} aktif</small>
                                        </div>
                                        <p class="mb-1">Tedarikçilerden teklif topla ve değerlendir</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="procurementProcesses.showOrderManagement()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Sipariş Yönetimi</h6>
                                            <small class="text-muted">${this.orders.filter(o => o.status === 'open').length} açık</small>
                                        </div>
                                        <p class="mb-1">Siparişleri oluştur ve takip et</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="procurementProcesses.showDeliveryTracking()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Teslimat Takibi</h6>
                                            <small class="text-muted">${this.deliveries.filter(d => d.status === 'pending').length} bekleyen</small>
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
                                            <h4 class="text-primary">${this.demands.filter(d => d.status === 'pending').length}</h4>
                                            <small class="text-muted">Onay Bekleyen</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-warning">${this.quotes.filter(q => q.status === 'active').length}</h4>
                                            <small class="text-muted">Teklif Aşamasında</small>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-info">${this.orders.filter(o => o.status === 'ordered').length}</h4>
                                            <small class="text-muted">Sipariş Edildi</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-success">${this.deliveries.filter(d => d.status === 'delivered').length}</h4>
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

    showDemandManagement() {
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
                    <button class="btn btn-primary" onclick="procurementProcesses.showAddDemandModal()">
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
                                            ${this.renderDemandTableRows()}
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
                                        <h4 class="text-warning">${this.demands.filter(d => d.status === 'pending').length}</h4>
                                        <small class="text-muted">Bekleyen</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-info">${this.demands.filter(d => d.status === 'approved').length}</h4>
                                        <small class="text-muted">Onaylandı</small>
                                    </div>
                                </div>
                                <hr>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-danger">${this.demands.filter(d => d.status === 'rejected').length}</h4>
                                        <small class="text-muted">Reddedildi</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-success">${this.demands.filter(d => d.status === 'completed').length}</h4>
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

    showQuoteCollection() {
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
                    <button class="btn btn-primary" onclick="procurementProcesses.showAddQuoteModal()">
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
                                            ${this.renderQuoteTableRows()}
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
                                        <h4 class="text-primary">${this.quotes.filter(q => q.status === 'active').length}</h4>
                                        <small class="text-muted">Aktif</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-success">${this.quotes.filter(q => q.status === 'completed').length}</h4>
                                        <small class="text-muted">Tamamlandı</small>
                                    </div>
                                </div>
                                <hr>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-warning">${this.quotes.filter(q => q.status === 'pending').length}</h4>
                                        <small class="text-muted">Bekleyen</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-info">${this.calculateAverageQuotes()}</h4>
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

    showOrderManagement() {
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
                    <button class="btn btn-primary" onclick="procurementProcesses.showAddOrderModal()">
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
                                            ${this.renderOrderTableRows()}
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
                                        <h4 class="text-primary">${this.orders.filter(o => o.status === 'open').length}</h4>
                                        <small class="text-muted">Açık</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-warning">${this.orders.filter(o => o.status === 'preparing').length}</h4>
                                        <small class="text-muted">Hazırlanıyor</small>
                                    </div>
                                </div>
                                <hr>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-info">${this.orders.filter(o => o.status === 'in-transit').length}</h4>
                                        <small class="text-muted">Yolda</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-success">${this.orders.filter(o => o.status === 'delivered').length}</h4>
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

    showDeliveryTracking() {
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
                                            ${this.renderDeliveryTableRows()}
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
                                        <h4 class="text-primary">${this.deliveries.filter(d => d.status === 'pending').length}</h4>
                                        <small class="text-muted">Bekleyen</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-success">${this.deliveries.filter(d => d.status === 'on-time').length}</h4>
                                        <small class="text-muted">Zamanında</small>
                                    </div>
                                </div>
                                <hr>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-warning">${this.deliveries.filter(d => d.status === 'delayed').length}</h4>
                                        <small class="text-muted">Gecikmeli</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-danger">${this.deliveries.filter(d => d.status === 'cancelled').length}</h4>
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

    // Helper methods
    calculateAverageQuotes() {
        if (this.quotes.length === 0) return 0;
        const totalQuotes = this.quotes.reduce((sum, quote) => sum + (quote.quoteCount || 0), 0);
        return Math.round(totalQuotes / this.quotes.length);
    }

    renderDemandTableRows() {
        if (this.demands.length === 0) {
            return `<tr><td colspan="8" class="text-center text-muted">Henüz talep kaydı bulunmamaktadır.</td></tr>`;
        }
        
        return this.demands.map(demand => `
            <tr>
                <td>${demand.number}</td>
                <td>${demand.requester}</td>
                <td>${demand.product}</td>
                <td>${demand.quantity}</td>
                <td><span class="badge bg-${demand.priority === 'high' ? 'danger' : demand.priority === 'medium' ? 'warning' : 'success'}">${demand.priority}</span></td>
                <td><span class="badge bg-${demand.status === 'pending' ? 'warning' : demand.status === 'approved' ? 'success' : demand.status === 'rejected' ? 'danger' : 'info'}">${demand.status}</span></td>
                <td>${demand.date}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Düzenle</button>
                    <button class="btn btn-sm btn-danger">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    renderQuoteTableRows() {
        if (this.quotes.length === 0) {
            return `<tr><td colspan="8" class="text-center text-muted">Henüz teklif talebi bulunmamaktadır.</td></tr>`;
        }
        
        return this.quotes.map(quote => `
            <tr>
                <td>${quote.number}</td>
                <td>${quote.product}</td>
                <td>${quote.quantity}</td>
                <td>${quote.quoteCount}</td>
                <td>₺${quote.lowestPrice?.toLocaleString()}</td>
                <td>${quote.deadline}</td>
                <td><span class="badge bg-${quote.status === 'active' ? 'primary' : quote.status === 'completed' ? 'success' : 'warning'}">${quote.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary">Düzenle</button>
                    <button class="btn btn-sm btn-danger">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    renderOrderTableRows() {
        if (this.orders.length === 0) {
            return `<tr><td colspan="8" class="text-center text-muted">Henüz sipariş kaydı bulunmamaktadır.</td></tr>`;
        }
        
        return this.orders.map(order => `
            <tr>
                <td>${order.number}</td>
                <td>${order.supplier}</td>
                <td>${order.product}</td>
                <td>${order.quantity}</td>
                <td>₺${order.totalAmount?.toLocaleString()}</td>
                <td>${order.deliveryDate}</td>
                <td><span class="badge bg-${order.status === 'open' ? 'primary' : order.status === 'preparing' ? 'warning' : order.status === 'in-transit' ? 'info' : 'success'}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary">Düzenle</button>
                    <button class="btn btn-sm btn-danger">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    renderDeliveryTableRows() {
        if (this.deliveries.length === 0) {
            return `<tr><td colspan="7" class="text-center text-muted">Henüz teslimat kaydı bulunmamaktadır.</td></tr>`;
        }
        
        return this.deliveries.map(delivery => `
            <tr>
                <td>${delivery.orderNumber}</td>
                <td>${delivery.supplier}</td>
                <td>${delivery.product}</td>
                <td>${delivery.plannedDelivery}</td>
                <td><span class="badge bg-${delivery.status === 'pending' ? 'warning' : delivery.status === 'on-time' ? 'success' : delivery.status === 'delayed' ? 'danger' : 'secondary'}">${delivery.status}</span></td>
                <td>${delivery.delay || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Takip Et</button>
                    <button class="btn btn-sm btn-success">Teslim Al</button>
                </td>
            </tr>
        `).join('');
    }

    // Modal functions
    showAddDemandModal() {
        alert('Talep ekleme modalı yakında eklenecektir.');
    }

    showAddQuoteModal() {
        alert('Teklif ekleme modalı yakında eklenecektir.');
    }

    showAddOrderModal() {
        alert('Sipariş ekleme modalı yakında eklenecektir.');
    }
} 