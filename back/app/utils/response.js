// app/utils/response.js
/**
 * utils/response.js
 * Respuestas estandarizadas.
 */

function ok(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function created(res, data = null, message = 'Recurso creado correctamente') {
  return ok(res, data, message, 201);
}

function fail(res, message = 'Ocurrió un error', statusCode = 400, code = 'BAD_REQUEST', details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
}

module.exports = { ok, created, fail };