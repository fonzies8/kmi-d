/**
 * Admin Kullanıcısı Oluşturma - Ethem Demir
 */

require('dotenv').config();
const { sequelize, User } = require('./models');

async function createUser() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('👤 Admin Kullanıcısı Oluşturuluyor');
        console.log('═══════════════════════════════════════════════════════\n');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Kullanıcı adı: "Ethem Demir" -> "ethemdemir" veya "EthemDemir" olarak kaydedelim
        // Ama kullanıcı "Ethem Demir" ile giriş yapmak istiyor, o zaman username'i "Ethem Demir" olarak tutalım
        const username = 'Ethem Demir';
        const email = 'ethem.demir@kartalmetal.com';
        const password = '123456';

        // Önce mevcut kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ 
            where: { username: username } 
        });
        
        if (existingUser) {
            console.log('⚠️  Kullanıcı zaten mevcut!');
            console.log(`   Kullanıcı Adı: ${existingUser.username}`);
            console.log(`   E-posta: ${existingUser.email}`);
            
            // Şifreyi güncelle
            existingUser.password = password;
            await existingUser.save();
            console.log('✓ Şifre güncellendi!');
            console.log(`   Yeni Şifre: ${password}\n`);
        } else {
            // Yeni kullanıcı oluştur
            const user = await User.create({
                username: username,
                email: email,
                password: password,
                is_active: true
            });

            console.log('✓ Kullanıcı başarıyla oluşturuldu!');
            console.log('═══════════════════════════════════════');
            console.log(`   Kullanıcı Adı: ${user.username}`);
            console.log(`   Şifre: ${password}`);
            console.log(`   E-posta: ${user.email}`);
            console.log('═══════════════════════════════════════\n');
        }

        // Tüm kullanıcıları listele
        const allUsers = await User.findAll({
            attributes: ['id', 'username', 'email', 'is_active'],
            order: [['created_at', 'DESC']]
        });

        console.log('📋 Mevcut Kullanıcılar:');
        console.log('─────────────────────────────────────────');
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.is_active ? 'Aktif' : 'Pasif'}`);
        });
        console.log('─────────────────────────────────────────\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Hata:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - ${err.path}: ${err.message}`);
            });
        }
        process.exit(1);
    }
}

createUser();
