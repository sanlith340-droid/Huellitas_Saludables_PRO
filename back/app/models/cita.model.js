// app/models/cita.model.js
import { prisma } from '../config/prisma.js';
import { esFechaHoraPasada } from '../utils/fechaHora.js';

const INCLUDE_CITA = {
  mascota: {
    select: {
      nombre: true,
      especie: true,
      genero: true,
      propietarios: {
        orderBy: { id_usuario: 'asc' },
        take: 1,
        select: {
          usuario: { select: { nombre: true, apellidos: true, telefono: true } },
        },
      },
    },
  },
  disponibilidad: {
    select: {
      fecha: true,
      hora: true,
      estado: true,
      id_usuario: true,
      especialista: { select: { nombre: true, apellidos: true, especializacion: true } },
    },
  },
  recepcionista: { select: { nombre: true, apellidos: true } },
  cancelacion: true,
};

function comoIsoFecha(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
}

function comoHora(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return [value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()]
      .map((part) => String(part).padStart(2, '0'))
      .join(':');
  }
  const match = String(value).match(/^(\d{2}:\d{2}:\d{2})/);
  return match ? match[1] : String(value);
}

function aplanar(cita) {
  const disponibilidad = cita.disponibilidad ?? {};
  const especialista = disponibilidad.especialista ?? {};
  const mascota = cita.mascota ?? {};
  const propietario = mascota.propietarios?.[0]?.usuario ?? {};
  const recepcionista = cita.recepcionista ?? {};

  return {
    id_cita: cita.id_cita,
    id_recepcionista: cita.id_recepcionista,
    id_mascota: cita.id_mascota,
    id_disponibilidad: cita.id_disponibilidad,
    motivo: cita.motivo,
    estado: cita.estado,
    mascota_nombre: mascota.nombre ?? null,
    mascota_especie: mascota.especie ?? null,
    mascota_genero: mascota.genero ?? null,
    propietario_nombre: propietario.nombre
      ? `${propietario.nombre} ${propietario.apellidos || ''}`.trim()
      : null,
    propietario_telefono: propietario.telefono ?? null,
    fecha_cita: comoIsoFecha(disponibilidad.fecha),
    hora_cita: comoHora(disponibilidad.hora),
    disponibilidad_estado: disponibilidad.estado ?? null,
    id_especialista: disponibilidad.id_usuario ?? null,
    especialista_nombre: especialista.nombre ?? null,
    especialista_apellidos: especialista.apellidos ?? null,
    especializacion: especialista.especializacion ?? null,
    recepcionista_nombre: recepcionista.nombre ?? null,
    recepcionista_apellidos: recepcionista.apellidos ?? null,
    cancelacion: cita.cancelacion
      ? {
          id_usuario_actor: cita.cancelacion.id_usuario_actor,
          rol_actor: cita.cancelacion.rol_actor,
          origen: cita.cancelacion.origen,
          motivo: cita.cancelacion.motivo,
          cancelada_en: cita.cancelacion.cancelada_en?.toISOString?.() ?? null,
        }
      : null,
  };
}

