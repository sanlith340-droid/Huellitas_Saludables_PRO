// tests/setup/globalSetup.js
// Se ejecuta UNA SOLA VEZ al inicio de todos los tests.
//
// Sus tareas:
//   1. Comprobar que PostgreSQL responde (con un mensaje claro si no).
//   2. Borrar y crear de nuevo la BD de pruebas (nunca la BD normal).
//   3. Correr las migraciones y los seeders dentro de esa BD.

import './setupEnv.js';
import teardown from './globalTeardown.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import child_processPkg from 'child_process';
const { execSync } = child_processPkg;
import sequelizePkg from 'sequelize';
const { Sequelize } = sequelizePkg;
import { obtenerConfigPruebas, describirError, borrarBaseSiExiste } from './testDbConfig.js';
// Raíz de back/, independiente del directorio de ejecución.
const BACK_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export default async () => {
  const config = obtenerConfigPruebas();
  const nombreBd = config.database;

  // Nos conectamos a la BD de sistema "postgres" para poder crear la BD de pruebas.
  const admin = new Sequelize('postgres', config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false,
  });

  try {
    try {
      await admin.authenticate();
    } catch (err) {
      throw new Error(
        `[test-setup] No se pudo conectar a PostgreSQL en ${config.host}:${config.port} ` +
        `(${describirError(err)}). Si ejecutas las pruebas en tu equipo, PostgreSQL debe estar ` +
        'encendido en ese host y puerto. Lo recomendado es usar Docker: ' +
        'docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests'
      );
    }

    try {
      await borrarBaseSiExiste(admin, nombreBd);
      await admin.query(`CREATE DATABASE "${nombreBd}"`);
    } catch (err) {
      throw new Error(`[test-setup] No se pudo preparar la base "${nombreBd}": ${describirError(err)}`);
    }
  } finally {
    await admin.close();
  }

  // Migraciones y seeders DENTRO de la BD de pruebas (NODE_ENV=test).
  const cwd = BACK_ROOT;
  const env = { ...process.env, NODE_ENV: 'test' };

  execSync('npx sequelize-cli db:migrate --config app/config/config.js --models-path app/models --migrations-path migrations --seeders-path seeders', { cwd, env, stdio: 'inherit' });
  execSync('npx sequelize-cli db:seed:all --config app/config/config.js --models-path app/models --migrations-path migrations --seeders-path seeders', { cwd, env, stdio: 'inherit' });

  console.log('[test-setup] Base de datos de prueba lista:', nombreBd);

  // Vitest ejecuta esta función una vez, después de todos los archivos.
  return teardown;
};
