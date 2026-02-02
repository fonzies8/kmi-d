/**
 * Temiz Veritabanına Örnek Veriler Ekleme
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
    HomepageCardImage,
    SiteSetting
} = require('./models');
const { initializeDefaultSettings } = require('./controllers/settingsController');

async function seedData() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🌱 ÖRNEK VERİLER EKLENİYOR');
        console.log('═══════════════════════════════════════════════════════\n');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // 1. Admin Kullanıcısı Oluştur
        console.log('👤 Admin kullanıcısı oluşturuluyor...');
        const admin = await User.create({
            username: 'Ethem Demir',
            email: 'ethem.demir@kartalmetal.com',
            password: '123456',
            is_active: true
        });
        console.log('✓ Admin kullanıcı oluşturuldu!');
        console.log(`   Kullanıcı Adı: ${admin.username}`);
        console.log(`   Şifre: 123456\n`);

        // 2. Site Ayarları
        console.log('⚙️  Site ayarları oluşturuluyor...');
        await initializeDefaultSettings();
        console.log('✓ Site ayarları oluşturuldu!\n');

        // 3. Örnek Ürünler
        console.log('📦 Örnek ürünler oluşturuluyor...');
        const products = [
            {
                name: 'Balya Römorku',
                description: 'Yüksek kaliteli balya römorku. Dayanıklı ve güvenilir.',
                category: 'Römork',
                status: 'active',
                display_order: 1
            },
            {
                name: 'Karavan',
                description: 'Konforlu ve modern karavan çözümleri.',
                category: 'Karavan',
                status: 'active',
                display_order: 2
            },
            {
                name: 'El Arabası',
                description: 'Pratik ve dayanıklı el arabası modelleri.',
                category: 'El Arabası',
                status: 'active',
                display_order: 3
            },
            {
                name: 'Küçük Römork',
                description: 'Küçük yükler için ideal römork çözümü.',
                category: 'Römork',
                status: 'active',
                display_order: 4
            },
            {
                name: 'Traktör Kasası',
                description: 'Güçlü ve dayanıklı traktör kasası.',
                category: 'Traktör',
                status: 'active',
                display_order: 5
            },
            {
                name: 'Yakıt Tankeri',
                description: 'Güvenli yakıt taşıma çözümleri.',
                category: 'Tanker',
                status: 'active',
                display_order: 6
            }
        ];

        for (const productData of products) {
            const product = await Product.create(productData);
            console.log(`   ✓ ${product.name} oluşturuldu (ID: ${product.id})`);
        }
        console.log('✓ Tüm ürünler oluşturuldu!\n');

        // 4. Örnek Hizmetler
        console.log('🔧 Örnek hizmetler oluşturuluyor...');
        const services = [
            {
                name: 'Kaynak Hizmetleri',
                short_description: 'Profesyonel kaynak hizmetleri',
                description: 'Tüm kaynak işlemleriniz için profesyonel hizmet. Yüksek kalite ve güvenilirlik.',
                status: 'active',
                display_order: 1
            },
            {
                name: 'Vinç Hizmetleri',
                short_description: 'Güvenli vinç kiralama ve operasyon',
                description: 'Büyük yükleriniz için güvenli vinç hizmetleri. Deneyimli operatörler.',
                status: 'active',
                display_order: 2
            },
            {
                name: 'Çatı Sistemleri',
                short_description: 'Modern çatı çözümleri',
                description: 'Dayanıklı ve estetik çatı sistemleri. Uzman ekibimizle hizmetinizdeyiz.',
                status: 'active',
                display_order: 3
            },
            {
                name: 'Römork Tamiri',
                short_description: 'Hızlı ve kaliteli römork tamiri',
                description: 'Tüm römork tamir işlemleriniz için hızlı ve kaliteli hizmet.',
                status: 'active',
                display_order: 4
            },
            {
                name: 'Makine Tamiri',
                short_description: 'Endüstriyel makine tamiri',
                description: 'Tüm endüstriyel makineleriniz için uzman tamir hizmeti.',
                status: 'active',
                display_order: 5
            },
            {
                name: 'Özel Metal İşleri',
                short_description: 'Özel tasarım metal işleri',
                description: 'İhtiyacınıza özel metal işleme ve üretim hizmetleri.',
                status: 'active',
                display_order: 6
            }
        ];

        for (const serviceData of services) {
            const service = await Service.create(serviceData);
            console.log(`   ✓ ${service.name} oluşturuldu (ID: ${service.id})`);
        }
        console.log('✓ Tüm hizmetler oluşturuldu!\n');

        // 5. Ana Sayfa Kartları
        console.log('🏠 Ana sayfa kartları oluşturuluyor...');
        const cards = [
            {
                title: 'Kaliteli Kaynak',
                type: 'feature',
                content: 'Yılların deneyimi ile kaliteli kaynak hizmetleri sunuyoruz.',
                status: 'active',
                display_order: 1
            },
            {
                title: 'Güvenli Vinç',
                type: 'feature',
                content: 'Güvenli ve profesyonel vinç hizmetleri ile yanınızdayız.',
                status: 'active',
                display_order: 2
            },
            {
                title: 'Müşteri Memnuniyeti',
                type: 'feature',
                content: 'Müşteri memnuniyeti bizim önceliğimizdir.',
                status: 'active',
                display_order: 3
            }
        ];

        for (const cardData of cards) {
            const card = await HomepageCard.create(cardData);
            console.log(`   ✓ ${card.title} oluşturuldu (ID: ${card.id})`);
        }
        console.log('✓ Tüm kartlar oluşturuldu!\n');

        // Özet
        const productCount = await Product.count();
        const serviceCount = await Service.count();
        const cardCount = await HomepageCard.count();
        const userCount = await User.count();

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ VERİLER BAŞARIYLA EKLENDİ!');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📊 Özet:');
        console.log(`   👤 Kullanıcılar: ${userCount}`);
        console.log(`   📦 Ürünler: ${productCount}`);
        console.log(`   🔧 Hizmetler: ${serviceCount}`);
        console.log(`   🏠 Ana Sayfa Kartları: ${cardCount}\n`);
        console.log('🔑 Giriş Bilgileri:');
        console.log('   Kullanıcı Adı: Ethem Demir');
        console.log('   Şifre: 123456\n');

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

seedData();
