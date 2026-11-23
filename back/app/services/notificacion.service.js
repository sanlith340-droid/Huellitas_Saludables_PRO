// app/services/notificacion.service.js
/**
 * RF09: avisos persistentes dentro de la aplicación para especialistas.
 * No se envía correo, SMS ni push porque el proyecto no configura esos canales.
 */
import notificacionModel from '../models/notificacion.model.js';

const TIPO = Object.freeze({
  NUEVA_CITA: 'nueva_cita',
  CAMBIO_CITA: 'cambio_cita',
  CAMBIO_ESTADO_CITA: 'cambio_estado_cita',
  CAMBIO_DISPONIBILIDAD: 'cambio_disponibilidad',
});

function fechaHoraCita(cita = {}) {
  const fecha = cita.fecha_cita || 'fecha por confirmar';
  const hora = String(cita.hora_cita || '').slice(0, 5);
  return hora ? `${fecha} a las ${hora}` : fecha;
}

async function enviar({ destinatarioId, tipo, asunto, mensaje, id_cita = null, id_disponibilidad = null }) {
  if (!destinatarioId) return null;
  return notificacionModel.crear({
    id_usuario: destinatarioId,
    tipo,
    asunto,
    mensaje,
    id_cita,
    id_disponibilidad,
  });
}

async function notificarNuevaCita({ veterinarioId, cita }) {
  return enviar({
    destinatarioId: veterinarioId,
    tipo: TIPO.NUEVA_CITA,
    asunto: 'Nueva cita asignada',
    mensaje: `Se asignó una nueva cita para el ${fechaHoraCita(cita)}. Consulta tu agenda para ver los detalles.`,
    id_cita: cita?.id_cita ?? null,
  });
}

async function notificarCambioCita({ veterinarioId, cita }) {
  return enviar({
    destinatarioId: veterinarioId,
    tipo: TIPO.CAMBIO_CITA,
    asunto: 'Cita actualizada',
    mensaje: `La cita #${cita?.id_cita ?? ''} fue modificada. Revisa tu agenda para consultar la información actualizada.`,
    id_cita: cita?.id_cita ?? null,
  });
}

async function notificarCambioEstadoCita({ veterinarioId, cita }) {
  return enviar({
    destinatarioId: veterinarioId,
    tipo: TIPO.CAMBIO_ESTADO_CITA,
    asunto: 'Cambio de estado en una cita',
    mensaje: `La cita #${cita?.id_cita ?? ''} cambió al estado "${cita?.estado ?? 'actualizado'}".`,
    id_cita: cita?.id_cita ?? null,
  });
}

async function notificarCambioDisponibilidad({ veterinarioId, disponibilidad, accion = 'actualizada' }) {
  const fecha = disponibilidad?.fecha || 'fecha por confirmar';
  const hora = String(disponibilidad?.hora || '').slice(0, 5);
  const momento = hora ? `${fecha} a las ${hora}` : fecha;
  const estado = disponibilidad?.estado ? ` Estado actual: ${disponibilidad.estado}.` : '';
  return enviar({
    destinatarioId: veterinarioId,
    tipo: TIPO.CAMBIO_DISPONIBILIDAD,
    asunto: 'Cambio en tu disponibilidad',
    mensaje: `La franja del ${momento} fue ${accion}.${estado}`,
    id_disponibilidad: disponibilidad?.id_disponibilidad ?? null,
  });
}

async function listarParaUsuario(id_usuario) {
  return notificacionModel.listarPorUsuario(id_usuario, 50);
}

async function marcarComoLeida(id_notificacion, id_usuario) {
  return notificacionModel.marcarComoLeida(id_notificacion, id_usuario);
}

async function marcarTodasComoLeidas(id_usuario) {
  const resultado = await notificacionModel.marcarTodasComoLeidas(id_usuario);
  return resultado.count;
}

export {
  TIPO,
  listarParaUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  notificarNuevaCita,
  notificarCambioCita,
  notificarCambioEstadoCita,
  notificarCambioDisponibilidad,
};
export default {
  TIPO,
  listarParaUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  notificarNuevaCita,
  notificarCambioCita,
  notificarCambioEstadoCita,
  notificarCambioDisponibilidad,
};
