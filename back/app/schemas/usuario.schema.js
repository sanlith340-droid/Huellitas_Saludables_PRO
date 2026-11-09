// app/schemas/usuario.schema.js
/**
 * schemas/usuario.schema.js
 * Validaciones de usuarios con Joi.
 */

import Joi from 'joi';

const idUsuarioParamSchema = Joi.object({
  id: Joi.string().trim().max(10).required()
});

export { idUsuarioParamSchema };
export default { idUsuarioParamSchema };
