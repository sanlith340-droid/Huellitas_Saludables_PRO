import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import authModel from '../models/auth.model.js';
import passwordResetTokenModel from '../models/passwordResetToken.model.js';
import { hashContrasena } from '../utils/password.js';
import AppError from '../utils/AppError.js';
import { enviarCorreoRecuperacion, smtpConfig } from './passwordResetEmail.service.js';

const MENSAJE_TOKEN_INVALIDO = 'El enlace no es válido, venció o ya fue utilizado. Solicita uno nuevo.';
const MENSAJE_SOLICITUD = 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.';

function ttlMinutes() {
  const value = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 30);
  return Number.isFinite(value) && value >= 1 && value <= 1440 ? value : 30;
}
function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
function normalizarCorreo(correo) { return correo.trim().toLowerCase(); }
function errorToken() { return AppError.badRequest(MENSAJE_TOKEN_INVALIDO); }

async function solicitarRecuperacion(correo) {
  const ahora = new Date();
  // Se valida SMTP antes de consultar usuarios para no variar la respuesta por existencia.
  if (!smtpConfig() || !process.env.FRONTEND_URL?.trim()) {
    throw AppError.serviceUnavailable('El correo de recuperación no está disponible temporalmente.');
  }
  const usuario = await authModel.findByEmail(normalizarCorreo(correo));
  if (!usuario) return { message: MENSAJE_SOLICITUD };
  const token = randomBytes(32).toString('hex');
  const expiraEn = new Date(ahora.getTime() + ttlMinutes() * 60 * 1000);
  const tokenHash = hashToken(token);
  await prisma.$transaction(async (tx) => {
    await passwordResetTokenModel.invalidatePrevious(usuario.id_usuario, ahora, tx);
    await passwordResetTokenModel.create({ tokenHash, id_usuario: usuario.id_usuario, expiraEn }, tx);
  });
  try {
    await enviarCorreoRecuperacion({ correo: usuario.correo, nombre: usuario.nombre, token, expiraEn });
  } catch (error) {
    // No dejamos un token activo que no pudo llegar a su destinatario.
    await prisma.passwordResetToken.updateMany({ where: { token_hash: tokenHash, usado_en: null }, data: { usado_en: new Date() } }).catch(() => {});
    throw error;
  }
  return { message: MENSAJE_SOLICITUD };
}

async function verificarToken(token) {
  const tokenValue = String(token || '');
  if (!/^[a-f0-9]{64}$/u.test(tokenValue)) throw errorToken();
  const tokenRecord = await passwordResetTokenModel.findUsableByHash(hashToken(tokenValue), new Date());
  if (!tokenRecord) throw errorToken();
  return { valido: true };
}

async function restablecerContrasena({ token, contrasena }) {
  const tokenValue = String(token || '');
  if (!/^[a-f0-9]{64}$/u.test(tokenValue)) throw errorToken();
  const nuevaHash = await hashContrasena(contrasena);
  const ahora = new Date();
  await prisma.$transaction(async (tx) => {
    const tokenRecord = await passwordResetTokenModel.findUsableByHash(hashToken(tokenValue), ahora, tx);
    if (!tokenRecord) throw errorToken();
    const claim = await passwordResetTokenModel.consume(tokenRecord.id_token_reset, ahora, tx);
    if (claim.count !== 1) throw errorToken();
    const updated = await tx.usuario.updateMany({ where: { id_usuario: tokenRecord.id_usuario }, data: { contrasena: nuevaHash } });
    if (updated.count !== 1) throw AppError.notFound('La cuenta ya no está disponible.');
  });
  return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
}

export { ttlMinutes, hashToken, solicitarRecuperacion, verificarToken, restablecerContrasena, MENSAJE_SOLICITUD, MENSAJE_TOKEN_INVALIDO };
export default { ttlMinutes, hashToken, solicitarRecuperacion, verificarToken, restablecerContrasena };
