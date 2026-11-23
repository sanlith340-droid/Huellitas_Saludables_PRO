// app/models/notificacion.model.js
/**
 * Persistencia de notificaciones in-app. Todas las consultas de usuario quedan
 * acotadas al destinatario autenticado en la capa de servicio.
 */
import { prisma } from '../config/prisma.js';

const ORDEN_RECIENTE = [
  { fecha_creacion: 'desc' },
  { id_notificacion: 'desc' },
];

async function crear({
  id_usuario,
  tipo,
  asunto,
  mensaje,
  id_cita = null,
  id_disponibilidad = null,
}) {
  return prisma.notificacion.create({
    data: {
      id_usuario,
      tipo,
      asunto,
      mensaje,
      id_cita,
      id_disponibilidad,
    },
  });
}

async function listarPorUsuario(id_usuario, limite = 50) {
  const where = { id_usuario };
  const [notificaciones, no_leidas] = await Promise.all([
    prisma.notificacion.findMany({
      where,
      orderBy: ORDEN_RECIENTE,
      take: limite,
    }),
    prisma.notificacion.count({ where: { ...where, leida: false } }),
  ]);
  return { notificaciones, no_leidas };
}

async function buscarPorUsuario(id_notificacion, id_usuario) {
  return prisma.notificacion.findFirst({
    where: { id_notificacion: Number(id_notificacion), id_usuario },
  });
}

async function marcarComoLeida(id_notificacion, id_usuario) {
  const id = Number(id_notificacion);
  const actual = await buscarPorUsuario(id, id_usuario);
  if (!actual || actual.leida) return actual;

  await prisma.notificacion.updateMany({
    where: { id_notificacion: id, id_usuario, leida: false },
    data: { leida: true, leida_en: new Date() },
  });
  return buscarPorUsuario(id, id_usuario);
}

async function marcarTodasComoLeidas(id_usuario) {
  return prisma.notificacion.updateMany({
    where: { id_usuario, leida: false },
    data: { leida: true, leida_en: new Date() },
  });
}

export { crear, listarPorUsuario, buscarPorUsuario, marcarComoLeida, marcarTodasComoLeidas };
export default { crear, listarPorUsuario, buscarPorUsuario, marcarComoLeida, marcarTodasComoLeidas };
