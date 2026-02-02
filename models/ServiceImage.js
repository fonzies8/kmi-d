const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceImage = sequelize.define('ServiceImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  alt_text: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'service_images',
  timestamps: true
});

module.exports = ServiceImage;
