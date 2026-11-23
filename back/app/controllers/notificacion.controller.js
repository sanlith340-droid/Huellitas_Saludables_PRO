// app/controllers/notificacion.controller.js
import notificacionService from '../services/notificacion.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import AppError from '../utils/AppError.js';

function obtenerEspecialista(req) {
  if (!req.user || req.user.rol !== 'especialista') {
    throw AppError.forbidden('Las notificaciones están disponibles para especialistas.');
  }
  return req.user.id;
}

const listar = asyncHandler(async (req, res) => {
  const datos = await notificacionService.listarParaUsuario(obtenerEspecialista(req));
  return ok(res, datos, 'Notificaciones listadas correctamente');
});

const marcarComoLeida = asyncHandler(async (req, res) => {
  const notificacion = await notificacionService.marcarComoLeida(
    req.params.id,
    obtenerEspecialista(req),
  );
  if (!notificacion) throw AppError.notFound('No existe la notificación solicitada.');
  return ok(res, notificacion, 'Notificación marcada como leída');
});

const marcarTodasComoLeidas = asyncHandler(async (req, res) => {
  const actualizadas = await notificacionService.marcarTodasComoLeidas(obtenerEspecialista(req));
  return ok(res, { actualizadas }, 'Notificaciones marcadas como leídas');
});

export { listar, marcarComoLeida, marcarTodasComoLeidas };
export default { listar, marcarComoLeida, marcarTodasComoLeidas };
