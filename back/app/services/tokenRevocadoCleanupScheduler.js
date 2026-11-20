import authService from './auth.service.js';
import logger from '../utils/logger.js';

const INTERVALO_MS = 60 * 60 * 1000; // 1 hora

/**
 * Elimina periódicamente de `token_revocado` los registros cuyo JWT ya expiró.
 * Sigue el mismo patrón que citaCancellationScheduler: sin solapamiento de
 * ejecuciones, timer con unref() y función de parada para el cierre ordenado.
 */
function iniciarLimpiezaTokensRevocados({ intervaloMs = INTERVALO_MS } = {}) {
  let ejecutando = false;
  let detenido = false;

  const ejecutar = async () => {
    if (ejecutando || detenido) return;
    ejecutando = true;
    try {
      const cantidad = await authService.limpiarTokensRevocadosExpirados();
      if (cantidad > 0) {
        logger.info(
          { event: 'auth.revoked_tokens_cleaned', count: cantidad },
          'Tokens revocados expirados eliminados',
        );
      }
    } catch {
      logger.error(
        { event: 'auth.revoked_tokens_cleanup_failed' },
        'Falló la limpieza de tokens revocados expirados',
      );
    } finally {
      ejecutando = false;
    }
  };

  void ejecutar();
  const timer = setInterval(ejecutar, intervaloMs);
  timer.unref?.();

  return () => {
    detenido = true;
    clearInterval(timer);
  };
}

export { INTERVALO_MS, iniciarLimpiezaTokensRevocados };
export default iniciarLimpiezaTokensRevocados;
