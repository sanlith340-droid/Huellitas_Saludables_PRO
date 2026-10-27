// tests/setup/globalTeardown.js
// Se ejecuta UNA SOLA VEZ al terminar TODOS los tests.
// Su trabajo: borrar la base de datos de pruebas (y solo esa).
//
// Usa la misma configuración que globalSetup (testDbConfig.js), así no
// depende de valores de otro entorno ni repite el nombre de la BD.

const { Sequelize } = require('sequelize');
const { obtenerConfigPruebas, describirError } = require('./testDbConfig');

module.exports = async () => {
  let config;
  try {
    config = obtenerConfigPruebas();
  } catch (err) {
    console.warn('[test-teardown] No se elimina ninguna base de datos:', err.message);
    return;
  }

  const admin = new Sequelize('postgres', config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await admin.query(`DROP DATABASE IF EXISTS "${config.database}" WITH (FORCE)`);
    console.log('[test-teardown] Base de datos de prueba eliminada:', config.database);
  } catch (err) {
    console.warn('[test-teardown] No se pudo eliminar la BD de pruebas:', describirError(err));
  } finally {
    await admin.close();
  }
};
