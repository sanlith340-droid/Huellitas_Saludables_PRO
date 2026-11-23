// tests/integration/seguridad-sql-injection.test.js
// Pruebas controladas de SQL Injection contra la API y las consultas crudas.
// Las entradas maliciosas deben tratarse solo como datos: sin saltar el login,
// sin ampliar filtros y sin alterar la base de datos.
import request from 'supertest';
import app from '../../app/app.js';
import { prisma } from '../../app/config/prisma.js';
import citaModel from '../../app/models/cita.model.js';
import historiaModel from '../../app/models/historia.model.js';
import { getToken } from '../helpers/auth.helper.js';
import { resetDatabase } from '../setup/dbHelper.js';

const ATAQUES = ["' OR 1=1 --", "' OR '1'='1", "admin' --"];
const ATAQUES_LARGOS = ["' OR 1=1 --", "' OR '1'='1"]; // superan VARCHAR(10)
// Sin espacios y de hasta 10 caracteres: pasan la validación de formato y
// llegan a la consulta, donde deben tratarse como texto literal.
const ATAQUES_CORTOS = ["'OR'1'='1", "'OR/**/1=1", "admin'--"];

describe('Seguridad SQL Injection', () => {
  let tokenUsuario;
  let tokenEspecialista;
  let totalUsuarios;
  let totalDisponibilidad;

  beforeAll(async () => {
    await resetDatabase();
    tokenUsuario = await getToken('usuario');
    tokenEspecialista = await getToken('especialista');
    totalUsuarios = await prisma.usuario.count();
    totalDisponibilidad = await prisma.disponibilidad.count();
  });

  describe('login', () => {
    it.each(ATAQUES)('correo malicioso %s no inicia sesión', async (ataque) => {
      const res = await request(app).post('/api/auth/login').send({ correo: ataque, contrasena: '123456' });
      expect([400, 401]).toContain(res.status);
      expect(res.body.data?.token).toBeUndefined();
    });

    it('correo con comentario SQL en formato válido no omite la contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: "juan.rodriguez@proyectohs.com'--", contrasena: 'x1234' });
      expect([400, 401]).toContain(res.status);
      expect(res.body.data?.token).toBeUndefined();
    });

    it.each(ATAQUES_CORTOS)('contraseña maliciosa %s con correo real devuelve 401', async (ataque) => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'juan.rodriguez@proyectohs.com', contrasena: ataque });
      expect(res.status).toBe(401);
      expect(res.body.data?.token).toBeUndefined();
    });
  });

  describe('disponibilidad', () => {
    it('el filtro legítimo sigue funcionando', async () => {
      const res = await request(app)
        .get('/api/disponibilidad?id_usuario=ESP001')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((d) => expect(d.id_usuario).toBe('ESP001'));
    });

    it.each([...ATAQUES_CORTOS, "admin' --"])('id_usuario=%s se trata como dato y no devuelve registros', async (ataque) => {
      const res = await request(app)
        .get('/api/disponibilidad')
        .query({ id_usuario: ataque })
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it.each(ATAQUES_LARGOS)('id_usuario=%s (más largo que el campo) se rechaza con 400', async (ataque) => {
      const res = await request(app)
        .get('/api/disponibilidad')
        .query({ id_usuario: ataque })
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });

    it.each(ATAQUES)('estado=%s no pasa la lista blanca (400)', async (ataque) => {
      const res = await request(app)
        .get('/api/disponibilidad')
        .query({ estado: ataque })
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });

    it('operadores inyectados como objeto (?id_usuario[not]=x) se rechazan con 400', async () => {
      const res = await request(app)
        .get('/api/disponibilidad?id_usuario[not]=x')
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });

    it.each(ATAQUES_CORTOS)('especialista %s no existe (404) en lugar de listar todo', async (ataque) => {
      const res = await request(app)
        .get(`/api/disponibilidad/especialista/${encodeURIComponent(ataque)}`)
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(404);
    });

    it.each(['1 OR 1=1', "1' OR '1'='1", '1; DROP TABLE disponibilidad'])('GET /disponibilidad/%s devuelve 400', async (ataque) => {
      const res = await request(app)
        .get(`/api/disponibilidad/${encodeURIComponent(ataque)}`)
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });
  });

  describe('otros módulos', () => {
    it.each(['1 OR 1=1', "' OR 1=1 --"])('GET /citas/%s devuelve 400', async (ataque) => {
      const res = await request(app)
        .get(`/api/citas/${encodeURIComponent(ataque)}`)
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(400);
    });

    it.each(ATAQUES_CORTOS)('GET /usuarios/%s no encuentra usuarios (404)', async (ataque) => {
      const res = await request(app)
        .get(`/api/usuarios/${encodeURIComponent(ataque)}`)
        .set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(404);
    });

    it.each(['1 OR 1=1', "' OR 1=1 --"])('historia por mascota/cita con %s devuelve 400', async (ataque) => {
      for (const ruta of ['mascota', 'cita']) {
        const res = await request(app)
          .get(`/api/historia/${ruta}/${encodeURIComponent(ataque)}`)
          .set('Authorization', `Bearer ${tokenEspecialista}`);
        expect(res.status).toBe(400);
      }
    });
  });

  describe('consultas SQL crudas ($queryRaw)', () => {
    it.each(['1 OR 1=1', "1' OR '1'='1", '1; DROP TABLE cita'])('crear cita con id_disponibilidad=%s se rechaza antes de consultar', async (ataque) => {
      await expect(citaModel.crearConTransaccion({
        id_mascota: 1, id_disponibilidad: ataque, id_recepcionista: 'REC001', motivo: 'x',
      })).rejects.toMatchObject({ statusCode: 400 });
    });

    it('cancelar cita con id malicioso se rechaza (400)', async () => {
      await expect(citaModel.cancelarConTransaccion("1 OR 1=1")).rejects.toMatchObject({ statusCode: 400 });
    });

    it('historia clínica con id_cita malicioso se rechaza (400)', async () => {
      await expect(historiaModel.crearConTransaccion({
        id_cita: "1' OR '1'='1", diagnostico: 'x', tratamiento: 'y', especialistaId: 'ESP001',
      })).rejects.toMatchObject({ statusCode: 400 });
    });

    it('cancelación automática rechaza un LIMIT o fecha maliciosos', async () => {
      await expect(citaModel.cancelarVencidasAutomaticamente({ limite: '1; DROP TABLE cita' })).rejects.toThrow(TypeError);
      await expect(citaModel.cancelarVencidasAutomaticamente({ ahora: "now'); DROP TABLE cita; --" })).rejects.toThrow(TypeError);
      await expect(citaModel.cancelarVencidasAutomaticamente({ limite: 5 })).resolves.toEqual(expect.any(Number));
    });

    it('un texto malicioso en una plantilla $queryRaw se compara como dato literal', async () => {
      const filas = await prisma.$queryRaw`SELECT id_usuario FROM usuario WHERE correo = ${"' OR 1=1 --"}`;
      expect(filas).toEqual([]);
    });
  });

  it('la base de datos queda intacta después de todos los intentos', async () => {
    await expect(prisma.usuario.count()).resolves.toBe(totalUsuarios);
    await expect(prisma.disponibilidad.count()).resolves.toBe(totalDisponibilidad);
    await expect(prisma.cita.count()).resolves.toEqual(expect.any(Number));
  });
});
