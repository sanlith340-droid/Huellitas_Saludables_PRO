// app/routes/usuario.routes.js
/**
 * routes/usuario.routes.js
 * Endpoints de usuarios.
 */

const { Router } = require('express');
const controller = require('../controllers/usuario.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const { idUsuarioParamSchema } = require('../schemas/usuario.schema');

const router = Router();

// IMPORTANTE: /especialistas debe estar ANTES de /:documento
router.get('/especialistas', controller.listarEspecialistas);

// Solo administrador: personal de la clínica (debe ir ANTES de /:documento)
router.get('/personal', requireRole('admin'), controller.listarPersonal);

router.get('/:documento', controller.obtenerPorDocumento);

// Solo administrador: elimina cuentas de especialistas y recepcionistas
router.delete(
  '/:id',
  requireRole('admin'),
  validate(idUsuarioParamSchema, 'params'),
  controller.eliminar
);

module.exports = router;