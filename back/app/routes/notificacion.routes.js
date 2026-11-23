// app/routes/notificacion.routes.js
import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/notificacion.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { idNotificacionParamSchema } from '../schemas/notificacion.schema.js';

const router = Router();
router.use(requireRole('especialista'));

router.get('/', controller.listar);
router.patch('/leer-todas', controller.marcarTodasComoLeidas);
router.patch('/:id/leida', validate(idNotificacionParamSchema, 'params'), controller.marcarComoLeida);

export default router;
