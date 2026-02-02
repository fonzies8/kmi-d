-- Admin kullanıcısını kontrol et ve oluştur

-- Önce var mı kontrol et
SELECT * FROM users WHERE username = 'admin';

-- Eğer yoksa, manuel olarak ekle (şifre: Admin123!)
INSERT INTO users (username, email, password, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@kartalmetal.com',
    '$2a$10$sBsoPE/I.tqQTSmafrj0f.W37EuabbSBejdqS5VR7r61NIGIxno6G',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Kontrol et
SELECT id, username, email, is_active, created_at FROM users;
