const { Product, ProductImage, Service, ServiceImage, sequelize } = require('../models');

// Test database connection
exports.testDatabase = async (req, res) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT version()');

    res.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı!',
      database: {
        version: results[0].version,
        connected: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Veritabanı bağlantı hatası',
      error: error.message
    });
  }
};

// Get all products with details
exports.testProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: ProductImage,
        as: 'images',
        separate: true,
        order: [['display_order', 'ASC']]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        status: p.status,
        description: p.description,
        imageCount: p.images ? p.images.length : 0,
        images: p.images || [],
        created_at: p.created_at,
        updated_at: p.updated_at
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürünler alınırken hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all services with details
exports.testServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{
        model: ServiceImage,
        as: 'images',
        separate: true,
        order: [['display_order', 'ASC']]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: services.length,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        short_description: s.short_description,
        description: s.description,
        imageCount: s.images ? s.images.length : 0,
        images: s.images || [],
        created_at: s.created_at,
        updated_at: s.updated_at
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hizmetler alınırken hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Test API endpoint
exports.testAPI = async (req, res) => {
  try {
    const endpoint = req.query.endpoint || '/admin/api/products';
    const method = req.query.method || 'GET';

    // Simulate API call
    res.json({
      success: true,
      message: 'API endpoint test edildi',
      endpoint,
      method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API test hatası',
      error: error.message
    });
  }
};

// Create test product (with form data support)
exports.createTestProduct = async (req, res) => {
  try {
    // Extract and prepare product data from form
    const productData = {
      name: req.body.name || `Test Ürün ${Date.now()}`,
      description: req.body.description || 'Bu bir test ürünüdür. Admin panelinden silinebilir.',
      category: req.body.category || 'Test',
      status: req.body.status || 'active',
      display_order: 999
    };

    // Validate required fields
    if (!productData.name) {
      return res.status(400).json({
        success: false,
        message: 'Ürün adı zorunludur.'
      });
    }

    const testProduct = await Product.create(productData);

    // Handle multiple images if provided
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return ProductImage.create({
          product_id: testProduct.id,
          image_url: `/uploads/products/${file.filename}`,
          display_order: index,
          is_primary: index === 0
        });
      });

      await Promise.all(imagePromises);
    }

    // Get product with images
    const productWithImages = await Product.findByPk(testProduct.id, {
      include: [{
        model: ProductImage,
        as: 'images'
      }]
    });

    res.json({
      success: true,
      message: 'Test ürünü başarıyla oluşturuldu!',
      product: {
        id: productWithImages.id,
        name: productWithImages.name,
        description: productWithImages.description,
        category: productWithImages.category,
        status: productWithImages.status,
        images: productWithImages.images || []
      }
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error('Create test product error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Test ürünü oluşturulurken hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create test service
exports.createTestService = async (req, res) => {
  try {
    const testService = await Service.create({
      name: `Test Hizmet ${Date.now()}`,
      short_description: 'Bu bir test hizmetidir.',
      description: 'Bu bir test hizmetidir. Admin panelinden silinebilir.',
      status: 'active',
      display_order: 999
    });

    res.json({
      success: true,
      message: 'Test hizmeti oluşturuldu!',
      service: {
        id: testService.id,
        name: testService.name,
        status: testService.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test hizmeti oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Get session info
exports.getSessionInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      session: {
        exists: !!req.session,
        userId: req.session?.userId || null,
        username: req.session?.username || null,
        cookie: req.session?.cookie || null,
        sessionID: req.sessionID || null
      },
      user: req.session?.userId ? {
        id: req.session.userId,
        username: req.session.username
      } : null,
      authenticated: !!(req.session && req.session.userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Session bilgisi alınırken hata oluştu',
      error: error.message
    });
  }
};

// Execute SQL query
exports.executeSQL = async (req, res) => {
  try {
    const { query, queryType } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'SQL sorgusu boş olamaz.'
      });
    }

    // Security: Only allow SELECT queries by default, or warn for other types
    const trimmedQuery = query.trim().toUpperCase();
    const isSelect = trimmedQuery.startsWith('SELECT');
    const isInsert = trimmedQuery.startsWith('INSERT');
    const isUpdate = trimmedQuery.startsWith('UPDATE');
    const isDelete = trimmedQuery.startsWith('DELETE');
    const isCreate = trimmedQuery.startsWith('CREATE');
    const isDrop = trimmedQuery.startsWith('DROP');
    const isAlter = trimmedQuery.startsWith('ALTER');
    const isTruncate = trimmedQuery.startsWith('TRUNCATE');

    // Block dangerous operations
    if (isDrop || isAlter || isTruncate) {
      return res.status(403).json({
        success: false,
        message: 'Güvenlik nedeniyle DROP, ALTER ve TRUNCATE sorgularına izin verilmiyor.',
        blocked: true
      });
    }

    let result;
    let rowCount = 0;
    const startTime = Date.now();

    if (isSelect) {
      // SELECT queries return data
      const [results] = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
      });
      result = results;
      rowCount = results.length;
    } else if (isInsert) {
      // INSERT queries return affected rows
      const [results, metadata] = await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT
      });
      result = {
        insertedId: results[0] || null,
        affectedRows: metadata.rowCount || 0
      };
      rowCount = metadata.rowCount || 0;
    } else if (isUpdate || isDelete) {
      // UPDATE/DELETE queries return affected rows
      const [results, metadata] = await sequelize.query(query);
      result = {
        affectedRows: metadata.rowCount || 0
      };
      rowCount = metadata.rowCount || 0;
    } else {
      // Other queries (CREATE TABLE, etc.)
      const [results, metadata] = await sequelize.query(query);
      result = results;
      rowCount = metadata?.rowCount || 0;
    }

    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      query: query.substring(0, 500), // Limit query length in response
      queryType: isSelect ? 'SELECT' : isInsert ? 'INSERT' : isUpdate ? 'UPDATE' : isDelete ? 'DELETE' : 'OTHER',
      result: result,
      rowCount: rowCount,
      executionTime: executionTime + 'ms',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[EXECUTE SQL] Error:', error);
    res.status(500).json({
      success: false,
      message: 'SQL sorgusu çalıştırılırken hata oluştu',
      error: error.message,
      sqlError: error.original?.message || error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
