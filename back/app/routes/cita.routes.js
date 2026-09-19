// app/routes/cita.routes.js
/**
 * routes/cita.routes.js
 * Endpoints de citas.
 */

const { Router } = require('express');
const controller = require('../controllers/cita.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const {
  crearCitaSchema,
  idParamSchema,
  listarCitasQuerySchema
} = require('../schemas/cita.schema');

const router = Router();

router.get('/', validate(listarCitasQuerySchema, 'query'), controller.listar);
router.get('/:id', validate(idParamSchema, 'params'), controller.obtener);
router.get('/especialista/:id_especialista', controller.listarPorEspecialista);

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

module.exports = router;