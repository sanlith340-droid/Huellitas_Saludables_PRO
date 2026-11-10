import citaService from './cita.service.js';
import logger from '../utils/logger.js';

const INTERVALO_MS = 60_000;

function iniciarCancelacionAutomatica({ intervaloMs = INTERVALO_MS } = {}) {
  let ejecutando = false;
  let detenido = false;

  const ejecutar = async () => {
    if (ejecutando || detenido) return;
    ejecutando = true;
    try {
      const cantidad = await citaService.cancelarVencidasAutomaticamente();
      if (cantidad > 0) {
        logger.info(
          { event: 'appointments.auto_cancelled', count: cantidad },
          'Citas vencidas canceladas automáticamente',
        );
      }
    } catch {
      // No se serializa el error técnico para evitar que una consulta o datos internos
      // terminen en el log; el evento es suficiente para diagnóstico operativo.
      logger.error(
        { event: 'appointments.auto_cancel_failed' },
        'Falló el proceso automático de cancelación de citas',
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

export { INTERVALO_MS, iniciarCancelacionAutomatica };
export default iniciarCancelacionAutomatica;
