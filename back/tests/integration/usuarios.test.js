// tests/integration/usuarios.test.js
// Prueba los endpoints de usuarios.
//
// Endpoints probados:
//   - GET /api/usuarios/especialistas
//   - GET /api/usuarios/:documento

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');

describe('Usuarios - /api/usuarios', () => {
  let tokenUsuario;

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario = await getToken('usuario');
  });

  // ============================================================
  // LISTAR ESPECIALISTAS - GET /api/usuarios/especialistas
  // ============================================================
  describe('GET /api/usuarios/especialistas', () => {

    it('devuelve la lista de especialistas (200)', async () => {
      const res = await request(app)
        .get('/api/usuarios/especialistas')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);   // Hay 3 especialistas en el seeder
      // Verifica que TODOS tengan rol "especialista"
      res.body.data.forEach((e) => expect(e.rol).toBe('especialista'));
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/usuarios/especialistas');
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // OBTENER POR DOCUMENTO - GET /api/usuarios/:documento
  // ============================================================
  describe('GET /api/usuarios/:documento', () => {

    it('usuario existente devuelve 200 sin contraseña', async () => {
      const res = await request(app)
        .get('/api/usuarios/USU001')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id_usuario).toBe('USU001');
      // La respuesta NO debe incluir la contraseña
      expect(res.body.data).not.toHaveProperty('contrasena');
    });

    it('usuario inexistente devuelve 404', async () => {
      const res = await request(app)
        .get('/api/usuarios/NOEXISTE')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(404);
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/usuarios/USU001');
      expect(res.status).toBe(401);
    });
  });
});