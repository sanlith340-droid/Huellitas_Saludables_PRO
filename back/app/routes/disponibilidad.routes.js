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
  listarDisponibilidadQuerySchema
} = require('../schemas/disponibilidad.schema');

const router = Router();

router.get('/', validate(listarDisponibilidadQuerySchema, 'query'), controller.listar);
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