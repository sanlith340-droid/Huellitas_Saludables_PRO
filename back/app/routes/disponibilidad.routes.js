// app/routes/disponibilidad.routes.js
/**
 * routes/disponibilidad.routes.js
 * Endpoints de disponibilidad.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/disponibilidad.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { crearDisponibilidadSchema, actualizarDisponibilidadSchema, idParamSchema, listarDisponibilidadQuerySchema, especialistaParamSchema, listarPorEspecialistaQuerySchema } from '../schemas/disponibilidad.schema.js';

const router = Router();

router.get('/', validate(listarDisponibilidadQuerySchema, 'query'), controller.listar);

// IMPORTANTE: /especialista/:id_usuario debe estar ANTES de /:id
router.get(
  '/especialista/:id_usuario',
  validate(especialistaParamSchema, 'params'),
  validate(listarPorEspecialistaQuerySchema, 'query'),
  controller.listarPorEspecialista
);

router.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

router.post(
  '/',
  requireRole('recepcionista', 'admin'),
  validate(crearDisponibilidadSchema, 'body'),
  controller.crear
);

router.put(
  '/:id',
  requireRole('recepcionista', 'admin'),
  validate(idParamSchema, 'params'),
  validate(actualizarDisponibilidadSchema, 'body'),
  controller.actualizar
);

router.delete(
  '/:id',
  requireRole('recepcionista', 'admin'),
  validate(idParamSchema, 'params'),
  controller.eliminar
);

export default router;