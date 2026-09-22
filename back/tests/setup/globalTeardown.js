// tests/setup/globalTeardown.js
// Se ejecuta UNA SOLA VEZ al terminar TODOS los tests.
// Su trabajo: borrar la base de datos de prueba.
//
// Así tu computador no se llena de bases de datos de test.

const { Sequelize } = require('sequelize');

module.exports = async () => {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT) || 5432;
  const dbName = 'proyectohs_test';

  const admin = new Sequelize('postgres', dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    console.log('[test-teardown] Base de datos de prueba eliminada:', dbName);
  } catch (err) {
    console.warn('[test-teardown] No se pudo eliminar:', err.message);
  } finally {
    await admin.close();
  }
};