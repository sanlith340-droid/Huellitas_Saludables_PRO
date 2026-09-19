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

module.exports = {
  ESTADOS_CITA,
  crearCitaSchema,
  idParamSchema,
  listarCitasQuerySchema
};