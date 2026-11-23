// tests/unit/models/tokenRevocado.model.test.js
// Comprueba, sin BD, cómo el modelo invoca a Prisma (idempotencia y limpieza acotada).

import { vi } from 'vitest';

const { tokenRevocadoPrisma } = vi.hoisted(() => ({
  tokenRevocadoPrisma: {
    createMany: vi.fn(),
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../../app/config/prisma.js', () => ({
  prisma: { tokenRevocado: tokenRevocadoPrisma },
}));

import tokenRevocadoModel from '../../../app/models/tokenRevocado.model.js';

describe('models/tokenRevocado.model - llamadas a Prisma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revocar usa skipDuplicates para ser idempotente y guarda solo jti y expiración', async () => {
    tokenRevocadoPrisma.createMany.mockResolvedValue({ count: 1 });
    const expiraEn = new Date('2026-11-20T10:00:00Z');

    const nuevo = await tokenRevocadoModel.revocar({ jti: 'abc', expiraEn });

    expect(nuevo).toBe(true);
    expect(tokenRevocadoPrisma.createMany).toHaveBeenCalledWith({
      data: [{ jti: 'abc', expira_en: expiraEn }],
      skipDuplicates: true,
    });
  });

  it('revocar devuelve false cuando el jti ya estaba registrado', async () => {
    tokenRevocadoPrisma.createMany.mockResolvedValue({ count: 0 });
    expect(await tokenRevocadoModel.revocar({ jti: 'abc', expiraEn: new Date() })).toBe(false);
  });

  it('estaRevocado busca por jti y solo selecciona el id', async () => {
    tokenRevocadoPrisma.findUnique.mockResolvedValue({ id_token_revocado: 1 });
    expect(await tokenRevocadoModel.estaRevocado('abc')).toBe(true);
    expect(tokenRevocadoPrisma.findUnique).toHaveBeenCalledWith({
      where: { jti: 'abc' },
      select: { id_token_revocado: true },
    });

    tokenRevocadoPrisma.findUnique.mockResolvedValue(null);
    expect(await tokenRevocadoModel.estaRevocado('otro')).toBe(false);
  });

  it('eliminarExpirados borra únicamente expira_en < ahora', async () => {
    tokenRevocadoPrisma.deleteMany.mockResolvedValue({ count: 4 });
    const ahora = new Date('2026-11-19T12:00:00Z');

    expect(await tokenRevocadoModel.eliminarExpirados(ahora)).toBe(4);
    expect(tokenRevocadoPrisma.deleteMany).toHaveBeenCalledWith({
      where: { expira_en: { lt: ahora } },
    });
  });
});
