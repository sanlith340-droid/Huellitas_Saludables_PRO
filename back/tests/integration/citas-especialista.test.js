// tests/integration/citas-especialista.test.js
// Pantalla "Mis citas" del especialista:
//   - GET   /api/citas/especialista/:id   (con filtros estado / fecha / rango)
//   - PATCH /api/citas/:id/estado         (atendido | cancelado + liberar horario)

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');
const { MASCOTAS } = require('../fixtures');

describe('Citas del especialista', () => {
  let tokenUsuario, tokenEsp1, tokenEsp2, tokenRecepcionista, tokenAdmin;

  const crearCita = async (id_disponibilidad, motivo = 'Consulta') => {
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ id_mascota: MASCOTAS.MAX.id, id_disponibilidad, motivo });
    expect(res.status).toBe(201);
    return res.body.data.id_cita;
  };

  const estadoHorario = async (id) => {
    const res = await request(app)
      .get(`/api/disponibilidad/${id}`)
      .set('Authorization', `Bearer ${tokenUsuario}`);
    return res.body.data.estado;
  };

  const cambiarEstado = (id_cita, body, token = tokenEsp1) =>
    request(app)
      .patch(`/api/citas/${id_cita}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario = await getToken('usuario');
    tokenEsp1 = await getToken('especialista');
    tokenEsp2 = await getToken('especialista2');
    tokenRecepcionista = await getToken('recepcionista');
    tokenAdmin = await getToken('admin');
  });

  describe('GET /api/citas/especialista/:id (filtros)', () => {
    it('lista las citas del especialista con mascota, dueño, fecha y hora', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001')
        .set('Authorization', `Bearer ${tokenEsp1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const cita = res.body.data[0];
      expect(cita).toHaveProperty('fecha_cita');
      expect(cita).toHaveProperty('hora_cita');
      expect(cita).toHaveProperty('propietario_nombre');
      expect(cita.id_especialista).toBe('ESP001');
    });

    it('filtra por estado', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001?estado=atendido')
        .set('Authorization', `Bearer ${tokenEsp1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((c) => c.estado === 'atendido')).toBe(true);
    });

    it('filtra por fecha exacta y por rango', async () => {
      const exacta = await request(app)
        .get('/api/citas/especialista/ESP001?fecha=2026-08-19')
        .set('Authorization', `Bearer ${tokenEsp1}`);
      expect(exacta.status).toBe(200);
      expect(exacta.body.data.every((c) => String(c.fecha_cita).slice(0, 10) === '2026-08-19')).toBe(true);

      const vacio = await request(app)
        .get('/api/citas/especialista/ESP001?fecha_desde=2030-01-01&fecha_hasta=2030-12-31')
        .set('Authorization', `Bearer ${tokenEsp1}`);
      expect(vacio.status).toBe(200);
      expect(vacio.body.data).toHaveLength(0);
    });

    it('rechaza una fecha con formato inválido (400)', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001?fecha=19-08-2026')
        .set('Authorization', `Bearer ${tokenEsp1}`);
      expect(res.status).toBe(400);
    });

    it('un especialista NO puede ver las citas de otro (403)', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001')
        .set('Authorization', `Bearer ${tokenEsp2}`);
      expect(res.status).toBe(403);
    });

    it('un usuario común NO puede consultar citas de especialistas (403)', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(403);
    });

    it('recepcionista sí puede (200)', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP001')
        .set('Authorization', `Bearer ${tokenRecepcionista}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/citas/:id/estado', () => {
    it('marca la cita como atendida y el horario sigue ocupado', async () => {
      const id = await crearCita(2);
      const res = await cambiarEstado(id, { estado: 'atendido' });

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('atendido');
      expect(await estadoHorario(2)).toBe('ocupado');
    });

    it('cancela y por defecto deja el horario disponible', async () => {
      const id = await crearCita(3);
      const res = await cambiarEstado(id, { estado: 'cancelado' });

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('cancelado');
      expect(await estadoHorario(3)).toBe('disponible');
    });

    it('un horario liberado se puede volver a reservar', async () => {
      const id = await crearCita(4);
      await cambiarEstado(id, { estado: 'cancelado' });

      const nueva = await request(app)
        .post('/api/citas')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ id_mascota: MASCOTAS.MAX.id, id_disponibilidad: 4, motivo: 'Reagendada' });

      expect(nueva.status).toBe(201);
      expect(await estadoHorario(4)).toBe('ocupado');
    });

    it('cancela SIN liberar el horario (liberar_horario=false)', async () => {
      const id = await crearCita(5);
      const res = await cambiarEstado(id, { estado: 'cancelado', liberar_horario: false });

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('cancelado');
      expect(await estadoHorario(5)).toBe('ocupado');
    });

    it('no permite modificar una cita ya atendida (409)', async () => {
      const id = await crearCita(6);
      await cambiarEstado(id, { estado: 'atendido' });
      const res = await cambiarEstado(id, { estado: 'cancelado' });
      expect(res.status).toBe(409);
    });

    it('no permite modificar una cita ya cancelada (409)', async () => {
      const id = await crearCita(7);
      await cambiarEstado(id, { estado: 'cancelado' });
      const res = await cambiarEstado(id, { estado: 'atendido' });
      expect(res.status).toBe(409);
    });

    it('un especialista NO puede decidir sobre citas de otro (403)', async () => {
      const id = await crearCita(8);
      const res = await cambiarEstado(id, { estado: 'atendido' }, tokenEsp2);
      expect(res.status).toBe(403);
    });

    it('un usuario NO puede usar este endpoint (403)', async () => {
      const id = await crearCita(9);
      const res = await cambiarEstado(id, { estado: 'atendido' }, tokenUsuario);
      expect(res.status).toBe(403);
    });

    it('estado inválido devuelve 400', async () => {
      const id = await crearCita(10);
      const res = await cambiarEstado(id, { estado: 'confirmado' });
      expect(res.status).toBe(400);
    });

    it('cita inexistente devuelve 404', async () => {
      const res = await cambiarEstado(99999, { estado: 'atendido' });
      expect(res.status).toBe(404);
    });
  });

  describe('Administrador (pantalla "Citas de la clínica")', () => {
    it('GET /api/citas trae especialista y dueño de cada cita', async () => {
      const res = await request(app)
        .get('/api/citas')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const cita = res.body.data[0];
      expect(cita).toHaveProperty('id_especialista');
      expect(cita).toHaveProperty('especialista_nombre');
      expect(cita).toHaveProperty('propietario_nombre');
    });

    it('puede ver las citas de cualquier especialista (200)', async () => {
      const res = await request(app)
        .get('/api/citas/especialista/ESP002')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
    });

    it('puede marcar atendida una cita de cualquier especialista', async () => {
      const id = await crearCita(11);
      const res = await cambiarEstado(id, { estado: 'atendido' }, tokenAdmin);
      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('atendido');
    });

    it('puede cancelar y dejar el horario disponible', async () => {
      const id = await crearCita(12);
      const res = await cambiarEstado(id, { estado: 'cancelado' }, tokenAdmin);
      expect(res.status).toBe(200);
      expect(await estadoHorario(12)).toBe('disponible');
    });

    it('la recepcionista NO puede decidir sobre citas (403)', async () => {
      const id = await crearCita(13);
      const res = await cambiarEstado(id, { estado: 'atendido' }, tokenRecepcionista);
      expect(res.status).toBe(403);
    });
  });
});
