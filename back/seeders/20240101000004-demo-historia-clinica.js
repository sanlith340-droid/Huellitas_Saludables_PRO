'use strict';

/**
 * Migra database/data_jesus/7.HISTORIA_CLINICA.sql
 * Crea la historia clínica de la cita de ejemplo (id_cita = 1).
 * Insertarla dispara trg_historia_cita_atendida, que marca la cita
 * como 'atendido' automáticamente.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('historia_clinica', [
      {
        id_cita: 1,
        peso: 18.5,
        diagnostico: 'Otitis externa leve',
        tratamiento: 'Limpieza del conducto auditivo y tratamiento con gotas óticas durante 7 días',
        observaciones: 'La mascota presenta inflamación leve. Se recomienda control veterinario en 10 días.',
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('historia_clinica', null, {});
  },
};
