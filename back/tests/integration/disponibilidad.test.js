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
  // FILTROS Y PAGINACIÓN - GET /api/disponibilidad (query params)
  // Estos tests solo LEEN, así que no alteran la BD compartida.
  // Datos del seeder: ESP001/ESP002/ESP003 con 10 franjas por día
  // entre 2026-08-19 y 2026-08-21 (30 franjas por especialista).
  // ============================================================
  describe('GET /api/disponibilidad - filtros y paginación', () => {
    const get = (url, token = tokenRecepcionista) =>
      request(app).get(url).set('Authorization', `Bearer ${token}`);

    it('sin page ni limit mantiene el comportamiento original (arreglo completo, sin meta)', async () => {
      const res = await get('/api/disponibilidad?estado=disponible');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeUndefined();
      // Más de 20 (el límite por defecto) => demuestra que NO se pagina
      expect(res.body.data.length).toBeGreaterThan(20);
    });

    it('con limit devuelve solo esa cantidad y trae meta de paginación', async () => {
      const res = await get('/api/disponibilidad?id_usuario=ESP001&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 5 });
      expect(res.body.meta.total).toBeGreaterThan(5);
    });

    it('fecha_desde y fecha_hasta filtran por rango (ambos extremos incluidos)', async () => {
      const res = await get('/api/disponibilidad?fecha_desde=2026-08-20&fecha_hasta=2026-08-21');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => {
        expect(d.fecha >= '2026-08-20' && d.fecha <= '2026-08-21').toBe(true);
      });
      // Debe incluir los dos extremos
      const fechas = new Set(res.body.data.map((d) => d.fecha));
      expect(fechas.has('2026-08-20')).toBe(true);
      expect(fechas.has('2026-08-21')).toBe(true);
    });

    it('solo fecha_desde funciona (sin fecha_hasta)', async () => {
      const res = await get('/api/disponibilidad?fecha_desde=2026-08-21');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => expect(d.fecha >= '2026-08-21').toBe(true));
    });

    it('solo fecha_hasta funciona (sin fecha_desde)', async () => {
      const res = await get('/api/disponibilidad?fecha_hasta=2026-08-19');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => expect(d.fecha <= '2026-08-19').toBe(true));
    });

    it('"fecha" exacta tiene prioridad sobre el rango', async () => {
      const res = await get('/api/disponibilidad?fecha=2026-08-19&fecha_desde=2026-08-21');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => expect(d.fecha).toBe('2026-08-19'));
    });

    it('fecha_hasta anterior a fecha_desde devuelve 400', async () => {
      const res = await get('/api/disponibilidad?fecha_desde=2026-08-21&fecha_hasta=2026-08-19');
      expect(res.status).toBe(400);
    });

    it.each(['0', '-1', 'abc'])('page inválido "%s" devuelve 400', async (page) => {
      const res = await get(`/api/disponibilidad?page=${page}`);
      expect(res.status).toBe(400);
    });

    it.each(['0', '101', 'abc'])('limit inválido "%s" devuelve 400', async (limit) => {
      const res = await get(`/api/disponibilidad?limit=${limit}`);
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // POR ESPECIALISTA - GET /api/disponibilidad/especialista/:id_usuario
  // ============================================================
  describe('GET /api/disponibilidad/especialista/:id_usuario', () => {
    const get = (url, token = tokenRecepcionista) =>
      request(app).get(url).set('Authorization', `Bearer ${token}`);

    it('devuelve SOLO las franjas del especialista pedido (200)', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP001');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => expect(d.id_usuario).toBe('ESP001'));
    });

    it('la ruta no es capturada por /:id (no responde 400 por id no numérico)', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP002');
      expect(res.status).toBe(200);
      res.body.data.forEach((d) => expect(d.id_usuario).toBe('ESP002'));
    });

    it('siempre pagina: aplica el límite por defecto (20) y trae los datos del especialista', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP001');

      expect(res.body.data).toHaveLength(20);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 30,
        total_paginas: 2,
        especialista: { id_usuario: 'ESP001', nombre: 'Alejandro' },
      });
    });

    it('la página 2 trae el resto y no repite franjas de la página 1', async () => {
      const p1 = await get('/api/disponibilidad/especialista/ESP001?limit=20&page=1');
      const p2 = await get('/api/disponibilidad/especialista/ESP001?limit=20&page=2');

      expect(p2.status).toBe(200);
      expect(p2.body.data).toHaveLength(10); // 30 - 20
      const ids1 = new Set(p1.body.data.map((d) => d.id_disponibilidad));
      p2.body.data.forEach((d) => expect(ids1.has(d.id_disponibilidad)).toBe(false));
    });

    it('una página fuera de rango devuelve lista vacía (200), no error', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP001?page=99');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(30);
    });

    it('viene ordenado por fecha y luego por hora', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP001?limit=100');

      const claves = res.body.data.map((d) => `${d.fecha} ${d.hora}`);
      expect(claves).toEqual([...claves].sort());
    });

    it('filtra por estado y el resumen ignora ese filtro (para mostrar contadores)', async () => {
      const todas = await get('/api/disponibilidad/especialista/ESP001');
      const soloOcupadas = await get('/api/disponibilidad/especialista/ESP001?estado=ocupado');

      expect(soloOcupadas.status).toBe(200);
      expect(soloOcupadas.body.data.length).toBeGreaterThan(0); // la franja 1 está ocupada
      soloOcupadas.body.data.forEach((d) => expect(d.estado).toBe('ocupado'));

      // El resumen es el mismo con o sin filtro de estado...
      expect(soloOcupadas.body.meta.resumen).toEqual(todas.body.meta.resumen);
      // ...y suma el total de franjas del especialista.
      const { disponible, ocupado } = todas.body.meta.resumen;
      expect(disponible + ocupado).toBe(30);
      // El total paginado sí respeta el filtro de estado.
      expect(soloOcupadas.body.meta.total).toBe(ocupado);
    });

    it('combina especialista + rango de fechas', async () => {
      const res = await get(
        '/api/disponibilidad/especialista/ESP001?fecha_desde=2026-08-20&fecha_hasta=2026-08-20'
      );

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(10);
      res.body.data.forEach((d) => {
        expect(d.id_usuario).toBe('ESP001');
        expect(d.fecha).toBe('2026-08-20');
      });
    });

    it('un id inexistente devuelve 404', async () => {
      const res = await get('/api/disponibilidad/especialista/NOEXISTE');
      expect(res.status).toBe(404);
    });

    it('un usuario que NO es especialista devuelve 404', async () => {
      const res = await get('/api/disponibilidad/especialista/USU001');
      expect(res.status).toBe(404);
    });

    it('id_usuario de más de 10 caracteres devuelve 400', async () => {
      const res = await get(`/api/disponibilidad/especialista/${'A'.repeat(11)}`);
      expect(res.status).toBe(400);
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/disponibilidad/especialista/ESP001');
      expect(res.status).toBe(401);
    });

    it('cualquier usuario autenticado puede consultarla (200)', async () => {
      const res = await get('/api/disponibilidad/especialista/ESP001', tokenUsuario);
      expect(res.status).toBe(200);
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