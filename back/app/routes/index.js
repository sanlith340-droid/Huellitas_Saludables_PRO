// app/routes/index.js
/**
 * routes/index.js
 * Registro central de las rutas de la API.
 */

const { Router } = require('express');

const authRoutes = require('./auth.routes');
const mascotaRoutes = require('./mascota.routes');
const usuarioRoutes = require('./usuario.routes');
const citaRoutes = require('./cita.routes');
const disponibilidadRoutes = require('./disponibilidad.routes');
const historiaRoutes = require('./historia.routes');  // ← NUEVO
const razaRoutes = require('./raza.routes');

const router = Router();

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/mascotas', mascotaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/citas', citaRoutes);
router.use('/disponibilidad', disponibilidadRoutes);
router.use('/historia', historiaRoutes);  // ← NUEVO
router.use('/razas', razaRoutes);

module.exports = router;