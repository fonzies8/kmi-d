# 🚀 Render Deployment Rehberi

Bu dokümantasyon, Kartal Metal İş projesini Render üzerinde ücretsiz olarak çalıştırmak için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

1. GitHub hesabı (proje GitHub'da olmalı)
2. Render hesabı (ücretsiz kayıt: https://render.com)

## 🔧 Adım Adım Kurulum

### ADIM 1: PostgreSQL Veritabanı Oluşturma

1. **Render Dashboard'a giriş yapın**
   - https://dashboard.render.com adresine gidin
   - "New +" butonuna tıklayın
   - "PostgreSQL" seçeneğini seçin

2. **Veritabanı Ayarları**
   - **Name:** `kartal-metal-db` (veya istediğiniz bir isim)
   - **Database:** `kartal_metal_db`
   - **User:** `kartal_metal_db_user`
   - **Region:** `Frankfurt` (veya size en yakın bölge)
   - **Plan:** `Free` (ücretsiz plan)
   - **PostgreSQL Version:** En son sürüm

3. **Veritabanı Oluştur**
   - "Create Database" butonuna tıklayın
   - Veritabanı oluşturulduktan sonra **Connection String**'i kopyalayın
   - Format: `postgresql://kartal_metal_db_user:password@host:port/kartal_metal_db`

### ADIM 2: Web Servisi Oluşturma

1. **Yeni Web Servisi Oluştur**
   - Render Dashboard'da "New +" butonuna tıklayın
   - "Web Service" seçeneğini seçin

2. **GitHub Repository Bağlantısı**
   - "Connect GitHub" butonuna tıklayın
   - GitHub hesabınızı bağlayın
   - Repository'yi seçin: `fonzies8/kmi-d` (veya sizin repo adınız)
   - Branch: `main`

3. **Servis Ayarları**
   - **Name:** `kartal-metal-web` (veya istediğiniz bir isim)
   - **Region:** `Frankfurt` (veritabanı ile aynı bölge)
   - **Branch:** `main`
   - **Root Directory:** (boş bırakın, proje kök dizininde)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

4. **Environment Variables (Ortam Değişkenleri)**
   
   Aşağıdaki environment variable'ları ekleyin:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<PostgreSQL Connection String>
   JWT_SECRET=<güçlü-bir-secret-anahtar-buraya>
   SESSION_SECRET=<güçlü-bir-secret-anahtar-buraya>
   BCRYPT_ROUNDS=10
   COOKIE_MAX_AGE=86400000
   REMEMBER_ME_DURATION=2592000000
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/jpg
   LOGIN_RATE_LIMIT=5
   LOGIN_RATE_WINDOW=15
   API_RATE_LIMIT=100
   API_RATE_WINDOW=15
   ```

   **Önemli Notlar:**
   - `DATABASE_URL`: PostgreSQL servisinizden aldığınız connection string
   - `JWT_SECRET` ve `SESSION_SECRET`: Güçlü, rastgele stringler (en az 32 karakter)
   - Bu değerleri güvenli tutun!

5. **PostgreSQL Bağlantısı**
   - "Add Database" butonuna tıklayın
   - Oluşturduğunuz PostgreSQL veritabanını seçin
   - Render otomatik olarak `DATABASE_URL` environment variable'ını ekleyecek

6. **Servisi Oluştur**
   - "Create Web Service" butonuna tıklayın
   - İlk deployment başlayacak (5-10 dakika sürebilir)

### ADIM 3: İlk Admin Kullanıcısını Oluşturma

Deployment tamamlandıktan sonra:

1. **Web servisinizin URL'sini alın**
   - Format: `https://kartal-metal-web.onrender.com` (veya sizin servis adınız)

2. **Admin kullanıcısı oluşturun**
   
   Terminal'de veya Postman'de:
   ```bash
   curl -X POST https://your-app-name.onrender.com/auth/create-admin \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@kartalmetal.com",
       "password": "GüçlüŞifre123!"
     }'
   ```

   Veya Postman kullanarak:
   - Method: `POST`
   - URL: `https://your-app-name.onrender.com/auth/create-admin`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "username": "admin",
       "email": "admin@kartalmetal.com",
       "password": "GüçlüŞifre123!"
     }
     ```

### ADIM 4: Veritabanı Tablolarını Oluşturma

Render'da production ortamında otomatik sync devre dışıdır. İlk deployment'ta tabloları oluşturmak için:

**Seçenek 1: Manuel SQL Script (Önerilen)**
- Render PostgreSQL Dashboard'dan "Connect" butonuna tıklayın
- psql komutunu kopyalayın ve çalıştırın
- Veya Render Shell kullanarak bağlanın

**Seçenek 2: Geçici Sync Açma**
- `index.js` dosyasında production için sync'i geçici olarak açın (SADECE İLK KURULUM İÇİN)
- Deployment sonrası tekrar kapatın

**Seçenek 3: Migration Kullanma**
- `migrations/` klasöründeki migration dosyalarını çalıştırın

## 🔐 Güvenlik Notları

1. **Environment Variables**
   - `JWT_SECRET` ve `SESSION_SECRET` değerlerini güçlü tutun
   - Render'da "Generate" butonu ile otomatik oluşturabilirsiniz

2. **HTTPS**
   - Render otomatik olarak HTTPS sağlar
   - Custom domain ekleyebilirsiniz

3. **Database Security**
   - PostgreSQL connection string'i güvenli tutun
   - Render otomatik olarak SSL bağlantısı kullanır

## 📝 Render Ücretsiz Plan Limitleri

- **Web Service:**
  - 750 saat/ay (yaklaşık 31 gün)
  - 15 dakika inaktivite sonrası uyku modu
  - İlk istekte 30-60 saniye uyanma süresi

- **PostgreSQL:**
  - 90 gün ücretsiz (sonrası ücretli)
  - 1 GB depolama
  - 256 MB RAM

## 🐛 Sorun Giderme

### Deployment Başarısız Olursa

1. **Build Loglarını Kontrol Edin**
   - Render Dashboard > Your Service > Logs
   - Hata mesajlarını inceleyin

2. **Yaygın Hatalar:**
   - `npm install` hatası: `package.json` kontrol edin
   - Port hatası: `PORT` environment variable'ını kontrol edin
   - Database bağlantı hatası: `DATABASE_URL` kontrol edin

### Veritabanı Bağlantı Hatası

1. **DATABASE_URL Kontrolü**
   - Render Dashboard > PostgreSQL > Connections
   - Connection String'i kopyalayın
   - Web Service > Environment > `DATABASE_URL` değerini kontrol edin

2. **SSL Bağlantısı**
   - Render PostgreSQL SSL gerektirir
   - Kod otomatik olarak SSL kullanır

### Uygulama Uyku Modunda

- Ücretsiz planlarda 15 dakika inaktivite sonrası uyku modu
- İlk istekte 30-60 saniye uyanma süresi
- Bu normal bir durumdur

## 🔄 Güncelleme

1. **Kod Güncellemesi**
   - GitHub'a push yapın
   - Render otomatik olarak yeni deployment başlatır

2. **Environment Variable Güncellemesi**
   - Render Dashboard > Your Service > Environment
   - Değişiklik yapın ve "Save Changes"
   - Servis otomatik olarak yeniden başlar

## 📞 Destek

- Render Dokümantasyon: https://render.com/docs
- Render Support: https://render.com/support

## ✅ Deployment Checklist

- [ ] PostgreSQL veritabanı oluşturuldu
- [ ] Web servisi oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Tüm environment variables eklendi
- [ ] İlk deployment başarılı
- [ ] Veritabanı tabloları oluşturuldu
- [ ] Admin kullanıcısı oluşturuldu
- [ ] Uygulama çalışıyor ve erişilebilir

---

**Not:** Bu rehber Render'ın ücretsiz planı için hazırlanmıştır. Production ortamında ücretli plan kullanmanız önerilir.
