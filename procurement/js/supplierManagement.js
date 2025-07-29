// Supplier Management Module
export class SupplierManagement {
    constructor() {
        this.suppliers = [];
        this.contracts = [];
        this.evaluations = [];
    }

    showSupplierManagement() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="procurement-header">
                <h1>Tedarik Yönetimi</h1>
                <p>Tedarikçi kayıt, değerlendirme ve performans analizi</p>
            </div>
            
            <div class="procurement-stats">
                <div class="stat-card">
                    <h3>${this.suppliers.length}</h3>
                    <p>Toplam Tedarikçi</p>
                </div>
                <div class="stat-card">
                    <h3>${this.contracts.filter(c => c.status === 'active').length}</h3>
                    <p>Aktif Sözleşme</p>
                </div>
                <div class="stat-card">
                    <h3>${this.evaluations.filter(e => e.status === 'pending').length}</h3>
                    <p>Bekleyen Değerlendirme</p>
                </div>
                <div class="stat-card">
                    <h3>₺${this.calculateTotalSupplyValue()}</h3>
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
                                    <a href="#" class="list-group-item list-group-item-action" onclick="supplierManagement.showSupplierList()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Tedarikçi Listesi</h6>
                                            <small class="text-muted">${this.suppliers.length} tedarikçi</small>
                                        </div>
                                        <p class="mb-1">Kayıtlı tedarikçileri görüntüle ve yönet</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="supplierManagement.showSupplierEvaluation()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Tedarikçi Değerlendirme</h6>
                                            <small class="text-muted">${this.evaluations.filter(e => e.status === 'pending').length} bekleyen</small>
                                        </div>
                                        <p class="mb-1">Tedarikçi performans değerlendirmesi</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="supplierManagement.showContracts()">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">Sözleşmeler</h6>
                                            <small class="text-muted">${this.contracts.filter(c => c.status === 'active').length} aktif</small>
                                        </div>
                                        <p class="mb-1">Tedarikçi sözleşmelerini yönet</p>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-action" onclick="supplierManagement.showPerformanceAnalysis()">
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
                                            <h4 class="text-primary">${this.suppliers.filter(s => s.status === 'active').length}</h4>
                                            <small class="text-muted">Aktif Tedarikçi</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-success">${this.suppliers.filter(s => s.performance === 'high').length}</h4>
                                            <small class="text-muted">Yüksek Performans</small>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-warning">${this.suppliers.filter(s => s.performance === 'medium').length}</h4>
                                            <small class="text-muted">Orta Performans</small>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-center">
                                            <h4 class="text-danger">${this.suppliers.filter(s => s.performance === 'low').length}</h4>
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

