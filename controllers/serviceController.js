const { Service, ServiceImage } = require('../models');
const logger = require('../utils/logger');

// Get all services (Admin)
exports.getAllServices = async (req, res) => {
  try {
    logger.debug('GET ALL SERVICES');
    logger.debug('Query: SELECT * FROM services');

    const services = await Service.findAll({
      include: [{
        model: ServiceImage,
        as: 'images',
        separate: true, // Separate query for ordering
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    logger.debug('SUCCESS - Service Count: ' + services.length);
    logger.debug('Service IDs: ' + services.map(s => s.id).join(', '));

    res.json({ success: true, services });
  } catch (error) {
    logger.error('GET ALL SERVICES ERROR: ' + (error.message || error));
    logger.error(error.stack || 'no stack');
    res.status(500).json({
      success: false,
      message: 'Hizmetler alınırken hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get active services (Public)
exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { status: 'active' },
      include: [{
        model: ServiceImage,
        as: 'images',
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({ success: true, services });
  } catch (error) {
    logger.error('Get active services error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Hizmetler alınırken hata oluştu.'
    });
  }
};

// Get single service
exports.getService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [{
        model: ServiceImage,
        as: 'images',
        separate: true, // Separate query for ordering
        order: [['display_order', 'ASC']]
      }]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı.'
      });
    }

    res.json({ success: true, service });
  } catch (error) {
    logger.error('Get service error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Hizmet alınırken hata oluştu.'
    });
  }
};

// Create service
exports.createService = async (req, res) => {
  try {
    // Extract and prepare service data
    const serviceData = {
      name: req.body.name,
      description: req.body.description || null,
      short_description: req.body.short_description || null,
      status: req.body.status || 'active',
      display_order: req.body.display_order ? parseInt(req.body.display_order) : 0,
      icon: req.body.icon || null
    };

    // Validate required fields
    if (!serviceData.name) {
      return res.status(400).json({
        success: false,
        message: 'Hizmet adı zorunludur.'
      });
    }

    const service = await Service.create(serviceData);

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return ServiceImage.create({
          service_id: service.id,
          image_url: `/uploads/services/${file.filename}`,
          display_order: index,
          is_primary: index === 0
        });
      });

      await Promise.all(imagePromises);
    }

    const serviceWithImages = await Service.findByPk(service.id, {
      include: [{ model: ServiceImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Hizmet başarıyla oluşturuldu!',
      service: serviceWithImages
    });
  } catch (error) {
    logger.error('Create service error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Hizmet oluşturulurken hata oluştu.',
      error: error.message
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract and prepare update data
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.short_description !== undefined) updateData.short_description = req.body.short_description;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order) || 0;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı.'
      });
    }

    await service.update(updateData);

    // Handle new images
    if (req.files && req.files.length > 0) {
      const existingImages = await ServiceImage.count({ where: { service_id: id } });

      const imagePromises = req.files.map((file, index) => {
        return ServiceImage.create({
          service_id: id,
          image_url: `/uploads/services/${file.filename}`,
          display_order: existingImages + index,
          is_primary: existingImages === 0 && index === 0
        });
      });

      await Promise.all(imagePromises);
    }

    const updatedService = await Service.findByPk(id, {
      include: [{ model: ServiceImage, as: 'images' }]
    });

    res.json({
      success: true,
      message: 'Hizmet başarıyla güncellendi!',
      service: updatedService
    });
  } catch (error) {
    logger.error('Update service error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Hizmet güncellenirken hata oluştu.'
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı.'
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Hizmet başarıyla silindi!'
    });
  } catch (error) {
    logger.error('Delete service error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Hizmet silinirken hata oluştu.'
    });
  }
};

// Delete service image
exports.deleteServiceImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await ServiceImage.findByPk(imageId);

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
    logger.error('Delete image error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Resim silinirken hata oluştu.'
    });
  }
};
