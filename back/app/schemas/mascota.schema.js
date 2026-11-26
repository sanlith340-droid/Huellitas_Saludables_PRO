import Joi from 'joi';

const ESPECIES_PERMITIDAS = ['perro', 'gato'];
const GENEROS_PERMITIDOS = ['macho', 'hembra'];

const crearMascotaSchema = Joi.object({
  nombre: Joi.string().max(200).required(),
  fecha_nacimiento: Joi.date().iso().required(),
  especie: Joi.string().valid(...ESPECIES_PERMITIDAS).required(),
  genero: Joi.string().valid(...GENEROS_PERMITIDOS).required(),
  id_raza: Joi.number().integer().positive().required(),
  foto_url: Joi.string().max(2048).uri({ scheme: ['https'] }).allow('', null).optional()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export { crearMascotaSchema, idParamSchema, ESPECIES_PERMITIDAS, GENEROS_PERMITIDOS };
export default { crearMascotaSchema, idParamSchema, ESPECIES_PERMITIDAS, GENEROS_PERMITIDOS };
