// tests/unit/services/auth.service.test.js
// Prueba el servicio de autenticación "por dentro" (sin HTTP).

const authService = require('../../../app/services/auth.service');
const { resetDatabase } = require('../../setup/dbHelper');   // ← AGREGAR

describe('services/auth.service', () => {

  // ANTES de todos los tests: limpiar la BD
  beforeAll(async () => {                                     // ← AGREGAR
    await resetDatabase();
  });

  // ... el resto del archivo queda igual
  describe('login', () => {
    it('con credenciales válidas devuelve usuario + token', async () => {
      const res = await authService.login({
        correo: 'pedro.gonzalez@gmail.com',
        contrasena: '123456',
      });

      expect(res.usuario.id_usuario).toBe('USU001');
      expect(res.token).toMatch(/^eyJ/);
      expect(res.usuario).not.toHaveProperty('contrasena');
    });

    it('con correo inexistente lanza error 401', async () => {
      await expect(
        authService.login({ correo: 'no@nada.com', contrasena: '123' })
      ).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    });

    it('con contraseña incorrecta lanza error 401', async () => {
      await expect(
        authService.login({ correo: 'pedro.gonzalez@gmail.com', contrasena: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('registro', () => {
    it('crea un usuario nuevo con rol usuario', async () => {
      const correo = `unit_${Date.now()}@test.com`;
      const res = await authService.registro({
        nombre: 'Test',
        apellidos: 'Unit',
        telefono: '3001234567',
        correo,
        direccion: 'Calle Test',
        contrasena: 'segura123',
      });

      expect(res.usuario.rol).toBe('usuario');
      expect(res.usuario.correo).toBe(correo);
      expect(res.token).toMatch(/^eyJ/);
    });

    it('con correo duplicado lanza error 409', async () => {
      await expect(
        authService.registro({
          nombre: 'X', apellidos: 'Y', telefono: '300',
          correo: 'pedro.gonzalez@gmail.com',
          direccion: 'X', contrasena: 'segura123',
        })
      ).rejects.toMatchObject({ statusCode: 409, code: 'CONFLICT' });
    });
  });

  describe('registroAdmin', () => {
    it('admin puede crear un especialista', async () => {
      const correo = `esp_${Date.now()}@test.com`;
      const res = await authService.registroAdmin(
        {
          nombre: 'Nuevo',
          apellidos: 'Especialista',
          telefono: '3001234567',
          correo,
          direccion: 'X',
          contrasena: 'segura123',
          especializacion: 'Medicina General',
          rol: 'especialista',
        },
        'ADM001'
      );

      expect(res.usuario.rol).toBe('especialista');
      expect(res.usuario.especializacion).toBe('Medicina General');
    });

    it('no-admin intentando crear lanza error 403', async () => {
      await expect(
        authService.registroAdmin(
          {
            nombre: 'X', apellidos: 'Y', telefono: '300',
            correo: `x_${Date.now()}@test.com`,
            direccion: 'X', contrasena: 'segura123',
            rol: 'admin',
          },
          'USU001'
        )
      ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    });
  });
});