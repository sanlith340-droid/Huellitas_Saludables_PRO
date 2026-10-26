// app/controllers/auth.controller.js
/**
 * controllers/auth.controller.js
 * Controlador de autenticación.
 */

const authService = require('../services/auth.service');
const authModel = require('../models/auth.model');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const AppError = require('../utils/AppError');

const login = asyncHandler(async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    throw AppError.badRequest('Correo y contraseña son requeridos');
  }

  const result = await authService.login({ correo, contrasena });
  return ok(res, result, 'Login exitoso');
});

const registro = asyncHandler(async (req, res) => {
  if (req.user) {
    throw AppError.badRequest('Ya tienes una sesión activa. Cierra sesión para registrar un nuevo usuario.');
  }

  const result = await authService.registro(req.body);
  return created(res, result, 'Usuario registrado exitosamente');
});

const registroAdmin = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const { rol } = req.body;
  const rolesPermitidos = ['admin', 'especialista', 'recepcionista'];

  if (!rol || !rolesPermitidos.includes(rol)) {
    throw AppError.badRequest(`El rol debe ser uno de: ${rolesPermitidos.join(', ')}`);
  }

  const result = await authService.registroAdmin(req.body, req.user.id);

  return created(res, result, 'Usuario creado exitosamente');
});

const perfil = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const usuario = await authModel.findById(req.user.id);
  if (!usuario) {
    throw AppError.notFound('Usuario no encontrado');
  }

  const { contrasena, ...usuarioSinPassword } = usuario;
  return ok(res, usuarioSinPassword, 'Perfil obtenido correctamente');
});

module.exports = {
  login,
  registro,
  registroAdmin,
  perfil
};