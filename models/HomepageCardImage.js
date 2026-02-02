const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HomepageCardImage = sequelize.define('HomepageCardImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'homepage_cards',
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
  alt_text: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'homepage_card_images',
  timestamps: true
});

module.exports = HomepageCardImage;
