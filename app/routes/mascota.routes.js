import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/mascota.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { crearMascotaSchema, idParamSchema } from '../schemas/mascota.schema.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', validate(idParamSchema, 'params'), controller.obtener);

router.post(
  '/',
  requireRole('usuario', 'admin'),
  validate(crearMascotaSchema, 'body'),
  controller.crear
);

export default router;