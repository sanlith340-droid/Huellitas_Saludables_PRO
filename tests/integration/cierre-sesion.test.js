// tests/integration/cierre-sesion.test.js
// Tarea #12: cierre de sesión con invalidación real de tokens JWT.
//
// Endpoint probado:
//   - POST /api/auth/logout
// Y el efecto en el middleware identifyUser para cualquier ruta protegida
// (se usa GET /api/auth/perfil como endpoint protegido de referencia).

import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app/app.js';
import { prisma } from '../../app/config/prisma.js';
import { JWT_SECRET } from '../../app/utils/jwt.js';
import tokenRevocadoModel from '../../app/models/tokenRevocado.model.js';
import authService from '../../app/services/auth.service.js';
import logger from '../../app/utils/logger.js';
import { resetDatabase } from '../setup/dbHelper.js';
import { getToken, CREDENCIALES } from '../helpers/auth.helper.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MENSAJE_SESION_CERRADA = 'La sesión ha sido cerrada. Inicia sesión nuevamente.';

const perfil = (token) => request(app).get('/api/auth/perfil').set('Authorization', `Bearer ${token}`);
const logout = (token) => request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
const contarRevocados = (jti) => prisma.tokenRevocado.count({ where: { jti } });
const firmar = (payload, opciones = {}, secreto = JWT_SECRET) =>
  jwt.sign(payload, secreto, { algorithm: 'HS256', expiresIn: '1h', ...opciones });

