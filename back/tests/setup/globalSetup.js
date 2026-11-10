import './setupEnv.js';
import teardown from './globalTeardown.js';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { obtenerConfigPruebas, describirError, borrarBaseSiExiste } from './testDbConfig.js';
import logger from '../../app/utils/logger.js';

const { Client } = pg;
const BACK_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export default async function globalSetup() {
  const config = obtenerConfigPruebas();
  const nombreBd = config.database;
  const admin = new Client({ ...config, database: 'postgres' });

  try {
    await admin.connect();
  } catch (error) {
    throw new Error(
      `[test-setup] No se pudo conectar a PostgreSQL en ${config.host}:${config.port} ` +
      `(${describirError(error)}). PostgreSQL debe estar encendido y el usuario debe poder ` +
      'crear y eliminar únicamente la base de pruebas.'
    );
  }

  try {
    await borrarBaseSiExiste(admin, nombreBd);
    await admin.query(`CREATE DATABASE "${nombreBd}"`);
  } catch (error) {
    throw new Error(`[test-setup] No se pudo preparar la base de prueba: ${describirError(error)}`);
  } finally {
    await admin.end().catch(() => {});
  }

  const env = { ...process.env, NODE_ENV: 'test' };
  try {
    execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: BACK_ROOT, env, stdio: 'inherit' });
    execFileSync('npx', ['prisma', 'db', 'seed'], { cwd: BACK_ROOT, env, stdio: 'inherit' });
  } catch (error) {
    throw new Error(`[test-setup] Falló la migración o semilla Prisma de la base de prueba: ${describirError(error)}`);
  }

  logger.info({ event: 'test.database_ready' }, 'Base de datos de prueba lista');
  return teardown;
}
