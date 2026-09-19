// app/schemas/auth.schema.js
/**
 * schemas/auth.schema.js
 * Validaciones de autenticación con Joi.
 */

const Joi = require('joi');

// ============================================================
// ROLES PERMITIDOS PARA REGISTRO-ADMIN
// SOLO admin, especialista y recepcionista
// usuario NO está permitido aquí (tiene registro público)
// ============================================================
const ROLES_ADMIN = ['admin', 'especialista', 'recepcionista'];
const TIPOS_USUARIO = ['principal', 'acudiente'];

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  contrasena: Joi.string().min(4).required()
});

const registroSchema = Joi.object({
  nombre: Joi.string().max(100).required(),
  apellidos: Joi.string().max(150).required(),
  telefono: Joi.string().max(20).required(),
  correo: Joi.string().email().max(150).required(),
  direccion: Joi.string().max(150).required(),
  contrasena: Joi.string().min(4).max(255).required(),
  tipo: Joi.string().valid(...TIPOS_USUARIO).default('principal')
});

// ============================================================
// SCHEMA DINÁMICO PARA REGISTRO-ADMIN
// Cambia según el rol seleccionado
// ============================================================
const registroAdminSchema = Joi.object({
  // ============================================================
  // CAMPOS OBLIGATORIOS SIEMPRE
  // ============================================================
  nombre: Joi.string().max(100).required(),
  apellidos: Joi.string().max(150).required(),
  telefono: Joi.string().max(20).required(),
  correo: Joi.string().email().max(150).required(),
  direccion: Joi.string().max(150).required(),
  contrasena: Joi.string().min(4).max(255).required(),
  
  // ============================================================
  // ROL: Obligatorio - SOLO admin, especialista, recepcionista
  // ============================================================
  rol: Joi.string()
    .valid(...ROLES_ADMIN)
    .required()
    .messages({
      'any.only': 'El rol debe ser: admin, especialista o recepcionista',
      'any.required': 'El rol es requerido'
    }),
  
  // ============================================================
  // ESPECIALIZACIÓN: 
  // - OBLIGATORIA cuando rol = 'especialista'
  // - NO PERMITIDA (null) cuando rol = 'admin' o 'recepcionista'
  // ============================================================
  especializacion: Joi.when('rol', {
    is: 'especialista',
    then: Joi.string().max(100).required()
      .messages({
        'any.required': 'La especialización es requerida para especialistas'
      }),
    otherwise: Joi.valid(null).optional()
      .messages({
        'any.only': 'La especialización solo es permitida para especialistas'
      })
  }),
  
  // ============================================================
  // TIPO: 
  // - NO PERMITIDO para admin, especialista, recepcionista
  // - Siempre debe ser null
  // ============================================================
  tipo: Joi.valid(null).optional()
    .messages({
      'any.only': 'El tipo solo es permitido para usuarios (use /api/auth/registro)'
    })
});

module.exports = {
  loginSchema,
  registroSchema,
  registroAdminSchema,
  ROLES_ADMIN,
  TIPOS_USUARIO
};