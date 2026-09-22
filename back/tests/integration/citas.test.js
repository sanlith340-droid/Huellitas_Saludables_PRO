// tests/integration/citas.test.js
// Prueba los endpoints de citas.
//
// NOTA IMPORTANTE:
//   Los tests comparten la misma BD entre sí.
//   Cuando un test crea una cita, la disponibilidad usada queda 'ocupada'.
//   Por eso cada test usa un ID de disponibilidad DIFERENTE.
//
// Endpoints probados:
//   - GET   /api/citas
//   - GET   /api/citas/:id
//   - POST  /api/citas
//   - PATCH /api/citas/:id/cancelar

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');
const { MASCOTAS } = require('../fixtures');

describe('Citas - /api/citas', () => {
  let tokenUsuario, tokenEspecialista, tokenRecepcionista, tokenAdmin;

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario       = await getToken('usuario');
    tokenEspecialista  = await getToken('especialista');
    tokenRecepcionista = await getToken('recepcionista');
    tokenAdmin         = await getToken('admin');
  });

  // ============================================================
  // LISTAR CITAS - GET /api/citas
  // ============================================================
  describe('GET /api/citas', () => {

    it('usuario autenticado lista citas (200)', async () => {
      const res = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('filtro por estado funciona', async () => {
      const res = await request(app)
        .get('/api/citas?estado=pendiente')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((c) => expect(c.estado).toBe('pendiente'));
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/citas');
      expect(res.status).toBe(401);
    });

    it('estado inválido devuelve 400', async () => {
      const res = await request(app)
        .get('/api/citas?estado=inventado')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // OBTENER CITA - GET /api/citas/:id
  // ============================================================
  describe('GET /api/citas/:id', () => {

    it('cita existente devuelve 200', async () => {
      const res = await request(app)
        .get('/api/citas/1')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id_cita).toBe(1);
    });

    it('cita inexistente devuelve 404', async () => {
      const res = await request(app)
        .get('/api/citas/99999')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(404);
    });
  });

  // ============================================================
  // CREAR CITA - POST /api/citas
  // ============================================================
  describe('POST /api/citas', () => {

    it('usuario crea cita para su propia mascota (201)', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 2,
          motivo: 'Consulta general',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.estado).toBe('pendiente');
      expect(res.body.data.id_mascota).toBe(MASCOTAS.MAX.id);
    });

    it('recepcionista puede crear cita (201)', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          id_mascota: MASCOTAS.LUNA.id,
          id_disponibilidad: 3,
          motivo: 'Control',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id_recepcionista).toBe('REC001');
    });

    it('especialista NO puede crear cita (403)', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 31,
          motivo: 'X',
        });

      expect(res.status).toBe(403);
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).post('/api/citas').send({
        id_mascota: 1, id_disponibilidad: 5, motivo: 'X',
      });
      expect(res.status).toBe(401);
    });

    it('usuario intentando usar mascota ajena devuelve 403', async () => {
      const tokenMaria = (await request(app).post('/api/auth/login')
        .send({ correo: 'maria.lopez@gmail.com', contrasena: '123456' })).body.data.token;

      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 5,
          motivo: 'No debería funcionar',
        });

      expect(res.status).toBe(403);
    });

    it('disponibilidad ya ocupada devuelve 409', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 1,     // ID 1 = ocupada por el seeder
          motivo: 'X',
        });

      expect(res.status).toBe(409);
    });

    it('disponibilidad inexistente devuelve 404', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 99999,
          motivo: 'X',
        });

      expect(res.status).toBe(404);
    });

    it('motivo de exactamente 200 caracteres se acepta', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 6,
          motivo: 'A'.repeat(200),
        });

      expect(res.status).toBe(201);
    });

    it('motivo de 201 caracteres devuelve 400', async () => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 7,
          motivo: 'A'.repeat(201),
        });

      expect(res.status).toBe(400);
    });

    it.each([0, -1, 'abc'])('id_mascota inválido (%s) devuelve 400', async (id) => {
      const res = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ id_mascota: id, id_disponibilidad: 10, motivo: 'X' });

      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // CANCELAR CITA - PATCH /api/citas/:id/cancelar
  // ============================================================
  describe('PATCH /api/citas/:id/cancelar', () => {

    it('usuario puede cancelar su propia cita', async () => {
      // Crear una cita con disponibilidad ID 8 (libre)
      const creacion = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 8,
          motivo: 'Para cancelar',
        });

      const idCita = creacion.body.data.id_cita;

      const res = await request(app)
        .patch(`/api/citas/${idCita}/cancelar`)
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('cancelado');
    });

    it('cancelar cita ya cancelada devuelve 409', async () => {
      // Crear una cita con disponibilidad ID 9 (libre)
      const creacion = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 9,
          motivo: 'Doble cancelación',
        });
      const idCita = creacion.body.data.id_cita;

      // Primera cancelación
      await request(app)
        .patch(`/api/citas/${idCita}/cancelar`)
        .set('Authorization', `Bearer ${tokenUsuario}`);

      // Segunda cancelación (debe fallar)
      const res = await request(app)
        .patch(`/api/citas/${idCita}/cancelar`)
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(409);
    });
  });
});