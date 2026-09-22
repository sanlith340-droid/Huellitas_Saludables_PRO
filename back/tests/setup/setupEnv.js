// tests/setup/setupEnv.js
// Este archivo se ejecuta ANTES que cualquier otra cosa.
// Su trabajo es cargar el archivo .env.test (que tiene la configuración
// de la base de datos de PRUEBAS, no la real).

const path = require('path');

// dotenv lee el archivo .env.test y pone sus variables en process.env
require('dotenv').config({
  path: path.resolve(__dirname, '..', '..', '.env.test'),
});