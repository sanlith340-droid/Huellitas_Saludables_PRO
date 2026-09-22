'use strict';

/**
 * Migra database/data_jesus/5.INSERTAR_DISPONILBIDAD.sql
 * Agenda de ESP001, ESP002 y ESP003 del 19 al 21 de agosto de 2026,
 * en franjas de 1 hora entre las 08:00 y las 17:00.
 */
function generarFranjas() {
  const franjas = [];
  const dias = ['2026-08-19', '2026-08-20', '2026-08-21'];
  for (const fecha of dias) {
    for (let hora = 8; hora <= 17; hora++) {
      franjas.push({ fecha, hora: `${String(hora).padStart(2, '0')}:00:00` });
    }
  }
  return franjas;
}

module.exports = {
  up: async (queryInterface) => {
    const especialistas = ['ESP001', 'ESP002', 'ESP003'];
    const franjas = generarFranjas();

    const registros = especialistas.flatMap((id_usuario) =>
      franjas.map((f) => ({
        id_usuario,
        fecha: f.fecha,
        hora: f.hora,
        estado: 'disponible',
      }))
    );

    await queryInterface.bulkInsert('disponibilidad', registros);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('disponibilidad', null, {});
  },
};
