// app/middlewares/identifyUser.js
/**
 * middlewares/identifyUser.js
 * Autenticación mediante JWT (header Authorization: Bearer <token>).
 *
 * Antes esto confiaba en los headers x-user-id / x-user-role, que
 * el propio cliente podía inventar libremente. Ahora el cliente
 * debe enviar el JWT que recibió en /api/auth/login (o /registro),
 * y aquí se verifica su firma; el id y el rol se leen del token
 * ya verificado, no de headers sueltos.
 */

import usuarioModel from '../models/usuario.model.js';
import { verificarToken } from '../utils/jwt.js';
import { mensajeSinPermiso, nombreRol } from '../utils/roleMessages.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================
// RUTAS PÚBLICAS - COINCIDENCIA EXACTA
// ============================================================
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/registro',
  '/health'
];

function isPublicRoute(req) {
  // Comparación EXACTA, no con startsWith
  const path = req.originalUrl.split('?')[0]; // Quita query params
  return PUBLIC_ROUTES.includes(path);
}

function extraerToken(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header) return null;
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) return null;
  return token;
}

const identifyUser = asyncHandler(async (req, _res, next) => {
  if (isPublicRoute(req)) return next();
  const token = extraerToken(req);
  if (!token) {
    throw AppError.unauthorized('Falta el token de autenticación. Envía el header Authorization: Bearer <token>.');
  }

  let payload;
  try {
    payload = verificarToken(token);
  } catch {
    throw AppError.unauthorized('Token inválido o expirado. Inicia sesión nuevamente.');
  }

  const usuarioEncontrado = await usuarioModel.findById(String(payload.id).trim());
  if (!usuarioEncontrado) throw AppError.unauthorized('El usuario del token ya no existe.');

  req.user = {
    id: usuarioEncontrado.id_usuario,
    rol: String(usuarioEncontrado.rol).trim().toLowerCase(),
  };
  return next();
});

const requireRole = (...rolesPermitidos) => {
  return (req, _res, next) => {
    if (isPublicRoute(req)) return next();
    if (!req.user) return next(AppError.unauthorized('Usuario no autenticado.'));
    const rolUsuario = String(req.user.rol).trim().toLowerCase();
    const roles = rolesPermitidos.map((rol) => String(rol).trim().toLowerCase());
    if (!roles.includes(rolUsuario)) {
      const rolesPermitidosTexto = roles.map(nombreRol).join(' o ');
      return next(AppError.forbidden(
        `${mensajeSinPermiso(rolUsuario)} Esta acción está disponible para ${rolesPermitidosTexto}.`,
        { rol_actual: req.user.rol, roles_permitidos: rolesPermitidos }
      ));
    }
    return next();
  };
};

export { identifyUser, requireRole };
export default { identifyUser, requireRole };
