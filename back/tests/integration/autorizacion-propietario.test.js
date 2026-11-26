// tests/integration/autorizacion-propietario.test.js
// Verifica que las consultas GET respeten la pertenencia del recurso:
//   - un dueño solo ve SUS mascotas y citas;
//   - un especialista solo ve SUS citas;
//   - recepción y admin ven todo.
// Las ajenas responden 404 genérico (no revelan que existen).

import request from 'supertest';
import app from '../../app/app.js';
import { getToken } from '../helpers/auth.helper.js';
import { resetDatabase } from '../setup/dbHelper.js';
import { MASCOTAS } from '../fixtures/index.js';

describe('Autorización por propietario en GET', () => {
  let tokenPedro;       // USU001: dueño de Max y Luna, NO de Rocky
  let tokenCamila;      // USU008: otro dueño (no es dueña de Max ni Rocky)
  let tokenEsp1;        // ESP001
  let tokenEsp2;        // ESP002
  let tokenRecepcion;
  let tokenAdmin;
  let idCitaRocky;

  const get = (url, token) => request(app).get(url).set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    await resetDatabase();
    tokenPedro = await getToken('usuario');
    tokenCamila = await getToken('acudiente');
    tokenEsp1 = await getToken('especialista');
    tokenEsp2 = await getToken('especialista2');
    tokenRecepcion = await getToken('recepcionista');
    tokenAdmin = await getToken('admin');

    // Cita de Rocky (de USU002/USU008) en una franja libre de ESP002 (id 31)
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokenRecepcion}`)
      .send({ id_mascota: MASCOTAS.ROCKY.id, id_disponibilidad: 31, motivo: 'Control' });
    expect(res.status).toBe(201);
    idCitaRocky = res.body.data.id_cita;
  });

  describe('GET /api/mascotas/:id', () => {
    it('el dueño consulta su propia mascota (200)', async () => {
      const res = await get(`/api/mascotas/${MASCOTAS.MAX.id}`, tokenPedro);
      expect(res.status).toBe(200);
    });

    it('un dueño NO puede ver una mascota ajena (404 genérico)', async () => {
      const res = await get(`/api/mascotas/${MASCOTAS.ROCKY.id}`, tokenPedro);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('otro dueño (Camila) tampoco ve a Max, que es de Pedro (404)', async () => {
      const res = await get(`/api/mascotas/${MASCOTAS.MAX.id}`, tokenCamila);
      expect(res.status).toBe(404);
    });

    it('especialista, recepción y admin consultan cualquier mascota (200)', async () => {
      for (const t of [tokenEsp1, tokenRecepcion, tokenAdmin]) {
        const res = await get(`/api/mascotas/${MASCOTAS.ROCKY.id}`, t);
        expect(res.status).toBe(200);
      }
    });
  });

  describe('GET /api/citas/:id', () => {
    it('el dueño NO puede ver la cita de una mascota ajena (404)', async () => {
      const res = await get(`/api/citas/${idCitaRocky}`, tokenPedro);
      expect(res.status).toBe(404);
    });

    it('otro dueño (Camila) tampoco ve la cita 1, que es de Max (404)', async () => {
      const res = await get('/api/citas/1', tokenCamila);
      expect(res.status).toBe(404);
    });

    it('el dueño sí ve la cita de su mascota (200)', async () => {
      const res = await get('/api/citas/1', tokenPedro);
      expect(res.status).toBe(200);
    });

    it('un especialista NO puede ver la cita de otro especialista (404)', async () => {
      const res = await get('/api/citas/1', tokenEsp2);
      expect(res.status).toBe(404);
    });

    it('el especialista dueño de la agenda sí la ve (200)', async () => {
      const res = await get('/api/citas/1', tokenEsp1);
      expect(res.status).toBe(200);
    });

    it('recepción y admin ven cualquier cita (200)', async () => {
      for (const t of [tokenRecepcion, tokenAdmin]) {
        const res = await get(`/api/citas/${idCitaRocky}`, t);
        expect(res.status).toBe(200);
      }
    });
  });

  describe('GET /api/citas (listado)', () => {
    it('el dueño solo recibe citas de sus mascotas', async () => {
      const res = await get('/api/citas', tokenPedro);
      expect(res.status).toBe(200);
      expect(res.body.data.some((c) => c.id_cita === idCitaRocky)).toBe(false);
      expect(res.body.data.every((c) => [MASCOTAS.MAX.id, MASCOTAS.LUNA.id].includes(c.id_mascota))).toBe(true);
    });

    it('el especialista solo recibe sus propias citas', async () => {
      const res = await get('/api/citas', tokenEsp1);
      expect(res.status).toBe(200);
      expect(res.body.data.every((c) => c.id_especialista === 'ESP001')).toBe(true);
      expect(res.body.data.some((c) => c.id_cita === idCitaRocky)).toBe(false);
    });

    it('admin y recepción ven toda la agenda, incluida la cita de Rocky', async () => {
      for (const t of [tokenAdmin, tokenRecepcion]) {
        const res = await get('/api/citas', t);
        expect(res.status).toBe(200);
        expect(res.body.data.some((c) => c.id_cita === idCitaRocky)).toBe(true);
      }
    });

    it('un dueño no puede filtrar por la mascota de otro (lista vacía)', async () => {
      const res = await get(`/api/citas?id_mascota=${MASCOTAS.ROCKY.id}`, tokenPedro);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
