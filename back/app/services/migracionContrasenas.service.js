// app/services/migracionContrasenas.service.js
/**
 * services/migracionContrasenas.service.js
 * Migración de contraseñas almacenadas a bcrypt.
 *
 * - texto_plano -> se hashea con bcrypt y se guarda SOLO el hash. La
 *   actualización es condicional (id_usuario + valor anterior) para no pisar
 *   un cambio concurrente.
 * - scrypt      -> no se puede convertir sin conocer la contraseña: se migra
 *   de forma transparente en el siguiente login correcto (auth.service.js).
 * - bcrypt      -> no requiere cambios.
 * - no migrable -> texto plano vacío, con espacios o de más de 72 bytes:
 *   requiere restablecimiento de contraseña por un administrador.
 *
 * Nunca registra ni devuelve contraseñas ni hashes; solo conteos e IDs.
 */

import { prisma as prismaPorDefecto } from '../config/prisma.js';
import {
  hashContrasena,
  clasificarContrasenaGuardada,
  esContrasenaValidaParaBcrypt,
} from '../utils/password.js';

const TAMANO_LOTE = 200;

async function* recorrerUsuarios(cliente) {
  let cursor = null;
  for (;;) {
    const lote = await cliente.usuario.findMany({
      select: { id_usuario: true, contrasena: true },
      orderBy: { id_usuario: 'asc' },
      take: TAMANO_LOTE,
      ...(cursor ? { skip: 1, cursor: { id_usuario: cursor } } : {}),
    });
    if (lote.length === 0) return;
    yield* lote;
    cursor = lote[lote.length - 1].id_usuario;
    if (lote.length < TAMANO_LOTE) return;
  }
}

/**
 * Analiza (y opcionalmente migra) las contraseñas almacenadas.
 * @param {{ aplicar?: boolean, cliente?: object }} opciones
 */
async function migrarContrasenas({ aplicar = false, cliente = prismaPorDefecto } = {}) {
  const resumen = {
    modo: aplicar ? 'aplicar' : 'simulacion',
    total: 0,
    bcrypt: 0,
    scrypt_pendiente_login: 0,
    texto_plano: 0,
    migradas: 0,
    omitidas_por_cambio_concurrente: 0,
    requieren_restablecimiento: [],
  };

  for await (const { id_usuario, contrasena } of recorrerUsuarios(cliente)) {
    resumen.total += 1;
    const tipo = clasificarContrasenaGuardada(contrasena);

    if (tipo === 'bcrypt') {
      resumen.bcrypt += 1;
      continue;
    }
    if (tipo === 'scrypt') {
      resumen.scrypt_pendiente_login += 1;
      continue;
    }
    if (tipo === 'vacio' || !esContrasenaValidaParaBcrypt(contrasena)) {
      resumen.requieren_restablecimiento.push(id_usuario);
      continue;
    }

    resumen.texto_plano += 1;
    if (!aplicar) continue;

    const hash = await hashContrasena(contrasena);
    const { count } = await cliente.usuario.updateMany({
      where: { id_usuario, contrasena },
      data: { contrasena: hash },
    });
    if (count === 1) resumen.migradas += 1;
    else resumen.omitidas_por_cambio_concurrente += 1;
  }

  return resumen;
}

/** Cuenta los registros que todavía guardan la contraseña sin hash. */
async function contarTextoPlano(cliente = prismaPorDefecto) {
  let pendientes = 0;
  for await (const { contrasena } of recorrerUsuarios(cliente)) {
    const tipo = clasificarContrasenaGuardada(contrasena);
    if (tipo === 'texto_plano' || tipo === 'vacio') pendientes += 1;
  }
  return pendientes;
}

export { migrarContrasenas, contarTextoPlano };
export default { migrarContrasenas, contarTextoPlano };
