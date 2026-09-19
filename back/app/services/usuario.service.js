// app/services/usuario.service.js
/**
 * services/usuario.service.js
 * Lógica de negocio de usuarios.
 */

const usuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');

async function obtenerPorDocumento(documento) {
  const usuario = await usuarioModel.findByDocumento(documento);
  if (!usuario) {
    throw AppError.notFound(`No existe un usuario con ID ${documento}`);
  }
  return usuario;
}

async function listarEspecialistas() {
  return usuarioModel.findEspecialistas();
}

module.exports = {
  obtenerPorDocumento,
  listarEspecialistas
};