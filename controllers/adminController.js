const { Product, Service, HomepageCard, User } = require('../models');
const logger = require('../utils/logger');

// Render admin login page
exports.renderLogin = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
};

// Render admin dashboard
exports.renderDashboard = async (req, res) => {
  try {
    const stats = {
      products: await Product.count(),
      services: await Service.count(),
      cards: await HomepageCard.count(),
      activeProducts: await Product.count({ where: { status: 'active' } }),
      activeServices: await Service.count({ where: { status: 'active' } })
    };

    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });

    res.render('admin/dashboard', { stats, user });
  } catch (error) {
    logger.error('Dashboard render error: ' + (error.message || error));
    res.status(500).send('Dashboard yüklenirken hata oluştu.');
  }
};

// Render products management page
exports.renderProducts = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });
    res.render('admin/products', { user });
  } catch (error) {
    logger.error('Products page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render services management page
exports.renderServices = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });
    res.render('admin/services', { user });
  } catch (error) {
    logger.error('Services page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render homepage management page
exports.renderHomepageManager = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });
    res.render('admin/homepage', { user });
  } catch (error) {
    logger.error('Homepage manager render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render settings page
exports.renderSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });

    res.render('admin/settings', { user });
  } catch (error) {
    logger.error('Settings page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render test page
exports.renderProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'username', 'email']
    });

    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı.');
    }

    res.render('admin/profile', { user });
  } catch (error) {
    logger.error('Profile page render error: ' + (error.message || error));
    res.status(500).send('Profil sayfası yüklenirken hata oluştu.');
  }
};

// Render core values management page
// Note: core-values management removed
