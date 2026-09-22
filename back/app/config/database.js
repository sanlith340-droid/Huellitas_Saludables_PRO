// app/config/database.js
/**
 * config/database.js
 * Instancia real de Sequelize usada por la aplicación (Express).
 *
 * IMPORTANTE: en modo test se conecta a una BD diferente
 * (por ejemplo "proyectohs_test") para NO tocar los datos reales
 * cuando corremos los tests automatizados.
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Si estamos en modo test, usamos una BD distinta:
//   - Si existe DB_NAME_TEST, la usa
//   - Si no, agrega "_test" al nombre normal (ej: proyectohs_test)
// En cualquier otro modo, usa el nombre normal.
const dbName = process.env.NODE_ENV === 'test'
  ? (process.env.DB_NAME_TEST || `${process.env.DB_NAME || 'proyectohs'}_test`)
  : (process.env.DB_NAME || 'proyectohs');

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    // En test NO mostramos las queries SQL (ensucian la salida).
    logging: (process.env.NODE_ENV === 'development') ? console.log : false,
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function testConnection() {
  await sequelize.authenticate();
  const [result] = await sequelize.query('SELECT NOW() AS now');
  return result[0].now;
}

async function query(sql, params = []) {
  const rows = await sequelize.query(sql, {
    bind: params,
    type: sequelize.QueryTypes.SELECT,
  });
  return { rows };
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  query,
};