# 🚀 KARTAL METAL İŞ - KURULUM TALİMATLARI

Bu dosya projenin sıfırdan kurulumu için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

### 1. Node.js Kurulumu
- Node.js v16 veya üzeri gereklidir
- İndirme: https://nodejs.org/
- Kurulum kontrolü: `node --version`

### 2. PostgreSQL Kurulumu
- PostgreSQL v12 veya üzeri gereklidir
- İndirme: https://www.postgresql.org/download/

#### Windows için PostgreSQL Kurulumu:
1. PostgreSQL installer'ı indirin
2. Kurulum sırasında şifre belirleyin (bu şifreyi unutmayın!)
3. Port: 5432 (varsayılan)
4. pgAdmin 4 ile birlikte gelir

## 🔧 Adım Adım Kurulum

### ADIM 1: Veritabanını Oluşturun

PostgreSQL'de yeni veritabanı oluşturun:

#### Yöntem 1: pgAdmin Kullanarak
1. pgAdmin'i açın
2. Servers > PostgreSQL > Databases
3. Sağ tıklayın > Create > Database
4. Database adı: `kartal_metal_db`
5. Save

#### Yöntem 2: SQL Shell (psql) Kullanarak
\`\`\`bash
psql -U postgres
CREATE DATABASE kartal_metal_db;
\q
\`\`\`

### ADIM 2: .env Dosyasını Oluşturun

Proje kök dizininde `.env` dosyası oluşturun ve aşağıdaki içeriği yapıştırın:

\`\`\`env
# Server Configuration
PORT=3008
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kartal_metal_db
DB_USER=postgres
DB_PASSWORD=BURAYA_POSTGRESQL_SIFRENIZI_YAZIN

# Database Pool Configuration (Opsiyonel - varsayılan değerler kullanılır)
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_POOL_EVICT=1000

# Security Configuration (Bu değerleri değiştirin!)
JWT_SECRET=gizli_jwt_anahtari_2026_kartal_metal
SESSION_SECRET=gizli_session_anahtari_2026_kartal_metal
BCRYPT_ROUNDS=10

# Cookie Configuration
COOKIE_MAX_AGE=86400000
REMEMBER_ME_DURATION=2592000000

# Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/jpg

# Rate Limiting
LOGIN_RATE_LIMIT=5
LOGIN_RATE_WINDOW=15
API_RATE_LIMIT=100
API_RATE_WINDOW=15
\`\`\`

**ÖNEMLİ:** `DB_PASSWORD` kısmına PostgreSQL kurulumunda belirlediğiniz şifreyi yazın!

### ADIM 3: Bağımlılıkları Yükleyin

Terminal/PowerShell'de proje dizininde:

\`\`\`bash
npm install
\`\`\`

### ADIM 4: İlk Admin Kullanıcısını Oluşturun

Otomatik kurulum script'i ile:

\`\`\`bash
node setup.js
\`\`\`

Script sizden şunları soracak:
- Kullanıcı Adı (varsayılan: admin)
- E-posta (varsayılan: admin@kartalmetal.com)
- Şifre (minimum 6 karakter)

**Örnek:**
\`\`\`
Kullanıcı Adı: admin
E-posta: admin@kartalmetal.com
Şifre: Admin123!
\`\`\`

### ADIM 5: Sunucuyu Başlatın

\`\`\`bash
npm start
\`\`\`

veya geliştirme modunda (otomatik yeniden başlatma):

\`\`\`bash
npm run dev
\`\`\`

## ✅ Kurulum Kontrolü

Sunucu başarıyla çalışıyorsa şu mesajı görmelisiniz:

\`\`\`
═══════════════════════════════════════════════════════
🚀 KARTAL METAL İŞ - BACKEND SUNUCU BAŞLATILDI
═══════════════════════════════════════════════════════
📍 Sunucu Adresi: http://localhost:3008
📍 Admin Panel:   http://localhost:3008/admin
🌍 Ortam:         development
💾 Veritabanı:    PostgreSQL
═══════════════════════════════════════════════════════
\`\`\`

## 🌐 Siteyi Test Edin

### Public Sayfalar (Herkese Açık)
- Ana Sayfa: http://localhost:3008/
- Ürünler: http://localhost:3008/products
- Hizmetler: http://localhost:3008/services
- Hakkımızda: http://localhost:3008/about
- İletişim: http://localhost:3008/contact

### Admin Panel
1. http://localhost:3008/admin/login adresine gidin
2. Oluşturduğunuz kullanıcı adı ve şifre ile giriş yapın
3. Dashboard'da istatistikleri görün
4. Ürün, hizmet ve ana sayfa kartları ekleyin

## 🎨 İlk Verileri Ekleme

### Ürün Ekleme
1. Admin Panel > Ürünler
2. "Yeni Ürün Ekle" butonuna tıklayın
3. Ürün bilgilerini doldurun
4. Birden fazla resim seçebilirsiniz
5. Kaydedin

### Hizmet Ekleme
1. Admin Panel > Hizmetler
2. "Yeni Hizmet Ekle" butonuna tıklayın
3. Hizmet bilgilerini doldurun
4. Resimleri ekleyin
5. Kaydedin

### Ana Sayfa Kartı Ekleme
1. Admin Panel > Ana Sayfa
2. "Yeni Kart Ekle" butonuna tıklayın
3. Kart bilgilerini doldurun
4. Birden fazla resim ekleyebilirsiniz (otomatik carousel olacak)
5. Kaydedin

## ❌ Sorun Giderme

### Problem: "Veritabanı bağlantı hatası"
**Çözüm:**
1. PostgreSQL çalıştığından emin olun
2. .env dosyasındaki DB_PASSWORD doğru mu kontrol edin
3. pgAdmin'de veritabanının oluşturulduğunu kontrol edin

### Problem: "Port 3008 already in use"
**Çözüm:**
1. .env dosyasında PORT=3009 olarak değiştirin
2. Veya 3008 portunu kullanan programı kapatın

### Problem: "Cannot find module"
**Çözüm:**
\`\`\`bash
npm install
\`\`\`

### Problem: "Permission denied" (Resim yükleme hatası)
**Çözüm:**
1. uploads klasörünün var olduğundan emin olun
2. Windows'ta: Klasöre sağ tıklayın > Properties > Security > Düzenle

## 📱 Responsive Test

Siteyi farklı cihazlarda test edin:
- Desktop: Chrome, Firefox, Edge
- Mobile: Chrome DevTools (F12 > Toggle device toolbar)
- Gerçek mobil cihazınızdan: http://[BILGISAYAR-IP]:3008

## 🔐 Güvenlik Notları

**Önemli:** Canlı sunucuya (production) geçmeden önce:

1. ✅ `.env` dosyasındaki JWT_SECRET ve SESSION_SECRET'i değiştirin
2. ✅ Güçlü bir admin şifresi kullanın
3. ✅ NODE_ENV=production olarak ayarlayın
4. ✅ HTTPS kullanın
5. ✅ Firewall kurallarını ayarlayın

## 📞 Destek

Sorun yaşıyorsanız:
1. README.md dosyasını okuyun
2. Console'daki hata mesajlarını kontrol edin
3. .env dosyasını tekrar gözden geçirin

## 🎉 Kurulum Tamamlandı!

Başarıyla kurulum yaptıysanız:
- ✅ PostgreSQL çalışıyor
- ✅ Veritabanı oluşturuldu
- ✅ Admin kullanıcı oluşturuldu
- ✅ Sunucu çalışıyor
- ✅ Admin panele giriş yapabiliyorsunuz

**Keyifli kullanımlar! 🚀**
