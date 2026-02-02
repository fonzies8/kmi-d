🚀 Docker ile Kurulum ve Çalıştırma (Windows)

Özet:
- Bu proje PostgreSQL kullanır. Docker ile çalıştırırken veritabanı konteyneri otomatik oluşturulur.
- Oluşturduğum dosyalar: `Dockerfile`, `docker-compose.yml`, `.dockerignore`.

Gereksinimler (Windows):
1. Docker Desktop (WSL2 backend önerilir). İndir: https://www.docker.com/get-started
2. WSL2 ve virtualization etkin olsun.

Hızlı Başlangıç:
1. Proje kök dizinine gidin (ör. terminalde):
   cd /path/to/KmiProjeDocker

2. (İlk kez) `.env` dosyanızı kontrol edin ve gizli anahtarları güncelleyin (JWT_SECRET, SESSION_SECRET vb.).
   - Docker compose, `DB_HOST=db` olarak ayarlar; `.env` içindeki `DB_HOST` değerinin değiştirilmesine gerek yok.

3. Docker ile servisleri başlatın:
   docker compose up --build -d

4. Logları izlemek için:
   docker compose logs -f app

5. İlk admin kullanıcısını oluşturun (interactive):
   docker compose run --rm app node setup.js
   - Bu komut interaktif bir terminal açar ve sizden admin bilgilerini ister.

6. Veritabanını kontrol etmek için Adminer: http://localhost:8080
   - Server: db
   - Kullanıcı: postgres
   - Şifre: 1667
   - Veritabanı: kartal_metal_db

Yardımcı Komutlar:
- Dur: docker compose down
- Tam temiz: docker compose down -v  (volumes dahil)
- Tek seferlik komut çalıştırma: docker compose run --rm app node seed-fresh-data.js

Notlar ve Güvenlik ⚠️:
- Üretimde `.env` içindeki parola ve gizli anahtarları güçlü değerlerle değiştirin.
- `uploads` klasörü host ile eşleştirildi; dosyalar hostta saklanır.
- Üretim için Dockerfile ve compose yapılandırmasını gözden geçirip `NODE_ENV=production` ve uygun process manager (pm2) ve web server (nginx) eklemeyi düşünün.

Sorularınız varsa adım adım yardımcı olurum.