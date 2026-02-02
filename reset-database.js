/**
 * Veritabanını Sıfırlama Scripti
 * Tüm verileri siler ve tabloları yeniden oluşturur
 */

require('dotenv').config();
const { sequelize, Product, ProductImage, Service, ServiceImage, HomepageCard, HomepageCardImage, User, SiteSetting } = require('./models');

async function resetDatabase() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🗑️  VERİTABANI SIFIRLANIYOR');
        console.log('═══════════════════════════════════════════════════════\n');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Foreign key constraint'leri geçici olarak devre dışı bırak
        console.log('📦 Veriler siliniyor...\n');
        
        // Tüm foreign key constraint'leri geçici olarak devre dışı bırak
        await sequelize.query('SET session_replication_role = replica;');
        
        // Tüm verileri sil
        await sequelize.query('TRUNCATE TABLE product_images CASCADE;');
        console.log('✓ ProductImage verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE service_images CASCADE;');
        console.log('✓ ServiceImage verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE homepage_card_images CASCADE;');
        console.log('✓ HomepageCardImage verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE products CASCADE;');
        console.log('✓ Product verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE services CASCADE;');
        console.log('✓ Service verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE homepage_cards CASCADE;');
        console.log('✓ HomepageCard verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE site_settings CASCADE;');
        console.log('✓ SiteSetting verileri silindi');
        
        await sequelize.query('TRUNCATE TABLE users CASCADE;');
        console.log('✓ User verileri silindi');
        
        // Foreign key constraint'leri tekrar aktif et
        await sequelize.query('SET session_replication_role = DEFAULT;');
        
        console.log('\n✓ Tüm veriler başarıyla silindi!\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ VERİTABANI BAŞARIYLA SIFIRLANDI!');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('💡 Şimdi seed-data.js scriptini çalıştırarak örnek veriler ekleyebilirsiniz:');
        console.log('   node seed-data.js\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Hata:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - ${err.path}: ${err.message}`);
            });
        }
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

resetDatabase();
