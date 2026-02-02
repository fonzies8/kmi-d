/**
 * Örnek Veri Ekleme Script'i
 * 
 * Veritabanına örnek ürünler, hizmetler ve admin kullanıcısı ekler.
 * 
 * Kullanım: node seed-data.js
 */

require('dotenv').config();
const { 
    sequelize, 
    User, 
    Product, 
    ProductImage, 
    Service, 
    ServiceImage,
    HomepageCard,
    HomepageCardImage
} = require('./models');
const { initializeDefaultSettings } = require('./controllers/settingsController');

async function createAdminUser() {
    console.log('\n👤 Admin kullanıcısı oluşturuluyor...');
    
    try {
        // Önce mevcut admin var mı kontrol et
        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        
        if (existingAdmin) {
            console.log('⚠️  Admin kullanıcı zaten mevcut!');
            console.log(`   Kullanıcı Adı: ${existingAdmin.username}`);
            console.log(`   E-posta: ${existingAdmin.email}`);
            return existingAdmin;
        }

        // Yeni admin oluştur
        const admin = await User.create({
            username: 'admin',
            email: 'admin@kartalmetal.com',
            password: 'Admin123!',
            is_active: true
        });

        console.log('✓ Admin kullanıcı oluşturuldu!');
        console.log(`   Kullanıcı Adı: admin`);
        console.log(`   Şifre: Admin123!`);
        console.log(`   E-posta: ${admin.email}`);
        
        return admin;
    } catch (error) {
        console.error('❌ Admin oluşturma hatası:', error.message);
    }
}

async function createSampleProducts() {
    console.log('\n📦 Örnek ürünler oluşturuluyor...');
    
    const sampleProducts = [
        {
            name: 'Balya Römorku',
            description: 'Dayanıklı ve güçlü balya römorku. Tarım işleriniz için ideal çözüm. Yüksek kaliteli çelik malzemeden üretilmiştir.',
            category: 'Römork',
            status: 'active',
            images: ['resimler/balyarömork1.jpg']
        },
        {
            name: 'Karavan',
            description: 'Özel tasarım karavan. Tatil ve kamp için mükemmel. Geniş iç alan ve modern donanım.',
            category: 'Karavan',
            status: 'active',
            images: ['resimler/karavan1.jpg']
        },
        {
            name: 'El Arabası',
            description: 'Hafif ve dayanıklı el arabası. Yük taşıma işlerinizi kolaylaştırır. Paslanmaz çelik gövde.',
            category: 'Taşıma',
            status: 'active',
            images: ['resimler/elarabası1.jpg']
        },
        {
            name: 'Küçük Römork',
            description: 'Kompakt ve kullanışlı römork. Şehir içi ve kısa mesafe taşımacılık için ideal.',
            category: 'Römork',
            status: 'active',
            images: ['resimler/küçükrömork1.jpg']
        },
        {
            name: 'Traktör Kasası',
            description: 'Traktörler için özel üretim kasa. Yüksek yük kapasitesi ve dayanıklılık.',
            category: 'Tarım',
            status: 'active',
            images: ['resimler/traktör_kasası1.jpg']
        },
        {
            name: 'Yakıt Tankeri',
            description: 'Güvenli yakıt taşıma tankeri. Sızdırmaz özel tasarım.',
            category: 'Tanker',
            status: 'active',
            images: ['resimler/yakıt_tankeri1.jpg']
        }
    ];

    for (const productData of sampleProducts) {
        try {
            const product = await Product.create({
                name: productData.name,
                description: productData.description,
                category: productData.category,
                status: productData.status
            });

            // Resimleri ekle
            for (let i = 0; i < productData.images.length; i++) {
                await ProductImage.create({
                    product_id: product.id,
                    image_url: productData.images[i],
                    display_order: i,
                    is_primary: i === 0
                });
            }

            console.log(`  ✓ ${product.name}`);
        } catch (error) {
            console.error(`  ✗ ${productData.name} hatası:`, error.message);
        }
    }

    console.log(`✓ ${sampleProducts.length} örnek ürün eklendi!`);
}

