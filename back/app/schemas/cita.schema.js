// app/schemas/cita.schema.js
/**
 * schemas/cita.schema.js
 * Validaciones de citas con Joi.
 */

const Joi = require('joi');

const ESTADOS_CITA = ['pendiente', 'confirmado', 'cancelado', 'atendido'];

const crearCitaSchema = Joi.object({
  id_mascota: Joi.number().integer().positive().required(),
  id_disponibilidad: Joi.number().integer().positive().required(),
  motivo: Joi.string().max(200).required()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const listarCitasQuerySchema = Joi.object({
  id_mascota: Joi.number().integer().positive(),
  estado: Joi.string().valid(...ESTADOS_CITA),
  fecha: Joi.date().iso(),
  id_especialista: Joi.string().max(10)
});

// Fechas como "YYYY-MM-DD" (string) para evitar desfases de zona horaria.
const fechaISO = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
  'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD'
});

// Filtros de la pantalla "Mis citas" del especialista
const listarCitasEspecialistaQuerySchema = Joi.object({
  estado: Joi.string().valid(...ESTADOS_CITA),
  fecha: fechaISO,
  fecha_desde: fechaISO,
  fecha_hasta: fechaISO
});

const especialistaParamSchema = Joi.object({
  id_especialista: Joi.string().max(10).required()
});

// Decisión del especialista sobre una cita:
//   - atendido  : la consulta se realizó
//   - cancelado : la cita no se realizará; con liberar_horario=true (por defecto)
//                 el horario vuelve a quedar 'disponible' para nuevas citas
const cambiarEstadoCitaSchema = Joi.object({
  estado: Joi.string().valid('atendido', 'cancelado').required(),
  liberar_horario: Joi.boolean().default(true)
});

module.exports = {
  ESTADOS_CITA,
  crearCitaSchema,
  idParamSchema,
  listarCitasQuerySchema,
  listarCitasEspecialistaQuerySchema,
  especialistaParamSchema,
  cambiarEstadoCitaSchema
};