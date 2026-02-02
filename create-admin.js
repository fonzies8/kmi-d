/**
 * Admin Kullanıcısı Oluşturma (Hızlı)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        // Önce mevcut admin var mı kontrol et
        const existing = await User.findOne({ where: { username: 'admin' } });
        
        if (existing) {
            console.log('✓ Admin kullanıcı zaten mevcut!');
            console.log('  Kullanıcı Adı: admin');
            console.log('  E-posta:', existing.email);
            console.log('\n💡 Şifre: Admin123!');
            process.exit(0);
        }

        // Manuel olarak şifreyi hashle
        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        // Admin oluştur (validation bypass)
        const admin = await sequelize.query(
            `INSERT INTO users (username, email, password, is_active, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, NOW(), NOW()) 
             RETURNING *`,
            {
                bind: ['admin', 'admin@kartalmetal.com', hashedPassword, true],
                type: sequelize.QueryTypes.INSERT
            }
        );

        console.log('\n✓ Admin kullanıcı oluşturuldu!');
        console.log('═══════════════════════════════════════');
        console.log('  Kullanıcı Adı: admin');
        console.log('  Şifre: Admin123!');
        console.log('  E-posta: admin@kartalmetal.com');
        console.log('═══════════════════════════════════════\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('Hata:', error.message);
        process.exit(1);
    }
}

createAdmin();
