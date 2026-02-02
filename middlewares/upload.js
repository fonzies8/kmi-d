const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const securityConfig = require('../config/security');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/public';
    
    // Check the full path with admin prefix
    const fullPath = req.baseUrl + req.path;
    
    if (fullPath.includes('/products') || fullPath.includes('/product')) {
      uploadPath = 'uploads/products';
    } else if (fullPath.includes('/services') || fullPath.includes('/service')) {
      uploadPath = 'uploads/services';
    } else if (fullPath.includes('/homepage') || fullPath.includes('/homepage-card')) {
      uploadPath = 'uploads/homepage';
    }
    
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = securityConfig.upload.allowedTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları (JPEG, PNG, WebP) yüklenebilir.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: securityConfig.upload.maxFileSize
  }
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      const outputPath = file.path.replace(path.extname(file.path), '-optimized.jpg');
      
      await sharp(file.path)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
      
      // Replace original with optimized
      fs.unlinkSync(file.path);
      fs.renameSync(outputPath, file.path);
    }
    
    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

// Create thumbnail
const createThumbnail = async (imagePath) => {
  try {
    const thumbnailPath = imagePath.replace(path.extname(imagePath), '-thumb.jpg');
    
    await sharp(imagePath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    return null;
  }
};

module.exports = {
  upload,
  optimizeImage,
  createThumbnail
};
