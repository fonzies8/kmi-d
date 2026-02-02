/**
 * Veritabanına Örnek Ürünler Ekleme
 */

require('dotenv').config();
const {
    sequelize,
    Product,
    ProductImage
} = require('./models');

async function addSampleProducts() {
    try {
        const logger = require('./utils/logger');
        logger.info('Başlatılıyor: Örnek ürünler ekleme');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        logger.info('Veritabanı bağlantısı başarılı');

        // Örnek ürünler
        const sampleProducts = [
            {
                name: 'Balya Römorku',
                description: 'Dayanıklı ve güçlü balya römorku. Tarım işleriniz için ideal çözüm. Yüksek kaliteli çelik malzemeden üretilmiştir. Uzun ömürlü ve güvenilir yapısı ile tarım sektöründe tercih edilen ürünlerimizdendir.',
                category: 'Römork',
                status: 'active',
                display_order: 1
            },
            {
                name: 'Karavan',
                description: 'Özel tasarım karavan. Tatil ve kamp için mükemmel. Geniş iç alan ve modern donanım. Konforlu yaşam alanı ve pratik kullanım özellikleri ile ideal bir seyahat arkadaşı.',
                category: 'Karavan',
                status: 'active',
                display_order: 2
            },
            {
                name: 'El Arabası',
                description: 'Hafif ve dayanıklı el arabası. Yük taşıma işlerinizi kolaylaştırır. Paslanmaz çelik gövde. Ergonomik tasarımı ile uzun süreli kullanım için idealdir.',
                category: 'Taşıma',
                status: 'active',
                display_order: 3
            },
            {
                name: 'Küçük Römork',
                description: 'Kompakt ve kullanışlı römork. Şehir içi ve kısa mesafe taşımacılık için ideal. Düşük yakıt tüketimi ve kolay manevra kabiliyeti ile şehir trafiğinde pratik çözüm.',
                category: 'Römork',
                status: 'active',
                display_order: 4
            },
            {
                name: 'Traktör Kasası',
                description: 'Traktörler için özel üretim kasa. Yüksek yük kapasitesi ve dayanıklılık. Tarım ve inşaat sektöründe güvenilir taşıma çözümü. Sağlam yapısı ile ağır yükler için tasarlanmıştır.',
                category: 'Tarım',
                status: 'active',
                display_order: 5
            },
            {
                name: 'Yakıt Tankeri',
                description: 'Güvenli yakıt taşıma tankeri. Sızdırmaz özel tasarım. Güvenlik standartlarına uygun üretim. Büyük kapasiteli ve güvenilir yakıt taşıma çözümü.',
                category: 'Tanker',
                status: 'active',
                display_order: 6
            },
            {
                name: 'Büyük Kapasiteli Römork',
                description: 'Endüstriyel kullanım için büyük kapasiteli römork. Ağır yükler için tasarlanmış güçlü yapı. Uzun mesafe taşımacılık için ideal çözüm.',
                category: 'Römork',
                status: 'active',
                display_order: 7
            },
            {
                name: 'Su Tankeri',
                description: 'Temiz su taşıma için özel tasarım tanker. Hijyenik malzeme kullanımı. Tarım ve endüstriyel kullanım için uygun. Geniş kapasiteli ve pratik kullanım.',
                category: 'Tanker',
                status: 'active',
                display_order: 8
            },
            {
                name: 'Çift Akslı Römork',
                description: 'Çift akslı güçlü römork sistemi. Daha yüksek yük kapasitesi ve stabilite. Uzun yol taşımacılığı için profesyonel çözüm.',
                category: 'Römork',
                status: 'active',
                display_order: 9
            },
            {
                name: 'Konteyner Taşıyıcı',
                description: 'Konteyner taşıma için özel römork. Standart konteyner boyutlarına uygun. Lojistik ve nakliye sektörü için ideal çözüm.',
                category: 'Römork',
                status: 'active',
                display_order: 10
            }
        ];

        let addedCount = 0;
        let skippedCount = 0;

        for (const productData of sampleProducts) {
            try {
                // Aynı isimde ürün var mı kontrol et
                const existingProduct = await Product.findOne({
                    where: { name: productData.name }
                });

                if (existingProduct) {
                    logger.warn(`${productData.name} zaten mevcut (ID: ${existingProduct.id})`);
                    skippedCount++;
                    continue;
                }

                const product = await Product.create({
                    name: productData.name,
                    description: productData.description,
                    category: productData.category,
                    status: productData.status,
                    display_order: productData.display_order
                });

                logger.info(`${product.name} oluşturuldu (ID: ${product.id})`);
                addedCount++;
            } catch (error) {
                console.error(`   ✗ ${productData.name} hatası:`, error.message);
            }
        }

        // Özet
        const totalProducts = await Product.count();

        logger.info('İşlem tamamlandı — özet: ' + `yeni:${addedCount}, mevcut:${skippedCount}, toplam:${totalProducts}`);

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

addSampleProducts();
