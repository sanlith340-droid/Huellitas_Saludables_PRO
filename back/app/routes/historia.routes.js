// app/routes/historia.routes.js
/**
 * routes/historia.routes.js
 * Endpoints de historia clínica.
 * 
 * NOTA: Todos los endpoints requieren rol ESPECIALISTA
 */

const { Router } = require('express');
const controller = require('../controllers/historia.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const {
  crearHistoriaSchema,
  actualizarHistoriaSchema,
  idParamSchema,
  listarHistoriaQuerySchema
} = require('../schemas/historia.schema');

const router = Router();

// ============================================================
// TODOS LOS ENDPOINTS REQUIEREN ROL ESPECIALISTA
// ============================================================

/**
 * GET /api/historia
 * Listar historias clínicas con filtros
 */
router.get(
  '/',
  requireRole('especialista'),
  validate(listarHistoriaQuerySchema, 'query'),
  controller.listar
);

/**
 * GET /api/historia/:id
 * Obtener historia clínica por ID
 */
router.get(
  '/:id',
  requireRole('especialista'),
  validate(idParamSchema, 'params'),
  controller.obtener
);

/**
 * GET /api/historia/mascota/:id_mascota
 * Obtener historias por mascota
 */
router.get(
  '/mascota/:id_mascota',
  requireRole('especialista'),
  controller.obtenerPorMascota
);

/**
 * GET /api/historia/cita/:id_cita
 * Obtener historia por cita
 */
router.get(
  '/cita/:id_cita',
  requireRole('especialista'),
  controller.obtenerPorCita
);

/**
 * POST /api/historia
 * Crear historia clínica
 */
router.post(
  '/',
  requireRole('especialista'),
  validate(crearHistoriaSchema, 'body'),
  controller.crear
);

/**
 * PUT /api/historia/:id
 * Actualizar historia clínica
 */
router.put(
  '/:id',
  requireRole('especialista'),
  validate(idParamSchema, 'params'),
  validate(actualizarHistoriaSchema, 'body'),
  controller.actualizar
);

module.exports = router;