function errorDominio(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function fechaPrisma(value) {
  if (value == null) return value;
  if (value instanceof Date) return value;
  return new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
}

async function findAll({
  id_mascota,
  estado,
  fecha,
  fecha_desde,
  fecha_hasta,
  id_especialista,
} = {}) {
  const where = {};
  if (id_mascota) where.id_mascota = Number(id_mascota);
  if (estado) where.estado = estado;

  const filtroDisponibilidad = {};
  if (fecha) {
    filtroDisponibilidad.fecha = fechaPrisma(fecha);
  } else if (fecha_desde || fecha_hasta) {
    filtroDisponibilidad.fecha = {};
    if (fecha_desde) filtroDisponibilidad.fecha.gte = fechaPrisma(fecha_desde);
    if (fecha_hasta) filtroDisponibilidad.fecha.lte = fechaPrisma(fecha_hasta);
  }
  if (id_especialista) filtroDisponibilidad.id_usuario = id_especialista;
  if (Object.keys(filtroDisponibilidad).length) {
    where.disponibilidad = { is: filtroDisponibilidad };
  }

  const citas = await prisma.cita.findMany({
    where,
    include: INCLUDE_CITA,
    orderBy: [
      { disponibilidad: { fecha: 'desc' } },
      { disponibilidad: { hora: 'desc' } },
    ],
  });
  return citas.map(aplanar);
}

async function findById(id_cita, { transaction } = {}) {
  const db = transaction ?? prisma;
  const cita = await db.cita.findUnique({
    where: { id_cita: Number(id_cita) },
    include: INCLUDE_CITA,
  });
  return cita ? aplanar(cita) : null;
}

async function findByEspecialista(id_especialista, filtros = {}) {
  return findAll({ ...filtros, id_especialista });
}

async function obtenerPrimerRecepcionista() {
  const recepcionista = await prisma.usuario.findFirst({
    where: { rol: 'recepcionista' },
    orderBy: { id_usuario: 'asc' },
    select: { id_usuario: true },
  });
  return recepcionista?.id_usuario ?? null;
}

async function bloquearDisponibilidad(tx, id_disponibilidad, ahora = null) {
  const rows = await tx.$queryRaw`
    SELECT id_disponibilidad, estado,
      (fecha + hora) > (
        COALESCE(${ahora}::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Bogota'
      ) AS futura
    FROM disponibilidad
    WHERE id_disponibilidad = ${Number(id_disponibilidad)}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

async function bloquearDisponibilidades(tx, ids, ahora = null) {
  const ordenados = [...new Set(ids.map(Number))].sort((a, b) => a - b);
  if (ordenados.length < 2) {
    const fila = await bloquearDisponibilidad(tx, ordenados[0], ahora);
    return fila ? [fila] : [];
  }
  return tx.$queryRaw`
    SELECT id_disponibilidad, estado,
      (fecha + hora) > (
        COALESCE(${ahora}::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Bogota'
      ) AS futura
    FROM disponibilidad
    WHERE id_disponibilidad = ${ordenados[0]}
       OR id_disponibilidad = ${ordenados[1]}
    ORDER BY id_disponibilidad
    FOR UPDATE
  `;
}

async function bloquearCita(tx, id_cita) {
  const rows = await tx.$queryRaw`
    SELECT id_cita, id_disponibilidad, estado
    FROM cita
    WHERE id_cita = ${Number(id_cita)}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

function normalizarError(error, contexto) {
  if (error?.code === 'P2025') {
    return errorDominio(contexto.cita ? 'CITA_NO_EXISTE' : 'REFERENCIA_NO_EXISTE', 'No se encontró el registro requerido');
  }
  if (error?.code === 'P2003') {
    if (contexto.disponibilidadNueva) {
      return errorDominio('NUEVA_DISPONIBILIDAD_NO_EXISTE', 'La nueva disponibilidad ya no existe');
    }
    if (contexto.disponibilidad) {
      return errorDominio('DISPONIBILIDAD_NO_EXISTE', 'La disponibilidad ya no existe');
    }
    return errorDominio('REFERENCIA_NO_EXISTE', 'Una referencia requerida ya no existe');
  }
  if (error?.code === 'P2002') {
    if (contexto.disponibilidadNueva) {
      return errorDominio('NUEVA_DISPONIBILIDAD_NO_LIBRE', 'La nueva disponibilidad ya está reservada');
    }
    if (contexto.disponibilidad) {
      return errorDominio('DISPONIBILIDAD_NO_LIBRE', 'La disponibilidad ya está reservada');
    }
  }
  return error;
}

async function crearConTransaccion({ id_mascota, id_disponibilidad, id_recepcionista, motivo, ahora = null }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const disponibilidad = await bloquearDisponibilidad(tx, id_disponibilidad, ahora);
      if (!disponibilidad) throw errorDominio('DISPONIBILIDAD_NO_EXISTE');
      if (disponibilidad.estado !== 'disponible') throw errorDominio('DISPONIBILIDAD_NO_LIBRE');
      if (!disponibilidad.futura) throw errorDominio('DISPONIBILIDAD_PASADA');

      const nuevaCita = await tx.cita.create({
        data: {
          id_recepcionista,
          id_mascota: Number(id_mascota),
          id_disponibilidad: Number(id_disponibilidad),
          motivo,
          estado: 'pendiente',
        },
        select: { id_cita: true },
      });
      // El trigger de la base de datos reserva la disponibilidad al insertar Cita.
      return findById(nuevaCita.id_cita, { transaction: tx });
    });
  } catch (error) {
    throw normalizarError(error, { disponibilidad: true });
  }
}

