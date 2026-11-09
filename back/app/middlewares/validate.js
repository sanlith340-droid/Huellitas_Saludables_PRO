// app/middlewares/validate.js
/**
 * middlewares/validate.js
 * Middleware de validación con Joi.
 */

import AppError from '../utils/AppError.js';

function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detalles = error.details.map((d) => d.message);
      return next(AppError.badRequest(`Datos inválidos: ${detalles.join(' | ')}`));
    }

    req[property] = value;
    next();
  };
}

export default validate;