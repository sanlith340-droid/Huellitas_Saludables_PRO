// tests/setup/globalSetup.js
// Se ejecuta UNA SOLA VEZ al inicio de todos los tests.
//
// Sus tareas:
//   1. Crear la base de datos "proyectohs_test"
//   2. Correr las migraciones (crear las tablas)
//   3. Correr los seeders (insertar los datos de prueba)
//
// Al terminar, la BD de prueba queda idéntica a como estaría la real.

const { execSync } = require('child_process');
const path = require('path');
const { Sequelize } = require('sequelize');

module.exports = async () => {
  // Leemos la configuración del proyecto para saber cómo conectarnos
  const config = require('../../app/config/config.js');
  const testDbName = config.test.database;  // "proyectohs_test"

  const dbUser = config.test.username;
  const dbPass = config.test.password;
  const dbHost = config.test.host;
  const dbPort = config.test.port;

  // Nos conectamos a la BD "postgres" (la del sistema) para poder
  // crear la nueva BD desde cero.
  const admin = new Sequelize('postgres', dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
  });

  // Borra la BD de prueba si ya existe, y la crea de nuevo (vacía).
  await admin.query(`DROP DATABASE IF EXISTS "${testDbName}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${testDbName}"`);
  await admin.close();

  // Ahora corremos las migraciones y seeders DENTRO de la BD de prueba.
  const cwd = path.resolve(__dirname, '..', '..');
  const env = { ...process.env, NODE_ENV: 'test' };

  execSync('npx sequelize-cli db:migrate', { cwd, env, stdio: 'inherit' });
  execSync('npx sequelize-cli db:seed:all', { cwd, env, stdio: 'inherit' });

  console.log('[test-setup] Base de datos de prueba lista:', testDbName);
};