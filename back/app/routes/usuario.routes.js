// app/routes/usuario.routes.js
/**
 * routes/usuario.routes.js
 * Endpoints de usuarios.
 */

const { Router } = require('express');
const controller = require('../controllers/usuario.controller');

const router = Router();

// IMPORTANTE: /especialistas debe estar ANTES de /:documento
router.get('/especialistas', controller.listarEspecialistas);
router.get('/:documento', controller.obtenerPorDocumento);

module.exports = router;