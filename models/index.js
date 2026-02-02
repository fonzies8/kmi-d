const { sequelize, testConnection, closeConnection } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Service = require('./Service');
const ServiceImage = require('./ServiceImage');
const HomepageCard = require('./HomepageCard');
const HomepageCardImage = require('./HomepageCardImage');
const SiteSetting = require('./SiteSetting');

// Define relationships
Product.hasMany(ProductImage, {
  foreignKey: 'product_id',
  as: 'images',
  onDelete: 'CASCADE'
});
ProductImage.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Service.hasMany(ServiceImage, {
  foreignKey: 'service_id',
  as: 'images',
  onDelete: 'CASCADE'
});
ServiceImage.belongsTo(Service, {
  foreignKey: 'service_id',
  as: 'service'
});

HomepageCard.hasMany(HomepageCardImage, {
  foreignKey: 'cardId',
  as: 'images',
  onDelete: 'CASCADE'
});
HomepageCardImage.belongsTo(HomepageCard, {
  foreignKey: 'cardId',
  as: 'card'
});

const logger = require('../utils/logger');

// Sync database (only in development, never in production!)
const syncDatabase = async (force = false) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && force) {
    logger.error('❌ PRODUCTION ORTAMINDA FORCE SYNC YAPILAMAZ!');
    throw new Error('Production ortamında force sync yapılamaz!');
  }

  try {
    if (isProduction) {
      logger.warn('⚠️  Production ortamında sync devre dışı. Migrations kullanın.');
      return;
    }

    const options = force
      ? { force: true, alter: false }
      : { alter: true }; // alter: true to add new columns

    await sequelize.sync(options);
    logger.info('✓ Veritabanı tabloları senkronize edildi!');
  } catch (error) {
    logger.error('✗ Veritabanı senkronizasyon hatası:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection,
  User,
  Product,
  ProductImage,
  Service,
  ServiceImage,
  HomepageCard,
  HomepageCardImage,
  SiteSetting,
  syncDatabase
};
