// app/controllers/usuario.controller.js
/**
 * controllers/usuario.controller.js
 * Controlador de usuarios.
 */

const usuarioService = require('../services/usuario.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const AppError = require('../utils/AppError');

const obtenerPorDocumento = asyncHandler(async (req, res) => {
  const { documento } = req.params;

  if (!documento || documento.trim().length === 0) {
    throw AppError.badRequest('El ID del usuario es requerido');
  }

  const usuario = await usuarioService.obtenerPorDocumento(documento);
  return ok(res, usuario, 'Usuario encontrado correctamente');
});

const listarEspecialistas = asyncHandler(async (req, res) => {
  const especialistas = await usuarioService.listarEspecialistas();
  return ok(res, especialistas, 'Especialistas listados correctamente');
});

const listarPersonal = asyncHandler(async (req, res) => {
  const personal = await usuarioService.listarPersonal();
  return ok(res, personal, 'Personal listado correctamente');
});

const eliminar = asyncHandler(async (req, res) => {
  const eliminado = await usuarioService.eliminarCuenta(req.params.id);
  return ok(res, eliminado, 'Cuenta eliminada correctamente');
});

module.exports = {
  listarPersonal,
  eliminar,
  obtenerPorDocumento,
  listarEspecialistas
};