'use strict';

/**
 * Antes: cita.id_disponibilidad era UNIQUE para siempre. Si una cita se
 * cancelaba y el horario volvía a quedar 'disponible', nadie podía
 * reservarlo de nuevo (violación de unicidad contra la cita cancelada).
 *
 * Ahora: solo puede haber UNA cita NO cancelada por horario. Las citas
 * canceladas conservan su historial sin bloquear el horario.
 */
module.exports = {
  up: async (queryInterface) => {
    // El nombre depende de cómo se creó la tabla: migración (cita_id_disponibilidad_key)
    // o script database/1.CREAR_TABLAS.sql (uq_cita_disponibilidad).
    await queryInterface.sequelize.query(
      'ALTER TABLE cita DROP CONSTRAINT IF EXISTS cita_id_disponibilidad_key;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE cita DROP CONSTRAINT IF EXISTS uq_cita_disponibilidad;'
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_cita_disponibilidad_activa
      ON cita (id_disponibilidad)
      WHERE estado <> 'cancelado';
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS uq_cita_disponibilidad_activa;');
    // Solo se puede restaurar el UNIQUE si ningún horario tiene más de una cita
    // (p. ej. una cancelada y otra activa). Si las hay, se conservan los datos
    // y se avisa, en vez de fallar o borrar historial.
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM cita GROUP BY id_disponibilidad HAVING COUNT(*) > 1) THEN
          RAISE NOTICE 'No se restauró UNIQUE(id_disponibilidad): hay horarios con más de una cita (citas canceladas).';
        ELSE
          ALTER TABLE cita ADD CONSTRAINT cita_id_disponibilidad_key UNIQUE (id_disponibilidad);
        END IF;
      END $$;
    `);
  },
};
