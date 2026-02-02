const { User } = require('../models');
const { generateToken } = require('../middlewares/auth');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password, remember } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı.'
      });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmıştır.'
      });
    }

    // Update last login
    user.last_login = new Date();

    // Remember me token
    if (remember) {
      const rememberToken = crypto.randomBytes(64).toString('hex');
      user.remember_token = rememberToken;

      res.cookie('remember_token', rememberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'strict'
      });
    }

    await user.save();

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Generate JWT
    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Giriş başarılı!',
      redirect: '/admin/dashboard'
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu.'
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).send('Çıkış yaparken hata oluştu.');
    }

    res.clearCookie('token');
    res.clearCookie('remember_token');
    res.clearCookie('kartal_metal.sid');
    res.redirect('/admin/login');
  });
};

// Check authentication status
exports.checkAuth = async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['id', 'username', 'email']
      });

      if (user) {
        return res.json({
          success: true,
          authenticated: true,
          user
        });
      }
    }

    res.json({
      success: true,
      authenticated: false
    });
  } catch (error) {
    logger.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Kimlik doğrulama kontrolü başarısız.'
    });
  }
};

// Create first admin user
exports.createAdminUser = async (req, res) => {
  try {
    const adminCount = await User.count();

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin kullanıcı zaten mevcut.'
      });
    }

    const { username, email, password } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      is_active: true
    });

    res.json({
      success: true,
      message: 'Admin kullanıcı başarıyla oluşturuldu!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    logger.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin kullanıcı oluşturulurken hata oluştu.',
      error: error.message
    });
  }
};
