'use strict';

/**
 * Migra los datos de database/data_jesus/3.INSERTAR_USUARIOS.sql
 * al mundo Sequelize (seeders), conservando exactamente los mismos
 * IDs y datos de prueba.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('usuario', [
      // --- Recepcionistas ---
      { id_usuario: 'REC001', nombre: 'Laura', apellidos: 'Gomez Rodriguez', telefono: '3001112233', correo: 'laura.gomez@proyectohs.com', direccion: 'Calle 80 # 15-20', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },
      { id_usuario: 'REC002', nombre: 'Andrea', apellidos: 'Martinez Lopez', telefono: '3012223344', correo: 'andrea.martinez@proyectohs.com', direccion: 'Carrera 13 # 72-15', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },
      { id_usuario: 'REC003', nombre: 'Carlos', apellidos: 'Torres Perez', telefono: '3023334455', correo: 'carlos.torres@proyectohs.com', direccion: 'Calle 100 # 18-30', contrasena: '123456', especializacion: null, tipo: null, rol: 'recepcionista' },

      // --- Administrador ---
      { id_usuario: 'ADM001', nombre: 'Juan', apellidos: 'Rodriguez Sanchez', telefono: '3104445566', correo: 'juan.rodriguez@proyectohs.com', direccion: 'Carrera 7 # 85-20', contrasena: '123456', especializacion: null, tipo: null, rol: 'admin' },

      // --- Usuarios principales (USU001-USU007) ---
      { id_usuario: 'USU001', nombre: 'Pedro', apellidos: 'Gonzalez Ramirez', telefono: '3115556677', correo: 'pedro.gonzalez@gmail.com', direccion: 'Calle 45 # 20-10', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU002', nombre: 'Maria', apellidos: 'Lopez Hernandez', telefono: '3126667788', correo: 'maria.lopez@gmail.com', direccion: 'Carrera 30 # 45-25', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU003', nombre: 'Andres', apellidos: 'Martinez Castro', telefono: '3137778899', correo: 'andres.martinez@gmail.com', direccion: 'Calle 60 # 25-15', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU004', nombre: 'Diana', apellidos: 'Perez Moreno', telefono: '3148889900', correo: 'diana.perez@gmail.com', direccion: 'Carrera 50 # 80-20', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU005', nombre: 'Felipe', apellidos: 'Sanchez Torres', telefono: '3159990011', correo: 'felipe.sanchez@gmail.com', direccion: 'Calle 72 # 40-18', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU006', nombre: 'Natalia', apellidos: 'Ramirez Vargas', telefono: '3161112233', correo: 'natalia.ramirez@gmail.com', direccion: 'Carrera 19 # 65-30', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },
      { id_usuario: 'USU007', nombre: 'Santiago', apellidos: 'Moreno Diaz', telefono: '3172223344', correo: 'santiago.moreno@gmail.com', direccion: 'Calle 90 # 22-40', contrasena: '123456', especializacion: null, tipo: 'principal', rol: 'usuario' },

      // --- Acudientes (USU008-USU010) ---
      { id_usuario: 'USU008', nombre: 'Camila', apellidos: 'Vargas Ruiz', telefono: '3183334455', correo: 'camila.vargas@gmail.com', direccion: 'Carrera 11 # 60-25', contrasena: '123456', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
      { id_usuario: 'USU009', nombre: 'Ricardo', apellidos: 'Diaz Herrera', telefono: '3194445566', correo: 'ricardo.diaz@gmail.com', direccion: 'Calle 35 # 15-40', contrasena: '123456', especializacion: null, tipo: 'acudiente', rol: 'usuario' },
      { id_usuario: 'USU010', nombre: 'Valentina', apellidos: 'Ruiz Molina', telefono: '3205556677', correo: 'valentina.ruiz@gmail.com', direccion: 'Carrera 40 # 70-10', contrasena: '123456', especializacion: null, tipo: 'acudiente', rol: 'usuario' },

      // --- Especialistas ---
      { id_usuario: 'ESP001', nombre: 'Alejandro', apellidos: 'Castillo Moreno', telefono: '3211112233', correo: 'alejandro.castillo@proyectohs.com', direccion: 'Carrera 15 # 80-25', contrasena: '123456', especializacion: 'Medicina Veterinaria General', tipo: null, rol: 'especialista' },
      { id_usuario: 'ESP002', nombre: 'Carolina', apellidos: 'Mendez Torres', telefono: '3222223344', correo: 'carolina.mendez@proyectohs.com', direccion: 'Calle 90 # 18-35', contrasena: '123456', especializacion: 'Medicina Felina', tipo: null, rol: 'especialista' },
      { id_usuario: 'ESP003', nombre: 'Mauricio', apellidos: 'Rojas Hernandez', telefono: '3233334455', correo: 'mauricio.rojas@proyectohs.com', direccion: 'Carrera 50 # 75-40', contrasena: '123456', especializacion: 'Cirugia Veterinaria', tipo: null, rol: 'especialista' },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('usuario', null, {});
  },
};
