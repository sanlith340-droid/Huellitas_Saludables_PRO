import pg from 'pg';
import { obtenerConfigPruebas, describirError, borrarBaseSiExiste } from './testDbConfig.js';
import logger from '../../app/utils/logger.js';

const { Client } = pg;

export default async function globalTeardown() {
  let config;
  try {
    config = obtenerConfigPruebas();
  } catch {
    logger.warn({ event: 'test.teardown_skipped' }, 'No se elimina ninguna base de datos');
    return;
  }

  const admin = new Client({ ...config, database: 'postgres' });
  try {
    await admin.connect();
    await borrarBaseSiExiste(admin, config.database);
    logger.info({ event: 'test.database_removed' }, 'Base de datos de prueba eliminada');
  } catch (error) {
    logger.warn({ event: 'test.database_remove_failed', errorCode: error?.code }, 'No se pudo eliminar la base de pruebas');
    if (process.env.NODE_ENV === 'development') {
      logger.debug({ event: 'test.database_remove_detail', error: describirError(error) }, 'Detalle de limpieza');
    }
  } finally {
    await admin.end().catch(() => {});
  }
}