async function cancelarConTransaccion(id_cita, auditoria = {}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const filaCita = await bloquearCita(tx, id_cita);
      if (!filaCita) throw errorDominio('CITA_NO_EXISTE');
      await bloquearDisponibilidad(tx, filaCita.id_disponibilidad);
      if (filaCita.estado === 'cancelado') throw errorDominio('CITA_YA_CANCELADA');
      const horario = await tx.disponibilidad.findUnique({
        where: { id_disponibilidad: filaCita.id_disponibilidad },
        select: { fecha: true, hora: true },
      });
      await tx.cita.update({
        where: { id_cita: Number(id_cita) },
        data: { estado: 'cancelado' },
      });
      await tx.citaCancelacion.create({
        data: {
          id_cita: Number(id_cita),
          id_usuario_actor: auditoria.idUsuarioActor ?? null,
          rol_actor: auditoria.rolActor ?? 'sistema',
          origen: auditoria.origen ?? 'manual',
          motivo: auditoria.motivo ?? 'Cancelada manualmente.',
        },
      });
      if (horario && !esFechaHoraPasada(horario.fecha, horario.hora)) {
        await tx.disponibilidad.update({
          where: { id_disponibilidad: filaCita.id_disponibilidad },
          data: { estado: 'disponible' },
        });
      }
      return findById(id_cita, { transaction: tx });
    });
  } catch (error) {
    throw normalizarError(error, { cita: true });
  }
}

/**
 * Decisión del especialista: marcar la cita como 'atendido' o 'cancelado'.
 * Si se cancela y liberarHorario es true, el horario vuelve a estar disponible.
 */
async function cambiarEstadoConTransaccion(id_cita, estado, {
  liberarHorario = true,
  auditoria = {},
} = {}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const filaCita = await bloquearCita(tx, id_cita);
      if (!filaCita) throw errorDominio('CITA_NO_EXISTE');
      if (estado === 'cancelado' && filaCita.estado === 'cancelado') {
        throw errorDominio('CITA_YA_CANCELADA');
      }
      let horario = null;
      if (estado === 'cancelado' && liberarHorario) {
        await bloquearDisponibilidad(tx, filaCita.id_disponibilidad);
        horario = await tx.disponibilidad.findUnique({
          where: { id_disponibilidad: filaCita.id_disponibilidad },
          select: { fecha: true, hora: true },
        });
      }
      await tx.cita.update({ where: { id_cita: Number(id_cita) }, data: { estado } });
      if (estado === 'cancelado') {
        await tx.citaCancelacion.create({
          data: {
            id_cita: Number(id_cita),
            id_usuario_actor: auditoria.idUsuarioActor ?? null,
            rol_actor: auditoria.rolActor ?? 'sistema',
            origen: auditoria.origen ?? 'manual',
            motivo: auditoria.motivo ?? 'Cancelada manualmente.',
          },
        });
      }
      if (estado === 'cancelado' && liberarHorario && horario
        && !esFechaHoraPasada(horario.fecha, horario.hora)) {
        await tx.disponibilidad.update({
          where: { id_disponibilidad: filaCita.id_disponibilidad },
          data: { estado: 'disponible' },
        });
      }
      return findById(id_cita, { transaction: tx });
    });
  } catch (error) {
    throw normalizarError(error, { cita: true });
  }
}

