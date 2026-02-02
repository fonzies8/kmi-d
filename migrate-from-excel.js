/**
 * Excel'den PostgreSQL'e Veri Taşıma Script'i
 * 
 * Eski Excel dosyalarından (productdb.xlsx, servicesdb.xlsx) 
 * yeni PostgreSQL veritabanına veri aktarır.
 * 
 * Kullanım: node migrate-from-excel.js
 */

require('dotenv').config();
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Product, Service, ProductImage, ServiceImage, sequelize } = require('./models');

async function migrateProducts() {
    const excelPath = path.join(__dirname, 'db', 'productdb.xlsx');
    
    if (!fs.existsSync(excelPath)) {
        console.log('⚠️  productdb.xlsx bulunamadı, ürün aktarımı atlanıyor...');
        return;
    }

    console.log('\n📦 Ürünler aktarılıyor...');
    
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
        try {
            const product = await Product.create({
                name: row.name || row.Ürün || 'İsimsiz Ürün',
                description: row.description || row.Açıklama || '',
                category: row.category || row.Kategori || '',
                status: 'active'
            });

            // Eğer resim bilgisi varsa
            if (row.image || row.Resim) {
                await ProductImage.create({
                    product_id: product.id,
                    image_url: row.image || row.Resim,
                    is_primary: true,
                    display_order: 0
                });
            }

            console.log(`  ✓ ${product.name}`);
        } catch (error) {
            console.error(`  ✗ Ürün hatası:`, error.message);
        }
    }

    console.log(`✓ ${data.length} ürün aktarıldı!`);
}

async function migrateServices() {
    const excelPath = path.join(__dirname, 'db', 'servicesdb.xlsx');
    
    if (!fs.existsSync(excelPath)) {
        console.log('⚠️  servicesdb.xlsx bulunamadı, hizmet aktarımı atlanıyor...');
        return;
    }

    console.log('\n🔧 Hizmetler aktarılıyor...');
    
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
        try {
            const service = await Service.create({
                name: row.name || row.Hizmet || 'İsimsiz Hizmet',
                description: row.description || row.Açıklama || '',
                short_description: row.short_description || row.KısaAçıklama || '',
                status: 'active'
            });

            // Eğer resim bilgisi varsa
            if (row.image || row.Resim) {
                await ServiceImage.create({
                    service_id: service.id,
                    image_url: row.image || row.Resim,
                    is_primary: true,
                    display_order: 0
                });
            }

            console.log(`  ✓ ${service.name}`);
        } catch (error) {
            console.error(`  ✗ Hizmet hatası:`, error.message);
        }
    }

    console.log(`✓ ${data.length} hizmet aktarıldı!`);
}

async function migrate() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 EXCEL\'DEN PostgreSQL\'E VERİ AKTARIMI');
    console.log('═══════════════════════════════════════════════════════');

    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Sync database
        await sequelize.sync({ force: false });
        console.log('✓ Veritabanı tabloları hazır!\n');

        // Migrate products
        await migrateProducts();

        // Migrate services
        await migrateServices();

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✓ VERİ AKTARIMI TAMAMLANDI!');
        console.log('═══════════════════════════════════════════════════════\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Aktarım hatası:', error.message);
        console.error(error);
        
        await sequelize.close();
        process.exit(1);
    }
}

// Run migration
migrate();
