// app/utils/roleMessages.js
/**
 * Mensajes visibles para rechazos de autorización.
 * Se mantienen centralizados para que cada rol reciba una explicación clara
 * y consistente, sin exponer detalles internos de seguridad.
 */
const NOMBRES_ROL = {
  usuario: 'usuario',
  especialista: 'especialista',
  recepcionista: 'recepcionista',
  admin: 'administrador'
};

const MENSAJES_SIN_PERMISO = {
  usuario: 'Tu cuenta de usuario no tiene permisos para realizar esta acción. Solo el personal autorizado puede acceder a esta función.',
  especialista: 'Tu cuenta de especialista no tiene permisos para realizar esta acción. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.',
  recepcionista: 'Tu cuenta de recepcionista no tiene permisos para realizar esta acción. Esta función está reservada para especialistas o administradores.',
  admin: 'Tu cuenta de administrador no tiene permisos para realizar esta acción con la configuración actual. Verifica la operación solicitada.'
};

function mensajeSinPermiso(rol) {
  const rolNormalizado = String(rol || '').trim().toLowerCase();
  return MENSAJES_SIN_PERMISO[rolNormalizado]
    || 'Tu cuenta no tiene permisos para realizar esta acción. Verifica tu tipo de usuario o solicita apoyo al administrador.';
}

function nombreRol(rol) {
  const rolNormalizado = String(rol || '').trim().toLowerCase();
  return NOMBRES_ROL[rolNormalizado] || 'usuario';
}

module.exports = { mensajeSinPermiso, nombreRol };
