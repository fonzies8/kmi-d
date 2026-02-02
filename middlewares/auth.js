const jwt = require('jsonwebtoken');
const { User } = require('../models');
const securityConfig = require('../config/security');

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Yetkilendirme token\'ı bulunamadı.' 
      });
    }

    const decoded = jwt.verify(token, securityConfig.jwt.secret);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz veya devre dışı kullanıcı.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Oturum süreniz dolmuştur. Lütfen tekrar giriş yapın.' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Token doğrulanamadı.' 
    });
  }
};

// Session Authentication Middleware
const authenticateSession = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    // Check if it's an API request (check path or accept header)
    const isAPIRequest = req.path.includes('/api/') || 
                        req.path.includes('/admin/api/') ||
                        req.get('Accept')?.includes('application/json') ||
                        req.get('Content-Type')?.includes('application/json');
    
    if (isAPIRequest) {
      return res.status(401).json({ 
        success: false, 
        message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        requiresLogin: true
      });
    }
    // For HTML pages, redirect to login
    res.redirect('/admin/login');
  }
};

// Check if user is already logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    securityConfig.jwt.secret, 
    { expiresIn: securityConfig.jwt.expiresIn }
  );
};

module.exports = {
  authenticateJWT,
  authenticateSession,
  isLoggedIn,
  generateToken
};
