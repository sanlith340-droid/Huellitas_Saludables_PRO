import { claveAhoraBogota, esFechaHoraPasada } from '../../../app/utils/fechaHora.js';

describe('utilidades de fecha y hora en America/Bogota', () => {
  const ahora = new Date('2026-11-10T15:00:00.000Z'); // 10:00 en Bogotá

  it('interpreta el día y la hora local de Bogotá, no la fecha UTC', () => {
    expect(claveAhoraBogota(ahora)).toBe('2026-11-10T10:00:00');
  });

  it('considera vencidas las franjas anteriores o iguales a la hora actual', () => {
    expect(esFechaHoraPasada('2026-11-10', '09:59:00', ahora)).toBe(true);
    expect(esFechaHoraPasada('2026-11-10', '10:00:00', ahora)).toBe(true);
    expect(esFechaHoraPasada('2026-11-09', '23:59:00', ahora)).toBe(true);
  });

  it('permite una franja posterior, incluso en el mismo día', () => {
    expect(esFechaHoraPasada('2026-11-10', '10:01:00', ahora)).toBe(false);
    expect(esFechaHoraPasada('2026-11-11', '00:00:00', ahora)).toBe(false);
  });
});
