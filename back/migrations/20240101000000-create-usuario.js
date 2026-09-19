'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuario', {
      id_usuario: {
        type: Sequelize.STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      apellidos: { type: Sequelize.STRING(150), allowNull: false },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      correo: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      direccion: { type: Sequelize.STRING(150), allowNull: false },
      contrasena: { type: Sequelize.STRING(255), allowNull: false },
      especializacion: { type: Sequelize.STRING(100), allowNull: true },
      tipo: { type: Sequelize.STRING(20), allowNull: true },
      rol: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'usuario' },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Mismos CHECK constraints que la BD original (1.CREAR_TABLAS.sql)
    await queryInterface.sequelize.query(`
      ALTER TABLE usuario
        ADD CONSTRAINT chk_usuario_rol
        CHECK (rol IN ('admin', 'recepcionista', 'especialista', 'usuario'));
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE usuario
        ADD CONSTRAINT chk_usuario_tipo
        CHECK (tipo IN ('principal', 'acudiente'));
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('usuario');
  },
};
