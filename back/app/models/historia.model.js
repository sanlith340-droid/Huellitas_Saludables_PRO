// app/models/historia.model.js
/**
 * Consultas de historia clínica usando Prisma.
 */

import { prisma } from '../config/prisma.js';
import { aIdEntero } from '../utils/sqlSeguro.js';

const INCLUDE_BASE = {
  cita: {
    select: {
      id_mascota: true,
      motivo: true,
      estado: true,
      mascota: {
        select: {
          nombre: true,
          especie: true,
          genero: true,
        },
      },
      disponibilidad: {
        select: {
          fecha: true,
          hora: true,
          especialista: {
            select: {
              id_usuario: true,
              nombre: true,
              apellidos: true,
              especializacion: true,
            },
          },
        },
      },
    },
  },
};

function aplanar(historia) {
  const cita = historia.cita || {};
  const mascota = cita.mascota || {};
  const disponibilidad = cita.disponibilidad || {};
  const especialista = disponibilidad.especialista || {};

  return {
    id_historia_clinica: historia.id_historia_clinica,
    id_cita: historia.id_cita,
    // DECIMAL(5,2) se conserva como texto con escala fija en el contrato JSON.
    peso: historia.peso == null ? null : historia.peso.toFixed(2),
    diagnostico: historia.diagnostico,
    tratamiento: historia.tratamiento,
    observaciones: historia.observaciones,
    fecha_registro: historia.fecha_registro,
    id_mascota: cita.id_mascota ?? null,
    mascota_nombre: mascota.nombre ?? null,
    mascota_especie: mascota.especie ?? null,
    mascota_genero: mascota.genero ?? null,
    cita_motivo: cita.motivo ?? null,
    cita_estado: cita.estado ?? null,
    fecha_cita: comoFechaISO(disponibilidad.fecha),
    hora_cita: comoHora(disponibilidad.hora),
    especialista_id: especialista.id_usuario ?? null,
    especialista_nombre: especialista.nombre ?? null,
    especialista_apellidos: especialista.apellidos ?? null,
    especializacion: especialista.especializacion ?? null,
  };
}

function comoFechaISO(value) {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function comoHora(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return [value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()]
      .map((parte) => String(parte).padStart(2, '0'))
      .join(':');
  }
  const match = String(value).match(/(?:T|^)(\d{2}:\d{2}:\d{2})/);
  return match ? match[1] : String(value).slice(0, 8);
}

function errorDominio(codigo) {
  const error = new Error(codigo);
  error.code = codigo;
  return error;
}

function comoIdNumerico(id) {
  return typeof id === 'number' ? id : Number(id);
}

function comoFecha(fecha) {
  return fecha instanceof Date ? fecha : new Date(fecha);
}

async function findAll({ id_mascota, id_especialista, fecha_inicio, fecha_fin } = {}) {
  const where = {};
  if (fecha_inicio || fecha_fin) {
    where.fecha_registro = {};
    if (fecha_inicio) where.fecha_registro.gte = comoFecha(fecha_inicio);
    if (fecha_fin) where.fecha_registro.lte = comoFecha(fecha_fin);
  }

  if (id_mascota || id_especialista) {
    const cita = {};
    if (id_mascota) cita.id_mascota = comoIdNumerico(id_mascota);
    if (id_especialista) {
      cita.disponibilidad = { is: { id_usuario: id_especialista } };
    }
    where.cita = { is: cita };
  }

  const historias = await prisma.historiaClinica.findMany({
    where,
    include: INCLUDE_BASE,
    orderBy: { fecha_registro: 'desc' },
  });

  return historias.map(aplanar);
}

async function findById(id_historia_clinica) {
  const historia = await prisma.historiaClinica.findUnique({
    where: { id_historia_clinica: comoIdNumerico(id_historia_clinica) },
    include: INCLUDE_BASE,
  });
  return historia ? aplanar(historia) : null;
}

async function findByCitaId(id_cita) {
  const historia = await prisma.historiaClinica.findUnique({
    where: { id_cita: comoIdNumerico(id_cita) },
    include: INCLUDE_BASE,
  });
  return historia ? aplanar(historia) : null;
}

