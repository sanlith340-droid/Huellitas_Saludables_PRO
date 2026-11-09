import { vi } from 'vitest';

vi.mock('../../../app/models/auth.model.js', () => ({
  default: {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  existsByEmail: vi.fn(),
  generarIdUsuario: vi.fn(),
  create: vi.fn(),
  updatePassword: vi.fn(),
  },
}));

vi.mock('../../../app/utils/password.js', () => ({
  hashContrasena: vi.fn(),
  verificarContrasena: vi.fn(),
  esHashScrypt: vi.fn(),
}));

vi.mock('../../../app/utils/jwt.js', () => ({
  generarToken: vi.fn(() => 'token-de-prueba'),
}));

import authModel from '../../../app/models/auth.model.js';
import { hashContrasena, verificarContrasena, esHashScrypt } from '../../../app/utils/password.js';
import authService from '../../../app/services/auth.service.js';

const HASH = `scrypt$16384$8$1$${'A'.repeat(24)}$${'B'.repeat(88)}`;

const USUARIO = {
  id_usuario: 'USU001',
  nombre: 'Usuario',
  apellidos: 'Prueba',
  telefono: '3000000000',
  correo: 'usuario@example.com',
  direccion: 'Direccion',
  rol: 'usuario',
  tipo: 'principal',
};

describe('services/auth.service - seguridad de contraseñas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashContrasena.mockResolvedValue(HASH);
    esHashScrypt.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('verifica un hash scrypt válido y no devuelve la contraseña', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH });
      verificarContrasena.mockResolvedValue(true);

      const resultado = await authService.login({
        correo: USUARIO.correo,
        contrasena: 'claveDePrueba123',
      });

      expect(verificarContrasena).toHaveBeenCalledWith('claveDePrueba123', HASH);
      expect(authModel.updatePassword).not.toHaveBeenCalled();
      expect(resultado.usuario).not.toHaveProperty('contrasena');
      expect(JSON.stringify(resultado)).not.toContain('scrypt$');
    });

    it('rechaza una contraseña incorrecta', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH });
      verificarContrasena.mockResolvedValue(false);

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'incorrecta' })
      ).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    });

    it('migra una contraseña antigua después de verificarla', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: 'antigua' });
      verificarContrasena.mockResolvedValue(true);
      esHashScrypt.mockReturnValue(false);
      authModel.updatePassword.mockResolvedValue({ id_usuario: USUARIO.id_usuario });

      const resultado = await authService.login({
        correo: USUARIO.correo,
        contrasena: 'antigua',
      });

      expect(hashContrasena).toHaveBeenCalledWith('antigua');
      expect(authModel.updatePassword).toHaveBeenCalledWith(USUARIO.id_usuario, HASH);
      expect(resultado.usuario).not.toHaveProperty('contrasena');
    });

    it('permite el login aunque falle la actualización del hash', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: 'antigua' });
      verificarContrasena.mockResolvedValue(true);
      esHashScrypt.mockReturnValue(false);
      authModel.updatePassword.mockRejectedValue(new Error('fallo de base de datos'));

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'antigua' })
      ).resolves.toBeDefined();

      expect(errorSpy).toHaveBeenCalledWith(
        '[auth.service] No se pudo migrar la contraseña a hash'
      );
      expect(errorSpy.mock.calls.flat().join(' ')).not.toContain('antigua');
    });

    it('no informa una migración exitosa si updatePassword no actualiza', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: 'antigua' });
      verificarContrasena.mockResolvedValue(true);
      esHashScrypt.mockReturnValue(false);
      authModel.updatePassword.mockResolvedValue(null);

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'antigua' })
      ).resolves.toBeDefined();

      expect(errorSpy).toHaveBeenCalledWith(
        '[auth.service] No se pudo migrar la contraseña a hash'
      );
    });
  });

  describe('registro', () => {
    it('guarda un hash y no la contraseña original', async () => {
      authModel.existsByEmail.mockResolvedValue(false);
      authModel.generarIdUsuario.mockResolvedValue('USU100');
      authModel.create.mockImplementation(async (datos) => ({ ...datos }));

      const resultado = await authService.registro({
        nombre: 'Nuevo',
        apellidos: 'Usuario',
        telefono: '3000000000',
        correo: 'nuevo@example.com',
        direccion: 'Direccion',
        contrasena: 'claveDePrueba123',
        tipo: 'principal',
      });

      expect(hashContrasena).toHaveBeenCalledWith('claveDePrueba123');
      expect(authModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ contrasena: HASH })
      );
      expect(resultado.usuario).not.toHaveProperty('contrasena');
      expect(JSON.stringify(resultado)).not.toContain('scrypt$');
    });
  });

  describe('registroAdmin', () => {
    it('guarda un hash al crear una cuenta administrativa', async () => {
      authModel.findById.mockResolvedValue({ id_usuario: 'ADM001', rol: 'admin' });
      authModel.existsByEmail.mockResolvedValue(false);
      authModel.generarIdUsuario.mockResolvedValue('ESP100');
      authModel.create.mockImplementation(async (datos) => ({ ...datos }));

      const resultado = await authService.registroAdmin(
        {
          nombre: 'Nuevo',
          apellidos: 'Especialista',
          telefono: '3000000000',
          correo: 'especialista@example.com',
          direccion: 'Direccion',
          contrasena: 'claveDePrueba123',
          especializacion: 'Medicina General',
          rol: 'especialista',
        },
        'ADM001'
      );

      expect(hashContrasena).toHaveBeenCalledWith('claveDePrueba123');
      expect(authModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ contrasena: HASH })
      );
      expect(resultado.usuario).not.toHaveProperty('contrasena');
    });
  });
});
