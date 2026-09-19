// app/controllers/mascota.controller.js
const mascotaService = require('../services/mascota.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const AppError = require('../utils/AppError');

const listar = asyncHandler(async (req, res) => {
  const mascotas = await mascotaService.listar();
  return ok(res, mascotas, 'Mascotas y propietarios listados correctamente');
});

const obtener = asyncHandler(async (req, res) => {
  const mascota = await mascotaService.obtenerPorId(req.params.id);
  return ok(res, mascota, 'Mascota encontrada correctamente');
});

const crear = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const rolesPermitidos = ['usuario', 'admin'];
  if (!rolesPermitidos.includes(req.user.rol)) {
    throw AppError.forbidden(
      `No puedes realizar esta acción porque eres ${req.user.rol} y esta acción le corresponde a usuario o admin`
    );
  }

  const mascota = await mascotaService.crearConUsuario(req.body, req.user.id);
  return created(res, mascota, 'Mascota registrada exitosamente');
});

module.exports = { listar, obtener, crear };