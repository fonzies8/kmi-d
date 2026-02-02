const { User } = require('../models');
const logger = require('../utils/logger');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'email']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profil alınırken hata oluştu.'
        });
    }
};

// Update user profile (email only)
exports.updateProfile = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresi gereklidir.'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            where: { email: email.trim(), id: { [require('sequelize').Op.ne]: req.session.userId } }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılmaktadır.'
            });
        }

        const user = await User.findByPk(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        user.email = email.trim();
        await user.save();

        res.json({
            success: true,
            message: 'Profil başarıyla güncellendi!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profil güncellenirken hata oluştu.'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre ve yeni şifre gereklidir.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter uzunluğunda olmalıdır.'
            });
        }

        const user = await User.findByPk(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
        }

        // Verify current password
        const isValidPassword = await user.validatePassword(currentPassword);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre hatalı.'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi!'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre değiştirilirken hata oluştu.'
        });
    }
};
