// app/schemas/usuario.schema.js
/**
 * schemas/usuario.schema.js
 * Validaciones de usuarios con Joi.
 */

const Joi = require('joi');

const idUsuarioParamSchema = Joi.object({
  id: Joi.string().trim().max(10).required()
});

module.exports = { idUsuarioParamSchema };
