// app/routes/auth.routes.js
/**
 * routes/auth.routes.js
 * Endpoints de autenticación.
 */

const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/identifyUser');
const {
  loginSchema,
  registroSchema,
  registroAdminSchema
} = require('../schemas/auth.schema');

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

module.exports = router;