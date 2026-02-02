require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// Import configurations
const { sequelize, testConnection, syncDatabase, closeConnection } = require('./models');
const { dbConfig } = require('./config/database');
const securityConfig = require('./config/security');
const logger = require('./utils/logger');

// Import routes
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Import controllers
const { initializeDefaultSettings } = require('./controllers/settingsController');

// Import middleware
const requestLogger = require('./middlewares/requestLogger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3008;

// Security middleware
// In production enable stricter Helmet/CSP and HSTS
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // if behind reverse proxy (nginx, load balancer)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https:'],
                fontSrc: ["'self'", 'https:', 'data:'],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        hsts: { maxAge: 31536000, includeSubDomains: true },
        crossOriginEmbedderPolicy: false
    }));
} else {
    app.use(helmet({ contentSecurityPolicy: false }));
}

// CORS: allow origin from env or default to same origin only
const allowedOrigin = process.env.CORS_ORIGIN || false;
if (allowedOrigin && allowedOrigin !== 'false') {
    app.use(cors({ origin: allowedOrigin }));
} else {
    app.use(cors());
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// PostgreSQL Session Store Configuration
// Support DATABASE_URL for Render/Heroku
const sessionPool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    })
    : new Pool({
        user: dbConfig.username,
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    });

// Session configuration with PostgreSQL store
app.use(session({
    store: new pgSession({
        pool: sessionPool,
        tableName: 'user_sessions',
        createTableIfMissing: true
    }),
    secret: securityConfig.session.secret,
    resave: securityConfig.session.resave,
    saveUninitialized: securityConfig.session.saveUninitialized,
    cookie: securityConfig.session.cookie,
    name: 'kartal_metal.sid'
}));

// Static files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'assets'), { maxAge: '30d' }));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));
} else {
    app.use(express.static(path.join(__dirname, 'assets')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Request Logger Middleware (tüm istekleri logla)
app.use(requestLogger);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Sayfa Bulunamadı</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                }
                h1 { font-size: 5rem; margin: 0; }
                p { font-size: 1.5rem; }
                a { color: white; text-decoration: none; border: 2px solid white; padding: 10px 20px; display: inline-block; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div>
                <h1>404</h1>
                <p>Sayfa Bulunamadı</p>
                <a href="/">Ana Sayfaya Dön</a>
            </div>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu.'
    });
});

// Google Maps API için Content Security Policy başlığı ekle
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://maps.googleapis.com;"
    );
    next();
});

// Start server
const startServer = async () => {
    try {
        logger.info('═══════════════════════════════════════════════════════');
        logger.info('🚀 KARTAL METAL İŞ - SUNUCU BAŞLATILIYOR...');
        logger.info('═══════════════════════════════════════════════════════');

        // Test database connection with retry
        logger.info('📡 Veritabanı bağlantısı test ediliyor...');
        await testConnection();

        // Sync database (only in development) — do NOT auto-sync in production
        if (process.env.NODE_ENV !== 'production') {
            logger.info('📊 Veritabanı tabloları kontrol ediliyor...');
            await syncDatabase(false);
        } else {
            logger.warn('⚠️  Production ortamında sync devre dışı. Migrations kullanın. (bkz: DEPLOYMENT_CHECKLIST.md)');
        }

        // Initialize default settings
        logger.info('⚙️  Varsayılan ayarlar kontrol ediliyor...');
        await initializeDefaultSettings();

        logger.info('📦 Veritabanı hazır!');
        logger.info('💡 İlk admin kullanıcı oluşturmak için: POST /auth/create-admin (body: { username, email, password })');

        // Start listening
        app.listen(PORT, () => {
            logger.info('═══════════════════════════════════════════════════════');
            logger.info('✅ KARTAL METAL İŞ - BACKEND SUNUCU BAŞLATILDI');
            logger.info('═══════════════════════════════════════════════════════');
            logger.info(`📍 Sunucu Adresi: http://localhost:${PORT}`);
            logger.info(`📍 Admin Panel:   http://localhost:${PORT}/admin`);
            logger.info(`🌍 Ortam:         ${process.env.NODE_ENV || 'development'}`);
            logger.info(`💾 Veritabanı:    PostgreSQL (${dbConfig.database})`);
            logger.info(`🔌 Pool:          Max: ${dbConfig.pool.max}, Min: ${dbConfig.pool.min}`);
            logger.info(`💾 Session Store: PostgreSQL`);
            logger.info('═══════════════════════════════════════════════════════');
        });

    } catch (error) {
        logger.error('\n❌ Sunucu başlatma hatası: %s', error.message);
        logger.warn('\n⚠️  Lütfen şunları kontrol edin:');
        logger.warn('   1. PostgreSQL servisi çalışıyor mu?');
        logger.warn('   2. .env dosyası mevcut ve doğru mu?');
        logger.warn('   3. Veritabanı bağlantı bilgileri doğru mu?');
        logger.warn('   4. Veritabanı oluşturuldu mu?');
        logger.warn('   5. Kullanıcı yetkileri doğru mu?\n');
        await gracefulShutdown('STARTUP_ERROR');
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.warn(`\n⚠️  ${signal} sinyali alındı. Sunucu kapatılıyor...`);
    try {
        await closeConnection();
        await sessionPool.end();
        logger.info('✓ Tüm bağlantılar kapatıldı.');
        process.exit(0);
    } catch (error) {
        logger.error('✗ Kapatma sırasında hata:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    logger.error('❌ Yakalanmamış hata:', error);
    await gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    logger.error('❌ İşlenmemiş promise rejection:', reason);
    await gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();
