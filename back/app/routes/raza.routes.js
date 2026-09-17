// app/routes/raza.routes.js
/**
 * routes/raza.routes.js
 * Endpoints de razas.
 */

const { Router } = require('express');
const controller = require('../controllers/raza.controller');

const router = Router();

router.get('/', controller.listar);

module.exports = router;
