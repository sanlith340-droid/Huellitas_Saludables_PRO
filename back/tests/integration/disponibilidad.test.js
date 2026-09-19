// tests/integration/disponibilidad.test.js
// Prueba los endpoints de disponibilidad.
//
// NOTA IMPORTANTE:
//   Los tests dentro de este archivo comparten la misma BD.
//   Si un test modifica una disponibilidad (la pone 'ocupado'),
//   el siguiente test verá ese cambio.
//
//   Por eso cada test usa una disponibilidad DIFERENTE.

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');

describe('Disponibilidad - /api/disponibilidad', () => {
  let tokenUsuario, tokenEspecialista, tokenRecepcionista, tokenAdmin;

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario       = await getToken('usuario');
    tokenEspecialista  = await getToken('especialista');
    tokenRecepcionista = await getToken('recepcionista');
    tokenAdmin         = await getToken('admin');
  });

  // ============================================================
  // LISTAR DISPONIBILIDAD - GET /api/disponibilidad
  // ============================================================
  describe('GET /api/disponibilidad', () => {

    it('usuario autenticado lista (200)', async () => {
      const res = await request(app)
        .get('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('filtro por id_usuario funciona', async () => {
      const res = await request(app)
        .get('/api/disponibilidad?id_usuario=ESP001')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((d) => expect(d.id_usuario).toBe('ESP001'));
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/disponibilidad');
      expect(res.status).toBe(401);
    });

    it('estado inválido devuelve 400', async () => {
      const res = await request(app)
        .get('/api/disponibilidad?estado=inventado')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // OBTENER DISPONIBILIDAD - GET /api/disponibilidad/:id
  // ============================================================
  describe('GET /api/disponibilidad/:id', () => {

    it('devuelve una disponibilidad existente (200)', async () => {
      // La disponibilidad ID 2 existe en el seeder y está libre
      const res = await request(app)
        .get('/api/disponibilidad/2')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id_disponibilidad).toBe(2);
    });

    it('id inexistente devuelve 404', async () => {
      const res = await request(app)
        .get('/api/disponibilidad/99999')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(404);
    });
  });

  // ============================================================
  // CREAR DISPONIBILIDAD - POST /api/disponibilidad
  // ============================================================
  describe('POST /api/disponibilidad', () => {
    // Cada test usa una fecha/hora distinta para no pisarse
    const bodyValido = (hora = '14:00:00') => ({
      id_usuario: 'ESP001',
      fecha: '2026-09-15',
      hora,
      estado: 'disponible',
    });

    it('recepcionista puede crear (201)', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send(bodyValido('14:00:00'));

      expect(res.status).toBe(201);
      expect(res.body.data.estado).toBe('disponible');
    });

    it('admin puede crear (201)', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(bodyValido('15:00:00'));

      expect(res.status).toBe(201);
    });

    it.each(['usuario', 'especialista'])(
      'rol %s no puede crear (403)',
      async (rol) => {
        const token = await getToken(rol);
        const res = await request(app)
          .post('/api/disponibilidad')
          .set('Authorization', `Bearer ${token}`)
          .send(bodyValido('16:00:00'));

        expect(res.status).toBe(403);
      }
    );

    it('sin token devuelve 401', async () => {
      const res = await request(app).post('/api/disponibilidad').send(bodyValido('17:00:00'));
      expect(res.status).toBe(401);
    });

    it('id_usuario que no es especialista devuelve 400', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({ ...bodyValido('18:00:00'), id_usuario: 'USU001' });

      expect(res.status).toBe(400);
    });

    // Este test usa el horario del seeder (2026-08-19 08:00), que YA EXISTE
    it('mismo especialista + fecha + hora devuelve 409', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          id_usuario: 'ESP001',
          fecha: '2026-08-19',
          hora: '08:00:00',
        });

      expect(res.status).toBe(409);
    });

    it.each(['25:00:00', '08:60:00', '8:00', 'abc', ''])(
      'hora inválida "%s" devuelve 400',
      async (hora) => {
        const res = await request(app)
          .post('/api/disponibilidad')
          .set('Authorization', `Bearer ${tokenRecepcionista}`)
          .send({ ...bodyValido('10:00:00'), hora });

        expect(res.status).toBe(400);
      }
    );

    it('fecha con formato inválido devuelve 400', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({ ...bodyValido('10:00:00'), fecha: 'no-es-fecha' });

      expect(res.status).toBe(400);
    });

    it('id_usuario > 10 chars devuelve 400', async () => {
      const res = await request(app)
        .post('/api/disponibilidad')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({ ...bodyValido('10:00:00'), id_usuario: 'A'.repeat(11) });

      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // ACTUALIZAR DISPONIBILIDAD - PUT /api/disponibilidad/:id
  // ============================================================
  describe('PUT /api/disponibilidad/:id', () => {

    it('recepcionista actualiza una disponibilidad libre (200)', async () => {
      // Usamos la ID 4 (libre en el seeder, ningún otro test la usa)
      const res = await request(app)
        .put('/api/disponibilidad/4')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({ estado: 'ocupado' });

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('ocupado');
    });

    it('intentar modificar fecha de una ocupada devuelve 409', async () => {
      // La ID 1 está ocupada por el seeder de cita
      const res = await request(app)
        .put('/api/disponibilidad/1')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({ fecha: '2027-01-01' });

      expect(res.status).toBe(409);
    });

    it('body vacío devuelve 400', async () => {
      // Usamos la ID 5 (libre)
      const res = await request(app)
        .put('/api/disponibilidad/5')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // ELIMINAR DISPONIBILIDAD - DELETE /api/disponibilidad/:id
  // ============================================================
  describe('DELETE /api/disponibilidad/:id', () => {

    it('recepcionista elimina una disponibilidad libre (200)', async () => {
      // Usamos la ID 6 (libre, ningún otro test la usa)
      const res = await request(app)
        .delete('/api/disponibilidad/6')
        .set('Authorization', `Bearer ${tokenRecepcionista}`);

      expect(res.status).toBe(200);
    });

    it('eliminar una ocupada devuelve 409', async () => {
      const res = await request(app)
        .delete('/api/disponibilidad/1')
        .set('Authorization', `Bearer ${tokenRecepcionista}`);

      expect(res.status).toBe(409);
    });

    it('id inexistente devuelve 404', async () => {
      const res = await request(app)
        .delete('/api/disponibilidad/99999')
        .set('Authorization', `Bearer ${tokenRecepcionista}`);
      expect(res.status).toBe(404);
    });
  });
});