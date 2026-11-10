// app/middlewares/auditLog.js
/**
 * middlewares/auditLog.js
 * Registro de auditoría para acciones administrativas.
 */

const ROLES_AUDITADOS = ['recepcionista', 'admin'];
const METODOS_AUDITADOS = ['POST', 'PUT', 'PATCH', 'DELETE'];
import logger from '../utils/logger.js';

function auditLog(req, res, next) {
  if (!METODOS_AUDITADOS.includes(req.method)) return next();

  res.on('finish', () => {
    if (process.env.NODE_ENV === 'production' || !logger.isLevelEnabled('info')) return;
    const rol = req.user?.rol;
    if (!ROLES_AUDITADOS.includes(rol)) return;

    const registro = {
      fecha: new Date().toISOString(),
      usuario: req.user?.id || 'desconocido',
      rol,
      accion: `${req.method} ${req.path}`,
      resultado: res.statusCode,
    };

    logger.info({ event: 'audit.action', ...registro }, 'Acción auditada');
  });

  next();
}

export default auditLog;
