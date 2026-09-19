// app/middlewares/errorHandler.js
/**
 * middlewares/errorHandler.js
 * Manejo central de errores.
 */

const AppError = require('../utils/AppError');
const { fail } = require('../utils/response');

const PG_ERROR_MESSAGES = {
  '23505': 'El registro ya existe (violación de restricción única)',
  '23503': 'Referencia inválida: el registro relacionado no existe',
  '23514': 'El valor no cumple una restricción de la base de datos',
  '22P02': 'Formato de dato inválido enviado a la base de datos',
};

function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return fail(res, err.message, err.statusCode, err.code);
  }

  if (err.code && PG_ERROR_MESSAGES[err.code]) {
    return fail(res, PG_ERROR_MESSAGES[err.code], 409, `PG_${err.code}`, {
      detail: err.detail,
    });
  }

  console.error('[error] No controlado:', err);
  return fail(res, 'Error interno del servidor', 500, 'INTERNAL_ERROR');
}

module.exports = { notFoundHandler, errorHandler };