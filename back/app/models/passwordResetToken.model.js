import { prisma } from '../config/prisma.js';

async function invalidatePrevious(id_usuario, ahora, client = prisma) {
  return client.passwordResetToken.updateMany({
    where: { id_usuario, usado_en: null },
    data: { usado_en: ahora },
  });
}

async function create({ tokenHash, id_usuario, expiraEn }, client = prisma) {
  return client.passwordResetToken.create({
    data: { token_hash: tokenHash, id_usuario, expira_en: expiraEn },
  });
}

async function findUsableByHash(tokenHash, ahora, client = prisma) {
  return client.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    select: { id_token_reset: true, id_usuario: true, expira_en: true, usado_en: true },
  }).then((token) => (
    token && token.usado_en === null && token.expira_en > ahora ? token : null
  ));
}

/** Reclama el token dentro de la transacción: solo una carrera obtiene count=1. */
async function consume(id_token_reset, ahora, client = prisma) {
  return client.passwordResetToken.updateMany({
    where: { id_token_reset, usado_en: null, expira_en: { gt: ahora } },
    data: { usado_en: ahora },
  });
}

export { invalidatePrevious, create, findUsableByHash, consume };
export default { invalidatePrevious, create, findUsableByHash, consume };
