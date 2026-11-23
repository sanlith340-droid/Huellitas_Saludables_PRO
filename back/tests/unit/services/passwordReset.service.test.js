import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: { $transaction: vi.fn(), passwordResetToken: { updateMany: vi.fn() } },
  authModel: { findByEmail: vi.fn() },
  tokenModel: { invalidatePrevious: vi.fn(), create: vi.fn(), findUsableByHash: vi.fn(), consume: vi.fn() },
  hashContrasena: vi.fn(), enviarCorreo: vi.fn(), smtpConfig: vi.fn(),
}));
vi.mock('../../../app/config/prisma.js', () => ({ prisma: mocks.prisma }));
vi.mock('../../../app/models/auth.model.js', () => ({ default: mocks.authModel }));
vi.mock('../../../app/models/passwordResetToken.model.js', () => ({ default: mocks.tokenModel }));
vi.mock('../../../app/utils/password.js', () => ({ hashContrasena: mocks.hashContrasena }));
vi.mock('../../../app/services/passwordResetEmail.service.js', () => ({
  enviarCorreoRecuperacion: mocks.enviarCorreo,
  smtpConfig: mocks.smtpConfig,
}));

import { hashToken, solicitarRecuperacion, verificarToken, restablecerContrasena } from '../../../app/services/passwordReset.service.js';

const TOKEN = 'a'.repeat(64);
const USUARIO = { id_usuario: 'USU001', correo: 'persona@example.com', nombre: 'Persona' };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES = '30';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  mocks.smtpConfig.mockReturnValue({ host: 'smtp.example.com' });
  mocks.prisma.$transaction.mockImplementation((callback) => callback({
    passwordResetToken: mocks.prisma.passwordResetToken,
    usuario: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  }));
  mocks.hashContrasena.mockResolvedValue('$2b$12$' + 'A'.repeat(53));
});

describe('passwordReset.service', () => {
  it('genera y persiste solo el hash, y envía el token en memoria', async () => {
    mocks.authModel.findByEmail.mockResolvedValue(USUARIO);
    mocks.enviarCorreo.mockResolvedValue(undefined);
    await solicitarRecuperacion(USUARIO.correo);
    const tokenHash = mocks.tokenModel.create.mock.calls[0][0].tokenHash;
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(tokenHash).not.toBe(TOKEN);
    expect(mocks.enviarCorreo).toHaveBeenCalledWith(expect.objectContaining({ token: expect.stringMatching(/^[a-f0-9]{64}$/u) }));
  });

  it('rechaza token con formato inválido, vencido o usado', async () => {
    await expect(verificarToken('corto')).rejects.toMatchObject({ statusCode: 400 });
    mocks.tokenModel.findUsableByHash.mockResolvedValue(null);
    await expect(verificarToken(TOKEN)).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.tokenModel.findUsableByHash).toHaveBeenCalledWith(hashToken(TOKEN), expect.any(Date));
  });

  it('consume una sola vez: la segunda carrera falla y no actualiza usuario', async () => {
    mocks.tokenModel.findUsableByHash.mockResolvedValue({ id_token_reset: 1, id_usuario: 'USU001' });
    mocks.tokenModel.consume.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    await expect(restablecerContrasena({ token: TOKEN, contrasena: 'nueva123' })).resolves.toBeDefined();
    await expect(restablecerContrasena({ token: TOKEN, contrasena: 'otra123' })).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.tokenModel.consume).toHaveBeenCalledTimes(2);
  });
});
