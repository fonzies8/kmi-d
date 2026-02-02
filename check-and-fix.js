/**
 * Veritabanı Kontrol ve Düzeltme Scripti
 * Session tablosunu kontrol eder ve eksikse oluşturur
 * Kullanıcıyı kontrol eder
 */

require('dotenv').config();
const { sequelize, User } = require('./models');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(require('express-session'));
const { dbConfig } = require('./config/database');

async function checkAndFix() {
    try {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🔍 VERİTABANI KONTROL EDİLİYOR');
        console.log('═══════════════════════════════════════════════════════\n');

        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı başarılı!\n');

        // Session tablosunu kontrol et ve oluştur
        console.log('📋 Session tablosu kontrol ediliyor...');
        const sessionPool = new Pool(dbConfig);
        
        // Session tablosunun var olup olmadığını kontrol et
        const [tableCheck] = await sequelize.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_sessions'
            );
        `);
        
        if (!tableCheck[0].exists) {
            console.log('⚠️  Session tablosu bulunamadı, oluşturuluyor...');
            
            // Session tablosunu oluştur
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS "user_sessions" (
                    "sid" varchar NOT NULL COLLATE "default",
                    "sess" json NOT NULL,
                    "expire" timestamp(6) NOT NULL,
                    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
                )
                WITH (OIDS=FALSE);
                
                CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
            `);
            
            console.log('✓ Session tablosu oluşturuldu!\n');
        } else {
            console.log('✓ Session tablosu mevcut!\n');
        }

        // Kullanıcıları kontrol et
        console.log('👤 Kullanıcılar kontrol ediliyor...');
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'is_active']
        });
        
        if (users.length === 0) {
            console.log('⚠️  Hiç kullanıcı bulunamadı!');
            console.log('💡 Yeni kullanıcı oluşturuluyor...\n');
            
            const newUser = await User.create({
                username: 'ethem',
                email: 'ethem@kartalmetal.com',
                password: '123456',
                is_active: true
            });
            
            console.log('✓ Kullanıcı oluşturuldu!');
            console.log(`   ID: ${newUser.id}`);
            console.log(`   Kullanıcı Adı: ${newUser.username}`);
            console.log(`   Şifre: 123456\n`);
        } else {
            console.log(`✓ ${users.length} kullanıcı bulundu:\n`);
            users.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - ${user.is_active ? 'Aktif' : 'Pasif'}`);
            });
            console.log('');
        }

        // Tabloları kontrol et
        console.log('📊 Tablolar kontrol ediliyor...');
        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        const tableNames = results.map(r => r.table_name);
        console.log(`✓ ${tableNames.length} tablo bulundu:\n`);
        tableNames.forEach(name => {
            console.log(`   - ${name}`);
        });
        console.log('');

        // Session pool'u kapat
        await sessionPool.end();
        await sequelize.close();

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ KONTROL TAMAMLANDI!');
        console.log('═══════════════════════════════════════════════════════\n');
        
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

checkAndFix();
