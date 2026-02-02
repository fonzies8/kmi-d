# ⚡ Render Hızlı Başlangıç Rehberi

Bu rehber, mevcut Render PostgreSQL veritabanınızı kullanarak hızlıca deployment yapmanız için hazırlanmıştır.

## 📋 Mevcut PostgreSQL Bilgileriniz

```
Hostname: dpg-d60831a1i9vc73aq8crg-a.frankfurt-postgres.render.com
Port: 5432
Database: kartal_metal_db
Username: kartal_metal_db_user
Password: s5VUPO2tQ42wvpv9H1CG3zG9Px6YOaJF
```

**Connection String:**
```
postgresql://kartal_metal_db_user:s5VUPO2tQ42wvpv9H1CG3zG9Px6YOaJF@dpg-d60831ali9vc73aq8crg-a.frankfurt-postgres.render.com/kartal_metal_db
```

## 🚀 Hızlı Deployment (5 Adım)

### 1. GitHub'a Push Yapın
```bash
git add .
git commit -m "Render deployment için hazırlandı"
git push origin main
```

### 2. Render'da Web Servisi Oluşturun

1. https://dashboard.render.com → "New +" → "Web Service"
2. GitHub repository'nizi bağlayın: `fonzies8/kmi-d`
3. Ayarlar:
   - **Name:** `kartal-metal-web`
   - **Region:** `Frankfurt`
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### 3. Environment Variables Ekleyin

Render Dashboard'da Web Service > Environment sekmesine gidin ve şunları ekleyin:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://kartal_metal_db_user:s5VUPO2tQ42wvpv9H1CG3zG9Px6YOaJF@dpg-d60831ali9vc73aq8crg-a.frankfurt-postgres.render.com/kartal_metal_db
JWT_SECRET=<RENDER'DA GENERATE BUTONU İLE OLUŞTURUN>
SESSION_SECRET=<RENDER'DA GENERATE BUTONU İLE OLUŞTURUN>
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

**Önemli:** `JWT_SECRET` ve `SESSION_SECRET` için Render'da "Generate" butonunu kullanın!

### 4. Deployment'ı Başlatın

"Create Web Service" butonuna tıklayın. İlk deployment 5-10 dakika sürebilir.

### 5. Admin Kullanıcısı Oluşturun

Deployment tamamlandıktan sonra (örnek URL: `https://kartal-metal-web.onrender.com`):

```bash
curl -X POST https://kartal-metal-web.onrender.com/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@kartalmetal.com",
    "password": "GüçlüŞifre123!"
  }'
```

## ✅ Kontrol Listesi

- [ ] GitHub'a push yapıldı
- [ ] Render'da Web Service oluşturuldu
- [ ] Tüm environment variables eklendi
- [ ] DATABASE_URL doğru connection string ile ayarlandı
- [ ] JWT_SECRET ve SESSION_SECRET generate edildi
- [ ] Deployment başarılı
- [ ] Admin kullanıcısı oluşturuldu
- [ ] Uygulama çalışıyor

## 🔗 Erişim

- **Web Site:** `https://your-app-name.onrender.com`
- **Admin Panel:** `https://your-app-name.onrender.com/admin/login`

## 📝 Notlar

- Ücretsiz planda 15 dakika inaktivite sonrası uyku modu
- İlk istekte 30-60 saniye uyanma süresi (normal)
- Detaylı bilgi için `RENDER_DEPLOYMENT.md` dosyasına bakın
