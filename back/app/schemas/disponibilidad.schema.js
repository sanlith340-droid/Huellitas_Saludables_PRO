// app/schemas/disponibilidad.schema.js
/**
 * schemas/disponibilidad.schema.js
 * Validaciones de disponibilidad con Joi.
 */

const Joi = require('joi');

const ESTADOS_DISPONIBILIDAD = ['disponible', 'ocupado'];
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const crearDisponibilidadSchema = Joi.object({
  id_usuario: Joi.string().max(10).required(),
  fecha: Joi.date().iso().required(),
  hora: Joi.string().pattern(horaRegex).required(),
  estado: Joi.string().valid(...ESTADOS_DISPONIBILIDAD).default('disponible')
});

const actualizarDisponibilidadSchema = Joi.object({
  id_usuario: Joi.string().max(10),
  fecha: Joi.date().iso(),
  hora: Joi.string().pattern(horaRegex),
  estado: Joi.string().valid(...ESTADOS_DISPONIBILIDAD)
}).min(1);

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// Límites de paginación. Si el cliente no envía "page" ni "limit", el
// listado NO se pagina (comportamiento original, usado por NuevaCita).
const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO = 100;

// Filtros comunes a todos los listados de disponibilidad.
//   fecha        -> un día exacto (tiene prioridad sobre el rango)
//   fecha_desde  -> desde ese día (incluido)
//   fecha_hasta  -> hasta ese día (incluido); no puede ser anterior a fecha_desde
const filtrosComunes = {
  fecha: Joi.date().iso(),
  fecha_desde: Joi.date().iso(),
  // La regla de orden solo aplica si el cliente también envió fecha_desde;
  // sin ella, min(Joi.ref(...)) rechazaría un fecha_hasta "suelto".
  fecha_hasta: Joi.date().iso().when('fecha_desde', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('fecha_desde')).messages({
      'date.min': '"fecha_hasta" no puede ser anterior a "fecha_desde"'
    })
  }),
  estado: Joi.string().valid(...ESTADOS_DISPONIBILIDAD),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(LIMITE_MAXIMO)
};

const listarDisponibilidadQuerySchema = Joi.object({
  id_usuario: Joi.string().max(10),
  ...filtrosComunes
});

// GET /disponibilidad/especialista/:id_usuario
const especialistaParamSchema = Joi.object({
  id_usuario: Joi.string().trim().max(10).required()
});

const listarPorEspecialistaQuerySchema = Joi.object({
  ...filtrosComunes
});

module.exports = {
  ESTADOS_DISPONIBILIDAD,
  crearDisponibilidadSchema,
  actualizarDisponibilidadSchema,
  idParamSchema,
  listarDisponibilidadQuerySchema,
  especialistaParamSchema,
  listarPorEspecialistaQuerySchema,
  LIMITE_POR_DEFECTO,
  LIMITE_MAXIMO
};