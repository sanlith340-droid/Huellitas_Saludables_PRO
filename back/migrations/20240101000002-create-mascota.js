'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mascota', {
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: { type: Sequelize.STRING(200), allowNull: false },
      fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: false },
      especie: { type: Sequelize.STRING(50), allowNull: false },
      genero: { type: Sequelize.STRING(20), allowNull: false },
      id_raza: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'raza', key: 'id_raza' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE mascota
        ADD CONSTRAINT chk_mascota_especie CHECK (especie IN ('perro', 'gato'));
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE mascota
        ADD CONSTRAINT chk_mascota_genero CHECK (genero IN ('macho', 'hembra'));
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mascota');
  },
};
