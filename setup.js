/**
 * Setup Script - İlk Admin Kullanıcısı Oluşturma
 * 
 * Bu script projeyi ilk kez kurduğunuzda admin kullanıcısı oluşturmak için kullanılır.
 * 
 * Kullanım: node setup.js
 */

require('dotenv').config();
const readline = require('readline');
const { sequelize } = require('./models');
const User = require('./models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🚀 KARTAL METAL İŞ - İLK KURULUM');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Sync database
        await sequelize.sync({ force: false });
        console.log('✓ Veritabanı tabloları oluşturuldu!\n');

        // Check if admin already exists
        const existingAdmin = await User.count();
        
        if (existingAdmin > 0) {
            console.log('⚠️  Admin kullanıcı zaten mevcut!');
            console.log(`   Toplam kullanıcı sayısı: ${existingAdmin}\n`);
            
            const overwrite = await question('Yeni admin oluşturmak ister misiniz? (e/h): ');
            
            if (overwrite.toLowerCase() !== 'e') {
                console.log('\nİşlem iptal edildi.');
                rl.close();
                process.exit(0);
            }
        }

        // Get admin details
        console.log('\n--- Yeni Admin Kullanıcısı Bilgileri ---\n');
        
        const username = await question('Kullanıcı Adı (admin): ') || 'admin';
        const email = await question('E-posta (admin@kartalmetal.com): ') || 'admin@kartalmetal.com';
        const password = await question('Şifre (min 6 karakter): ');

        if (!password || password.length < 6) {
            console.log('\n❌ Şifre en az 6 karakter olmalıdır!');
            rl.close();
            process.exit(1);
        }

        // Create admin user
        const admin = await User.create({
            username,
            email,
            password,
            is_active: true
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✓ Admin kullanıcı başarıyla oluşturuldu!');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`   Kullanıcı Adı: ${admin.username}`);
        console.log(`   E-posta:       ${admin.email}`);
        console.log(`   ID:            ${admin.id}`);
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🎉 Kurulum tamamlandı!');
        console.log('\n📍 Sunucuyu başlatmak için:');
        console.log('   npm start');
        console.log('\n📍 Admin panele giriş için:');
        console.log(`   http://localhost:${process.env.PORT || 3008}/admin/login\n`);

        rl.close();
        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Kurulum hatası:', error.message);
        console.error('\n⚠️  Lütfen şunları kontrol edin:');
        console.error('   1. PostgreSQL çalışıyor mu?');
        console.error('   2. .env dosyası mevcut ve doğru mu?');
        console.error('   3. Veritabanı bağlantı bilgileri doğru mu?\n');
        
        rl.close();
        process.exit(1);
    }
}

// Run setup
setup();
