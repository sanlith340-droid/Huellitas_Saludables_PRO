// app/middlewares/errorHandler.js
/**
 * middlewares/errorHandler.js
 * Manejo central de errores y único punto de respuesta de error de la API.
 */
import AppError from '../utils/AppError.js';
import { fail } from '../utils/response.js';
import logger from '../utils/logger.js';

const PG_ERROR_MESSAGES = {
  '23505': 'El registro ya existe.',
  '23503': 'La referencia indicada no existe.',
  '23514': 'El valor no cumple una regla de validación.',
  '22P02': 'El formato de uno de los datos no es válido.',
};
const MENSAJE_ERROR_INTERNO = 'Ocurrió un error interno. Inténtalo de nuevo más tarde.';

function codigoSeguro(codigo) {
  return typeof codigo === 'string' && /^[A-Za-z0-9_]{1,40}$/.test(codigo)
    ? codigo
    : undefined;
}

function registrarErrorInterno(error) {
  const campos = { event: 'http.unhandled_error' };
  if (process.env.NODE_ENV === 'development') {
    if (typeof error?.name === 'string' && /^[A-Za-z][A-Za-z0-9]{0,60}$/.test(error.name)) {
      campos.errorName = error.name;
    }
    const code = codigoSeguro(error?.code || error?.parent?.code || error?.original?.code);
    if (code) campos.errorCode = code;
  }
  if (process.env.NODE_ENV === 'development' && typeof error?.stack === 'string') {
    const frames = error.stack.split('\n').slice(1)
      .filter((line) => /^\s+at\s/.test(line)).slice(0, 12)
      .map((line) => line.replace(/\/(?:home|Users)\/[^/\s]+/g, '/[USUARIO]'));
    if (frames.length) campos.stack = frames;
  }
  logger.error(campos, 'Error interno no controlado');
}

function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`No existe la ruta ${req.method} ${req.path}.`));
}

function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);
  const error = err && typeof err === 'object' ? err : new Error('Error no controlado');
  const postgresCode = error.code || error.parent?.code || error.original?.code;
  if (postgresCode && PG_ERROR_MESSAGES[postgresCode]) {
    return fail(res, PG_ERROR_MESSAGES[postgresCode], 409, `PG_${postgresCode}`, null);
  }
  if (error.type === 'entity.parse.failed') {
    return fail(res, 'El cuerpo de la solicitud contiene JSON inválido.', 400, 'BAD_REQUEST', null);
  }
  if (error.type === 'entity.too.large') {
    return fail(res, 'El cuerpo de la solicitud supera el tamaño permitido.', 413, 'PAYLOAD_TOO_LARGE', null);
  }
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      registrarErrorInterno({ name: err.name, code: err.code });
      const servicioNoDisponible = err.statusCode === 503;
      return fail(
        res,
        servicioNoDisponible ? 'Servicio temporalmente no disponible.' : MENSAJE_ERROR_INTERNO,
        servicioNoDisponible ? 503 : 500,
        servicioNoDisponible ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
        null
      );
    }
    return fail(res, err.message, err.statusCode, err.code, err.details ?? null);
  }
  registrarErrorInterno(error);
  return fail(res, MENSAJE_ERROR_INTERNO, 500, 'INTERNAL_ERROR', null);
}

export { notFoundHandler, errorHandler };
export default { notFoundHandler, errorHandler };
