// tests/fixtures/index.js
// Aquí guardamos datos que conocemos de la BD de prueba
// (porque vienen de los seeders).
//
// Los tests importan estos datos para no tener que escribir
// los IDs y correos a mano cada vez.

const USUARIOS = {
  USU001: { id: 'USU001', rol: 'usuario',       correo: 'pedro.gonzalez@gmail.com',          tipo: 'principal', nombre: 'Pedro' },
  USU002: { id: 'USU002', rol: 'usuario',       correo: 'maria.lopez@gmail.com',             tipo: 'principal', nombre: 'Maria' },
  USU008: { id: 'USU008', rol: 'usuario',       correo: 'camila.vargas@gmail.com',           tipo: 'acudiente', nombre: 'Camila' },
  ESP001: { id: 'ESP001', rol: 'especialista',  correo: 'alejandro.castillo@proyectohs.com', nombre: 'Alejandro' },
  ESP002: { id: 'ESP002', rol: 'especialista',  correo: 'carolina.mendez@proyectohs.com',    nombre: 'Carolina' },
  REC001: { id: 'REC001', rol: 'recepcionista', correo: 'laura.gomez@proyectohs.com',        nombre: 'Laura' },
  ADM001: { id: 'ADM001', rol: 'admin',         correo: 'juan.rodriguez@proyectohs.com',     nombre: 'Juan' },
};

const MASCOTAS = {
  MAX:   { id: 1, nombre: 'Max',   especie: 'perro', genero: 'macho',  propietarios: ['USU001', 'USU008'] },
  LUNA:  { id: 2, nombre: 'Luna',  especie: 'gato',  genero: 'hembra', propietarios: ['USU001', 'USU010'] },
  ROCKY: { id: 3, nombre: 'Rocky', especie: 'perro', genero: 'macho',  propietarios: ['USU002', 'USU008'] },
  NALA:  { id: 4, nombre: 'Nala',  especie: 'gato',  genero: 'hembra', propietarios: ['USU003', 'USU009'] },
};

const DISPONIBILIDAD = {
  OCUPADA_ID_1: { id: 1,  id_usuario: 'ESP001', fecha: '2026-08-19', hora: '08:00:00', estado: 'ocupado' },
  LIBRE_ID_2:   { id: 2,  id_usuario: 'ESP001', fecha: '2026-08-19', hora: '09:00:00', estado: 'disponible' },
  LIBRE_ID_3:   { id: 3,  id_usuario: 'ESP001', fecha: '2026-08-19', hora: '10:00:00', estado: 'disponible' },
  LIBRE_ID_31:  { id: 31, id_usuario: 'ESP002', fecha: '2026-08-19', hora: '08:00:00', estado: 'disponible' },
};

const CITA = {
  DEMO_ID_1: { id: 1, id_mascota: 1, id_disponibilidad: 1, id_recepcionista: 'REC001', estado: 'atendido' },
};

module.exports = { USUARIOS, MASCOTAS, DISPONIBILIDAD, CITA };