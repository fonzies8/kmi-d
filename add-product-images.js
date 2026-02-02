/**
 * Ürünlere Resim Ekleme Scripti
 */

require('dotenv').config();
const {
    sequelize,
    Product,
    ProductImage
} = require('./models');

async function addProductImages() {
    try {
        const logger = require('./utils/logger');
        logger.info('Başlatılıyor: Ürünlere resim ekleme');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        logger.info('Veritabanı bağlantısı başarılı');

        // Ürün-resim eşleştirmeleri (assets klasöründen serve ediliyor)
        const productImageMap = {
            'Balya Römorku': ['/resimler/balyarömork1.jpg'],
            'Karavan': ['/resimler/karavan1.jpg'],
            'El Arabası': ['/resimler/elarabası1.jpg'],
            'Küçük Römork': ['/resimler/küçükrömork1.jpg'],
            'Traktör Kasası': ['/resimler/traktör_kasası1.jpg'],
            'Yakıt Tankeri': ['/resimler/yakıt_tankeri1.jpg'],
            'Büyük Kapasiteli Römork': ['/resimler/balyarömork1.jpg'],
            'Su Tankeri': ['/resimler/tanker1.jpg'],
            'Çift Akslı Römork': ['/resimler/küçükrömork1.jpg'],
            'Konteyner Taşıyıcı': ['/resimler/balyarömork1.jpg']
        };

        // Tüm ürünleri al
        const products = await Product.findAll({
            order: [['id', 'ASC']]
        });

        logger.info(`Toplam ${products.length} ürün bulundu.`);

        let addedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const product of products) {
            try {
                // Bu ürünün zaten resmi var mı kontrol et
                const existingImages = await ProductImage.count({
                    where: { product_id: product.id }
                });

                if (existingImages > 0) {
                    logger.warn(`${product.name} - zaten ${existingImages} resim mevcut`);
                    skippedCount++;
                    continue;
                }

                // Bu ürün için resim var mı?
                const imagePaths = productImageMap[product.name];

                if (!imagePaths || imagePaths.length === 0) {
                    logger.warn(`${product.name} - resim eşleştirmesi bulunamadı`);
                    skippedCount++;
                    continue;
                }

                // Resimleri ekle
                for (let i = 0; i < imagePaths.length; i++) {
                    await ProductImage.create({
                        product_id: product.id,
                        image_url: imagePaths[i],
                        display_order: i,
                        is_primary: i === 0
                    });
                }

                logger.info(`${product.name} - ${imagePaths.length} resim eklendi`);
                addedCount++;
            } catch (error) {
                console.error(`   ✗ ${product.name} hatası:`, error.message);
                errorCount++;
            }
        }

        // Özet
        const totalImages = await ProductImage.count();

        logger.info('İşlem tamamlandı');
        logger.info('Özet: ' + `eklenen:${addedCount}, atlanan:${skippedCount}, hatalar:${errorCount}, toplam_resim:${totalImages}`);

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        logger.error('Hata: ' + (error.message || error));
        if (error.errors) {
            error.errors.forEach(err => {
                logger.error(`- ${err.path}: ${err.message}`);
            });
        }
        logger.error(error.stack || 'no stack');
        await sequelize.close();
        process.exit(1);
    }
}

addProductImages();
