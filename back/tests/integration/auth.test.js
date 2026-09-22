// tests/integration/auth.test.js
// Prueba los endpoints de autenticación.
//
// Endpoints probados:
//   - POST /api/auth/login
//   - GET  /api/auth/perfil
//   - POST /api/auth/registro

const request = require('supertest');
const app = require('../../app/app');
const { resetDatabase } = require('../setup/dbHelper');

describe('Auth - /api/auth', () => {

  // ANTES de todos los tests de este archivo: limpiamos la BD.
  beforeAll(async () => {
    await resetDatabase();
  });

  // ============================================================
  // LOGIN - POST /api/auth/login
  // ============================================================
  describe('POST /api/auth/login', () => {

    // TEST POSITIVO: login correcto
    it('login con credenciales válidas devuelve 200 + token', async () => {
      // 1. Hacemos la petición de login
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: '123456' });

      // 2. Verificamos que la respuesta sea correcta
      expect(res.status).toBe(200);                          // Código HTTP 200
      expect(res.body.success).toBe(true);                   // success: true
      expect(res.body.data.token).toMatch(/^eyJ/);          // El token empieza con "eyJ"
      expect(res.body.data.usuario.id_usuario).toBe('USU001');
      expect(res.body.data.usuario).not.toHaveProperty('contrasena');  // NO devuelve la contraseña
    });

    // TEST NEGATIVO: correo que no existe
    it('login con correo inexistente devuelve 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'noexiste@nada.com', contrasena: '123456' });

      expect(res.status).toBe(401);                          // Código HTTP 401
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    // TEST NEGATIVO: contraseña incorrecta
    it('login con contraseña incorrecta devuelve 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: 'wrong' });

      expect(res.status).toBe(401);
    });

    // TEST DE FRONTERA: sin correo (falta campo obligatorio)
    it('sin correo devuelve 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ contrasena: '123456' });

      expect(res.status).toBe(400);
    });

    // TEST DE FRONTERA: correo con formato inválido
    it('correo con formato inválido devuelve 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'no-es-un-email', contrasena: '123456' });

      expect(res.status).toBe(400);
    });

    // TEST DE FRONTERA: contraseña muy corta
    it('contraseña de 3 caracteres devuelve 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: '123' });

      expect(res.status).toBe(400);
    });

    // TEST PARAMETRIZADO: probamos los 4 roles con el mismo test
    it.each([
      ['usuario',       'pedro.gonzalez@gmail.com',          'USU001'],
      ['especialista',  'alejandro.castillo@proyectohs.com', 'ESP001'],
      ['recepcionista', 'laura.gomez@proyectohs.com',        'REC001'],
      ['admin',         'juan.rodriguez@proyectohs.com',     'ADM001'],
    ])('login como %s devuelve 200 y rol correcto', async (rol, correo, idEsperado) => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo, contrasena: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data.usuario.id_usuario).toBe(idEsperado);
      expect(res.body.data.usuario.rol).toBe(rol);
    });
  });

  // ============================================================
  // PERFIL - GET /api/auth/perfil
  // ============================================================
  describe('GET /api/auth/perfil', () => {
    let token;

    // Antes de estos tests, hacemos login para tener un token
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: '123456' });
      token = res.body.data.token;
    });

    // TEST POSITIVO: con token válido
    it('con token válido devuelve el perfil', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`);   // Enviamos el token

      expect(res.status).toBe(200);
      expect(res.body.data.id_usuario).toBe('USU001');
      expect(res.body.data).not.toHaveProperty('contrasena');
    });

    // TEST NEGATIVO: sin token
    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/auth/perfil');
      expect(res.status).toBe(401);
    });

    // TEST NEGATIVO: token inválido
    it('con token inválido devuelve 401', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token_falso_123');
      expect(res.status).toBe(401);
    });

    // TEST NEGATIVO: header mal formado
    it('con header sin "Bearer" devuelve 401', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', token);   // Falta "Bearer "
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // REGISTRO - POST /api/auth/registro
  // ============================================================
  describe('POST /api/auth/registro', () => {

    // TEST POSITIVO: registrar un usuario nuevo
    it('registra un usuario nuevo y devuelve 201 + JWT', async () => {
      // Usamos Date.now() para generar un correo único cada vez
      const correo = `nuevo_${Date.now()}@test.com`;

      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'Nuevo',
          apellidos: 'Usuario',
          telefono: '3001234567',
          correo,
          direccion: 'Calle Test 123',
          contrasena: 'segura123',
          tipo: 'principal',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.usuario.rol).toBe('usuario');
      expect(res.body.data.token).toMatch(/^eyJ/);
    });

    // TEST NEGATIVO: correo ya registrado
    it('correo ya registrado devuelve 409', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'X', apellidos: 'Y', telefono: '3001234567',
          correo: 'pedro.gonzalez@gmail.com',   // Ya existe
          direccion: 'Calle X', contrasena: 'segura123',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT');
    });

    // TEST DE FRONTERA: nombre de exactamente 100 caracteres (el límite)
    it('nombre de exactamente 100 caracteres se acepta', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'A'.repeat(100),   // 100 caracteres exactos
          apellidos: 'B'.repeat(150),
          telefono: '3001234567',
          correo: `limite_${Date.now()}@test.com`,
          direccion: 'X', contrasena: 'segura123',
        });

      expect(res.status).toBe(201);
    });

    // TEST DE FRONTERA: nombre de 101 caracteres (uno más del límite)
    it('nombre de 101 caracteres devuelve 400', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          nombre: 'A'.repeat(101),   // 101 caracteres, se pasa
          apellidos: 'B', telefono: '3001234567',
          correo: `excede_${Date.now()}@test.com`,
          direccion: 'X', contrasena: 'segura123',
        });

      expect(res.status).toBe(400);
    });

    // TEST PARAMETRIZADO: probamos faltando cada campo obligatorio
    it.each(['nombre', 'apellidos', 'telefono', 'correo', 'direccion', 'contrasena'])(
      'sin %s devuelve 400',
      async (campoFaltante) => {
        // Creamos un body completo
        const body = {
          nombre: 'A', apellidos: 'B', telefono: '3001234567',
          correo: `faltante_${Date.now()}@test.com`,
          direccion: 'X', contrasena: 'segura123',
        };
        // Le quitamos el campo que queremos probar
        delete body[campoFaltante];

        const res = await request(app).post('/api/auth/registro').send(body);
        expect(res.status).toBe(400);
      }
    );
  });
});