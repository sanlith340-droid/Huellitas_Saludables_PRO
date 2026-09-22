// app/routes/disponibilidad.routes.js
/**
 * routes/disponibilidad.routes.js
 * Endpoints de disponibilidad.
 */

const { Router } = require('express');
const controller = require('../controllers/disponibilidad.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const {
  crearDisponibilidadSchema,
  actualizarDisponibilidadSchema,
  idParamSchema,
  listarDisponibilidadQuerySchema,
  especialistaParamSchema,
  listarPorEspecialistaQuerySchema
} = require('../schemas/disponibilidad.schema');

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

module.exports = router;