const { Router } = require('express');
const controller = require('../controllers/mascota.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const { crearMascotaSchema, idParamSchema } = require('../schemas/mascota.schema');

const router = Router();

router.get('/', controller.listar);
router.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

router.post(
  '/',
  requireRole('usuario', 'admin'),
  validate(crearMascotaSchema, 'body'),
  controller.crear
);

module.exports = router;