# Dağıtım Kontrol Listesi (Production Hazırlık) — Kartal Metal

Aşağıdaki adımları takip ederek uygulamayı canlıya uygun şekilde konuşlandırın.

1) Ortam Değişkenleri
- `.env` dosyasını oluşturun (örnek: `.env.example`).
- `SESSION_SECRET` ve `JWT_SECRET` için güçlü, rasgele değerler kullanın.
- `NODE_ENV=production` olarak ayarlayın.
- `CORS_ORIGIN`'u sadece izin verdiğiniz domain ile sınırlandırın.

2) Veritabanı ve Migrasyonlar
- Production ortamında `sequelize.sync()` ya da `syncDatabase(true)` çalıştırmayın.
- Migrations kullanın: `npx sequelize-cli db:migrate` ile şemayı uygulayın.
- Yedek alın: migration/backup öncesi DB dump alın.

3) SSL / Reverse Proxy
- Uygulamayı Nginx/Apache veya load balancer arkasında çalıştırın.
- HTTPS zorunlu: SSL sertifikası (Let's Encrypt vb.) ve `HSTS` başlıklarını etkinleştirin.
- `app.set('trust proxy', 1)` if behind proxy — index.js zaten bunu yapıyor.

4) Process Manager
- PM2 kullanın: `pm2 start ecosystem.config.js --env production`
- Log rotasyonu, restart politika ve max memory restart ayarlarını kontrol edin.

5) Güvenlik
- `helmet` ile CSP/HSTS etkinleştirilmiş olmalı (index.js güncellendi).
- Session cookie `secure: true`, `httpOnly: true`, `sameSite: 'strict'` olmalı.
- Rate limit'leri (login ve api) kontrol edin.
- Yüklenen dosya türleri ve boyutları sınırlanmalı.

6) Bağımlılıklar
- `npm audit` çalıştırın; `npm audit fix` ile otomatik düzeltmeleri uygulayın.
- Kritik paketler için manuel inceleme yapın.

7) Logging ve Gizlilik
- Üretimde detaylı istek/yanıt loglarını devre dışı bırakın (requestLogger düzenlendi).
- Hata raporlarını izlemek için Sentry gibi bir servis eklemeyi düşünün.

8) Performans ve Cache
- Statik dosyalar için cache ayarlarını uygulayın (index.js üretimde maxAge ayarlandı).
- Gerekirse CDN (ör. Cloudflare) kullanın.

9) Test
- `npm run dev` ile test ortamında tüm sayfaları, admin paneli ve dosya yüklemeyi test edin.
- Otomatik testler yoksa manual smoke test listesi oluşturun.

10) İzleme & Yedek
- Sunucu ve DB izleme kurun (Prometheus/Grafana veya benzeri).
- Düzenli DB yedekleme uygulayın ve test edin.

Komut Örnekleri

```bash
# Migrations uygula
npx sequelize-cli db:migrate --env production

# PM2 ile başlat
pm2 start ecosystem.config.js --env production

# Logları izle
pm2 logs kartal-metal

# Audit
npm audit --production
npm audit fix
```

Not: İsterseniz bu repo içindeki geliştirici scriptlerini `dev_tools/` altına taşıyabilirim; önce onayınızı isteyeceğim.
