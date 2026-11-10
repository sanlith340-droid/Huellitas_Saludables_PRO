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

// Fechas deterministas para fixtures legados (p. ej. disponibilidades de agosto de 2026).
process.env.HUELLITAS_TEST_NOW ||= '2026-08-18T12:00:00-05:00';
