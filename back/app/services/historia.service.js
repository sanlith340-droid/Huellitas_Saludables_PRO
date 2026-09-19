// app/services/historia.service.js
/**
 * services/historia.service.js
 * Lógica de negocio de historia clínica.
 */

const historiaModel = require('../models/historia.model');
const citaModel = require('../models/cita.model');
const mascotaModel = require('../models/mascota.model');
const usuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');

/**
 * Listar historias clínicas con filtros
 */
async function listar(filtros) {
  return historiaModel.findAll(filtros);
}

/**
 * Obtener historia clínica por ID
 */
async function obtenerPorId(id_historia_clinica) {
  const historia = await historiaModel.findById(id_historia_clinica);
  if (!historia) {
    throw AppError.notFound(`No existe historia clínica con id ${id_historia_clinica}`);
  }
  return historia;
}

/**
 * Obtener historias por mascota
 */
async function obtenerPorMascota(id_mascota) {
  const mascota = await mascotaModel.findById(id_mascota);
  if (!mascota) {
    throw AppError.notFound(`No existe la mascota con id ${id_mascota}`);
  }
  return historiaModel.findByMascota(id_mascota);
}

/**
 * Obtener historia por cita
 */
async function obtenerPorCita(id_cita) {
  const cita = await citaModel.findById(id_cita);
  if (!cita) {
    throw AppError.notFound(`No existe cita con id ${id_cita}`);
  }
  const historia = await historiaModel.findByCitaId(id_cita);
  if (!historia) {
    throw AppError.notFound(`No existe historia clínica para la cita ${id_cita}`);
  }
  return historia;
}

/**
 * Crear historia clínica (solo especialista asignado)
 */
async function crear({ id_cita, peso, diagnostico, tratamiento, observaciones, especialistaId }) {
  // 1. Validar que el especialista existe
  const especialista = await usuarioModel.findByIdAndRol(especialistaId, 'especialista');
  if (!especialista) {
    throw AppError.forbidden('Solo los especialistas pueden crear historias clínicas');
  }

  // 2. Validar que la cita existe
  const cita = await citaModel.findById(id_cita);
  if (!cita) {
    throw AppError.notFound(`No existe cita con id ${id_cita}`);
  }

  // 3. Verificar que la cita no esté cancelada
  if (cita.estado === 'cancelado') {
    throw AppError.conflict('No se puede crear historia clínica para una cita cancelada');
  }

  // 4. Verificar que la cita no tenga ya historia
  const existeHistoria = await historiaModel.findByCitaId(id_cita);
  if (existeHistoria) {
    throw AppError.conflict('La cita ya tiene una historia clínica asignada');
  }

  try {
    return await historiaModel.crearConTransaccion({
      id_cita,
      peso,
      diagnostico,
      tratamiento,
      observaciones,
      especialistaId
    });
  } catch (error) {
    if (error.code === 'CITA_NO_EXISTE') {
      throw AppError.notFound('La cita no existe');
    }
    if (error.code === 'ESPECIALISTA_NO_ASIGNADO') {
      throw AppError.forbidden('El especialista no está asignado a esta cita');
    }
    if (error.code === 'HISTORIA_YA_EXISTE') {
      throw AppError.conflict('La cita ya tiene una historia clínica');
    }
    throw error;
  }
}

/**
 * Actualizar historia clínica (solo especialista dueño)
 */
async function actualizar(id_historia_clinica, cambios, especialistaId) {
  // 1. Validar que el especialista existe
  const especialista = await usuarioModel.findByIdAndRol(especialistaId, 'especialista');
  if (!especialista) {
    throw AppError.forbidden('Solo los especialistas pueden actualizar historias clínicas');
  }

  // 2. Verificar que la historia existe
  const historia = await historiaModel.findById(id_historia_clinica);
  if (!historia) {
    throw AppError.notFound(`No existe historia clínica con id ${id_historia_clinica}`);
  }

  // 3. Validar que al menos un campo se va a actualizar
  const camposPermitidos = ['peso', 'diagnostico', 'tratamiento', 'observaciones'];
  const tieneCambios = camposPermitidos.some(campo => cambios[campo] !== undefined);
  if (!tieneCambios) {
    throw AppError.badRequest('Debe proporcionar al menos un campo para actualizar');
  }

  try {
    return await historiaModel.actualizar(id_historia_clinica, cambios, especialistaId);
  } catch (error) {
    if (error.code === 'HISTORIA_NO_EXISTE') {
      throw AppError.notFound('La historia clínica no existe');
    }
    if (error.code === 'ESPECIALISTA_NO_AUTORIZADO') {
      throw AppError.forbidden('No tiene permisos para modificar esta historia clínica');
    }
    throw error;
  }
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorMascota,
  obtenerPorCita,
  crear,
  actualizar
};