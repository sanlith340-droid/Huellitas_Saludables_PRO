'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disponibilidad', {
      id_disponibilidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'usuario', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      hora: { type: Sequelize.TIME, allowNull: false },
      estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'disponible' },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE disponibilidad
        ADD CONSTRAINT chk_disponibilidad_estado CHECK (estado IN ('disponible', 'ocupado'));
    `);
    await queryInterface.addConstraint('disponibilidad', {
      fields: ['id_usuario', 'fecha', 'hora'],
      type: 'unique',
      name: 'uq_disponibilidad_usuario_fecha_hora',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('disponibilidad');
  },
};
