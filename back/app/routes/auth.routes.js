// app/routes/auth.routes.js
/**
 * routes/auth.routes.js
 * Endpoints de autenticación.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { loginSchema, registroSchema, registroAdminSchema } from '../schemas/auth.schema.js';

const router = Router();

// Públicos
router.post('/login', validate(loginSchema, 'body'), controller.login);
router.post('/registro', validate(registroSchema, 'body'), controller.registro);

// Solo admin - crear admin, especialista, recepcionista
router.post(
  '/registro-admin',
  requireRole('admin'),
  validate(registroAdminSchema, 'body'),
  controller.registroAdmin
);

// Autenticado
router.get('/perfil', controller.perfil);

// Test
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working!' });
});

export default router;