// prisma/migrar-contrasenas-bcrypt.js
/**
 * Migra a bcrypt las contraseñas guardadas en texto plano.
 *
 * Uso (desde back/):
 *   npm run passwords:migrate                                   -> solo analiza (no modifica nada)
 *   npm run passwords:migrate -- --aplicar --confirmo-respaldo  -> aplica la migración
 *
 * Antes de aplicar: hacer un respaldo de la base (p. ej. pg_dump -t usuario).
 * El script nunca imprime contraseñas ni hashes.
 */

import { disconnect } from '../app/config/prisma.js';
import { migrarContrasenas } from '../app/services/migracionContrasenas.service.js';

const argumentos = new Set(process.argv.slice(2));
const aplicar = argumentos.has('--aplicar');

async function main() {
  if (aplicar && !argumentos.has('--confirmo-respaldo')) {
    process.stderr.write(
      'Para modificar datos agrega --confirmo-respaldo después de verificar que tienes un respaldo de la tabla usuario.\n',
    );
    process.exitCode = 1;
    return;
  }

  const resumen = await migrarContrasenas({ aplicar });
  process.stdout.write(`${JSON.stringify(resumen, null, 2)}\n`);

  if (!aplicar && resumen.texto_plano > 0) {
    process.stdout.write(
      `\n${resumen.texto_plano} contraseña(s) en texto plano. Ejecuta con --aplicar --confirmo-respaldo para migrarlas.\n`,
    );
  }
  if (resumen.requieren_restablecimiento.length > 0) {
    process.stdout.write(
      '\nLos IDs listados en "requieren_restablecimiento" no se pueden migrar de forma segura y necesitan una contraseña nueva.\n',
    );
  }
}

main()
  .catch((error) => {
    process.stderr.write(`Falló la migración de contraseñas: ${error?.name || 'Error'}\n`);
    process.exitCode = 1;
  })
  .finally(() => disconnect());
