require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_change_this',
    expiresIn: '24h'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your_session_secret_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 86400000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // 'lax' for development to allow cross-site requests
    }
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
  },
  rateLimit: {
    login: {
      windowMs: (parseInt(process.env.LOGIN_RATE_WINDOW) || 15) * 60 * 1000,
      max: parseInt(process.env.LOGIN_RATE_LIMIT) || 5,
      message: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    api: {
      windowMs: (parseInt(process.env.API_RATE_WINDOW) || 15) * 60 * 1000,
      max: parseInt(process.env.API_RATE_LIMIT) || 100,
      message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
    }
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/jpg').split(',')
  }
};
