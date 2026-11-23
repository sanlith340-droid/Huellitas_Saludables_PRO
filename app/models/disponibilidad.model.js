// app/models/disponibilidad.model.js
/**
 * Consultas de disponibilidad usando Prisma.
 */

import { prisma } from '../config/prisma.js';
import { claveAhoraBogota, obtenerAhora } from '../utils/fechaHora.js';

const SELECT_ESPECIALISTA = {
  nombre: true,
  apellidos: true,
  especializacion: true,
};

const ORDEN = [{ fecha: 'asc' }, { hora: 'asc' }];

/** Normaliza una fecha sin permitir que la zona horaria desplace el día. */
function aFechaISO(fecha) {
  return fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);
}

/** Prisma requiere Date para las columnas DateTime @db.Date y @db.Time. */
function aFechaPrisma(fecha) {
  return new Date(`${aFechaISO(fecha)}T00:00:00.000Z`);
}

function aHoraPrisma(hora) {
  if (hora instanceof Date) {
    return new Date(Date.UTC(
      1970,
      0,
      1,
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      hora.getUTCMilliseconds(),
    ));
  }

  const [horas, minutos, segundos = '0'] = String(hora).split(':');
  const [segundo, fraccion = '0'] = segundos.split('.');
  const milisegundos = Number(`0.${fraccion}`) * 1000;
  return new Date(Date.UTC(
    1970,
    0,
    1,
    Number(horas),
    Number(minutos),
    Number(segundo),
    Math.floor(milisegundos),
  ));
}

function formatearFecha(fecha) {
  return fecha instanceof Date ? fecha.toISOString().slice(0, 10) : String(fecha).slice(0, 10);
}

function formatearHora(hora) {
  if (hora instanceof Date) {
    return [hora.getUTCHours(), hora.getUTCMinutes(), hora.getUTCSeconds()]
      .map((parte) => String(parte).padStart(2, '0'))
      .join(':');
  }
  const coincidencia = String(hora).match(/(?:T|^)(\d{2}:\d{2}:\d{2})/);
  return coincidencia ? coincidencia[1] : String(hora).slice(0, 8);
}

function aplanar(disponibilidad) {
  const especialista = disponibilidad.especialista;
  return {
    id_disponibilidad: disponibilidad.id_disponibilidad,
    id_usuario: disponibilidad.id_usuario,
    fecha: formatearFecha(disponibilidad.fecha),
    hora: formatearHora(disponibilidad.hora),
    estado: disponibilidad.estado,
    especialista_nombre: especialista?.nombre ?? null,
    especialista_apellidos: especialista?.apellidos ?? null,
    especializacion: especialista?.especializacion ?? null,
  };
}

function construirWhere({ id_usuario, fecha, fecha_desde, fecha_hasta, estado, futuras } = {}) {
  const where = {};
  if (id_usuario) where.id_usuario = id_usuario;
  if (estado) where.estado = estado;

  if (fecha) {
    where.fecha = aFechaPrisma(fecha);
  } else if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha.gte = aFechaPrisma(fecha_desde);
    if (fecha_hasta) where.fecha.lte = aFechaPrisma(fecha_hasta);
  }

  if (futuras) {
    const [fechaActual, horaActual] = claveAhoraBogota(obtenerAhora()).split('T');
    where.AND = [{
      OR: [
        { fecha: { gt: aFechaPrisma(fechaActual) } },
        { fecha: aFechaPrisma(fechaActual), hora: { gt: aHoraPrisma(horaActual) } },
      ],
    }];
  }

  return where;
}

const INCLUDE_ESPECIALISTA = { especialista: { select: SELECT_ESPECIALISTA } };

/** Listado completo, sin paginar. */
async function findAll(filtros = {}) {
  const disponibilidades = await prisma.disponibilidad.findMany({
    where: construirWhere(filtros),
    include: INCLUDE_ESPECIALISTA,
    orderBy: ORDEN,
  });
  return disponibilidades.map(aplanar);
}

/** Cuenta ambos estados respetando los otros filtros e ignorando solo estado. */
async function contarPorEstado(filtros = {}) {
  const { estado, ...sinEstado } = filtros;
  const filas = await prisma.disponibilidad.groupBy({
    by: ['estado'],
    where: construirWhere(sinEstado),
    _count: { _all: true },
  });

  const resumen = { disponible: 0, ocupado: 0 };
  for (const fila of filas) {
    resumen[fila.estado] = fila._count._all;
  }
  return resumen;
}

/** Listado paginado con total y resumen por estado. */
async function findPaginado({ page, limit, ...filtros }) {
  const where = construirWhere(filtros);
  const [filas, total, resumen] = await Promise.all([
    prisma.disponibilidad.findMany({
      where,
      include: INCLUDE_ESPECIALISTA,
      orderBy: ORDEN,
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.disponibilidad.count({ where }),
    contarPorEstado(filtros),
  ]);

  return { filas: filas.map(aplanar), total, resumen };
}

async function findById(id_disponibilidad) {
  const disponibilidad = await prisma.disponibilidad.findUnique({
    where: { id_disponibilidad: Number(id_disponibilidad) },
    include: INCLUDE_ESPECIALISTA,
  });
  return disponibilidad ? aplanar(disponibilidad) : null;
}

/** Busca una disponibilidad exacta por especialista, día y hora, sin cambiar el día. */
async function findExacta({ id_usuario, fecha, hora }) {
  return prisma.disponibilidad.findFirst({
    where: {
      id_usuario,
      fecha: aFechaPrisma(fecha),
      hora: aHoraPrisma(hora),
    },
  });
}

async function create({ id_usuario, fecha, hora, estado }) {
  const nueva = await prisma.disponibilidad.create({
    data: {
      id_usuario,
      fecha: aFechaPrisma(fecha),
      hora: aHoraPrisma(hora),
      estado: estado || 'disponible',
    },
  });
  return {
    id_disponibilidad: nueva.id_disponibilidad,
    id_usuario: nueva.id_usuario,
    fecha: formatearFecha(nueva.fecha),
    hora: formatearHora(nueva.hora),
    estado: nueva.estado,
  };
}

async function update(id_disponibilidad, cambios) {
  const id = Number(id_disponibilidad);
  const existente = await prisma.disponibilidad.findUnique({ where: { id_disponibilidad: id } });
  if (!existente) return null;

  const camposPermitidos = ['id_usuario', 'fecha', 'hora', 'estado'];
  const data = {};
  for (const campo of camposPermitidos) {
    if (cambios[campo] !== undefined) {
      data[campo] = campo === 'fecha'
        ? aFechaPrisma(cambios[campo])
        : campo === 'hora'
          ? aHoraPrisma(cambios[campo])
          : cambios[campo];
    }
  }

  if (Object.keys(data).length === 0) return findById(id_disponibilidad);

  const disponibilidad = await prisma.disponibilidad.update({
    where: { id_disponibilidad: id },
    data,
  });
  return {
    id_disponibilidad: disponibilidad.id_disponibilidad,
    id_usuario: disponibilidad.id_usuario,
    fecha: formatearFecha(disponibilidad.fecha),
    hora: formatearHora(disponibilidad.hora),
    estado: disponibilidad.estado,
  };
}

async function remove(id_disponibilidad) {
  const id = Number(id_disponibilidad);
  const resultado = await prisma.disponibilidad.deleteMany({ where: { id_disponibilidad: id } });
  return resultado.count ? { id_disponibilidad: id } : null;
}

export { findAll, findPaginado, contarPorEstado, findById, findExacta, create, update, remove };
export default { findAll, findPaginado, contarPorEstado, findById, findExacta, create, update, remove };
