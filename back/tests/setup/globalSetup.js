// tests/setup/globalSetup.js
// Se ejecuta UNA SOLA VEZ al inicio de todos los tests.
//
// Sus tareas:
//   1. Comprobar que PostgreSQL responde (con un mensaje claro si no).
//   2. Borrar y crear de nuevo la BD de pruebas (nunca la BD normal).
//   3. Correr las migraciones y los seeders dentro de esa BD.

const path = require('path');
const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');
const { obtenerConfigPruebas, describirError, borrarBaseSiExiste } = require('./testDbConfig');

module.exports = async () => {
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
  const cwd = path.resolve(__dirname, '..', '..');
  const env = { ...process.env, NODE_ENV: 'test' };

  execSync('npx sequelize-cli db:migrate', { cwd, env, stdio: 'inherit' });
  execSync('npx sequelize-cli db:seed:all', { cwd, env, stdio: 'inherit' });

  console.log('[test-setup] Base de datos de prueba lista:', nombreBd);
};
