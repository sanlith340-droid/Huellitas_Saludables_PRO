const ZONA_HORARIA = 'America/Bogota';

function fechaISO(fecha) {
  if (fecha instanceof Date) return fecha.toISOString().slice(0, 10);
  return String(fecha).slice(0, 10);
}

function horaISO(hora) {
  if (hora instanceof Date) {
    return [hora.getUTCHours(), hora.getUTCMinutes(), hora.getUTCSeconds()]
      .map((parte) => String(parte).padStart(2, '0'))
      .join(':');
  }
  const coincidencia = String(hora).match(/(?:T|^)(\d{2}:\d{2})(?::(\d{2}))?/);
  if (!coincidencia) throw new TypeError('La hora debe tener formato HH:mm o HH:mm:ss');
  return `${coincidencia[1]}:${coincidencia[2] ?? '00'}`;
}

function claveFechaHora(fecha, hora) {
  return `${fechaISO(fecha)}T${horaISO(hora)}`;
}

function claveAhoraBogota(instante = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA_HORARIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instante)
      .filter((parte) => parte.type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`;
}

function obtenerAhora() {
  const relojDePrueba = process.env.NODE_ENV === 'test'
    ? process.env.HUELLITAS_TEST_NOW
    : null;
  return relojDePrueba ? new Date(relojDePrueba) : new Date();
}

function esFechaHoraPasada(fecha, hora, ahora = obtenerAhora()) {
  return claveFechaHora(fecha, hora) <= claveAhoraBogota(ahora);
}

export {
  ZONA_HORARIA,
  fechaISO,
  horaISO,
  claveFechaHora,
  claveAhoraBogota,
  obtenerAhora,
  esFechaHoraPasada,
};
export default { ZONA_HORARIA, fechaISO, horaISO, claveFechaHora, claveAhoraBogota, obtenerAhora, esFechaHoraPasada };