/** Cancela en bloques citas pendientes/confirmadas cuyo horario local ya venció. */
async function cancelarVencidasAutomaticamente({ ahora = null, limite = 100 } = {}) {
  return prisma.$transaction(async (tx) => {
    const vencidas = await tx.$queryRaw`
      SELECT c.id_cita
      FROM cita c
      JOIN disponibilidad d ON d.id_disponibilidad = c.id_disponibilidad
      WHERE c.estado IN ('pendiente', 'confirmado')
        AND (d.fecha + d.hora) <= (
          COALESCE(${ahora}::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Bogota'
        )
      ORDER BY d.fecha ASC, d.hora ASC, c.id_cita ASC
      LIMIT ${limite}
      FOR UPDATE OF c SKIP LOCKED
    `;

    for (const { id_cita } of vencidas) {
      await tx.cita.update({
        where: { id_cita },
        data: { estado: 'cancelado' },
      });
      await tx.citaCancelacion.create({
        data: {
          id_cita,
          id_usuario_actor: null,
          rol_actor: 'sistema',
          origen: 'automatico',
          motivo: 'Cancelada automáticamente porque la fecha y hora de la cita ya pasaron.',
        },
      });
    }

    return vencidas.length;
  }, { timeout: 30000 });
}

async function editarConTransaccion(id_cita, cambios, { ahora = null } = {}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const filaCita = await bloquearCita(tx, id_cita);
      if (!filaCita) throw errorDominio('CITA_NO_EXISTE');

      const moverHorario = cambios.id_disponibilidad !== undefined
        && Number(cambios.id_disponibilidad) !== Number(filaCita.id_disponibilidad);
      if (moverHorario) {
        const horarios = await bloquearDisponibilidades(tx, [
          filaCita.id_disponibilidad,
          cambios.id_disponibilidad,
        ], ahora);
        const nueva = horarios.find((horario) =>
          Number(horario.id_disponibilidad) === Number(cambios.id_disponibilidad));
        if (!nueva) throw errorDominio('NUEVA_DISPONIBILIDAD_NO_EXISTE');
        if (nueva.estado !== 'disponible') throw errorDominio('NUEVA_DISPONIBILIDAD_NO_LIBRE');
        if (!nueva.futura) throw errorDominio('NUEVA_DISPONIBILIDAD_PASADA');

        // Se actualiza la cita y los dos horarios en una sola transacción.
        await tx.cita.update({
          where: { id_cita: Number(id_cita) },
          data: { id_disponibilidad: Number(cambios.id_disponibilidad) },
        });
        await tx.disponibilidad.update({
          where: { id_disponibilidad: filaCita.id_disponibilidad },
          data: { estado: 'disponible' },
        });
        await tx.disponibilidad.update({
          where: { id_disponibilidad: Number(cambios.id_disponibilidad) },
          data: { estado: 'ocupado' },
        });
      }

      const data = {};
      for (const campo of ['id_mascota', 'motivo']) {
        if (cambios[campo] !== undefined) data[campo] = cambios[campo];
      }
      if (!moverHorario && cambios.id_disponibilidad !== undefined) {
        data.id_disponibilidad = Number(cambios.id_disponibilidad);
      }
      if (Object.keys(data).length) {
        await tx.cita.update({ where: { id_cita: Number(id_cita) }, data });
      }
      return findById(id_cita, { transaction: tx });
    });
  } catch (error) {
    throw normalizarError(error, { cita: true, disponibilidadNueva: true });
  }
}

async function perteneceAUsuario(id_cita, id_usuario) {
  const cita = await prisma.cita.findUnique({
    where: { id_cita: Number(id_cita) },
    select: { id_mascota: true },
  });
  if (!cita) return false;
  const propietario = await prisma.usuarioMascota.findUnique({
    where: { id_usuario_id_mascota: { id_usuario, id_mascota: cita.id_mascota } },
    select: { id_usuario: true },
  });
  return Boolean(propietario);
}

export {
  findAll,
  findById,
  findByEspecialista,
  obtenerPrimerRecepcionista,
  crearConTransaccion,
  cancelarConTransaccion,
  cambiarEstadoConTransaccion,
  cancelarVencidasAutomaticamente,
  editarConTransaccion,
  perteneceAUsuario,
};

export default {
  findAll,
  findById,
  findByEspecialista,
  obtenerPrimerRecepcionista,
  crearConTransaccion,
  cancelarConTransaccion,
  cambiarEstadoConTransaccion,
  cancelarVencidasAutomaticamente,
  editarConTransaccion,
  perteneceAUsuario,
};
