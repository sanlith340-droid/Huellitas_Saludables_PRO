// tests/setup/setupEnv.js
// Este archivo se ejecuta ANTES que cualquier otra cosa.
// Su trabajo es cargar el archivo .env.test (que tiene la configuración
// de la base de datos de PRUEBAS, no la real).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Raíz de back/, independiente del directorio de ejecución.
const BACK_ROOT = fileURLToPath(new URL('../../', import.meta.url));

// dotenv lee el archivo .env.test y pone sus variables en process.env
dotenv.config({
  path: path.resolve(BACK_ROOT, '.env.test'),
});