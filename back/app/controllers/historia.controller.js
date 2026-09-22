// app/controllers/historia.controller.js
/**
 * controllers/historia.controller.js
 * Controlador de historia clínica.
 */

const historiaService = require('../services/historia.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const AppError = require('../utils/AppError');

/**
 * Listar historias clínicas
 * GET /api/historia
 */
const listar = asyncHandler(async (req, res) => {
  // Solo especialistas pueden listar
  if (!req.user || req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden listar historias clínicas');
  }

  const historias = await historiaService.listar(req.query);
  return ok(res, historias, 'Historias clínicas listadas correctamente');
});

/**
 * Obtener historia clínica por ID
 * GET /api/historia/:id
 */
const obtener = asyncHandler(async (req, res) => {
  if (!req.user || req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden ver historias clínicas');
  }

  const historia = await historiaService.obtenerPorId(req.params.id);
  return ok(res, historia, 'Historia clínica encontrada correctamente');
});

/**
 * Obtener historias por mascota
 * GET /api/historia/mascota/:id_mascota
 */
const obtenerPorMascota = asyncHandler(async (req, res) => {
  if (!req.user || req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden ver historias clínicas');
  }

  const historias = await historiaService.obtenerPorMascota(req.params.id_mascota);
  return ok(res, historias, 'Historias clínicas de la mascota listadas correctamente');
});

/**
 * Obtener historia por cita
 * GET /api/historia/cita/:id_cita
 */
const obtenerPorCita = asyncHandler(async (req, res) => {
  if (!req.user || req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden ver historias clínicas');
  }

  const historia = await historiaService.obtenerPorCita(req.params.id_cita);
  return ok(res, historia, 'Historia clínica de la cita encontrada correctamente');
});

/**
 * Crear historia clínica
 * POST /api/historia
 */
const crear = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  if (req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden crear historias clínicas');
  }

  const historia = await historiaService.crear({
    ...req.body,
    especialistaId: req.user.id
  });

  return created(res, historia, 'Historia clínica creada correctamente');
});

/**
 * Actualizar historia clínica
 * PUT /api/historia/:id
 */
const actualizar = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw AppError.unauthorized('Usuario no autenticado');
  }

  if (req.user.rol !== 'especialista') {
    throw AppError.forbidden('Solo los especialistas pueden actualizar historias clínicas');
  }

  const historia = await historiaService.actualizar(
    req.params.id,
    req.body,
    req.user.id
  );

  return ok(res, historia, 'Historia clínica actualizada correctamente');
});

module.exports = {
  listar,
  obtener,
  obtenerPorMascota,
  obtenerPorCita,
  crear,
  actualizar
};