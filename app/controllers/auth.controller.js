// app/controllers/auth.controller.js
/**
 * controllers/auth.controller.js
 * Controlador de autenticación.
 */

import authService from '../services/auth.service.js';
import authModel from '../models/auth.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import passwordResetService from '../services/passwordReset.service.js';

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

const logout = asyncHandler(async (req, res) => {
  // req.auth lo fija identifyUser a partir del JWT verificado; sin él no se revoca nada.
  if (!req.user || !req.auth?.jti) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  await authService.logout(req.auth);
  return ok(res, null, 'Sesión cerrada correctamente');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await passwordResetService.solicitarRecuperacion(req.body.correo);
  return ok(res, null, result.message);
});

const verifyResetToken = asyncHandler(async (req, res) => {
  const result = await passwordResetService.verificarToken(req.body.token);
  return ok(res, result, 'El enlace es válido.');
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await passwordResetService.restablecerContrasena(req.body);
  return ok(res, null, result.message);
});

export { login, registro, registroAdmin, perfil, logout, forgotPassword, verifyResetToken, resetPassword };
export default { login, registro, registroAdmin, perfil, logout, forgotPassword, verifyResetToken, resetPassword };
