// app/utils/asyncHandler.js
/**
 * utils/asyncHandler.js
 * Manejador de funciones asíncronas.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;