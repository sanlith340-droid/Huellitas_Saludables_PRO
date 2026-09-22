'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cita', {
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_recepcionista: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: { model: 'usuario', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'mascota', key: 'id_mascota' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      id_disponibilidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'disponibilidad', key: 'id_disponibilidad' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      motivo: { type: Sequelize.STRING(200), allowNull: false },
      estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pendiente' },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE cita
        ADD CONSTRAINT chk_cita_estado
        CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'atendido'));
    `);

    // ============================================================
    // FUNCIÓN + TRIGGER (igual que 2.FUNCIONES_DISPARADORES.sql):
    // al insertar una cita, la disponibilidad usada pasa a 'ocupado'.
    // El modelo Sequelize (cita.model.js) también lo hace de forma
    // explícita dentro de la transacción, así que esto es una
    // salvaguarda a nivel de base de datos, igual que en el diseño
    // original.
    // ============================================================
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION actualizar_disponibilidad_cita()
      RETURNS TRIGGER
      AS $$
      BEGIN
          UPDATE disponibilidad
          SET estado = 'ocupado'
          WHERE id_disponibilidad = NEW.id_disponibilidad;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_actualizar_disponibilidad_cita
      AFTER INSERT ON cita
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_disponibilidad_cita();
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_actualizar_disponibilidad_cita ON cita;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS actualizar_disponibilidad_cita;');
    await queryInterface.dropTable('cita');
  },
};
