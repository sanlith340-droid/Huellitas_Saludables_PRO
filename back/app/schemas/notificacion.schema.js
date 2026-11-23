// app/schemas/notificacion.schema.js
import Joi from 'joi';

const idNotificacionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export { idNotificacionParamSchema };
export default { idNotificacionParamSchema };
