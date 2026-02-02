const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HomepageCard = sequelize.define('HomepageCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('product', 'service', 'feature', 'testimonial', 'custom', 'cta', 'stats'),
    defaultValue: 'custom'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Font Awesome icon class (e.g., fas fa-wrench)'
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  link_text: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  background_color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Bootstrap color class (e.g., primary, success, info)'
  },
  text_color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Bootstrap text color class'
  },
  highlight: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Show as featured/highlighted card'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'homepage_cards',
  timestamps: true
});

module.exports = HomepageCard;
