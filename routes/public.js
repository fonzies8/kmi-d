const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const productController = require('../controllers/productController');
const serviceController = require('../controllers/serviceController');
const homepageController = require('../controllers/homepageController');

// Public Pages
router.get('/', publicController.renderHomepage);
router.get('/products', publicController.renderProducts);
router.get('/product/:id', publicController.renderProduct);
router.get('/services', publicController.renderServices);
router.get('/service/:id', publicController.renderService);
router.get('/about', publicController.renderAbout);
router.get('/contact', publicController.renderContact);

// Public API (for AJAX requests)
router.get('/api/products', productController.getActiveProducts);
router.get('/api/products/:id', productController.getProduct);
router.get('/api/services', serviceController.getActiveServices);
router.get('/api/services/:id', serviceController.getService);
router.get('/api/homepage-cards', homepageController.getActiveCards);

module.exports = router;
