// app/routes/usuario.routes.js
/**
 * routes/usuario.routes.js
 * Endpoints de usuarios.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/usuario.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { idUsuarioParamSchema } from '../schemas/usuario.schema.js';

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

export default router;