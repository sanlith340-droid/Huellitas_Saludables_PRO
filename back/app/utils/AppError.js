// app/utils/AppError.js
/**
 * utils/AppError.js
 * Errores personalizados de la aplicación.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static badRequest(message = 'Solicitud inválida', details = null) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static conflict(message = 'Conflicto con el estado actual') {
    return new AppError(message, 409, 'CONFLICT');
  }

  static forbidden(message = 'No tiene permisos', details = null) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static unauthorized(message = 'No autenticado') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }
  static serviceUnavailable(message = 'El servicio no está disponible.') {
    return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

export default AppError;
