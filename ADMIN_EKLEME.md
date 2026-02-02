# Admin Kullanıcısı Manuel Ekleme

Eğer otomatik scriptler çalışmazsa, admin kullanıcısını manuel olarak ekleyebilirsiniz:

## Yöntem 1: pgAdmin ile

1. pgAdmin 4'ü açın
2. Servers > PostgreSQL > Databases > kartal_metal_db > Schemas > public > Tables > users
3. Sağ tıklayın > View/Edit Data > All Rows
4. Toolbar'da "+" butonuna tıklayın (Add Row)
5. Şu bilgileri girin:
   - username: `admin`
   - email: `admin@kartalmetal.com`
   - password: `$2a$10$sBsoPE/I.tqQTSmafrj0f.W37EuabbSBejdqS5VR7r61NIGIxno6G`
   - is_active: `true`
6. Save/Commit

## Yöntem 2: SQL Query ile

pgAdmin'de Query Tool'u açın ve şu komutu çalıştırın:

\`\`\`sql
INSERT INTO users (username, email, password, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@kartalmetal.com',
    '$2a$10$sBsoPE/I.tqQTSmafrj0f.W37EuabbSBejdqS5VR7r61NIGIxno6G',
    true,
    NOW(),
    NOW()
);
\`\`\`

## Giriş Bilgileri

- **Kullanıcı Adı:** admin
- **Şifre:** Admin123!
- **URL:** http://localhost:3008/admin/login

## Alternatif Basit Şifre

Eğer daha basit bir şifre isterseniz:

\`\`\`sql
-- Şifre: admin123
INSERT INTO users (username, email, password, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@kartalmetal.com',
    '$2a$10$Yj7LBZ5qnQx0ZJK9fLqJJO0hKRzs5rV5hYdQgJwx4xQ6LZqnQx0ZJ',
    true,
    NOW(),
    NOW()
);
\`\`\`

Giriş bilgileri:
- Kullanıcı Adı: admin
- Şifre: admin123
