'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historia_clinica', {
      id_historia_clinica: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'cita', key: 'id_cita' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      peso: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      diagnostico: { type: Sequelize.STRING(200), allowNull: false },
      tratamiento: { type: Sequelize.STRING(200), allowNull: false },
      observaciones: { type: Sequelize.STRING(500), allowNull: true },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE historia_clinica
        ADD CONSTRAINT chk_historia_peso CHECK (peso IS NULL OR peso > 0);
    `);

    // ============================================================
    // FUNCIÓN + TRIGGER (igual que 2.FUNCIONES_DISPARADORES.sql):
    // al crear una historia clínica, la cita asociada pasa a 'atendido'.
    // ============================================================
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION actualizar_cita_atendida()
      RETURNS TRIGGER
      AS $$
      BEGIN
          UPDATE cita
          SET estado = 'atendido'
          WHERE id_cita = NEW.id_cita;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_historia_cita_atendida
      AFTER INSERT ON historia_clinica
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_cita_atendida();
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_historia_cita_atendida ON historia_clinica;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS actualizar_cita_atendida;');
    await queryInterface.dropTable('historia_clinica');
  },
};