describe('Cierre de sesión - POST /api/auth/logout', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // Emisión del token
  // ============================================================
  describe('JWT emitido con jti', () => {
    it('login correcto genera un JWT válido con jti UUID, id, rol, iat y exp', async () => {
      const res = await request(app).post('/api/auth/login').send(CREDENCIALES.usuario);
      expect(res.status).toBe(200);

      const payload = jwt.decode(res.body.data.token);
      expect(payload.jti).toMatch(UUID_V4);
      expect(payload.id).toBe('USU001');
      expect(payload.rol).toBe('usuario');
      expect(payload.iat).toEqual(expect.any(Number));
      expect(payload.exp).toBeGreaterThan(payload.iat);
      expect(payload).not.toHaveProperty('contrasena');
    });

    it('el token del registro público también lleva jti y funciona', async () => {
      const res = await request(app).post('/api/auth/registro').send({
        nombre: 'Sesion', apellidos: 'Prueba', telefono: '3001234567',
        correo: `sesion_${Date.now()}@test.com`, direccion: 'Calle 1', contrasena: 'segura123',
      });
      expect(res.status).toBe(201);
      expect(jwt.decode(res.body.data.token).jti).toMatch(UUID_V4);
      expect((await perfil(res.body.data.token)).status).toBe(200);
    });
  });

  // ============================================================
  // Flujo principal
  // ============================================================
  describe('flujo de revocación', () => {
    it('token válido y no revocado permite acceso', async () => {
      const token = await getToken('usuario');
      const res = await perfil(token);
      expect(res.status).toBe(200);
      expect(res.body.data.id_usuario).toBe('USU001');
    });

    it('logout correcto: responde 200 y registra solo el jti (no el JWT) como revocado', async () => {
      const token = await getToken('usuario');
      const { jti, exp } = jwt.decode(token);

      const res = await logout(token);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, message: 'Sesión cerrada correctamente', data: null });

      const registro = await prisma.tokenRevocado.findUnique({ where: { jti } });
      expect(registro).not.toBeNull();
      expect(registro.expira_en.getTime()).toBe(exp * 1000);
      expect(registro.revocado_en).toBeInstanceOf(Date);
      // El JWT completo nunca se guarda en ninguna columna.
      expect(Object.values(registro).map(String)).not.toContain(token);
    });

    it('reutilizar un token revocado devuelve 401 con el mensaje de sesión cerrada', async () => {
      const token = await getToken('usuario');
      expect((await perfil(token)).status).toBe(200);

      expect((await logout(token)).status).toBe(200);

      const res = await perfil(token);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        code: 'UNAUTHORIZED',
        message: MENSAJE_SESION_CERRADA,
      });
    });

    it('un token revocado se rechaza en cualquier endpoint protegido, no solo en perfil', async () => {
      const token = await getToken('usuario');
      await logout(token);

      const res = await request(app).get('/api/mascotas').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    });

    it('revocación repetida: no crea registros duplicados ni errores 5xx', async () => {
      const token = await getToken('usuario');
      const { jti } = jwt.decode(token);

      expect((await logout(token)).status).toBe(200);
      // El segundo intento ya usa un token revocado: el middleware lo rechaza (401), sin 5xx.
      const segundo = await logout(token);
      expect(segundo.status).toBe(401);
      expect(segundo.body.message).toBe(MENSAJE_SESION_CERRADA);

      expect(await contarRevocados(jti)).toBe(1);
    });

    it('el modelo es idempotente: revocar el mismo jti dos veces deja un único registro', async () => {
      const jti = randomUUID();
      const expiraEn = new Date(Date.now() + 3600_000);

      expect(await tokenRevocadoModel.revocar({ jti, expiraEn })).toBe(true);
      expect(await tokenRevocadoModel.revocar({ jti, expiraEn })).toBe(false);

      expect(await contarRevocados(jti)).toBe(1);
    });

    it('iniciar sesión de nuevo tras el logout entrega un token nuevo que funciona', async () => {
      const viejo = await getToken('usuario');
      await logout(viejo);

      const nuevo = await getToken('usuario');
      expect(jwt.decode(nuevo).jti).not.toBe(jwt.decode(viejo).jti);
      expect((await perfil(nuevo)).status).toBe(200);
      expect((await perfil(viejo)).status).toBe(401);
    });

    it('dos sesiones del mismo usuario: revocar una no invalida la otra', async () => {
      const sesionA = await getToken('usuario');
      const sesionB = await getToken('usuario');
      expect(jwt.decode(sesionA).jti).not.toBe(jwt.decode(sesionB).jti);

      expect((await logout(sesionA)).status).toBe(200);

      expect((await perfil(sesionA)).status).toBe(401);
      expect((await perfil(sesionB)).status).toBe(200);
    });
  });

  // ============================================================
  // Logout sin credenciales válidas
  // ============================================================
  describe('logout sin autenticación válida', () => {
    it('sin token devuelve 401 y no registra nada', async () => {
      const antes = await prisma.tokenRevocado.count();
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
      expect(await prisma.tokenRevocado.count()).toBe(antes);
    });

    it('con token mal firmado devuelve 401 y no registra nada', async () => {
      const antes = await prisma.tokenRevocado.count();
      const ajeno = firmar({ id: 'USU001', rol: 'usuario' }, { jwtid: randomUUID() }, 'otro-secreto');
      const res = await logout(ajeno);
      expect(res.status).toBe(401);
      expect(await prisma.tokenRevocado.count()).toBe(antes);
    });

    it('no se puede revocar el token de otra persona enviando su jti en el cuerpo o en headers', async () => {
      const victima = await getToken('admin');
      const atacante = await getToken('usuario');
      const { jti } = jwt.decode(victima);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${atacante}`)
        .set('x-jti', jti)
        .send({ jti });

      expect(res.status).toBe(200);
      expect(await contarRevocados(jti)).toBe(0);
      expect((await perfil(victima)).status).toBe(200);
      expect((await perfil(atacante)).status).toBe(401);
    });
  });

  // ============================================================
  // Rechazos del middleware
  // ============================================================
  describe('identifyUser - tokens que deben rechazarse', () => {
    it('petición sin token devuelve 401', async () => {
      const res = await request(app).get('/api/auth/perfil');
      expect(res.status).toBe(401);
    });

    it('token expirado devuelve 401', async () => {
      const expirado = firmar({ id: 'USU001', rol: 'usuario' }, { expiresIn: -10, jwtid: randomUUID() });
      const res = await perfil(expirado);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('token mal firmado devuelve 401', async () => {
      const ajeno = firmar({ id: 'USU001', rol: 'usuario' }, { jwtid: randomUUID() }, 'otro-secreto');
      expect((await perfil(ajeno)).status).toBe(401);
    });

    it('token sin jti devuelve 401 (contrato de seguridad)', async () => {
      const sinJti = firmar({ id: 'USU001', rol: 'usuario' });
      const res = await perfil(sinJti);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('token sin expiración devuelve 401 aunque tenga jti y firma válida', async () => {
      const sinExp = jwt.sign({ id: 'USU001', rol: 'usuario', jti: randomUUID() }, JWT_SECRET, { algorithm: 'HS256' });
      expect((await perfil(sinExp)).status).toBe(401);
    });

    it('token con jti más largo que la columna devuelve 401 (sin error de BD)', async () => {
      const jtiLargo = firmar({ id: 'USU001', rol: 'usuario' }, { jwtid: 'x'.repeat(65) });
      expect((await perfil(jtiLargo)).status).toBe(401);
    });

    it('token con algoritmo "none" devuelve 401', async () => {
      const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const sinFirma = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 'ADM001', rol: 'admin', jti: randomUUID(), exp })}.`;
      expect((await perfil(sinFirma)).status).toBe(401);
    });

    it('usuario inexistente con token bien firmado y no revocado devuelve 401', async () => {
      const fantasma = firmar({ id: 'USU999', rol: 'usuario' }, { jwtid: randomUUID() });
      const res = await perfil(fantasma);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('El usuario del token ya no existe.');
    });

    it('el rol sigue saliendo de la BD, no del payload del token', async () => {
      const escalada = firmar({ id: 'USU001', rol: 'admin' }, { jwtid: randomUUID() });
      const res = await request(app).get('/api/usuarios/personal').set('Authorization', `Bearer ${escalada}`);
      expect(res.status).toBe(403);
    });
  });

  // ============================================================
  // Fallo seguro
  // ============================================================
  describe('fallo seguro ante errores de la lista de revocación', () => {
    it('si falla la consulta de revocaciones NO se autoriza la petición (503, sin datos)', async () => {
      const token = await getToken('usuario');
      vi.spyOn(logger, 'error').mockImplementation(() => {});
      vi.spyOn(tokenRevocadoModel, 'estaRevocado').mockRejectedValueOnce(new Error('conexión perdida'));

      const res = await perfil(token);

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
      expect(res.body).not.toHaveProperty('data');
      expect(logger.error).toHaveBeenCalledWith(
        { event: 'auth.revocation_check_failed' },
        expect.any(String),
      );

      // Con la BD recuperada, el mismo token vuelve a funcionar (no se revocó por el fallo).
      expect((await perfil(token)).status).toBe(200);
    });

    it('si la revocación no se puede persistir el logout NO responde éxito', async () => {
      const token = await getToken('usuario');
      const { jti } = jwt.decode(token);
      vi.spyOn(logger, 'error').mockImplementation(() => {});
      vi.spyOn(tokenRevocadoModel, 'revocar').mockRejectedValueOnce(new Error('escritura fallida'));

      const res = await logout(token);

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.body.success).toBe(false);
      expect(await contarRevocados(jti)).toBe(0);
    });
  });

  // ============================================================
  // Regresión de autorización por roles
  // ============================================================
  describe('autorización por roles (regresión)', () => {
    it('admin con sesión vigente accede a ruta de admin; usuario recibe 403', async () => {
      const admin = await getToken('admin');
      const usuario = await getToken('usuario');

      expect((await request(app).get('/api/usuarios/personal').set('Authorization', `Bearer ${admin}`)).status).toBe(200);
      expect((await request(app).get('/api/usuarios/personal').set('Authorization', `Bearer ${usuario}`)).status).toBe(403);
    });

    it('tras cerrar sesión, el admin pierde el acceso con 401 (no 403)', async () => {
      const admin = await getToken('admin');
      await logout(admin);

      const res = await request(app).get('/api/usuarios/personal').set('Authorization', `Bearer ${admin}`);
      expect(res.status).toBe(401);
    });
  });

  // ============================================================
  // Limpieza de registros expirados
  // ============================================================
  describe('limpieza de tokens revocados expirados', () => {
    it('elimina solo los registros expirados y conserva los vigentes', async () => {
      const jtiExpirado = randomUUID();
      const jtiVigente = randomUUID();
      await prisma.tokenRevocado.createMany({
        data: [
          { jti: jtiExpirado, expira_en: new Date(Date.now() - 60_000) },
          { jti: jtiVigente, expira_en: new Date(Date.now() + 3600_000) },
        ],
      });

      const eliminados = await authService.limpiarTokensRevocadosExpirados();

      expect(eliminados).toBeGreaterThanOrEqual(1);
      expect(await contarRevocados(jtiExpirado)).toBe(0);
      expect(await contarRevocados(jtiVigente)).toBe(1);
    });

    it('un token revocado y todavía vigente sigue rechazado después de la limpieza', async () => {
      const token = await getToken('usuario');
      await logout(token);

      await authService.limpiarTokensRevocadosExpirados();

      expect((await perfil(token)).status).toBe(401);
    });
  });
});
