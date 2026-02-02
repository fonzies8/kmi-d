const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const serviceController = require('../controllers/serviceController');
const homepageController = require('../controllers/homepageController');
const settingsController = require('../controllers/settingsController');
const profileController = require('../controllers/profileController');
const { authenticateSession } = require('../middlewares/auth');
const { upload, optimizeImage } = require('../middlewares/upload');
const { apiLimiter } = require('../middlewares/rateLimiter');
const {
  productValidation,
  serviceValidation,
  homepageCardValidation,
  handleValidationErrors
} = require('../middlewares/validation');

// Root admin route - redirect to dashboard if logged in, otherwise to login
router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/admin/login');
});

// Login page (no auth required)
router.get('/login', adminController.renderLogin);

// All routes below require authentication
router.use(authenticateSession);

// Dashboard
router.get('/dashboard', adminController.renderDashboard);

// Products Management
router.get('/products', adminController.renderProducts);
router.get('/api/products', apiLimiter, productController.getAllProducts);
router.get('/api/products/:id', apiLimiter, productController.getProduct);
router.post('/api/products',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  productValidation,
  handleValidationErrors,
  productController.createProduct
);
router.put('/api/products/:id',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  productValidation,
  handleValidationErrors,
  productController.updateProduct
);
router.delete('/api/products/:id', apiLimiter, productController.deleteProduct);
router.delete('/api/product-images/:imageId', apiLimiter, productController.deleteProductImage);

// Services Management
router.get('/services', adminController.renderServices);
router.get('/api/services', apiLimiter, serviceController.getAllServices);
router.get('/api/services/:id', apiLimiter, serviceController.getService);
router.post('/api/services',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  serviceValidation,
  handleValidationErrors,
  serviceController.createService
);
router.put('/api/services/:id',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  serviceValidation,
  handleValidationErrors,
  serviceController.updateService
);
router.delete('/api/services/:id', apiLimiter, serviceController.deleteService);
router.delete('/api/service-images/:imageId', apiLimiter, serviceController.deleteServiceImage);

// Homepage Management
router.get('/homepage', adminController.renderHomepageManager);
router.get('/api/homepage-cards', apiLimiter, homepageController.getAllCards);
router.get('/api/homepage-cards/:id', apiLimiter, homepageController.getCard);
router.post('/api/homepage-cards',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  homepageCardValidation,
  handleValidationErrors,
  homepageController.createCard
);
router.put('/api/homepage-cards/:id',
  apiLimiter,
  upload.array('images', 10),
  optimizeImage,
  homepageCardValidation,
  handleValidationErrors,
  homepageController.updateCard
);
router.delete('/api/homepage-cards/:id', apiLimiter, homepageController.deleteCard);
router.delete('/api/homepage-card-images/:imageId', apiLimiter, homepageController.deleteCardImage);

// Settings Management
router.get('/settings', adminController.renderSettings);
router.get('/api/settings', apiLimiter, settingsController.getAllSettings);
router.put('/api/settings', apiLimiter, settingsController.updateSettings);
router.post('/api/settings/image',
  apiLimiter,
  upload.single('image'),
  optimizeImage,
  settingsController.updateSettingImage
);

// User Profile
router.get('/profile', adminController.renderProfile);
router.get('/api/profile', apiLimiter, profileController.getProfile);
router.put('/api/profile/update', apiLimiter, profileController.updateProfile);
router.put('/api/profile/change-password', apiLimiter, profileController.changePassword);

module.exports = router;
