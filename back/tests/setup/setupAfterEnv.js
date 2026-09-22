// tests/setup/setupAfterEnv.js
// Se ejecuta después de cada archivo de tests.
// Su trabajo: cerrar la conexión a la BD y subir el timeout.
//
// Sin esto, Jest se queda "colgado" esperando a que la conexión
// se cierre sola.

const { sequelize } = require('../../app/models');

// Este bloque se ejecuta al final de cada archivo de tests.
afterAll(async () => {
  await sequelize.close();
});

// Le decimos a Jest que cada test puede tardar hasta 30 segundos.
// El default es 5 segundos, muy poco para operaciones con BD.
jest.setTimeout(30000);