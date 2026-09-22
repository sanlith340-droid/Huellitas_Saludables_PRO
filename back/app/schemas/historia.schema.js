// app/schemas/historia.schema.js
/**
 * schemas/historia.schema.js
 * Validaciones de historia clínica con Joi.
 */

const Joi = require('joi');

/**
 * Crear historia clínica
 */
const crearHistoriaSchema = Joi.object({
  id_cita: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'El id_cita debe ser un número',
      'number.positive': 'El id_cita debe ser un número positivo',
      'any.required': 'El id_cita es requerido'
    }),
  peso: Joi.number().positive().max(999.99).optional()
    .messages({
      'number.base': 'El peso debe ser un número',
      'number.positive': 'El peso debe ser un número positivo',
      'number.max': 'El peso no puede ser mayor a 999.99'
    }),
  diagnostico: Joi.string().max(200).required()
    .messages({
      'string.base': 'El diagnóstico debe ser un texto',
      'string.max': 'El diagnóstico no puede exceder 200 caracteres',
      'any.required': 'El diagnóstico es requerido'
    }),
  tratamiento: Joi.string().max(200).required()
    .messages({
      'string.base': 'El tratamiento debe ser un texto',
      'string.max': 'El tratamiento no puede exceder 200 caracteres',
      'any.required': 'El tratamiento es requerido'
    }),
  observaciones: Joi.string().max(500).optional()
    .messages({
      'string.base': 'Las observaciones deben ser un texto',
      'string.max': 'Las observaciones no pueden exceder 500 caracteres'
    })
});

/**
 * Actualizar historia clínica
 */
const actualizarHistoriaSchema = Joi.object({
  peso: Joi.number().positive().max(999.99).optional(),
  diagnostico: Joi.string().max(200).optional(),
  tratamiento: Joi.string().max(200).optional(),
  observaciones: Joi.string().max(500).optional()
}).min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * ID Param
 */
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

/**
 * Listar historias (query params)
 */
const listarHistoriaQuerySchema = Joi.object({
  id_mascota: Joi.number().integer().positive().optional(),
  id_especialista: Joi.string().max(10).optional(),
  fecha_inicio: Joi.date().iso().optional(),
  fecha_fin: Joi.date().iso().optional()
});

module.exports = {
  crearHistoriaSchema,
  actualizarHistoriaSchema,
  idParamSchema,
  listarHistoriaQuerySchema
};