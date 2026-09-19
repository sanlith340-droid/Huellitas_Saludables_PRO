// tests/helpers/auth.helper.js
// Tiene funciones que se repiten en muchos tests.
//
// La más útil: getToken(rol)
//   - Hace login con un usuario del rol indicado
//   - Devuelve el token JWT para usar en los tests

const request = require('supertest');
const app = require('../../app/app');

// Aquí están los correos y contraseñas de cada rol (según los seeders)
const CREDENCIALES = {
  usuario:       { correo: 'pedro.gonzalez@gmail.com',          contrasena: '123456' },
  acudiente:     { correo: 'camila.vargas@gmail.com',           contrasena: '123456' },
  especialista:  { correo: 'alejandro.castillo@proyectohs.com', contrasena: '123456' },
  especialista2: { correo: 'carolina.mendez@proyectohs.com',    contrasena: '123456' },
  recepcionista: { correo: 'laura.gomez@proyectohs.com',        contrasena: '123456' },
  admin:         { correo: 'juan.rodriguez@proyectohs.com',     contrasena: '123456' },
};

// Hace login y devuelve el token
async function getToken(rol) {
  const cred = CREDENCIALES[rol];
  if (!cred) throw new Error(`Rol desconocido: ${rol}`);

  // Hace una petición POST a /api/auth/login
  const res = await request(app).post('/api/auth/login').send(cred);

  if (!res.body.success) {
    throw new Error(`Login falló para ${rol}: ${res.body.message}`);
  }

  // Devuelve solo el token
  return res.body.data.token;
}

module.exports = { getToken, CREDENCIALES };