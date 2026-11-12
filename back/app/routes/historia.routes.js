// app/routes/historia.routes.js
/**
 * routes/historia.routes.js
 * Endpoints de historia clínica.
 * 
 * NOTA: Todos los endpoints requieren rol ESPECIALISTA
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/historia.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { crearHistoriaSchema, actualizarHistoriaSchema, idParamSchema, idMascotaParamSchema, idCitaParamSchema, listarHistoriaQuerySchema } from '../schemas/historia.schema.js';

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
  validate(idMascotaParamSchema, 'params'),
  controller.obtenerPorMascota
);

/**
 * GET /api/historia/cita/:id_cita
 * Obtener historia por cita
 */
router.get(
  '/cita/:id_cita',
  requireRole('especialista'),
  validate(idCitaParamSchema, 'params'),
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

export default router;