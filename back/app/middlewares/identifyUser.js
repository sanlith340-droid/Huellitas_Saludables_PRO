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

const { Usuario } = require('../models');
const { verificarToken } = require('../utils/jwt');
const { mensajeSinPermiso, nombreRol } = require('../utils/roleMessages');

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

const identifyUser = async (req, res, next) => {
  if (isPublicRoute(req)) {
    return next();
  }

  try {
    // ============================================================
    // LEER Y VERIFICAR EL JWT
    // ============================================================
    const token = extraerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Falta el token de autenticación. Envía el header Authorization: Bearer <token>.',
        code: 'UNAUTHORIZED'
      });
    }

    let payload;
    try {
      payload = verificarToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado. Inicia sesión nuevamente.',
        code: 'UNAUTHORIZED'
      });
    }

    // ============================================================
    // VERIFICAR QUE EL USUARIO SIGA EXISTIENDO EN BD
    // (por si fue eliminado o su rol cambió después de emitido el token)
    // ============================================================
    const usuarioEncontrado = await Usuario.findByPk(String(payload.id).trim(), {
      attributes: ['id_usuario', 'rol'],
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        success: false,
        message: 'El usuario del token ya no existe',
        code: 'UNAUTHORIZED'
      });
    }

    const usuario = usuarioEncontrado.get({ plain: true });
    const rolReal = String(usuario.rol).trim().toLowerCase();

    // ============================================================
    // AUTENTICACIÓN EXITOSA
    // ============================================================
    req.user = {
      id: usuario.id_usuario,
      rol: rolReal
    };

    next();
  } catch {
    console.error('[identifyUser] Error interno al validar la sesión');
    return res.status(500).json({
      success: false,
      message: 'Error al validar el usuario',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (isPublicRoute(req)) {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    const rolUsuario = String(req.user.rol).trim().toLowerCase();
    const roles = rolesPermitidos.map(r => String(r).trim().toLowerCase());

    if (!roles.includes(rolUsuario)) {
      const rolesPermitidosTexto = roles.map(nombreRol).join(' o ');
      return res.status(403).json({
        success: false,
        message: `${mensajeSinPermiso(rolUsuario)} Esta acción está disponible para ${rolesPermitidosTexto}.`,
        code: 'FORBIDDEN',
        details: {
          rol_actual: req.user.rol,
          roles_permitidos: rolesPermitidos
        }
      });
    }

    next();
  };
};

module.exports = { identifyUser, requireRole };
