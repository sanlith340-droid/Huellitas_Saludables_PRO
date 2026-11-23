import nodemailer from 'nodemailer';
import AppError from '../utils/AppError.js';

function required(name) {
  const value = process.env[name]?.trim();
  return value || null;
}

function smtpConfig() {
  const host = required('SMTP_HOST');
  const user = required('SMTP_USER');
  const pass = required('SMTP_PASS');
  const from = required('SMTP_FROM');
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  if (!host || !user || !pass || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  return { host, port, secure, auth: { user, pass }, from };
}

function transporter() {
  const config = smtpConfig();
  if (!config) {
    throw AppError.serviceUnavailable('El correo de recuperación no está disponible temporalmente.');
  }
  return { transport: nodemailer.createTransport(config), from: config.from };
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

async function enviarCorreoRecuperacion({ correo, nombre, token, expiraEn }) {
  const { transport, from } = transporter();
  const frontendUrl = required('FRONTEND_URL');
  if (!frontendUrl) throw AppError.serviceUnavailable('El correo de recuperación no está disponible temporalmente.');
  const link = `${frontendUrl.replace(/\/$/u, '')}/nueva-contrasena?token=${encodeURIComponent(token)}`;
  const minutos = Math.max(1, Math.ceil((expiraEn.getTime() - Date.now()) / 60000));
  const saludo = escapeHtml(nombre || '');
  await transport.sendMail({
    from,
    to: correo,
    subject: 'Recupera tu contraseña | Huellitas Saludables',
    text: `Hola ${nombre || ''}, solicita el cambio de contraseña en ${link}. El enlace vence en ${minutos} minutos y solo puede usarse una vez. Si no lo solicitaste, ignora este correo.`,
    html: `<!doctype html><html lang="es"><body style="margin:0;background:#ebf2e4;font-family:Arial,sans-serif;color:#232b23"><div style="max-width:600px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden"><div style="background:#365939;color:#ebf2e4;padding:28px;text-align:center"><h1 style="margin:0;font-size:24px">Huellitas Saludables</h1><p style="margin:8px 0 0">Cuidamos su salud, cuidamos tu tranquilidad.</p></div><div style="padding:32px"><p>Hola${saludo ? ` ${saludo}` : ''},</p><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p><p style="text-align:center;margin:28px 0"><a href="${link}" style="display:inline-block;background:#5a8c66;color:#fff;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Crear nueva contraseña</a></p><p style="font-size:14px;color:#55594f">Este enlace vence en ${minutos} minutos y solo puede usarse una vez. Si no solicitaste este cambio, puedes ignorar este correo.</p></div></div></body></html>`,
  });
}

export { smtpConfig, enviarCorreoRecuperacion };
export default { smtpConfig, enviarCorreoRecuperacion };