async function findByMascota(id_mascota) {
  return findAll({ id_mascota });
}

async function findByIdConTransaccion(id_historia_clinica, tx) {
  const historia = await tx.historiaClinica.findUnique({
    where: { id_historia_clinica: comoIdNumerico(id_historia_clinica) },
    include: INCLUDE_BASE,
  });
  return historia ? aplanar(historia) : null;
}

async function crearConTransaccion({ id_cita, peso, diagnostico, tratamiento, observaciones, especialistaId }) {
  // Se valida antes de usarse como parámetro de la consulta cruda.
  const idCita = aIdEntero(id_cita, 'id_cita');
  try {
    return await prisma.$transaction(async (tx) => {
      const citas = await tx.$queryRaw`
        SELECT id_cita, id_disponibilidad
        FROM cita
        WHERE id_cita = ${idCita}
        FOR UPDATE
      `;
      const cita = citas[0];
      if (!cita) throw errorDominio('CITA_NO_EXISTE');

      const disponibilidad = await tx.disponibilidad.findUnique({
        where: { id_disponibilidad: cita.id_disponibilidad },
        select: { id_usuario: true },
      });
      const especialistaAsignado = disponibilidad ? disponibilidad.id_usuario : null;
      if (especialistaAsignado !== especialistaId) throw errorDominio('ESPECIALISTA_NO_ASIGNADO');

      const existente = await tx.historiaClinica.findUnique({
        where: { id_cita: idCita },
        select: { id_historia_clinica: true },
      });
      if (existente) throw errorDominio('HISTORIA_YA_EXISTE');

      const nuevaHistoria = await tx.historiaClinica.create({
        data: {
          id_cita: idCita,
          peso: peso || null,
          diagnostico,
          tratamiento,
          observaciones: observaciones || null,
        },
        select: { id_historia_clinica: true },
      });

      // El trigger SQL asociado a la tabla marca la cita como "atendido".
      return findByIdConTransaccion(nuevaHistoria.id_historia_clinica, tx);
    });
  } catch (error) {
    if (error?.code === 'P2002') throw errorDominio('HISTORIA_YA_EXISTE');
    throw error;
  }
}

async function actualizar(id_historia_clinica, cambios, especialistaId) {
  // Se valida antes de usarse como parámetro de la consulta cruda.
  const idHistoria = aIdEntero(id_historia_clinica, 'id_historia_clinica');
  return prisma.$transaction(async (tx) => {
    const bloqueadas = await tx.$queryRaw`
      SELECT id_historia_clinica
      FROM historia_clinica
      WHERE id_historia_clinica = ${idHistoria}
      FOR UPDATE
    `;
    if (bloqueadas.length === 0) throw errorDominio('HISTORIA_NO_EXISTE');

    const historia = await tx.historiaClinica.findUnique({
      where: { id_historia_clinica: idHistoria },
      include: {
        cita: {
          select: {
            disponibilidad: {
              select: { especialista: { select: { id_usuario: true } } },
            },
          },
        },
      },
    });
    if (!historia) throw errorDominio('HISTORIA_NO_EXISTE');

    const especialistaAsignado = historia.cita?.disponibilidad?.especialista?.id_usuario ?? null;
    if (especialistaAsignado !== especialistaId) throw errorDominio('ESPECIALISTA_NO_AUTORIZADO');

    const camposPermitidos = ['peso', 'diagnostico', 'tratamiento', 'observaciones'];
    const data = {};
    for (const campo of camposPermitidos) {
      if (cambios[campo] !== undefined) data[campo] = cambios[campo];
    }

    if (Object.keys(data).length > 0) {
      try {
        await tx.historiaClinica.update({ where: { id_historia_clinica: idHistoria }, data });
      } catch (error) {
        if (error?.code === 'P2025') throw errorDominio('HISTORIA_NO_EXISTE');
        throw error;
      }
    }

    return findByIdConTransaccion(idHistoria, tx);
  });
}

export { findAll, findById, findByCitaId, findByMascota, crearConTransaccion, actualizar };
export default { findAll, findById, findByCitaId, findByMascota, crearConTransaccion, actualizar };
