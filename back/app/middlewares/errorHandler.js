// app/middlewares/errorHandler.js
/**
 * middlewares/errorHandler.js
 * Manejo central de errores.
 */

const AppError = require('../utils/AppError');
const { fail } = require('../utils/response');

const isDevelopment = process.env.NODE_ENV === 'development';

const PG_ERROR_MESSAGES = {
  '23505': 'El registro ya existe (violación de restricción única)',
  '23503': 'Referencia inválida: el registro relacionado no existe',
  '23514': 'El valor no cumple una restricción de la base de datos',
  '22P02': 'Formato de dato inválido enviado a la base de datos',
};

const PATRON_SECRETO = /(["']?(?:password|passwd|pwd|clave|contrasena|contraseña|token|secret|authorization|jwt|api[-_]?key|hash)["']?\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi;
const PATRON_BEARER = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const PATRON_JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const PATRON_CORREO = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PATRON_HASH = /\b[a-f0-9]{32,}\b/gi;
const PATRON_NUMERO_LARGO = /\b\d{7,}\b/g;
const PATRON_SQL = /\b(select|insert|update|delete|from|where|values|join|returning|sequelize)\b/i;
const PATRON_RUTA_USUARIO = /\/(?:home|Users)\/[^/\s]+/g;
const PATRON_RUTA_WINDOWS = /[A-Za-z]:\\Users\\[^\\\s]+/g;

function redactarTexto(valor) {
  if (typeof valor !== 'string') {
    return '';
  }

  return valor
    .replace(PATRON_SECRETO, '$1[REDACTADO]')
    .replace(PATRON_BEARER, 'Bearer [REDACTADO]')
    .replace(PATRON_JWT, '[TOKEN REDACTADO]')
    .replace(PATRON_CORREO, '[CORREO REDACTADO]')
    .replace(PATRON_HASH, '[HASH REDACTADO]')
    .replace(PATRON_NUMERO_LARGO, '[NUMERO REDACTADO]')
    .replace(PATRON_RUTA_USUARIO, '/[USUARIO]')
    .replace(PATRON_RUTA_WINDOWS, 'C:\\Users\\[USUARIO]');
}

function obtenerCodigoSeguro(codigo) {
  if (typeof codigo === 'string' && /^[A-Za-z0-9_]{1,40}$/.test(codigo)) {
    return codigo;
  }

  return null;
}

function obtenerStackSeguro(stack) {
  if (typeof stack !== 'string') {
    return [];
  }

  return stack
    .split('\n')
    .filter((linea) => /^\s+at\s/.test(linea) && !PATRON_SQL.test(linea))
    .slice(0, 10)
    .map((linea) => redactarTexto(linea))
    .filter(Boolean);
}

function obtenerDetallesDesarrollo(error) {
  const detalles = {};
  const nombre = redactarTexto(error.name);

  if (nombre) {
    detalles.name = nombre.slice(0, 80);
  }

  const codigo = obtenerCodigoSeguro(error.code);
  if (codigo) {
    detalles.code = codigo;
  }

  const mensaje = redactarTexto(error.message);
  if (mensaje && !PATRON_SQL.test(mensaje)) {
    detalles.message = mensaje.slice(0, 500);
  }

  const stack = obtenerStackSeguro(error.stack);
  if (stack.length > 0) {
    detalles.stack = stack;
  }

  return Object.keys(detalles).length > 0 ? detalles : null;
}

function registrarErrorInesperado(error) {
  const resumen = {};
  const nombre = redactarTexto(error.name);

  if (nombre) {
    resumen.name = nombre.slice(0, 80);
  }

  const codigo = obtenerCodigoSeguro(error.code);
  if (codigo) {
    resumen.code = codigo;
  }

  console.error('[error] No controlado:', resumen);
}

function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return fail(res, err.message, err.statusCode, err.code);
  }

  const error = err && typeof err === 'object'
    ? err
    : { name: 'Error', message: String(err) };

  const postgresCode = error.code || error.parent?.code || error.original?.code;
  if (postgresCode && PG_ERROR_MESSAGES[postgresCode]) {
    return fail(res, PG_ERROR_MESSAGES[postgresCode], 409, `PG_${postgresCode}`);
  }

  registrarErrorInesperado(error);

  if (isDevelopment) {
    return fail(
      res,
      'Error interno del servidor',
      500,
      'INTERNAL_ERROR',
      obtenerDetallesDesarrollo(error)
    );
  }

  return fail(res, 'Error interno del servidor', 500, 'INTERNAL_ERROR');
}

module.exports = { notFoundHandler, errorHandler };
