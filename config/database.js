const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

// Parse DATABASE_URL if provided (for Render, Heroku, etc.)
let dbConfig = {};
if (process.env.DATABASE_URL) {
  // Parse PostgreSQL connection string
  // Format: postgresql://username:password@host:port/database
  try {
    const url = new URL(process.env.DATABASE_URL);
    
    // Validate parsed values
    if (!url.hostname || !url.username || !url.password || !url.pathname) {
      throw new Error('Invalid DATABASE_URL: missing required components');
    }
    
    dbConfig = {
      database: url.pathname.slice(1) || url.pathname.substring(1), // Remove leading '/'
      username: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => logger.debug('[DB] ' + msg)
      : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      evict: parseInt(process.env.DB_POOL_EVICT) || 1000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false
    },
    dialectOptions: {
      connectTimeout: 10000,
      application_name: 'kartal_metal_app',
      // SSL is required for Render PostgreSQL
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    };
    
    // Validate dbConfig values
    if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
      throw new Error(`Invalid dbConfig: host=${dbConfig.host}, database=${dbConfig.database}, username=${dbConfig.username}`);
    }
    
    // Debug logging
    logger.info('DATABASE_URL parsed successfully');
    logger.debug(`Parsed host: ${dbConfig.host}`);
    logger.debug(`Parsed port: ${dbConfig.port}`);
    logger.debug(`Parsed database: ${dbConfig.database}`);
    logger.debug(`Parsed username: ${dbConfig.username}`);
  } catch (error) {
    logger.error('DATABASE_URL parse error:', error.message);
    throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
  }
} else {
  // Use individual environment variables
  dbConfig = {
    database: process.env.DB_NAME || 'kartal_metal_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1667',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => logger.debug('[DB] ' + msg)
      : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      evict: parseInt(process.env.DB_POOL_EVICT) || 1000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false
    },
    dialectOptions: {
      connectTimeout: 10000,
      application_name: 'kartal_metal_app',
      // SSL support for production
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    }
  };
}

// Validate dbConfig before initializing Sequelize
if (!dbConfig.database || !dbConfig.username || !dbConfig.password || !dbConfig.host) {
  logger.error('Invalid dbConfig:', {
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password ? '***' : undefined,
    host: dbConfig.host,
    port: dbConfig.port
  });
  throw new Error('Database configuration is incomplete. Please check your environment variables.');
}

// Initialize Sequelize
// Always use parsed dbConfig (works for both DATABASE_URL and individual vars)
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
    retry: dbConfig.retry
  }
);

// Test database connection with retry mechanism
const testConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      logger.info('PostgreSQL veritabanı bağlantısı başarılı!');
      logger.debug(`Veritabanı: ${dbConfig.database}`);
      logger.debug(`Host: ${dbConfig.host}:${dbConfig.port}`);
      return true;
    } catch (error) {
      const attempt = i + 1;
      logger.error(`PostgreSQL bağlantı denemesi ${attempt}/${retries} başarısız: ${error.message}`);

      if (attempt < retries) {
        logger.info(`${delay / 1000} saniye sonra tekrar denenecek...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error('Veritabanı bağlantısı kurulamadı!');
        logger.error('Lütfen şunları kontrol edin:');
        logger.error('1. PostgreSQL servisi çalışıyor mu?');
        logger.error('2. .env dosyasındaki DB bilgileri doğru mu?');
        logger.error('3. Veritabanı oluşturuldu mu?');
        logger.error('4. Kullanıcı yetkileri doğru mu?');
        throw error;
      }
    }
  }
};

// Close database connection gracefully
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Veritabanı bağlantısı kapatıldı.');
  } catch (error) {
    logger.error('Veritabanı bağlantısı kapatılırken hata: ' + (error.message || error));
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection,
  dbConfig
};