async function createSampleServices() {
    console.log('\n🔧 Örnek hizmetler oluşturuluyor...');
    
    const sampleServices = [
        {
            name: 'Kaynak Hizmetleri',
            short_description: 'Profesyonel kaynak işlemleri',
            description: 'Dayanıklı ve kaliteli metal kaynak hizmeti sunuyoruz. MIG, TIG ve elektrik kaynağı. Kusursuz kaynak, sağlam sonuç.',
            status: 'active',
            images: ['resimler/kaynak-nedir-kaynak-cesitleri-1200x720.jpg']
        },
        {
            name: 'Vinç Hizmetleri',
            short_description: 'Güvenli ve profesyonel vinç hizmeti',
            description: 'Kaliteli ve güvenli vinç hizmeti sunuyoruz. Ağır yük kaldırma ve taşıma işlemleriniz için profesyonel çözümler. Güç ve hassasiyet bir arada.',
            status: 'active',
            images: ['resimler/vinç.jpg']
        },
        {
            name: 'Çatı Sistemleri',
            short_description: 'Metal çatı yapımı ve montajı',
            description: 'Dayanıklı metal çatı sistemleri. Profesyonel montaj hizmeti. Yalıtımlı ve uzun ömürlü çözümler.',
            status: 'active',
            images: ['resimler/çatı.jpg', 'resimler/çatı2.jpg']
        },
        {
            name: 'Römork Tamiri',
            short_description: 'Römork bakım ve onarım',
            description: 'Tüm römork tiplerinin bakım, onarım ve modifikasyon hizmetleri. Uzman kadromuzla hızlı ve kaliteli servis.',
            status: 'active',
            images: ['resimler/römork_tamiri.jpg']
        },
        {
            name: 'Makine Tamiri',
            short_description: 'Endüstriyel makine onarımı',
            description: 'Endüstriyel makinelerin bakım ve onarım hizmetleri. 7/24 teknik destek.',
            status: 'active',
            images: ['resimler/makinetamiri.jpg']
        },
        {
            name: 'Özel Metal İşleri',
            short_description: 'Özel tasarım metal ürünler',
            description: 'İhtiyacınıza özel metal ürün tasarım ve üretimi. Kapı, merdiven, korkuluk, oluk ve daha fazlası.',
            status: 'active',
            images: ['resimler/kapı.jpg', 'resimler/oluk1.jpg']
        }
    ];

    for (const serviceData of sampleServices) {
        try {
            const service = await Service.create({
                name: serviceData.name,
                short_description: serviceData.short_description,
                description: serviceData.description,
                status: serviceData.status
            });

            // Resimleri ekle
            for (let i = 0; i < serviceData.images.length; i++) {
                await ServiceImage.create({
                    service_id: service.id,
                    image_url: serviceData.images[i],
                    display_order: i,
                    is_primary: i === 0
                });
            }

            console.log(`  ✓ ${service.name}`);
        } catch (error) {
            console.error(`  ✗ ${serviceData.name} hatası:`, error.message);
        }
    }

    console.log(`✓ ${sampleServices.length} örnek hizmet eklendi!`);
}

async function createHomepageCards() {
    console.log('\n🏠 Ana sayfa kartları oluşturuluyor...');
    
    const sampleCards = [
        {
            title: 'Kaliteli Kaynak',
            type: 'feature',
            content: 'Profesyonel kaynak hizmetleri ile en kaliteli sonuçları elde edin.',
            status: 'active',
            images: ['resimler/kaynak-nedir-kaynak-cesitleri-1200x720.jpg']
        },
        {
            title: 'Güvenli Vinç',
            type: 'feature',
            content: 'Güvenli ve profesyonel vinç hizmetleri.',
            status: 'active',
            images: ['resimler/vinç.jpg']
        },
        {
            title: 'Müşteri Memnuniyeti',
            type: 'testimonial',
            content: 'Metal işçiliği hizmetinden oldukça memnun kaldık. Ekip son derece profesyonel ve titizdi. Kesinlikle tavsiye ederiz.',
            status: 'active',
            images: []
        }
    ];

    for (const cardData of sampleCards) {
        try {
            const card = await HomepageCard.create({
                title: cardData.title,
                type: cardData.type,
                content: cardData.content,
                status: cardData.status
            });

            // Resimleri ekle
            for (let i = 0; i < cardData.images.length; i++) {
                await HomepageCardImage.create({
                    card_id: card.id,
                    image_url: cardData.images[i],
                    display_order: i
                });
            }

            console.log(`  ✓ ${card.title}`);
        } catch (error) {
            console.error(`  ✗ ${cardData.title} hatası:`, error.message);
        }
    }

    console.log(`✓ ${sampleCards.length} ana sayfa kartı eklendi!`);
}

async function seed() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🌱 ÖRNEK VERİ EKLEME');
    console.log('═══════════════════════════════════════════════════════');

    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Sync database
        await sequelize.sync({ force: false });
        console.log('✓ Veritabanı tabloları hazır!\n');

        // Create admin user
        await createAdminUser();

        // Create sample products
        await createSampleProducts();

        // Create sample services
        await createSampleServices();

        // Create homepage cards
        await createHomepageCards();

        // Initialize default settings
        console.log('\n⚙️  Site ayarları oluşturuluyor...');
        await initializeDefaultSettings();

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✓ ÖRNEK VERİ EKLEME TAMAMLANDI!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n🎉 Şimdi admin panele giriş yapabilirsiniz:');
        console.log(`   URL: http://localhost:${process.env.PORT || 3008}/admin/login`);
        console.log('   Kullanıcı Adı: admin');
        console.log('   Şifre: Admin123!\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Veri ekleme hatası:', error.message);
        console.error(error);
        
        await sequelize.close();
        process.exit(1);
    }
}

// Run seed
seed();
