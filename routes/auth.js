const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation, userValidation, handleValidationErrors } = require('../middlewares/validation');
const { loginLimiter } = require('../middlewares/rateLimiter');

// Login POST (actual login)
router.post('/login', 
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// Logout
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// Check authentication status
router.get('/check-auth', authController.checkAuth);

// Create admin user (for initial setup)
router.post('/create-admin', 
  userValidation,
  handleValidationErrors,
  authController.createAdminUser
);

module.exports = router;
