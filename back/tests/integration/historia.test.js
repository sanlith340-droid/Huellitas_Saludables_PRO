// tests/integration/historia.test.js
// Prueba los endpoints de historia clínica.
//
// IMPORTANTE: Aquí se prueba que el TRIGGER funciona.
// Cuando se crea una historia, la cita pasa a "atendido" automáticamente.
//
// Endpoints probados:
//   - GET /api/historia
//   - POST /api/historia
//   - PUT /api/historia/:id
//   - GET /api/historia/cita/:id_cita

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');
const { MASCOTAS, DISPONIBILIDAD } = require('../fixtures');

describe('Historia Clínica - /api/historia', () => {
  let tokenUsuario, tokenEspecialista, tokenEspecialista2, tokenAdmin;

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario       = await getToken('usuario');
    tokenEspecialista  = await getToken('especialista');   // ESP001
    tokenEspecialista2 = await getToken('especialista2');  // ESP002
    tokenAdmin         = await getToken('admin');
  });

  // ============================================================
  // LISTAR HISTORIAS - GET /api/historia
  // ============================================================
  describe('GET /api/historia', () => {

    it('especialista lista historias (200)', async () => {
      const res = await request(app)
        .get('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // TEST PARAMETRIZADO: otros roles NO pueden listar
    it.each(['usuario', 'admin'])(
      'rol %s NO puede listar (403)',
      async (rol) => {
        const token = await getToken(rol);
        const res = await request(app)
          .get('/api/historia')
          .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
      }
    );

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/historia');
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // CREAR HISTORIA - POST /api/historia
  // ============================================================
  describe('POST /api/historia', () => {

    // TEST POSITIVO + TEST DEL TRIGGER
    it('especialista asignado crea historia para su cita (201)', async () => {
      // 1. Primero creamos una cita con ESP001
      const cita = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: DISPONIBILIDAD.LIBRE_ID_2.id,
          motivo: 'Consulta con ESP001',
        });

      // 2. Luego creamos la historia clínica
      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({
          id_cita: cita.body.data.id_cita,
          peso: 18.5,
          diagnostico: 'Otitis externa leve',
          tratamiento: 'Gotas óticas 7 días',
          observaciones: 'Control en 10 días',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.diagnostico).toBe('Otitis externa leve');

      // 3. VERIFICAMOS EL TRIGGER:
      //    La cita debe haber pasado a "atendido" automáticamente
      const citaDespues = await request(app)
        .get(`/api/citas/${cita.body.data.id_cita}`)
        .set('Authorization', `Bearer ${tokenEspecialista}`);

      expect(citaDespues.body.data.estado).toBe('atendido');
    });

    // TEST NEGATIVO: especialista que NO es el asignado
    it('especialista que no es el asignado devuelve 403', async () => {
      // La cita es con ESP001 (disponibilidad LIBRE_ID_3 es de ESP001)
      const cita = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: DISPONIBILIDAD.LIBRE_ID_3.id,
          motivo: 'Cita con ESP001',
        });

      // Pero intenta crear la historia ESP002
      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista2}`)
        .send({
          id_cita: cita.body.data.id_cita,
          diagnostico: 'X', tratamiento: 'Y',
        });

      expect(res.status).toBe(403);
    });

    // TEST NEGATIVO: usuario NO puede crear
    it('usuario NO puede crear (403)', async () => {
      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ id_cita: 1, diagnostico: 'X', tratamiento: 'Y' });
      expect(res.status).toBe(403);
    });

    // TEST NEGATIVO: cita no existe
    it('cita inexistente devuelve 404', async () => {
      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({ id_cita: 99999, diagnostico: 'X', tratamiento: 'Y' });
      expect(res.status).toBe(404);
    });

    // TEST NEGATIVO: cita ya tiene historia
    it('cita que ya tiene historia devuelve 409', async () => {
      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({ id_cita: 1, diagnostico: 'X', tratamiento: 'Y' });
      expect(res.status).toBe(409);
    });

    // TEST DE FRONTERA: diagnostico de 200 caracteres
    it('diagnostico de 200 caracteres se acepta', async () => {
      const cita = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.LUNA.id,
          id_disponibilidad: 31,
          motivo: 'X',
        });

      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista2}`)
        .send({
          id_cita: cita.body.data.id_cita,
          diagnostico: 'D'.repeat(200),
          tratamiento: 'T'.repeat(200),
        });

      expect(res.status).toBe(201);
    });

    // TEST DE FRONTERA: diagnostico de 201 caracteres
    it('diagnostico de 201 caracteres devuelve 400', async () => {
      const cita = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.LUNA.id,
          id_disponibilidad: 32,
          motivo: 'X',
        });

      const res = await request(app)
        .post('/api/historia')
        .set('Authorization', `Bearer ${tokenEspecialista2}`)
        .send({
          id_cita: cita.body.data.id_cita,
          diagnostico: 'D'.repeat(201),
          tratamiento: 'Y',
        });

      expect(res.status).toBe(400);
    });

    // TEST PARAMETRIZADO: pesos inválidos
    it.each([0, -1, 1000, 999.995])(
      'peso inválido (%s) devuelve 400',
      async (peso) => {
        const res = await request(app)
          .post('/api/historia')
          .set('Authorization', `Bearer ${tokenEspecialista}`)
          .send({ id_cita: 99999, peso, diagnostico: 'X', tratamiento: 'Y' });
        expect(res.status).toBe(400);
      }
    );
  });

  // ============================================================
  // ACTUALIZAR HISTORIA - PUT /api/historia/:id
  // ============================================================
  describe('PUT /api/historia/:id', () => {

    it('especialista dueño actualiza (200)', async () => {
      const res = await request(app)
        .put('/api/historia/1')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({ diagnostico: 'Otitis externa moderada' });

      expect(res.status).toBe(200);
      expect(res.body.data.diagnostico).toBe('Otitis externa moderada');
    });

    // TEST NEGATIVO: otro especialista no puede
    it('otro especialista NO puede actualizar (403)', async () => {
      const res = await request(app)
        .put('/api/historia/1')
        .set('Authorization', `Bearer ${tokenEspecialista2}`)
        .send({ diagnostico: 'X' });
      expect(res.status).toBe(403);
    });

    // TEST DE FRONTERA: body vacío
    it('body vacío devuelve 400', async () => {
      const res = await request(app)
        .put('/api/historia/1')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // OBTENER HISTORIA POR CITA - GET /api/historia/cita/:id_cita
  // ============================================================
  describe('GET /api/historia/cita/:id_cita', () => {

    it('devuelve la historia de la cita 1', async () => {
      const res = await request(app)
        .get('/api/historia/cita/1')
        .set('Authorization', `Bearer ${tokenEspecialista}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id_cita).toBe(1);
    });

    it('cita sin historia devuelve 404', async () => {
      const cita = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({
          id_mascota: MASCOTAS.MAX.id,
          id_disponibilidad: 4,
          motivo: 'X',
        });

      const res = await request(app)
        .get(`/api/historia/cita/${cita.body.data.id_cita}`)
        .set('Authorization', `Bearer ${tokenEspecialista}`);
      expect(res.status).toBe(404);
    });
  });
});