    showSupplierList() {
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
                    <button class="btn btn-primary" onclick="supplierManagement.showAddSupplierModal()">
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
                                    ${this.renderSupplierTableRows()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showSupplierEvaluation() {
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
                                            <div class="progress-bar bg-success" style="width: ${this.calculateQualityScore()}%">${this.calculateQualityScore()}%</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>Teslimat (30%)</h6>
                                        <div class="progress mb-3">
                                            <div class="progress-bar bg-info" style="width: ${this.calculateDeliveryScore()}%">${this.calculateDeliveryScore()}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6>Fiyat (20%)</h6>
                                        <div class="progress mb-3">
                                            <div class="progress-bar bg-warning" style="width: ${this.calculatePriceScore()}%">${this.calculatePriceScore()}%</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>Hizmet (10%)</h6>
                                        <div class="progress mb-3">
                                            <div class="progress-bar bg-primary" style="width: ${this.calculateServiceScore()}%">${this.calculateServiceScore()}%</div>
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
                                    <h3 class="text-muted">${this.evaluations.filter(e => e.status === 'pending').length}</h3>
                                    <p class="text-muted">Bekleyen Değerlendirme</p>
                                </div>
                                <hr>
                                <div class="text-center">
                                    <h3 class="text-muted">${this.evaluations.filter(e => e.status === 'completed').length}</h3>
                                    <p class="text-muted">Tamamlanan Değerlendirme</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showContracts() {
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
                    <button class="btn btn-primary" onclick="supplierManagement.showAddContractModal()">
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
                                            ${this.renderContractTableRows()}
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
                                        <h4 class="text-success">${this.contracts.filter(c => c.status === 'active').length}</h4>
                                        <small class="text-muted">Aktif</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-warning">${this.contracts.filter(c => c.status === 'expiring').length}</h4>
                                        <small class="text-muted">Yakında Bitecek</small>
                                    </div>
                                </div>
                                <hr>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-danger">${this.contracts.filter(c => c.status === 'expired').length}</h4>
                                        <small class="text-muted">Süresi Dolmuş</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-info">${this.contracts.length}</h4>
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

    showPerformanceAnalysis() {
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
                                ${this.suppliers.length > 0 ? this.renderPerformanceChart() : `
                                    <div class="text-center">
                                        <h3 class="text-muted">Henüz veri yok</h3>
                                        <p class="text-muted">Performans verileri görüntülemek için tedarikçi değerlendirmeleri yapılmalıdır.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Trend Analizi</h5>
                            </div>
                            <div class="card-body">
                                ${this.evaluations.length > 0 ? this.renderTrendChart() : `
                                    <div class="text-center">
                                        <h3 class="text-muted">Henüz veri yok</h3>
                                        <p class="text-muted">Trend analizi için yeterli veri bulunmamaktadır.</p>
                                    </div>
                                `}
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
                                ${this.suppliers.length > 0 ? this.renderDetailedReport() : `
                                    <div class="text-center">
                                        <h3 class="text-muted">Rapor Hazırlanıyor</h3>
                                        <p class="text-muted">Detaylı performans raporu için tedarikçi verileri gereklidir.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    calculateTotalSupplyValue() {
        return this.contracts.reduce((total, contract) => total + (contract.value || 0), 0).toLocaleString();
    }

    calculateQualityScore() {
        if (this.evaluations.length === 0) return 0;
        const avgScore = this.evaluations.reduce((sum, evaluation) => sum + (evaluation.qualityScore || 0), 0) / this.evaluations.length;
        return Math.round(avgScore * 40);
    }

    calculateDeliveryScore() {
        if (this.evaluations.length === 0) return 0;
        const avgScore = this.evaluations.reduce((sum, evaluation) => sum + (evaluation.deliveryScore || 0), 0) / this.evaluations.length;
        return Math.round(avgScore * 30);
    }

    calculatePriceScore() {
        if (this.evaluations.length === 0) return 0;
        const avgScore = this.evaluations.reduce((sum, evaluation) => sum + (evaluation.priceScore || 0), 0) / this.evaluations.length;
        return Math.round(avgScore * 20);
    }

    calculateServiceScore() {
        if (this.evaluations.length === 0) return 0;
        const avgScore = this.evaluations.reduce((sum, evaluation) => sum + (evaluation.serviceScore || 0), 0) / this.evaluations.length;
        return Math.round(avgScore * 10);
    }

    renderSupplierTableRows() {
        if (this.suppliers.length === 0) {
            return `<tr><td colspan="8" class="text-center text-muted">Henüz tedarikçi kaydı bulunmamaktadır.</td></tr>`;
        }
        
        return this.suppliers.map(supplier => `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.category}</td>
                <td>${supplier.contact}</td>
                <td><span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">${supplier.status}</span></td>
                <td><span class="badge bg-${supplier.performance === 'high' ? 'success' : supplier.performance === 'medium' ? 'warning' : 'danger'}">${supplier.performance}</span></td>
                <td>${supplier.lastUpdate}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Düzenle</button>
                    <button class="btn btn-sm btn-danger">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    renderContractTableRows() {
        if (this.contracts.length === 0) {
            return `<tr><td colspan="7" class="text-center text-muted">Henüz sözleşme kaydı bulunmamaktadır.</td></tr>`;
        }
        
        return this.contracts.map(contract => `
            <tr>
                <td>${contract.number}</td>
                <td>${contract.supplier}</td>
                <td>${contract.startDate}</td>
                <td>${contract.endDate}</td>
                <td>₺${contract.value?.toLocaleString()}</td>
                <td><span class="badge bg-${contract.status === 'active' ? 'success' : contract.status === 'expiring' ? 'warning' : 'danger'}">${contract.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary">Düzenle</button>
                    <button class="btn btn-sm btn-danger">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    renderPerformanceChart() {
        const highPerf = this.suppliers.filter(s => s.performance === 'high').length;
        const mediumPerf = this.suppliers.filter(s => s.performance === 'medium').length;
        const lowPerf = this.suppliers.filter(s => s.performance === 'low').length;
        
        return `
            <div class="text-center">
                <h4>Performans Dağılımı</h4>
                <div class="row">
                    <div class="col-4">
                        <h5 class="text-success">${highPerf}</h5>
                        <small>Yüksek</small>
                    </div>
                    <div class="col-4">
                        <h5 class="text-warning">${mediumPerf}</h5>
                        <small>Orta</small>
                    </div>
                    <div class="col-4">
                        <h5 class="text-danger">${lowPerf}</h5>
                        <small>Düşük</small>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrendChart() {
        return `
            <div class="text-center">
                <h4>Trend Analizi</h4>
                <p class="text-muted">Performans trendi grafiği burada görüntülenecek</p>
            </div>
        `;
    }

    renderDetailedReport() {
        return `
            <div class="text-center">
                <h4>Detaylı Rapor</h4>
                <p class="text-muted">Detaylı performans raporu burada görüntülenecek</p>
            </div>
        `;
    }

    // Modal functions
    showAddSupplierModal() {
        alert('Tedarikçi ekleme modalı yakında eklenecektir.');
    }

    showAddContractModal() {
        alert('Sözleşme ekleme modalı yakında eklenecektir.');
    }
} 