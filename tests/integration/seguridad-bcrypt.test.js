// tests/integration/seguridad-bcrypt.test.js
// Pruebas de extremo a extremo de la protección de contraseñas con bcrypt:
// registro, login, almacenamiento, respuestas de la API y migración.
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app/app.js';
import { prisma } from '../../app/config/prisma.js';
import { getToken } from '../helpers/auth.helper.js';
import { resetDatabase } from '../setup/dbHelper.js';
import { migrarContrasenas } from '../../app/services/migracionContrasenas.service.js';

const FORMATO_BCRYPT_12 = /^\$2b\$12\$[./A-Za-z0-9]{53}$/;

function hashScryptHeredado(contrasena) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(contrasena, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');
}

async function contrasenaGuardada(correo) {
  const fila = await prisma.usuario.findUnique({ where: { correo }, select: { contrasena: true } });
  return fila?.contrasena;
}

function crearUsuarioDirecto(id_usuario, correo, contrasena) {
  return prisma.usuario.create({
    data: {
      id_usuario, correo, contrasena,
      nombre: 'Heredado', apellidos: 'Prueba', telefono: '3000000000',
      direccion: 'Calle 1', tipo: 'principal', rol: 'usuario',
    },
  });
}

describe('Seguridad bcrypt - contraseñas', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('la semilla guarda todas las contraseñas como bcrypt de 12 rondas (ninguna en texto plano)', async () => {
    const usuarios = await prisma.usuario.findMany({ select: { contrasena: true } });
    expect(usuarios.length).toBeGreaterThan(0);
    for (const { contrasena } of usuarios) {
      expect(contrasena).toMatch(FORMATO_BCRYPT_12);
      expect(contrasena).not.toBe('123456');
    }
  });

  it('registro guarda solo el hash bcrypt y la respuesta no expone contraseña ni hash', async () => {
    const correo = `bcrypt_${Date.now()}@test.com`;
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Bcrypt', apellidos: 'Prueba', telefono: '3001234567',
      correo, direccion: 'Calle 10', contrasena: 'MiClaveSegura9',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.usuario).not.toHaveProperty('contrasena');
    expect(JSON.stringify(res.body)).not.toMatch(/MiClaveSegura9|\$2[aby]\$/);

    const guardada = await contrasenaGuardada(correo);
    expect(guardada).toMatch(FORMATO_BCRYPT_12);
    expect(guardada).not.toContain('MiClaveSegura9');
    await expect(bcrypt.compare('MiClaveSegura9', guardada)).resolves.toBe(true);

    const login = await request(app).post('/api/auth/login').send({ correo, contrasena: 'MiClaveSegura9' });
    expect(login.status).toBe(200);
    expect(login.body.data.token).toMatch(/^eyJ/);
    expect(JSON.stringify(login.body)).not.toMatch(/\$2[aby]\$/);

    const incorrecta = await request(app).post('/api/auth/login').send({ correo, contrasena: 'MiClaveSegura8' });
    expect(incorrecta.status).toBe(401);
  });

  it('registro rechaza contraseñas de más de 72 bytes (límite de bcrypt)', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Larga', apellidos: 'Prueba', telefono: '3001234567',
      correo: `larga_${Date.now()}@test.com`, direccion: 'Calle 10', contrasena: 'a'.repeat(73),
    });
    expect(res.status).toBe(400);
  });

  it('registro-admin también guarda un hash bcrypt', async () => {
    const tokenAdmin = await getToken('admin');
    const correo = `esp_bcrypt_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/registro-admin')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Esp', apellidos: 'Bcrypt', telefono: '3001234567', correo,
        direccion: 'Calle 20', contrasena: 'ClaveEspecialista1', rol: 'especialista',
        especializacion: 'Dermatología',
      });

    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/ClaveEspecialista1|\$2[aby]\$/);
    expect(await contrasenaGuardada(correo)).toMatch(FORMATO_BCRYPT_12);
  });

  it('perfil y listados de usuarios no exponen hashes', async () => {
    const tokenAdmin = await getToken('admin');
    for (const ruta of ['/api/auth/perfil', '/api/usuarios/personal', '/api/usuarios/especialistas', '/api/usuarios/USU001']) {
      const res = await request(app).get(ruta).set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/contrasena|\$2[aby]\$/);
    }
  });

  it('un hash scrypt heredado permite iniciar sesión y se migra a bcrypt', async () => {
    const correo = 'heredado.scrypt@test.com';
    await crearUsuarioDirecto('USU901', correo, hashScryptHeredado('ClaveVieja1'));

    const res = await request(app).post('/api/auth/login').send({ correo, contrasena: 'ClaveVieja1' });
    expect(res.status).toBe(200);

    const guardada = await contrasenaGuardada(correo);
    expect(guardada).toMatch(FORMATO_BCRYPT_12);
    await expect(bcrypt.compare('ClaveVieja1', guardada)).resolves.toBe(true);

    const otraVez = await request(app).post('/api/auth/login').send({ correo, contrasena: 'ClaveVieja1' });
    expect(otraVez.status).toBe(200);
    const mal = await request(app).post('/api/auth/login').send({ correo, contrasena: 'ClaveVieja2' });
    expect(mal.status).toBe(401);
  });

  it('una contraseña en texto plano ya no sirve para entrar hasta ejecutar la migración', async () => {
    const correo = 'heredado.plano@test.com';
    await crearUsuarioDirecto('USU902', correo, 'ClavePlana7');

    const antes = await request(app).post('/api/auth/login').send({ correo, contrasena: 'ClavePlana7' });
    expect(antes.status).toBe(401);

    const resumen = await migrarContrasenas({ aplicar: true });
    expect(resumen.migradas).toBe(1);
    expect(resumen.requieren_restablecimiento).toEqual([]);

    const guardada = await contrasenaGuardada(correo);
    expect(guardada).toMatch(FORMATO_BCRYPT_12);

    const despues = await request(app).post('/api/auth/login').send({ correo, contrasena: 'ClavePlana7' });
    expect(despues.status).toBe(200);

    const verificacion = await migrarContrasenas();
    expect(verificacion.texto_plano).toBe(0);
  });
});
