// app/services/usuario.service.js
/**
 * services/usuario.service.js
 * Lógica de negocio de usuarios.
 */

const usuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');

async function obtenerPorDocumento(documento) {
  const usuario = await usuarioModel.findByDocumento(documento);
  if (!usuario) {
    throw AppError.notFound(`No existe un usuario con ID ${documento}`);
  }
  return usuario;
}

async function listarEspecialistas() {
  return usuarioModel.findEspecialistas();
}

// Únicos roles cuyas cuentas puede eliminar el administrador
const ROLES_ELIMINABLES = ['especialista', 'recepcionista'];

async function listarPersonal() {
  const personal = await usuarioModel.findPersonal();
  const citas = await usuarioModel.contarCitasPorPersonal();

  return personal.map((u) => {
    const total = citas.get(u.id_usuario) || 0;
    return {
      ...u,
      citas_asociadas: total,
      puede_eliminar: ROLES_ELIMINABLES.includes(u.rol) && total === 0,
    };
  });
}

async function eliminarCuenta(id_usuario) {
  const usuario = await usuarioModel.findById(id_usuario);
  if (!usuario) {
    throw AppError.notFound(`No existe un usuario con ID ${id_usuario}`);
  }

  if (!ROLES_ELIMINABLES.includes(usuario.rol)) {
    throw AppError.forbidden(
      'Solo se pueden eliminar cuentas de especialistas y recepcionistas'
    );
  }

  const mensajeConCitas = (total) =>
    `No se puede eliminar: la cuenta tiene ${total} cita(s) asociada(s). ` +
    'Se conserva para no perder el historial de citas e historias clínicas.';

  const total = await usuarioModel.contarCitasDe(id_usuario, usuario.rol);
  if (total > 0) {
    throw AppError.conflict(mensajeConCitas(total));
  }

  try {
    await usuarioModel.eliminar(id_usuario);
  } catch (error) {
    // Una cita pudo crearse justo entre la verificación y el borrado
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw AppError.conflict(mensajeConCitas('varias'));
    }
    throw error;
  }

  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    rol: usuario.rol,
  };
}

module.exports = {
  listarPersonal,
  eliminarCuenta,
  obtenerPorDocumento,
  listarEspecialistas
};