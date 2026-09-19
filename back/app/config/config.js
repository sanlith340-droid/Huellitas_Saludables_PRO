// app/config/config.js
/**
 * Configuración usada exclusivamente por sequelize-cli
 * (comandos: npx sequelize-cli db:migrate / db:seed:all).
 *
 * La app en tiempo de ejecución NO usa este archivo directamente,
 * usa app/config/database.js (que crea la instancia real de Sequelize).
 */
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'proyectohs',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: base,
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || `${base.database}_test`,
  },
  production: {
    ...base,
    logging: false,
  },
};
