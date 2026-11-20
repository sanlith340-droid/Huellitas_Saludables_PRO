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
 *
 * Además de la firma y la expiración, se comprueba que el `jti` del token no
 * esté en la lista de revocación (tabla `token_revocado`, alimentada por
 * POST /api/auth/logout). Si la consulta falla se aplica fallo seguro: la
 * petición NO se autoriza.
 */

import usuarioModel from '../models/usuario.model.js';
import tokenRevocadoModel from '../models/tokenRevocado.model.js';
import { verificarToken } from '../utils/jwt.js';
import { mensajeSinPermiso, nombreRol } from '../utils/roleMessages.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const MAX_LONGITUD_JTI = 64; // coincide con la columna token_revocado.jti VARCHAR(64)
const MENSAJE_TOKEN_INVALIDO = 'Token inválido o expirado. Inicia sesión nuevamente.';
const MENSAJE_SESION_CERRADA = 'La sesión ha sido cerrada. Inicia sesión nuevamente.';

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
    throw AppError.unauthorized(MENSAJE_TOKEN_INVALIDO);
  }

  // Contrato de seguridad: todo token debe traer `jti` (para poder revocarlo) y `exp`.
  // Los emitidos antes de este mecanismo (sin jti) se rechazan: hay que iniciar sesión de nuevo.
  const { jti, exp } = payload;
  if (typeof jti !== 'string' || jti === '' || jti.length > MAX_LONGITUD_JTI || !Number.isFinite(exp)) {
    throw AppError.unauthorized(MENSAJE_TOKEN_INVALIDO);
  }

  // Fallo seguro: si no se puede consultar la lista de revocación, no se autoriza.
  let revocado;
  try {
    revocado = await tokenRevocadoModel.estaRevocado(jti);
  } catch {
    // Sin serializar el error técnico ni el jti para no filtrar datos al log.
    logger.error({ event: 'auth.revocation_check_failed' }, 'No se pudo consultar la lista de revocación de tokens');
    throw AppError.serviceUnavailable('No se pudo verificar la sesión. Inténtalo de nuevo más tarde.');
  }
  if (revocado) throw AppError.unauthorized(MENSAJE_SESION_CERRADA);

  const usuarioEncontrado = await usuarioModel.findById(String(payload.id).trim());
  if (!usuarioEncontrado) throw AppError.unauthorized('El usuario del token ya no existe.');

  req.user = {
    id: usuarioEncontrado.id_usuario,
    rol: String(usuarioEncontrado.rol).trim().toLowerCase(),
  };
  // Datos del token ya verificado; los usa POST /api/auth/logout para revocarlo.
  req.auth = { jti, exp };
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
