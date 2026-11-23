// app/models/tokenRevocado.model.js
/**
 * Lista de revocación de JWT con Prisma.
 * Solo se almacena el `jti` (identificador único del token) y su expiración;
 * nunca el JWT completo ni datos del usuario.
 */

import { prisma } from '../config/prisma.js';

/**
 * Registra un token como revocado. Es idempotente: si el `jti` ya estaba
 * registrado no crea un duplicado ni lanza error (INSERT ... ON CONFLICT DO NOTHING).
 * Devuelve true si se creó un registro nuevo y false si ya existía.
 */
async function revocar({ jti, expiraEn }) {
  const resultado = await prisma.tokenRevocado.createMany({
    data: [{ jti, expira_en: expiraEn }],
    skipDuplicates: true,
  });
  return resultado.count === 1;
}

/** Indica si el `jti` está en la lista de revocación (búsqueda por índice único). */
async function estaRevocado(jti) {
  return (await prisma.tokenRevocado.findUnique({
    where: { jti },
    select: { id_token_revocado: true },
  })) !== null;
}

/**
 * Elimina únicamente los registros cuyo token original ya expiró.
 * Un token expirado ya es rechazado por la verificación de la firma/expiración,
 * así que su registro de revocación deja de ser necesario.
 * Devuelve la cantidad de registros eliminados.
 */
async function eliminarExpirados(ahora = new Date()) {
  const resultado = await prisma.tokenRevocado.deleteMany({
    where: { expira_en: { lt: ahora } },
  });
  return resultado.count;
}

export { revocar, estaRevocado, eliminarExpirados };
export default { revocar, estaRevocado, eliminarExpirados };
