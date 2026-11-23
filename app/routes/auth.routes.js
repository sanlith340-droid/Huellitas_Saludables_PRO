// app/routes/auth.routes.js
/**
 * routes/auth.routes.js
 * Endpoints de autenticación.
 */

import expressPkg from 'express';
const { Router } = expressPkg;
import controller from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.js';
import { loginRateLimiter, registroRateLimiter, createAuthRateLimiter } from '../middlewares/authRateLimit.js';
import { requireRole } from '../middlewares/identifyUser.js';
import { loginSchema, registroSchema, registroAdminSchema } from '../schemas/auth.schema.js';
import { forgotPasswordSchema, verifyResetTokenSchema, resetPasswordSchema } from '../schemas/passwordReset.schema.js';

const router = Router();

// Públicos
router.post('/login', loginRateLimiter, validate(loginSchema, 'body'), controller.login);
router.post('/registro', registroRateLimiter, validate(registroSchema, 'body'), controller.registro);
router.post('/forgot-password', createAuthRateLimiter(), validate(forgotPasswordSchema, 'body'), controller.forgotPassword);
router.post('/verify-reset-token', createAuthRateLimiter(), validate(verifyResetTokenSchema, 'body'), controller.verifyResetToken);
router.post('/reset-password', createAuthRateLimiter(), validate(resetPasswordSchema, 'body'), controller.resetPassword);

// Solo admin - crear admin, especialista, recepcionista
router.post(
  '/registro-admin',
  requireRole('admin'),
  validate(registroAdminSchema, 'body'),
  controller.registroAdmin
);

// Autenticado
router.get('/perfil', controller.perfil);

// Autenticado - revoca el JWT con el que se hace la petición (cierre de sesión real)
router.post('/logout', controller.logout);

// Test
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working!' });
});

export default router;
