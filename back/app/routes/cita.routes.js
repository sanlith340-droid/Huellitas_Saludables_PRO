// app/routes/cita.routes.js
/**
 * routes/cita.routes.js
 * Endpoints de citas.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/cita.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import {
  crearCitaSchema,
  idParamSchema,
  listarCitasQuerySchema,
  listarCitasEspecialistaQuerySchema,
  especialistaParamSchema,
  cambiarEstadoCitaSchema
} from '../schemas/cita.schema.js';

const router = Router();

router.get('/', validate(listarCitasQuerySchema, 'query'), controller.listar);
router.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
router.get(
  '/especialista/:id_especialista',
  requireRole('especialista', 'recepcionista', 'admin'),
  validate(especialistaParamSchema, 'params'),
  validate(listarCitasEspecialistaQuerySchema, 'query'),
  controller.listarPorEspecialista
);

router.post(
  '/',
  requireRole('usuario', 'recepcionista', 'admin'),
  validate(crearCitaSchema, 'body'),
  controller.crear
);

router.put(
  '/:id',
  requireRole('usuario', 'recepcionista', 'admin'),
  validate(idParamSchema, 'params'),
  controller.editar
);

router.patch(
  '/:id/cancelar',
  requireRole('usuario', 'recepcionista', 'admin'),  // ← NO incluye 'especialista'
  validate(idParamSchema, 'params'),
  controller.cancelar
);

// El especialista decide: atendido | cancelado (+ dejar el horario disponible)
router.patch(
  '/:id/estado',
  requireRole('especialista', 'admin'),
  validate(idParamSchema, 'params'),
  validate(cambiarEstadoCitaSchema, 'body'),
  controller.cambiarEstado
);

export default router;