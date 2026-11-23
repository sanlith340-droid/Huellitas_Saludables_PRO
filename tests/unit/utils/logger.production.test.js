import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const BACK_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('logger de producción', () => {
  it('omite info y redacta tokens y datos de usuario de cualquier nivel', () => {
    const script = `
      import logger from './app/utils/logger.js';
      logger.info({ token: 'INFO_TOKEN_SENTINEL' }, 'mensaje informativo');
      logger.error({
        token: 'ERROR_TOKEN_SENTINEL',
        correo: 'CORREO_SENTINEL@example.invalid',
        email: 'EMAIL_SENTINEL@example.invalid',
        usuario: { id_usuario: 'ID_SENTINEL', nombre: 'NOMBRE_SENTINEL' },
        user: { email: 'USER_EMAIL_SENTINEL@example.invalid' }
      }, 'error controlado de prueba');
    `;

    const salida = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: BACK_ROOT,
      env: { ...process.env, NODE_ENV: 'production' },
      encoding: 'utf8',
    });

    expect(salida).toContain('error controlado de prueba');
    expect(salida).toContain('[REDACTADO]');
    expect(salida).not.toContain('mensaje informativo');

    const datosSensibles = [
      'INFO_TOKEN_SENTINEL',
      'ERROR_TOKEN_SENTINEL',
      'CORREO_SENTINEL@example.invalid',
      'EMAIL_SENTINEL@example.invalid',
      'ID_SENTINEL',
      'NOMBRE_SENTINEL',
      'USER_EMAIL_SENTINEL@example.invalid',
    ];
    for (const dato of datosSensibles) expect(salida).not.toContain(dato);
  });
});
