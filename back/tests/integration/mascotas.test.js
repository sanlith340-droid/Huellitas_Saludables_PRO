// tests/integration/mascotas.test.js
// Prueba los endpoints de mascotas.
//
// Endpoints probados:
//   - GET  /api/mascotas
//   - GET  /api/mascotas/:id
//   - POST /api/mascotas

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');
const { MASCOTAS } = require('../fixtures');

describe('Mascotas - /api/mascotas', () => {
  // Variables para guardar los tokens que usaremos
  let tokenUsuario;
  let tokenEspecialista;
  let tokenAdmin;

  beforeAll(async () => {
    await resetDatabase();                              // Limpiamos la BD
    tokenUsuario      = await getToken('usuario');      // Login como usuario
    tokenEspecialista = await getToken('especialista'); // Login como especialista
    tokenAdmin        = await getToken('admin');        // Login como admin
  });

  // ============================================================
  // LISTAR MASCOTAS - GET /api/mascotas
  // ============================================================
  describe('GET /api/mascotas', () => {

    it('usuario autenticado puede listar (200)', async () => {
      const res = await request(app)
        .get('/api/mascotas')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);    // Es un array
      expect(res.body.data.length).toBeGreaterThan(0);    // Tiene al menos 1

      // Buscamos a Max en la lista
      const max = res.body.data.find((f) => f.mascota === 'Max');
      expect(max).toBeDefined();
      expect(max.raza).toBe('Labrador Retriever');
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/mascotas');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });

  // ============================================================
  // OBTENER MASCOTA - GET /api/mascotas/:id
  // ============================================================
  describe('GET /api/mascotas/:id', () => {

    it('obtener Max (id=1) devuelve sus propietarios', async () => {
      const res = await request(app)
        .get(`/api/mascotas/${MASCOTAS.MAX.id}`)
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(200);
      expect(res.body.data.mascota).toBe('Max');
      expect(res.body.data.raza.nombre).toBe('Labrador Retriever');
      expect(res.body.data.propietarios.length).toBeGreaterThan(0);
    });

    // TEST NEGATIVO: mascota que no existe
    it('id inexistente devuelve 404', async () => {
      const res = await request(app)
        .get('/api/mascotas/99999')
        .set('Authorization', `Bearer ${tokenUsuario}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    // TEST DE FRONTERA: id no numérico
    it('id no numérico devuelve 400', async () => {
      const res = await request(app)
        .get('/api/mascotas/abc')       // "abc" no es un número
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // CREAR MASCOTA - POST /api/mascotas
  // ============================================================
  describe('POST /api/mascotas', () => {
    // Función que genera un body válido (para no repetirlo)
    const bodyValido = () => ({
      nombre: 'Firulais_' + Date.now(),
      fecha_nacimiento: '2023-05-15',
      especie: 'perro',
      genero: 'macho',
      id_raza: 1,
    });

    // TEST POSITIVO: usuario puede crear
    it('usuario puede crear una mascota (201)', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(bodyValido());

      expect(res.status).toBe(201);
      expect(res.body.data.mascota).toMatch(/^Firulais_/);
    });

    // TEST POSITIVO: admin también puede crear
    it('admin también puede crear (201)', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(bodyValido());

      expect(res.status).toBe(201);
    });

    // TEST NEGATIVO: especialista NO puede crear
    it('rol especialista NO puede crear (403)', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenEspecialista}`)
        .send(bodyValido());

      expect(res.status).toBe(403);
    });

    // TEST NEGATIVO: sin token
    it('sin token devuelve 401', async () => {
      const res = await request(app).post('/api/mascotas').send(bodyValido());
      expect(res.status).toBe(401);
    });

    // TEST PARAMETRIZADO: especies inválidas
    it.each(['conejo', 'ave', 'reptil', 'perro '])(
      'especie "%s" devuelve 400',
      async (especie) => {
        const res = await request(app)
          .post('/api/mascotas')
          .set('Authorization', `Bearer ${tokenUsuario}`)
          .send({ ...bodyValido(), especie });

        expect(res.status).toBe(400);
      }
    );

    // TEST DE FRONTERA: nombre de 200 caracteres (límite)
    it('nombre de exactamente 200 caracteres se acepta', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ ...bodyValido(), nombre: 'A'.repeat(200) });

      expect(res.status).toBe(201);
    });

    // TEST DE FRONTERA: nombre de 201 caracteres (se pasa)
    it('nombre de 201 caracteres devuelve 400', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ ...bodyValido(), nombre: 'A'.repeat(201) });

      expect(res.status).toBe(400);
    });

    // TEST NEGATIVO: raza que no existe
    it('id_raza inexistente devuelve 404', async () => {
      const res = await request(app)
        .post('/api/mascotas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ ...bodyValido(), id_raza: 99999 });

      expect(res.status).toBe(404);
    });

    // TEST PARAMETRIZADO: faltando cada campo
    it.each(['nombre', 'fecha_nacimiento', 'especie', 'genero', 'id_raza'])(
      'sin %s devuelve 400',
      async (campoFaltante) => {
        const body = bodyValido();
        delete body[campoFaltante];

        const res = await request(app)
          .post('/api/mascotas')
          .set('Authorization', `Bearer ${tokenUsuario}`)
          .send(body);

        expect(res.status).toBe(400);
      }
    );
  });
});