# GEMKOM React - Talaşlı İmalat İş Takip Sistemi

Bu proje, orijinal vanilya JavaScript GEMKOM projesinin React TypeScript'e dönüştürülmüş halidir. Tüm özellikler ve işlevsellik korunmuştur.

## Özellikler

### 🔐 Kimlik Doğrulama
- Kullanıcı girişi sistemi
- Rol tabanlı erişim kontrolü (Admin/Normal kullanıcı)
- Oturum yönetimi

### ⏱️ Zaman Takibi
- JIRA entegrasyonu ile iş takibi
- Gerçek zamanlı zamanlayıcı
- Sunucu zamanı senkronizasyonu
- Zamanlayıcı durumu kalıcılığı (sayfa yenilendiğinde korunur)

### 👨‍💼 Admin Paneli
- Aktif zamanlayıcıları görüntüleme
- Kullanıcı filtreleme
- Issue filtreleme
- Gerçek zamanlı güncelleme

### 🔧 Bakım Talepleri
- JIRA Issue Collector entegrasyonu
- Bakım talep formu
- Layout görseli

## Teknoloji Yığını

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **CSS3** - Responsive styling
- **JIRA REST API** - Issue management
- **Custom Backend** - Authentication and timer management

## Kurulum

1. Proje klasörüne gidin:
```bash
cd gemkom-react
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

4. Tarayıcıda `http://localhost:3000` adresini açın.

## Sayfa Yapısı

### `/login` - Giriş Sayfası
- Kullanıcı seçimi ve şifre girişi
- Otomatik yönlendirme (admin → admin paneli, normal kullanıcı → üretim takibi)

### `/manufacturing` - Talaşlı İmalat Takibi
- JIRA issue listesi
- Issue arama
- Zamanlayıcı ekranı
- Başlat/Durdur işlemleri

### `/admin` - Admin Paneli
- Aktif zamanlayıcılar tablosu
- Kullanıcı ve issue filtreleme
- Gerçek zamanlı süre görüntüleme

### `/maintenance` - Bakım Talepleri
- JIRA Issue Collector formu
- Layout görseli

## Özel Özellikler

### 🔄 Sunucu Zamanı Senkronizasyonu
- Uygulama başlangıcında sunucu zamanı ile senkronize olur
- Tüm zaman işlemleri senkronize edilmiş zaman kullanır

### 💾 Zamanlayıcı Kalıcılığı
- Sayfa yenilendiğinde veya tarayıcı kapatıldığında zamanlayıcı durumu korunur
- LocalStorage kullanılarak veri saklama

### 📱 Responsive Tasarım
- Mobil ve tablet uyumlu
- Touch-friendly interface
- Adaptive layouts

### 🔒 Güvenlik
- Protected routes
- Role-based access control
- Session management

## API Entegrasyonları

### Backend Services
- **Base URL**: `https://falling-bread-330e.ocalik.workers.dev`
- Kullanıcı listesi: `/user/list`
- Giriş: `/login`
- Aktif zamanlayıcılar: `/active`
- Sunucu zamanı: `/now`

### JIRA Integration
- **Instance**: `https://gemkom-1.atlassian.net`
- JIRA REST API v3
- Issue Collector widget
- Custom fields support

## Geliştirme

### Available Scripts

- `npm start` - Geliştirme sunucusunu başlatır
- `npm build` - Production build oluşturur
- `npm test` - Testleri çalıştırır
- `npm eject` - React Scripts'ten çıkar (geri alınamaz)

### Proje Yapısı
```
src/
├── components/          # React bileşenleri
│   ├── Login.tsx       # Giriş bileşeni
│   ├── Manufacturing.tsx # Üretim takip bileşeni
│   ├── Admin.tsx       # Admin panel bileşeni
│   ├── Maintenance.tsx # Bakım talep bileşeni
│   └── ProtectedRoute.tsx # Route koruma bileşeni
├── services/           # API servisleri
│   ├── base.ts        # Base konfigürasyon
│   ├── loginService.ts # Kimlik doğrulama
│   ├── machiningService.ts # Üretim takip servisleri
│   ├── adminService.ts # Admin servisleri
│   └── timeService.ts  # Zaman senkronizasyonu
└── App.tsx            # Ana uygulama bileşeni
```

## Orijinal Projeden Farklar

### ✅ Korunan Özellikler
- Tüm JIRA entegrasyonları
- Zamanlayıcı işlevselliği
- Admin paneli özellikleri
- Bakım talep sistemi
- Responsive tasarım
- Türkçe dil desteği

### 🆕 Yeni Özellikler
- TypeScript type safety
- Component-based architecture
- Better state management
- Improved error handling
- Enhanced user experience
- Modern React patterns

### 🔧 Teknical Improvements
- Modern build system (Webpack 5)
- Hot module replacement
- Better development experience
- Optimized production builds
- Progressive Web App ready

## Deployment

1. Production build oluşturun:
```bash
npm run build
```

2. `build` klasörü statik dosya sunucusuna deploy edin.

3. Routing için sunucu konfigürasyonu gerekebilir (SPA için).

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Lisans

Bu proje GEMKOM için özel olarak geliştirilmiştir.