// tests/unit/services/tokenRevocadoCleanupScheduler.test.js
// Prueba el scheduler de limpieza de tokens revocados expirados (sin BD).

import { vi } from 'vitest';

vi.mock('../../../app/services/auth.service.js', () => ({
  default: { limpiarTokensRevocadosExpirados: vi.fn() },
}));

vi.mock('../../../app/utils/logger.js', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import authService from '../../../app/services/auth.service.js';
import logger from '../../../app/utils/logger.js';
import { iniciarLimpiezaTokensRevocados } from '../../../app/services/tokenRevocadoCleanupScheduler.js';

describe('services/tokenRevocadoCleanupScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ejecuta la limpieza al iniciar y en cada intervalo hasta que se detiene', async () => {
    authService.limpiarTokensRevocadosExpirados.mockResolvedValue(0);

    const detener = iniciarLimpiezaTokensRevocados({ intervaloMs: 1000 });
    await vi.advanceTimersByTimeAsync(0);
    expect(authService.limpiarTokensRevocadosExpirados).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(authService.limpiarTokensRevocadosExpirados).toHaveBeenCalledTimes(2);

    detener();
    await vi.advanceTimersByTimeAsync(5000);
    expect(authService.limpiarTokensRevocadosExpirados).toHaveBeenCalledTimes(2);
  });

  it('registra la cantidad eliminada sin incluir identificadores de token', async () => {
    authService.limpiarTokensRevocadosExpirados.mockResolvedValue(3);

    const detener = iniciarLimpiezaTokensRevocados({ intervaloMs: 1000 });
    await vi.advanceTimersByTimeAsync(0);
    detener();

    expect(logger.info).toHaveBeenCalledWith(
      { event: 'auth.revoked_tokens_cleaned', count: 3 },
      expect.any(String),
    );
  });

  it('un fallo de la limpieza no lanza excepción y se registra sin detalles técnicos', async () => {
    authService.limpiarTokensRevocadosExpirados.mockRejectedValue(new Error('conexión caída'));

    const detener = iniciarLimpiezaTokensRevocados({ intervaloMs: 1000 });
    await vi.advanceTimersByTimeAsync(0);
    detener();

    expect(logger.error).toHaveBeenCalledWith(
      { event: 'auth.revoked_tokens_cleanup_failed' },
      expect.any(String),
    );
  });

  it('no solapa ejecuciones si la anterior sigue en curso', async () => {
    let liberar;
    authService.limpiarTokensRevocadosExpirados.mockImplementation(
      () => new Promise((resolve) => { liberar = () => resolve(0); }),
    );

    const detener = iniciarLimpiezaTokensRevocados({ intervaloMs: 1000 });
    await vi.advanceTimersByTimeAsync(3000);
    expect(authService.limpiarTokensRevocadosExpirados).toHaveBeenCalledTimes(1);

    liberar();
    detener();
  });
});
