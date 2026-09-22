// app/services/cita.service.js
const citaModel = require('../models/cita.model');
const mascotaModel = require('../models/mascota.model');
const disponibilidadModel = require('../models/disponibilidad.model');
const usuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');

async function listar(filtros) {
  return citaModel.findAll(filtros);
}

async function obtenerPorId(id_cita) {
  const cita = await citaModel.findById(id_cita);
  if (!cita) {
    throw AppError.notFound(`No existe cita con id ${id_cita}`);
  }
  return cita;
}

async function listarPorEspecialista(id_especialista) {
  const especialista = await usuarioModel.findByIdAndRol(id_especialista, 'especialista');
  if (!especialista) {
    throw AppError.notFound(`No existe especialista con ID ${id_especialista}`);
  }
  return citaModel.findByEspecialista(id_especialista);
}

async function crear({ id_mascota, id_disponibilidad, motivo, solicitante }) {
  const mascota = await mascotaModel.findById(id_mascota);
  if (!mascota) {
    throw AppError.notFound(`No existe la mascota con id ${id_mascota}`);
  }

  if (solicitante.rol === 'usuario') {
    const pertenece = await mascotaModel.perteneceAUsuario(id_mascota, solicitante.id);
    if (!pertenece) {
      throw AppError.forbidden('La mascota no pertenece al usuario autenticado');
    }
  }

  const disponibilidad = await disponibilidadModel.findById(id_disponibilidad);
  if (!disponibilidad) {
    throw AppError.notFound(`No existe disponibilidad con id ${id_disponibilidad}`);
  }
  if (disponibilidad.estado !== 'disponible') {
    throw AppError.conflict('La disponibilidad seleccionada no está disponible');
  }

  let id_recepcionista;
  if (solicitante.rol === 'recepcionista') {
    id_recepcionista = solicitante.id;
  } else {
    id_recepcionista = await citaModel.obtenerPrimerRecepcionista();
  }

  if (!id_recepcionista) {
    throw AppError.badRequest('No existe un recepcionista registrado para crear la cita');
  }

  try {
    return await citaModel.crearConTransaccion({
      id_mascota,
      id_disponibilidad,
      id_recepcionista,
      motivo
    });
  } catch (error) {
    if (error.code === 'DISPONIBILIDAD_NO_EXISTE') {
      throw AppError.notFound('La disponibilidad no existe');
    }
    if (error.code === 'DISPONIBILIDAD_NO_LIBRE') {
      throw AppError.conflict('La disponibilidad ya está ocupada');
    }
    throw error;
  }
}

async function editar(id_cita, cambios, solicitante) {
  const cita = await obtenerPorId(id_cita);

  // Restricción para usuarios
  if (solicitante.rol === 'usuario') {
    const esPropietario = await citaModel.perteneceAUsuario(id_cita, solicitante.id);
    if (!esPropietario) {
      throw AppError.forbidden('No tienes permiso para modificar esta cita porque no te pertenece');
    }
  }

  if (cambios.id_disponibilidad && cambios.id_disponibilidad !== cita.id_disponibilidad) {
    const nuevaDisponibilidad = await disponibilidadModel.findById(cambios.id_disponibilidad);
    if (!nuevaDisponibilidad) {
      throw AppError.notFound('La nueva disponibilidad no existe');
    }
    if (nuevaDisponibilidad.estado !== 'disponible') {
      throw AppError.conflict('La nueva disponibilidad no está disponible');
    }
  }

  return citaModel.editarConTransaccion(id_cita, cambios);
}

async function cancelar(id_cita, solicitante) {
  const cita = await obtenerPorId(id_cita);

  // Restricción para usuarios
  if (solicitante.rol === 'usuario') {
    const esPropietario = await citaModel.perteneceAUsuario(id_cita, solicitante.id);
    if (!esPropietario) {
      throw AppError.forbidden('No tienes permiso para cancelar esta cita porque no te pertenece');
    }
  }

  if (cita.estado === 'cancelado') {
    throw AppError.conflict('La cita ya está cancelada');
  }

  return citaModel.cancelarConTransaccion(id_cita);
}

module.exports = {
  listar,
  obtenerPorId,
  listarPorEspecialista,
  crear,
  editar,
  cancelar
};