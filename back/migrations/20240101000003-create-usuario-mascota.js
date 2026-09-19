'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuario_mascota', {
      id_usuario: {
        type: Sequelize.STRING(10),
        allowNull: false,
        primaryKey: true,
        references: { model: 'usuario', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'mascota', key: 'id_mascota' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('usuario_mascota');
  },
};
