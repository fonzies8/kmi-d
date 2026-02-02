/**
 * TEST DOSYASI - Ürün Çekme ve Console'a Yazdırma
 * productController.js'deki getAllProducts() fonksiyonunu çağırır
 */

require('dotenv').config();
const productController = require('./controllers/productController');
const { sequelize } = require('./config/database');

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ÜRÜN VERİSİ ÇEKME İŞLEMİ
// ═══════════════════════════════════════════════════════════════════════════════

async function getAllProductsTest() {
    try {
        console.log('\n' + '═'.repeat(80));
        console.log('🧪 TEST: ÜRÜN VERİSİ ÇEKME - productController.getAllProducts()');
        console.log('═'.repeat(80));
        console.log('[TEST] Veritabanı bağlantısı test ediliyor...');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('[TEST] ✅ Veritabanı bağlantısı başarılı!');

        console.log('\n[TEST] getAllProducts() fonksiyonu çağrılıyor...');
        console.log('═'.repeat(80));

        // Mock req/res nesneleri oluştur
        let responseData = null;
        const mockReq = {
            session: { userId: 1 },
            query: {},
            body: {}
        };

        const mockRes = {
            json: function (data) {
                responseData = data;
                console.log('\n📊 ÜRÜN VERİLERİ');
                console.log('═'.repeat(80));
                console.log(`[RESULT] Toplam Ürün Sayısı: ${data.products.length}`);
                console.log(`[RESULT] Ürün ID'leri: ${data.products.map(p => p.id).join(', ')}`);

                // Her ürünü detaylı yazdır
                if (data.products.length > 0) {
                    console.log('\n📋 ÜRÜN LİSTESİ:');
                    console.log('─'.repeat(80));

                    data.products.forEach((product, index) => {
                        console.log(`\n[${index + 1}] ÜRÜN ID: ${product.id}`);
                        console.log(`    📝 Adı: ${product.name}`);
                        console.log(`    📄 Açıklama: ${product.description ? product.description.substring(0, 50) : 'N/A'}...`);
                        console.log(`    🏷️  Kategori: ${product.category || 'N/A'}`);
                        console.log(`    💰 Fiyat: ${product.price || 'N/A'}`);
                        console.log(`    🔄 Durum: ${product.status}`);
                        console.log(`    📅 Oluşturulma: ${product.created_at}`);
                        console.log(`    🖼️  Resim Sayısı: ${product.images ? product.images.length : 0}`);

                        // Resimleri yazdır
                        if (product.images && product.images.length > 0) {
                            console.log(`    📸 Resimler:`);
                            product.images.forEach((img, imgIndex) => {
                                const isPrimary = img.is_primary ? '⭐ (Birincil)' : '';
                                console.log(`       [${imgIndex + 1}] ${img.image_url} ${isPrimary}`);
                            });
                        }
                    });

                    console.log('\n' + '─'.repeat(80));
                } else {
                    console.log('[RESULT] ⚠️  Veritabanında ürün bulunamadı!');
                }

                // JSON formatında da yazdır
                console.log('\n📦 JSON FORMATINDA:');
                console.log('═'.repeat(80));
                console.log(JSON.stringify(data.products, null, 2));

                return this;
            },
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            statusCode: 200
        };

        // productController.getAllProducts() fonksiyonunu çağır
        await productController.getAllProducts(mockReq, mockRes);

        console.log('\n' + '═'.repeat(80));
        console.log('✅ TEST BAŞARILI - productController.getAllProducts() çalıştırıldı');
        console.log('═'.repeat(80) + '\n');

    } catch (error) {
        console.error('\n' + '═'.repeat(80));
        console.error('❌ HATA OLUŞTU');
        console.error('═'.repeat(80));
        console.error('[ERROR] Mesaj:', error.message);
        console.error('[ERROR] Stack:', error.stack);
        console.error('═'.repeat(80) + '\n');

    } finally {
        // Veritabanı bağlantısını kapat
        console.log('[TEST] Veritabanı bağlantısı kapatılıyor...');
        await sequelize.close();
        console.log('[TEST] ✅ Bağlantı kapatıldı');
        process.exit(0);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ TESTLERI ÇALIŞTIR
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n');
console.log('█'.repeat(80));
console.log('█' + ' '.repeat(78) + '█');
console.log(`█` + `  🧪 ÜRÜN ÇEKME TEST SAYFASI - test.js`.padEnd(78) + `█`);
console.log('█' + ' '.repeat(78) + '█');
console.log('█'.repeat(80));

getAllProductsTest();
