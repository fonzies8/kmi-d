const { Product, ProductImage } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Get all products (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    logger.debug('Fetching all products with images');

    const products = await Product.findAll({
      include: [{
        model: ProductImage,
        as: 'images',
        separate: true,
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    logger.debug(`Successfully retrieved ${products.length} products`);
    res.json({ success: true, products });
  } catch (error) {
    logger.error('Get all products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürünler alınırken hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get active products (Public)
exports.getActiveProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'active' },
      include: [{
        model: ProductImage,
        as: 'images',
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({ success: true, products });
  } catch (error) {
    logger.error('Get active products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürünler alınırken hata oluştu.'
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: ProductImage,
        as: 'images',
        separate: true, // Separate query for ordering
        order: [['display_order', 'ASC']]
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı.'
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    logger.error('Get product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürün alınırken hata oluştu.'
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    logger.debug('Creating new product');

    // Extract and prepare product data
    const productData = {
      name: req.body.name,
      description: req.body.description || null,
      category: req.body.category || null,
      price: req.body.price ? parseFloat(req.body.price) : null,
      status: req.body.status || 'active',
      display_order: req.body.display_order ? parseInt(req.body.display_order) : 0,
      meta_title: req.body.meta_title || null,
      meta_description: req.body.meta_description || null
    };

    // Validate required fields
    if (!productData.name) {
      return res.status(400).json({
        success: false,
        message: 'Ürün adı zorunludur.'
      });
    }

    const product = await Product.create(productData);
    logger.debug(`Product created with ID: ${product.id}`);

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        logger.debug(`Uploading image: ${file.filename}`);
        return ProductImage.create({
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          display_order: index,
          is_primary: index === 0
        });
      });

      await Promise.all(imagePromises);
      logger.debug(`${req.files.length} images uploaded for product ${product.id}`);
    }

    const productWithImages = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu!',
      product: productWithImages
    });
  } catch (error) {
    logger.error('Create product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürün oluşturulurken hata oluştu.',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract and prepare update data
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.price !== undefined) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order) || 0;
    if (req.body.meta_title !== undefined) updateData.meta_title = req.body.meta_title;
    if (req.body.meta_description !== undefined) updateData.meta_description = req.body.meta_description;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı.'
      });
    }

    await product.update(updateData);

    // Handle new images
    if (req.files && req.files.length > 0) {
      const existingImages = await ProductImage.count({ where: { product_id: id } });

      const imagePromises = req.files.map((file, index) => {
        return ProductImage.create({
          product_id: id,
          image_url: `/uploads/products/${file.filename}`,
          display_order: existingImages + index,
          is_primary: existingImages === 0 && index === 0
        });
      });

      await Promise.all(imagePromises);
    }

    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Ürün başarıyla güncellendi!',
      product: updatedProduct
    });
  } catch (error) {
    logger.error('Update product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken hata oluştu.'
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug(`Deleting product with ID: ${id}`);

    const product = await Product.findByPk(id);

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı.'
      });
    }

    await product.destroy();
    logger.debug(`Product ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Ürün başarıyla silindi!'
    });
  } catch (error) {
    logger.error('Delete product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken hata oluştu.'
    });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    logger.debug(`Deleting product image with ID: ${imageId}`);

    const image = await ProductImage.findByPk(imageId);

    if (!image) {
      logger.warn(`Product image not found: ${imageId}`);
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı.'
      });
    }

    await image.destroy();
    logger.debug(`Product image ${imageId} deleted successfully`);

    res.json({
      success: true,
      message: 'Resim başarıyla silindi!'
    });
  } catch (error) {
    logger.error('Delete product image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Resim silinirken hata oluştu.'
    });
  }
};
