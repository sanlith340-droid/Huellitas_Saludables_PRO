// app/routes/raza.routes.js
/**
 * routes/raza.routes.js
 * Endpoints de razas.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/raza.controller.js';

const router = Router();

router.get('/', controller.listar);

export default router;
