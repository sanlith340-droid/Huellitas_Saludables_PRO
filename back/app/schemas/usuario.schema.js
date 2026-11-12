// app/schemas/usuario.schema.js
/**
 * schemas/usuario.schema.js
 * Validaciones de usuarios con Joi.
 */

import Joi from 'joi';

const idUsuarioParamSchema = Joi.object({
  id: Joi.string().trim().max(10).required()
});

// GET /usuarios/:documento -> el documento es un id_usuario (p. ej. USU001).
const documentoParamSchema = Joi.object({
  documento: Joi.string().trim().max(10).required()
});

export { idUsuarioParamSchema, documentoParamSchema };
export default { idUsuarioParamSchema, documentoParamSchema };
