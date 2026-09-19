// app/services/disponibilidad.service.js
/**
 * services/disponibilidad.service.js
 * Lógica de negocio de disponibilidad.
 */

const disponibilidadModel = require('../models/disponibilidad.model');
const usuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');

async function listar(filtros) {
  return disponibilidadModel.findAll(filtros);
}

async function obtenerPorId(id) {
  const disponibilidad = await disponibilidadModel.findById(id);
  if (!disponibilidad) {
    throw AppError.notFound(`No existe disponibilidad con id ${id}`);
  }
  return disponibilidad;
}

async function crear(datos) {
  // 1. Validar que el usuario sea especialista
  const especialista = await usuarioModel.findByIdAndRol(datos.id_usuario, 'especialista');
  if (!especialista) {
    throw AppError.badRequest(`El usuario ${datos.id_usuario} no es un especialista`);
  }

  // 2. Buscar una disponibilidad EXACTA (mismo especialista + misma fecha + misma hora).
  //    La comparación la hace PostgreSQL directamente, que maneja bien el tipo TIME.
  //    (En JavaScript no podemos comparar String(Date) === "08:00:00", nunca coincide).
  const duplicada = await disponibilidadModel.findExacta({
    id_usuario: datos.id_usuario,
    fecha: datos.fecha,
    hora: datos.hora,
  });

  if (duplicada) {
    throw AppError.conflict('El especialista ya tiene una disponibilidad para esa fecha y hora');
  }

  // 3. Crear la disponibilidad
  try {
    return await disponibilidadModel.create({
      id_usuario: datos.id_usuario,
      fecha: datos.fecha,
      hora: datos.hora,
      estado: datos.estado || 'disponible',
    });
  } catch (error) {
    // Si por alguna razón se escapa el duplicado, la BD lo detecta (unique constraint)
    if (error.code === '23505') {
      throw AppError.conflict('Ya existe una disponibilidad para ese especialista, fecha y hora');
    }
    throw error;
  }
}

async function actualizar(id, cambios) {
  const actual = await obtenerPorId(id);

  if (actual.estado === 'ocupado' && 
      (cambios.fecha !== undefined || cambios.hora !== undefined || cambios.id_usuario !== undefined)) {
    throw AppError.conflict('No se puede modificar fecha, hora o especialista de una disponibilidad ocupada');
  }

  if (cambios.id_usuario) {
    const especialista = await usuarioModel.findByIdAndRol(cambios.id_usuario, 'especialista');
    if (!especialista) {
      throw AppError.badRequest('El nuevo usuario no es un especialista');
    }
  }

  return disponibilidadModel.update(id, cambios);
}

async function eliminar(id) {
  const actual = await obtenerPorId(id);

  if (actual.estado === 'ocupado') {
    throw AppError.conflict('No se puede eliminar una disponibilidad ocupada');
  }

  return disponibilidadModel.remove(id);
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};