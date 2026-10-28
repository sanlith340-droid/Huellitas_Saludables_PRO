// app/controllers/cita.controller.js
/**
 * controllers/cita.controller.js
 * Controlador de citas.
 */

const citaService = require('../services/cita.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const AppError = require('../utils/AppError');

const listar = asyncHandler(async (req, res) => {
  const citas = await citaService.listar(req.query);
  return ok(res, citas, 'Citas listadas correctamente');
});

const obtener = asyncHandler(async (req, res) => {
  const cita = await citaService.obtenerPorId(req.params.id);
  return ok(res, cita, 'Cita encontrada correctamente');
});

const listarPorEspecialista = asyncHandler(async (req, res) => {
  const { id_especialista } = req.params;
  const citas = await citaService.listarPorEspecialista(id_especialista, req.query, req.user);
  return ok(res, citas, 'Citas del especialista listadas correctamente');
});

const crear = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const cita = await citaService.crear({
    ...req.body,
    solicitante: req.user
  });

  return created(res, cita, 'Cita creada correctamente');
});

const editar = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const cita = await citaService.editar(req.params.id, req.body, req.user);
  return ok(res, cita, 'Cita editada correctamente');
});

const cancelar = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const cita = await citaService.cancelar(req.params.id, req.user);
  return ok(res, cita, 'Cita cancelada correctamente');
});

const cambiarEstado = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  const cita = await citaService.cambiarEstadoPorEspecialista(req.params.id, req.body, req.user);
  const mensaje =
    cita.estado === 'atendido'
      ? 'Cita marcada como atendida'
      : 'Cita cancelada por el especialista';
  return ok(res, cita, mensaje);
});

module.exports = {
  cambiarEstado,
  listar,
  obtener,
  listarPorEspecialista,
  crear,
  editar,
  cancelar
};