// app/services/disponibilidad.service.js
/**
 * services/disponibilidad.service.js
 * Lógica de negocio de disponibilidad.
 */

import disponibilidadModel from '../models/disponibilidad.model.js';
import usuarioModel from '../models/usuario.model.js';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { LIMITE_POR_DEFECTO } from '../schemas/disponibilidad.schema.js';
import { esFechaHoraPasada } from '../utils/fechaHora.js';

const MENSAJE_FECHA_PASADA = 'No se pueden crear franjas en el pasado. Selecciona una fecha y hora futuras (hora de Colombia).';

function validarFranjaFutura(fecha, hora) {
  if (esFechaHoraPasada(fecha, hora)) {
    throw AppError.badRequest(MENSAJE_FECHA_PASADA);
  }
}

/**
 * Arma el bloque "meta" de paginación que acompaña a la lista.
 */
function armarMeta({ total, page, limit, resumen }) {
  return {
    total,
    page,
    limit,
    total_paginas: Math.max(1, Math.ceil(total / limit)),
    resumen,
  };
}

/**
 * Lista disponibilidades con filtros (id_usuario, fecha, fecha_desde,
 * fecha_hasta, estado).
 *
 * Retorna siempre { datos, meta }:
 *   - Sin "page" ni "limit"  -> datos = TODAS las filas y meta = undefined
 *     (comportamiento original; lo usa la pantalla de Nueva cita).
 *   - Con "page" o "limit"   -> datos = la página pedida y meta = paginación
 *     + resumen de conteos por estado.
 */
async function listar(filtros = {}) {
  const { page, limit } = filtros;

  if (page === undefined && limit === undefined) {
    return { datos: await disponibilidadModel.findAll(filtros), meta: undefined };
  }

  const paginaActual = page || 1;
  const tamano = limit || LIMITE_POR_DEFECTO;

  const { filas, total, resumen } = await disponibilidadModel.findPaginado({
    ...filtros,
    page: paginaActual,
    limit: tamano,
  });

  return {
    datos: filas,
    meta: armarMeta({ total, page: paginaActual, limit: tamano, resumen }),
  };
}

/**
 * Lista las disponibilidades de UN especialista (filtrado por su id).
 * A diferencia de listar(), aquí SIEMPRE se pagina, para que la vista de
 * un especialista con muchas franjas nunca cargue todo de golpe.
 * Falla con 404 si el id no corresponde a un especialista.
 */
async function listarPorEspecialista(id_usuario, filtros = {}) {
  const especialista = await usuarioModel.findByIdAndRol(id_usuario, 'especialista');
  if (!especialista) {
    throw AppError.notFound(`No existe un especialista con id ${id_usuario}`);
  }

  const paginaActual = filtros.page || 1;
  const tamano = filtros.limit || LIMITE_POR_DEFECTO;

  const { filas, total, resumen } = await disponibilidadModel.findPaginado({
    ...filtros,
    id_usuario,
    page: paginaActual,
    limit: tamano,
  });

  return {
    datos: filas,
    meta: {
      ...armarMeta({ total, page: paginaActual, limit: tamano, resumen }),
      especialista: {
        id_usuario: especialista.id_usuario,
        nombre: especialista.nombre,
        apellidos: especialista.apellidos,
        especializacion: especialista.especializacion,
      },
    },
  };
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

  validarFranjaFutura(datos.fecha, datos.hora);

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
    if (error.code === 'P2002' || error.code === '23505') {
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

  if (cambios.fecha !== undefined || cambios.hora !== undefined) {
    validarFranjaFutura(cambios.fecha ?? actual.fecha, cambios.hora ?? actual.hora);
  }

  if (cambios.id_usuario) {
    const especialista = await usuarioModel.findByIdAndRol(cambios.id_usuario, 'especialista');
    if (!especialista) {
      throw AppError.badRequest('El nuevo usuario no es un especialista');
    }
  }

  try {
    return await disponibilidadModel.update(id, cambios);
  } catch (error) {
    if (error.code === 'P2002' || error.code === '23505') {
      throw AppError.conflict('Ya existe una disponibilidad para ese especialista, fecha y hora');
    }
    throw error;
  }
}

async function eliminar(id) {
  const actual = await obtenerPorId(id);

  if (actual.estado === 'ocupado') {
    throw AppError.conflict('No se puede eliminar una disponibilidad ocupada');
  }

  // Una cita (incluso cancelada) conserva la referencia para proteger el
  // historial. Se comprueba antes del DELETE para no depender del mensaje
  // técnico de la restricción de clave foránea.
  const citasAsociadas = await prisma.cita.count({
    where: { id_disponibilidad: Number(id) },
  });
  if (citasAsociadas > 0) {
    throw AppError.conflict(
      'No se puede eliminar esta disponibilidad porque tiene una cita asociada. Cancela o elimina primero la cita.'
    );
  }

  try {
    return await disponibilidadModel.remove(id);
  } catch (error) {
    // Prisma señala la restricción de clave foránea con P2003.
    if (error.code === 'P2003') {
      throw AppError.conflict(
        'No se puede eliminar esta disponibilidad porque tiene una cita asociada. Cancela o elimina primero la cita.'
      );
    }
    throw error;
  }
}

export { listar, listarPorEspecialista, obtenerPorId, crear, actualizar, eliminar };
export default { listar, listarPorEspecialista, obtenerPorId, crear, actualizar, eliminar };
