const { HomepageCard, HomepageCardImage } = require('../models');
const logger = require('../utils/logger');

// Get all homepage cards (Admin)
exports.getAllCards = async (req, res) => {
  try {
    const cards = await HomepageCard.findAll({
      include: [{
        model: HomepageCardImage,
        as: 'images',
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    // Debug logging
    logger.debug(`Loaded ${cards.length} cards`);
    cards.forEach(card => {
      logger.debug(`Card "${card.title}": ${card.images ? card.images.length : 0} images`);
    });

    res.json({ success: true, cards });
  } catch (error) {
    logger.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Kartlar alınırken hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get active homepage cards (Public)
exports.getActiveCards = async (req, res) => {
  try {
    const cards = await HomepageCard.findAll({
      where: { status: 'active' },
      include: [{
        model: HomepageCardImage,
        as: 'images',
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC']]
    });

    res.json({ success: true, cards });
  } catch (error) {
    logger.error('Get active cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Kartlar alınırken hata oluştu.'
    });
  }
};

// Get single card
exports.getCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await HomepageCard.findByPk(id, {
      include: [{
        model: HomepageCardImage,
        as: 'images',
        order: [['display_order', 'ASC']]
      }]
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Kart bulunamadı.'
      });
    }

    res.json({ success: true, card });
  } catch (error) {
    logger.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Kart alınırken hata oluştu.'
    });
  }
};

// Create card
exports.createCard = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Kart başlığı zorunludur.'
      });
    }

    const cardData = {
      title: req.body.title,
      content: req.body.content || null,
      type: req.body.type || 'custom',
      status: req.body.status || 'active',
      display_order: req.body.display_order ? parseInt(req.body.display_order) : 0
    };

    const card = await HomepageCard.create(cardData);

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return HomepageCardImage.create({
          cardId: card.id,
          image_url: `/uploads/homepage/${file.filename}`,
          display_order: index
        });
      });

      await Promise.all(imagePromises);
    }

    const cardWithImages = await HomepageCard.findByPk(card.id, {
      include: [{ model: HomepageCardImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Kart başarıyla oluşturuldu!',
      card: cardWithImages
    });
  } catch (error) {
    logger.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Kart oluşturulurken hata oluştu.',
      error: error.message
    });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract and prepare update data
    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order) || 0;

    const card = await HomepageCard.findByPk(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Kart bulunamadı.'
      });
    }

    await card.update(updateData);

    // Handle new images
    if (req.files && req.files.length > 0) {
      const existingImages = await HomepageCardImage.count({ where: { cardId: id } });

      const imagePromises = req.files.map((file, index) => {
        return HomepageCardImage.create({
          cardId: id,
          image_url: `/uploads/homepage/${file.filename}`,
          display_order: existingImages + index
        });
      });

      await Promise.all(imagePromises);
    }

    const updatedCard = await HomepageCard.findByPk(id, {
      include: [{ model: HomepageCardImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Kart başarıyla güncellendi!',
      card: updatedCard
    });
  } catch (error) {
    logger.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Kart güncellenirken hata oluştu.'
    });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await HomepageCard.findByPk(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Kart bulunamadı.'
      });
    }

    await card.destroy();

    res.json({
      success: true,
      message: 'Kart başarıyla silindi!'
    });
  } catch (error) {
    logger.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Kart silinirken hata oluştu.'
    });
  }
};

// Delete card image
exports.deleteCardImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await HomepageCardImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı.'
      });
    }

    await image.destroy();

    res.json({
      success: true,
      message: 'Resim başarıyla silindi!'
    });
  } catch (error) {
    logger.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Resim silinirken hata oluştu.'
    });
  }
};
