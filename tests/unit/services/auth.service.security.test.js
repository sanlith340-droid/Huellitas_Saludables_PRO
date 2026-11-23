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
  simularVerificacion: vi.fn(),
  necesitaRehash: vi.fn(),
  clasificarContrasenaGuardada: vi.fn(),
}));

vi.mock('../../../app/utils/jwt.js', () => ({
  generarToken: vi.fn(() => 'token-de-prueba'),
}));

vi.mock('../../../app/utils/logger.js', () => ({
  default: { error: vi.fn(), warn: vi.fn() },
}));

import authModel from '../../../app/models/auth.model.js';
import {
  hashContrasena,
  verificarContrasena,
  simularVerificacion,
  necesitaRehash,
  clasificarContrasenaGuardada,
} from '../../../app/utils/password.js';
import authService from '../../../app/services/auth.service.js';
import logger from '../../../app/utils/logger.js';

const HASH = `$2b$12$${'A'.repeat(53)}`;
const HASH_SCRYPT = `scrypt$16384$8$1$${'A'.repeat(24)}$${'B'.repeat(88)}`;

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
    necesitaRehash.mockReturnValue(false);
    clasificarContrasenaGuardada.mockReturnValue('bcrypt');
    simularVerificacion.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('verifica un hash bcrypt válido y no devuelve la contraseña', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH });
      verificarContrasena.mockResolvedValue(true);

      const resultado = await authService.login({
        correo: USUARIO.correo,
        contrasena: 'claveDePrueba123',
      });

      expect(verificarContrasena).toHaveBeenCalledWith('claveDePrueba123', HASH);
      expect(authModel.updatePassword).not.toHaveBeenCalled();
      expect(resultado.usuario).not.toHaveProperty('contrasena');
      expect(JSON.stringify(resultado)).not.toContain('$2b$');
    });

    it('rechaza una contraseña incorrecta', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH });
      verificarContrasena.mockResolvedValue(false);

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'incorrecta' })
      ).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    });

    it('migra un hash scrypt heredado a bcrypt después de verificarlo', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH_SCRYPT });
      verificarContrasena.mockResolvedValue(true);
      necesitaRehash.mockReturnValue(true);
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
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH_SCRYPT });
      verificarContrasena.mockResolvedValue(true);
      necesitaRehash.mockReturnValue(true);
      authModel.updatePassword.mockRejectedValue(new Error('fallo de base de datos'));

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'antigua' })
      ).resolves.toBeDefined();

      expect(logger.error).toHaveBeenCalledWith(
        { event: 'auth.password_hash_migration_failed' },
        'No se pudo migrar el hash de contraseña'
      );
      expect(JSON.stringify(logger.error.mock.calls)).not.toContain('antigua');
    });

    it('no informa una migración exitosa si updatePassword no actualiza', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH_SCRYPT });
      verificarContrasena.mockResolvedValue(true);
      necesitaRehash.mockReturnValue(true);
      authModel.updatePassword.mockResolvedValue(null);

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: 'antigua' })
      ).resolves.toBeDefined();

      expect(logger.error).toHaveBeenCalledWith(
        { event: 'auth.password_hash_migration_failed' },
        'No se pudo migrar el hash de contraseña'
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
      expect(JSON.stringify(resultado)).not.toContain('$2b$');
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

  describe('login - endurecimiento bcrypt', () => {
    it('con correo inexistente consume una verificación ficticia y responde 401', async () => {
      authModel.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ correo: 'noexiste@example.com', contrasena: 'claveDePrueba123' })
      ).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });

      expect(simularVerificacion).toHaveBeenCalledWith('claveDePrueba123');
      expect(verificarContrasena).not.toHaveBeenCalled();
    });

    it('rechaza una contraseña guardada en texto plano y no la re-hashea', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: '123456' });
      verificarContrasena.mockResolvedValue(false);
      clasificarContrasenaGuardada.mockReturnValue('texto_plano');

      await expect(
        authService.login({ correo: USUARIO.correo, contrasena: '123456' })
      ).rejects.toMatchObject({ statusCode: 401 });

      expect(authModel.updatePassword).not.toHaveBeenCalled();
      expect(hashContrasena).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        { event: 'auth.password_plaintext_pending_migration' },
        expect.any(String)
      );
      expect(JSON.stringify(logger.error.mock.calls)).not.toContain('123456');
    });

    it('no re-hashea un hash bcrypt vigente', async () => {
      authModel.findByEmail.mockResolvedValue({ ...USUARIO, contrasena: HASH });
      verificarContrasena.mockResolvedValue(true);
      necesitaRehash.mockReturnValue(false);

      await authService.login({ correo: USUARIO.correo, contrasena: 'claveDePrueba123' });

      expect(hashContrasena).not.toHaveBeenCalled();
      expect(authModel.updatePassword).not.toHaveBeenCalled();
    });
  });
});
