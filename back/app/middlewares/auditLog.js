// app/middlewares/auditLog.js
/**
 * middlewares/auditLog.js
 * Registro de auditoría para acciones administrativas.
 */

const ROLES_AUDITADOS = ['recepcionista', 'admin'];
const METODOS_AUDITADOS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function auditLog(req, res, next) {
  if (!METODOS_AUDITADOS.includes(req.method)) return next();

  res.on('finish', () => {
    const rol = req.user?.rol;
    if (!ROLES_AUDITADOS.includes(rol)) return;

    const registro = {
      fecha: new Date().toISOString(),
      usuario: req.user?.id || 'desconocido',
      rol,
      accion: `${req.method} ${req.originalUrl}`,
      resultado: res.statusCode,
    };

    console.log('[auditoria]', JSON.stringify(registro));
  });

  next();
}

module.exports = auditLog;