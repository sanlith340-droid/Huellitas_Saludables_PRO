'use strict';

/**
 * Migra database/data_jesus/4.INSERTAR_MASCOTAS.sql
 * (razas + mascotas + relación usuario_mascota).
 *
 * Como id_raza e id_mascota son autoincrementales, se insertan
 * primero las razas/mascotas y luego se consultan sus IDs por
 * nombre para poder armar las relaciones, igual que hacía el SQL
 * original con subconsultas (SELECT ... WHERE nombre = ...).
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const razas = [
      'Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés',
      'Beagle', 'Poodle', 'Chihuahua', 'Husky Siberiano', 'Persa', 'Siamés',
      'Maine Coon', 'Bengalí', 'Angora', 'British Shorthair',
    ];
    await queryInterface.bulkInsert('raza', razas.map((nombre) => ({ nombre })));

    const [razaRows] = await queryInterface.sequelize.query('SELECT id_raza, nombre FROM raza');
    const idRazaPorNombre = Object.fromEntries(razaRows.map((r) => [r.nombre, r.id_raza]));

    const mascotas = [
      { nombre: 'Max', fecha_nacimiento: '2021-03-15', especie: 'perro', genero: 'macho', raza: 'Labrador Retriever' },
      { nombre: 'Luna', fecha_nacimiento: '2022-07-10', especie: 'gato', genero: 'hembra', raza: 'Persa' },
      { nombre: 'Rocky', fecha_nacimiento: '2020-11-05', especie: 'perro', genero: 'macho', raza: 'Pastor Alemán' },
      { nombre: 'Nala', fecha_nacimiento: '2023-01-20', especie: 'gato', genero: 'hembra', raza: 'Siamés' },
      { nombre: 'Bruno', fecha_nacimiento: '2019-08-12', especie: 'perro', genero: 'macho', raza: 'Golden Retriever' },
      { nombre: 'Mia', fecha_nacimiento: '2022-05-18', especie: 'gato', genero: 'hembra', raza: 'Maine Coon' },
      { nombre: 'Toby', fecha_nacimiento: '2021-09-25', especie: 'perro', genero: 'macho', raza: 'Beagle' },
      { nombre: 'Coco', fecha_nacimiento: '2023-04-14', especie: 'gato', genero: 'hembra', raza: 'Bengalí' },
      { nombre: 'Zeus', fecha_nacimiento: '2020-02-28', especie: 'perro', genero: 'macho', raza: 'Husky Siberiano' },
      { nombre: 'Kira', fecha_nacimiento: '2022-12-03', especie: 'perro', genero: 'hembra', raza: 'Bulldog Francés' },
    ];

    await queryInterface.bulkInsert(
      'mascota',
      mascotas.map((m) => ({
        nombre: m.nombre,
        fecha_nacimiento: m.fecha_nacimiento,
        especie: m.especie,
        genero: m.genero,
        id_raza: idRazaPorNombre[m.raza],
      }))
    );

    const [mascotaRows] = await queryInterface.sequelize.query('SELECT id_mascota, nombre FROM mascota');
    const idMascotaPorNombre = Object.fromEntries(mascotaRows.map((m) => [m.nombre, m.id_mascota]));

    const relaciones = [
      { id_usuario: 'USU001', mascotas: ['Max', 'Luna'] },
      { id_usuario: 'USU002', mascotas: ['Rocky'] },
      { id_usuario: 'USU003', mascotas: ['Nala', 'Bruno'] },
      { id_usuario: 'USU004', mascotas: ['Mia'] },
      { id_usuario: 'USU005', mascotas: ['Toby', 'Coco'] },
      { id_usuario: 'USU006', mascotas: ['Zeus'] },
      { id_usuario: 'USU007', mascotas: ['Kira'] },
      // Acudientes
      { id_usuario: 'USU008', mascotas: ['Max', 'Rocky'] },
      { id_usuario: 'USU009', mascotas: ['Nala', 'Toby'] },
      { id_usuario: 'USU010', mascotas: ['Luna', 'Zeus'] },
    ];

    const usuarioMascotaRows = relaciones.flatMap((r) =>
      r.mascotas.map((nombreMascota) => ({
        id_usuario: r.id_usuario,
        id_mascota: idMascotaPorNombre[nombreMascota],
      }))
    );

    await queryInterface.bulkInsert('usuario_mascota', usuarioMascotaRows);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('usuario_mascota', null, {});
    await queryInterface.bulkDelete('mascota', null, {});
    await queryInterface.bulkDelete('raza', null, {});
  },
};
