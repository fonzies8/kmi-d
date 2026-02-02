'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Example: create services table if not exists
        await queryInterface.createTable('services', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT },
            short_description: { type: Sequelize.STRING(500) },
            status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            icon: { type: Sequelize.STRING(100) },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('services');
    }
};
