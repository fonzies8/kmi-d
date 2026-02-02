const { Product, ProductImage, Service, ServiceImage, HomepageCard, HomepageCardImage, SiteSetting } = require('../models');
const logger = require('../utils/logger');

// Helper function to get settings
const getSettings = async () => {
  try {
    const settingsData = await SiteSetting.findAll();
    const settings = {};

    settingsData.forEach(setting => {
      if (setting.type === 'json' && setting.value) {
        try {
          settings[setting.key] = JSON.parse(setting.value);
        } catch (e) {
          settings[setting.key] = setting.value;
        }
      } else if (setting.type === 'boolean') {
        settings[setting.key] = setting.value === 'true';
      } else {
        settings[setting.key] = setting.value;
      }
    });

    return settings;
  } catch (error) {
    logger.error('Error fetching settings: ' + (error.message || error));
    return {};
  }
};

// Render homepage
exports.renderHomepage = async (req, res) => {
  try {
    const [products, services, cards, settings] = await Promise.all([
      Product.findAll({
        where: { status: 'active' },
        include: [{
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false
        }],
        limit: 4,
        order: [['display_order', 'ASC']]
      }),
      Service.findAll({
        where: { status: 'active' },
        include: [{
          model: ServiceImage,
          as: 'images',
          separate: true, // Separate query for ordering
          order: [['display_order', 'ASC']]
        }],
        limit: 4,
        order: [['display_order', 'ASC']]
      }),
      HomepageCard.findAll({
        where: { status: 'active' },
        include: [{
          model: HomepageCardImage,
          as: 'images',
          order: [['display_order', 'ASC']]
        }],
        order: [['display_order', 'ASC']]
      }),
      getSettings()
    ]);

    res.render('public/index', { products, services, cards, settings });
  } catch (error) {
    logger.error('Homepage render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render products page
exports.renderProducts = async (req, res) => {
  try {
    const [products, settings] = await Promise.all([
      Product.findAll({
        where: { status: 'active' },
        include: [{
          model: ProductImage,
          as: 'images',
          order: [['display_order', 'ASC']]
        }],
        order: [['display_order', 'ASC'], ['created_at', 'DESC']]
      }),
      getSettings()
    ]);

    res.render('public/products', { products, settings });
  } catch (error) {
    logger.error('Products page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render single product page
exports.renderProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [product, settings] = await Promise.all([
      Product.findOne({
        where: { id, status: 'active' },
        include: [{
          model: ProductImage,
          as: 'images',
          order: [['display_order', 'ASC']]
        }]
      }),
      getSettings()
    ]);

    if (!product) {
      return res.status(404).send('Ürün bulunamadı.');
    }

    res.render('public/product', { product, settings });
  } catch (error) {
    logger.error('Product page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render services page
exports.renderServices = async (req, res) => {
  try {
    const [services, settings] = await Promise.all([
      Service.findAll({
        where: { status: 'active' },
        include: [{
          model: ServiceImage,
          as: 'images',
          order: [['display_order', 'ASC']]
        }],
        order: [['display_order', 'ASC'], ['created_at', 'DESC']]
      }),
      getSettings()
    ]);

    res.render('public/services', { services, settings });
  } catch (error) {
    logger.error('Services page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render single service page
exports.renderService = async (req, res) => {
  try {
    const { id } = req.params;

    const [serviceModel, settings] = await Promise.all([
      Service.findOne({
        where: { id, status: 'active' },
        include: [{
          model: ServiceImage,
          as: 'images',
          order: [['display_order', 'ASC']]
        }]
      }),
      getSettings()
    ]);

    if (!serviceModel) {
      return res.status(404).send('Hizmet bulunamadı.');
    }

    // Normalize service object and image URLs for consistent rendering
    const service = serviceModel.get ? serviceModel.get({ plain: true }) : serviceModel;
    service.images = (service.images || []).map(img => {
      let url = img.image_url || img.imageUrl || img.url || '';
      if (url && !url.startsWith('http') && !url.startsWith('/')) url = '/' + url;
      return Object.assign({}, img, { image_url: url });
    });

    res.render('public/service', { service, settings });
  } catch (error) {
    logger.error('Service page render error: ' + (error.message || error));
    res.status(500).send('Sayfa yüklenirken hata oluştu.');
  }
};

// Render about page
exports.renderAbout = async (req, res) => {
  try {
    const settings = await getSettings();
    res.render('public/about', { settings });
  } catch (error) {
    logger.error('About page render error: ' + (error.message || error));
    // Render with empty settings if error
    res.render('public/about', { settings: {} });
  }
};

// Render contact page
exports.renderContact = async (req, res) => {
  try {
    const settings = await getSettings();
    res.render('public/contact', { settings });
  } catch (error) {
    logger.error('Contact page render error: ' + (error.message || error));
    // Render with empty settings if error
    res.render('public/contact', { settings: {} });
  }
};
