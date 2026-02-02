/**
 * DEBUG SCRIPT - Admin Ürün Sayfası Sorunlarını Tespit Et
 * products.ejs'de ürünlerin neden yüklenmedığini kontrol eder
 */

require('dotenv').config();
const productController = require('./controllers/productController');
const { sequelize } = require('./config/database');

console.log('\n' + '═'.repeat(80));
console.log('🔍 ÜRÜN SAYFASI DEBUG - SORUN TESPITI');
console.log('═'.repeat(80));

// ✅ KONTROL 1: Veritabanı bağlantısı
async function checkDatabase() {
    try {
        console.log('\n[1] Veritabanı Bağlantısı Kontrolü...');
        await sequelize.authenticate();
        console.log('✅ OK - Veritabanı bağlantısı çalışıyor');
        return true;
    } catch (error) {
        console.error('❌ HATA - Veritabanı bağlantısı başarısız');
        console.error('[ERROR]', error.message);
        return false;
    }
}

// ✅ KONTROL 2: Ürün model'i kontrol et
async function checkProductModel() {
    try {
        console.log('\n[2] Product Model Kontrolü...');
        const { Product } = require('./models');
        console.log('✅ OK - Product modeli yüklendi');
        console.log('[MODEL] Tablo adı:', Product.tableName);
        console.log('[MODEL] Attributes:', Object.keys(Product.rawAttributes).join(', '));
        return true;
    } catch (error) {
        console.error('❌ HATA - Product modeli yüklenemedi');
        console.error('[ERROR]', error.message);
        return false;
    }
}

// ✅ KONTROL 3: Veritabanında ürünler var mı?
async function checkProductsInDatabase() {
    try {
        console.log('\n[3] Veritabanında Ürün Kontrolü...');
        const { Product } = require('./models');
        const count = await Product.count();
        console.log(`✅ OK - Veritabanında ${count} ürün var`);

        if (count === 0) {
            console.warn('⚠️  UYARI - Veritabanında ürün bulunmamaktadır!');
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ HATA - Ürün sayısı alınamadı');
        console.error('[ERROR]', error.message);
        return false;
    }
}

// ✅ KONTROL 4: API route'u kontrol et
async function checkAPIRoute() {
    try {
        console.log('\n[4] API Route Kontrolü - /admin/api/products...');

        // Mock req/res nesneleri
        let responseData = null;
        let statusCode = null;

        const mockReq = { session: { userId: 1 } };
        const mockRes = {
            json: function (data) {
                responseData = data;
                return this;
            },
            status: function (code) {
                statusCode = code;
                return this;
            }
        };

        // productController.getAllProducts() çağır
        await productController.getAllProducts(mockReq, mockRes);

        if (responseData && responseData.success) {
            console.log(`✅ OK - API çalışıyor`);
            console.log(`[RESPONSE] ${responseData.products.length} ürün döndürüldü`);

            // İlk ürünü göster
            if (responseData.products.length > 0) {
                const product = responseData.products[0];
                console.log('\n[SAMPLE PRODUCT]');
                console.log('  ID:', product.id);
                console.log('  Name:', product.name);
                console.log('  Category:', product.category);
                console.log('  Status:', product.status);
                console.log('  Images:', product.images?.length || 0);
            }
            return true;
        } else {
            console.error('❌ HATA - API success: false');
            console.error('[RESPONSE]', responseData);
            return false;
        }
    } catch (error) {
        console.error('❌ HATA - API çağrısı başarısız');
        console.error('[ERROR]', error.message);
        console.error('[STACK]', error.stack);
        return false;
    }
}

// ✅ KONTROL 5: ProductImage modeli bağlantısı
async function checkProductImageRelation() {
    try {
        console.log('\n[5] Product → ProductImage İlişkisi Kontrolü...');
        const { Product, ProductImage } = require('./models');

        // Ürün ve resimleriyle beraber çek
        const product = await Product.findOne({
            include: [{
                model: ProductImage,
                as: 'images'
            }]
        });

        if (product) {
            console.log('✅ OK - Product-Image ilişkisi çalışıyor');
            console.log(`[PRODUCT] ID: ${product.id}, Name: ${product.name}`);
            console.log(`[IMAGES] Toplam: ${product.images?.length || 0}`);
            return true;
        } else {
            console.warn('⚠️  UYARI - Veritabanında ürün bulunamadı');
            return false;
        }
    } catch (error) {
        console.error('❌ HATA - Product-Image ilişkisi çalışmıyor');
        console.error('[ERROR]', error.message);
        return false;
    }
}

// ✅ KONTROL 6: Frontend simulasyonu
async function simulateFrontend() {
    try {
        console.log('\n[6] Frontend Simülasyonu (products.ejs)...');
        console.log('[SIMULATE] loadProducts() çağrılıyor...');

        // API'yi çağır
        const mockReq = { session: { userId: 1 } };
        let responseData = null;

        const mockRes = {
            json: function (data) {
                responseData = data;
                return this;
            },
            status: function (code) { return this; }
        };

        await productController.getAllProducts(mockReq, mockRes);

        if (!responseData.success) {
            console.error('❌ HATA - API başarısız');
            return false;
        }

        // Frontend'de yapılacaklar
        const products = responseData.products;
        console.log(`[FRONTEND] ${products.length} ürün alındı`);
        console.log('[FRONTEND] renderProducts() çağrılıyor...');

        // HTML oluştur
        if (products.length > 0) {
            console.log('✅ OK - HTML tablosuna dönüştürülebilir');

            // İlk 3 ürünü göster
            products.slice(0, 3).forEach((product, i) => {
                console.log(`  [${i + 1}] ${product.id} - ${product.name} (${product.status})`);
            });
        } else {
            console.warn('⚠️  UYARI - Render edilecek ürün yok');
        }

        return true;
    } catch (error) {
        console.error('❌ HATA - Frontend simülasyonu başarısız');
        console.error('[ERROR]', error.message);
        return false;
    }
}

// ✅ SONUÇ RAPORU
async function generateReport() {
    console.log('\n' + '═'.repeat(80));
    console.log('📋 TEST SONUÇLARI');
    console.log('═'.repeat(80));

    const results = [];

    results.push(['1. Veritabanı Bağlantısı', await checkDatabase()]);
    results.push(['2. Product Model', await checkProductModel()]);
    results.push(['3. Veritabanında Ürünler', await checkProductsInDatabase()]);
    results.push(['4. API Route', await checkAPIRoute()]);
    results.push(['5. Product-Image İlişkisi', await checkProductImageRelation()]);
    results.push(['6. Frontend Simülasyonu', await simulateFrontend()]);

    console.log('\n' + '─'.repeat(80));
    console.log('ÖZET:');
    console.log('─'.repeat(80));

    results.forEach(([test, passed]) => {
        const icon = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${icon} - ${test}`);
    });

    const allPassed = results.every(r => r[1]);

    console.log('\n' + '═'.repeat(80));
    if (allPassed) {
        console.log('✅ SONUÇ: Tüm kontroller başarılı - Sorun yok');
        console.log('💡 TÖNERİ: Browser console\'da (F12) hata olup olmadığını kontrol et');
    } else {
        console.log('❌ SONUÇ: Bazı kontroller başarısız - Yukarıdaki hataları düzelt');
    }
    console.log('═'.repeat(80) + '\n');
}

// ✅ PROGRAMI ÇALIŞTIR
async function run() {
    try {
        await generateReport();
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

run();
