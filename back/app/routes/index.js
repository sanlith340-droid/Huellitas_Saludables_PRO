// app/routes/index.js
/**
 * routes/index.js
 * Registro central de las rutas de la API.
 */

import expressPkg from 'express';
const { Router } = expressPkg;

import authRoutes from './auth.routes.js';
import mascotaRoutes from './mascota.routes.js';
import usuarioRoutes from './usuario.routes.js';
import citaRoutes from './cita.routes.js';
import disponibilidadRoutes from './disponibilidad.routes.js';
import historiaRoutes from './historia.routes.js';// ← NUEVO
import razaRoutes from './raza.routes.js';

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

export default router;