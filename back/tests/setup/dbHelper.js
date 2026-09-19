// tests/setup/dbHelper.js
// Este archivo tiene la función resetDatabase() que deja la BD
// de test en el mismo estado que los seeders.
//
// COMO FUNCIONA:
//   1. Borra TODAS las tablas (undo de migraciones)
//   2. Vuelve a crearlas (migrate)
//   3. Vuelve a llenarlas con datos (seeders)
//
// POR QUE ASI:
//   El método simple con TRUNCATE no reinicia bien las secuencias
//   de PostgreSQL (las columnas GENERATED ALWAYS AS IDENTITY).
//   Al borrar y recrear tablas, las secuencias empiezan desde 1.

const { execSync } = require('child_process');
const path = require('path');

async function resetDatabase() {
  const cwd = path.resolve(__dirname, '..', '..');
  const env = { ...process.env, NODE_ENV: 'test' };

  // 1. Borrar todas las tablas (ejecuta el "down" de cada migración)
  execSync('npx sequelize-cli db:migrate:undo:all', {
    cwd,
    env,
    stdio: 'ignore',
  });

  // 2. Volver a crear todas las tablas (ejecuta el "up" de cada migración)
  execSync('npx sequelize-cli db:migrate', {
    cwd,
    env,
    stdio: 'ignore',
  });

  // 3. Volver a insertar los datos de prueba (seeders)
  //    Si esta línea falla, con stdio: 'inherit' veremos el error real.
  execSync('npx sequelize-cli db:seed:all', {
    cwd,
    env,
    stdio: 'inherit',   // ← CAMBIO: antes era 'ignore', ahora vemos el error
  });
}

module.exports = { resetDatabase };