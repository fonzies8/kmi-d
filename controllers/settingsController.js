const { SiteSetting } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.findAll({
      order: [['key', 'ASC']]
    });

    // Convert to key-value object for easier use
    const settingsObj = {};
    settings.forEach(setting => {
      if (setting.type === 'json' && setting.value) {
        try {
          settingsObj[setting.key] = JSON.parse(setting.value);
        } catch (e) {
          settingsObj[setting.key] = setting.value;
        }
      } else if (setting.type === 'boolean') {
        settingsObj[setting.key] = setting.value === 'true';
      } else if (setting.type === 'number') {
        settingsObj[setting.key] = parseFloat(setting.value);
      } else {
        settingsObj[setting.key] = setting.value;
      }
    });

    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    logger.error('Get settings error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Ayarlar alınırken hata oluştu.'
    });
  }
};

// Get single setting by key
exports.getSetting = async (key) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key } });
    if (!setting) return null;

    if (setting.type === 'json' && setting.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return setting.value;
      }
    }
    return setting.value;
  } catch (error) {
    logger.error('Get setting error: ' + (error.message || error));
    return null;
  }
};

// Update multiple settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      let processedValue = value;
      let type = 'text';

      // Determine type and process value
      if (typeof value === 'object' && value !== null) {
        processedValue = JSON.stringify(value);
        type = 'json';
      } else if (typeof value === 'boolean') {
        processedValue = value.toString();
        type = 'boolean';
      } else if (typeof value === 'number') {
        processedValue = value.toString();
        type = 'number';
      }

      // Upsert (update or create)
      await SiteSetting.upsert({
        key,
        value: processedValue,
        type
      });
    }

    res.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi!'
    });
  } catch (error) {
    logger.error('Update settings error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Ayarlar güncellenirken hata oluştu.',
      error: error.message
    });
  }
};

// Update setting image
exports.updateSettingImage = async (req, res) => {
  try {
    const { key } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası bulunamadı.'
      });
    }

    const imageUrl = `/uploads/public/${req.file.filename}`;

    // Get old image to delete it
    const oldSetting = await SiteSetting.findOne({ where: { key } });
    if (oldSetting && oldSetting.value) {
      const oldImagePath = path.join(__dirname, '..', oldSetting.value);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }

    // Update or create setting
    await SiteSetting.upsert({
      key,
      value: imageUrl,
      type: 'image'
    });

    res.json({
      success: true,
      message: 'Resim başarıyla yüklendi!',
      imageUrl
    });
  } catch (error) {
    logger.error('Update setting image error: ' + (error.message || error));
    res.status(500).json({
      success: false,
      message: 'Resim yüklenirken hata oluştu.'
    });
  }
};

// Initialize default settings
exports.initializeDefaultSettings = async () => {
  try {
    const defaults = [
      // General
      { key: 'site_title', value: 'Kartal Metal İş', type: 'text', description: 'Site başlığı' },
      { key: 'site_description', value: 'Profesyonel kaynak, römork, vinç ve metal işçiliği hizmetleri', type: 'text', description: 'Site açıklaması' },

      // Contact
      { key: 'contact_phone', value: '+90 (0) 599 399 2999', type: 'text', description: 'İletişim telefonu' },
      { key: 'contact_email', value: 'info@kartalmetal.com', type: 'text', description: 'İletişim e-posta' },
      { key: 'contact_address', value: 'Kayseri, İncesu, Mahalle, Sokak', type: 'text', description: 'İletişim adresi' },
      { key: 'cargo_address', value: 'Kayseri, İncesu, Mahalle, Sokak', type: 'text', description: 'Kargo adresi' },

      // About
      { key: 'about_mission', value: 'Kartal Metal İş olarak, sektördeki en yüksek kalite standartlarına uygun metal işleme hizmetleri sunarak, müşteri memnuniyetini en üst düzeyde tutmayı amaçlıyoruz. Yenilikçi çözümlerimiz ve deneyimli ekibimizle, her projeye profesyonel bir yaklaşım getirerek güvenilir, hızlı ve kaliteli hizmet sağlıyoruz.', type: 'text', description: 'Misyon metni' },
      { key: 'about_vision', value: 'Metal işleme alanında öncü bir firma olarak, sürdürülebilir ve çevre dostu çözümlerle sektöre yön vermeyi hedefliyoruz. Kartal Metal İş, teknolojik gelişmeleri yakından takip ederek global standartlarda hizmet sunan bir dünya markası olma yolunda emin adımlarla ilerlemektedir.', type: 'text', description: 'Vizyon metni' },
      { key: 'about_content_1', value: 'Kartal Metal İş, yılların tecrübesi ve sektördeki uzmanlığı ile metal işleme ve üretim alanında hizmet veren öncü bir firmadır. Kaliteli malzeme kullanımı ve modern teknolojiye dayalı üretim anlayışıyla, müşterilerine en iyi çözümleri sunmayı ilke edinmiştir. Tutku ve kararlılık ile çalışan ekibimiz, projelerin her aşamasında müşterilerimizin taleplerini karşılayacak esnekliği ve profesyonelliği sergilemektedir.', type: 'text', description: 'Hakkımızda içerik 1' },
      { key: 'about_content_2', value: 'Kartal Metal İş, yalnızca ürünlerin kalitesine odaklanmakla kalmaz, aynı zamanda sürdürülebilirlik ve çevreye duyarlılık konularına da büyük önem verir. Üretim süreçlerimizde verimliliği artırmak ve atıkları minimize etmek amacıyla sürekli iyileştirme çalışmaları yürütüyoruz.', type: 'text', description: 'Hakkımızda içerik 2' },
      { key: 'about_image_1', value: '/resimler/kaynak-nedir-kaynak-cesitleri-1200x720.jpg', type: 'image', description: 'Hakkımızda resim 1' },
      { key: 'about_image_2', value: '/resimler/ERATAVINC-1.jpg', type: 'image', description: 'Hakkımızda resim 2' },

      // Working hours
      {
        key: 'working_hours', value: JSON.stringify({
          weekdays: '08:00 - 18:00',
          saturday: '09:00 - 14:00',
          sunday: 'Kapalı'
        }), type: 'json', description: 'Çalışma saatleri'
      },

      // Social media
      {
        key: 'social_media', value: JSON.stringify({
          facebook: '#',
          twitter: '#',
          instagram: '#',
          linkedin: '#'
        }), type: 'json', description: 'Sosyal medya linkleri'
      }
    ];

    for (const defaultSetting of defaults) {
      const exists = await SiteSetting.findOne({ where: { key: defaultSetting.key } });
      if (!exists) {
        await SiteSetting.create(defaultSetting);
      }
    }

    logger.info('✓ Default site settings initialized');
  } catch (error) {
    logger.error('Initialize default settings error: ' + (error.message || error));
  }
};
