'use strict';

/**
 * Migra database/data_jesus/6.CREAR_CITA.sql
 * Crea una cita de ejemplo para la mascota id 1 (Max), con el
 * especialista ESP001 el 2026-08-19 a las 08:00, agendada por REC001.
 *
 * Nota: como se explica en /Implementacion_ORM.md, insertar aquí
 * directamente con bulkInsert también dispara el trigger
 * trg_actualizar_disponibilidad_cita (creado en la migración de
 * `cita`), así que la disponibilidad usada queda en 'ocupado'
 * automáticamente, igual que con el script SQL original.
 */
module.exports = {
  up: async (queryInterface) => {
    const [[disponibilidad]] = await queryInterface.sequelize.query(`
      SELECT id_disponibilidad
      FROM disponibilidad
      WHERE id_usuario = 'ESP001'
        AND fecha = DATE '2026-08-19'
        AND hora = TIME '08:00:00'
        AND estado = 'disponible'
      LIMIT 1;
    `);

    if (!disponibilidad) {
      throw new Error('No se encontró la disponibilidad esperada para crear la cita de ejemplo (seeder de citas).');
    }

    await queryInterface.bulkInsert('cita', [
      {
        id_recepcionista: 'REC001',
        id_mascota: 1,
        id_disponibilidad: disponibilidad.id_disponibilidad,
        motivo: 'Consulta veterinaria general',
        estado: 'pendiente',
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('cita', null, {});
  },
};
