// app/utils/jwt.js
/**
 * utils/jwt.js
 * Firma y verificación de tokens JWT para autenticación.
 *
 * Reemplaza el "mock-token-..." que se usaba antes: ahora el token
 * es un JWT real, firmado con JWT_SECRET, que el cliente debe enviar
 * en el header `Authorization: Bearer <token>` en cada petición.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huellitas_saludables_dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Genera un JWT firmado a partir de un usuario.
 * El payload solo incluye lo estrictamente necesario para autorizar
 * peticiones (id y rol); nunca la contraseña ni otros datos sensibles.
 */
function generarToken(usuario) {
  const payload = {
    id: usuario.id_usuario,
    rol: usuario.rol,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica un JWT y devuelve su payload decodificado.
 * Lanza si el token es inválido, está mal firmado o expiró.
 */
function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generarToken, verificarToken, JWT_SECRET, JWT_EXPIRES_IN };
