const { body, validationResult } = require('express-validator');

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

// Login Validation Rules
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Kullanıcı adı gereklidir.')
    .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır.'),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir.')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.')
];

// User Registration Validation Rules
const userValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Kullanıcı adı gereklidir.')
    .isLength({ min: 3, max: 50 }).withMessage('Kullanıcı adı 3-50 karakter arasında olmalıdır.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.'),
  body('email')
    .trim()
    .notEmpty().withMessage('E-posta gereklidir.')
    .isEmail().withMessage('Geçerli bir e-posta adresi girin.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir.')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.')
];

// Product Validation Rules
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Ürün adı gereklidir.')
    .isLength({ min: 3, max: 200 }).withMessage('Ürün adı 3-200 karakter arasında olmalıdır.'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Geçersiz durum değeri.')
];

// Service Validation Rules
const serviceValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Hizmet adı gereklidir.')
    .isLength({ min: 3, max: 200 }).withMessage('Hizmet adı 3-200 karakter arasında olmalıdır.'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Geçersiz durum değeri.')
];

// Homepage Card Validation Rules
const homepageCardValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Başlık gereklidir.')
    .isLength({ min: 3, max: 200 }).withMessage('Başlık 3-200 karakter arasında olmalıdır.'),
  body('type')
    .optional()
    .isIn(['product', 'service', 'feature', 'testimonial', 'custom']).withMessage('Geçersiz kart tipi.'),
  body('content')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Geçersiz durum değeri.')
];

// Sanitize HTML to prevent XSS
const sanitizeHTML = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

module.exports = {
  handleValidationErrors,
  loginValidation,
  userValidation,
  productValidation,
  serviceValidation,
  homepageCardValidation,
  sanitizeHTML
};
