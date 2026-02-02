const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.login.windowMs,
  max: securityConfig.rateLimit.login.max,
  message: securityConfig.rateLimit.login.message,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.api.windowMs,
  max: securityConfig.rateLimit.api.max,
  message: securityConfig.rateLimit.api.message,
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Çok fazla işlem denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter
};
