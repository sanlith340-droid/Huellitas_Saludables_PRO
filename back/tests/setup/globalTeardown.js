// tests/setup/globalTeardown.js
// Se ejecuta UNA SOLA VEZ al terminar TODOS los tests.
// Su trabajo: borrar la base de datos de pruebas (y solo esa).
//
// Usa la misma configuración que globalSetup (testDbConfig.js), así no
// depende de valores de otro entorno ni repite el nombre de la BD.

import sequelizePkg from 'sequelize';
const { Sequelize } = sequelizePkg;
import { obtenerConfigPruebas, describirError, borrarBaseSiExiste } from './testDbConfig.js';
import logger from '../../app/utils/logger.js';

export default async () => {
  let config;
  try {
    config = obtenerConfigPruebas();
  } catch (err) {
    logger.warn({ event: 'test.teardown_skipped' }, 'No se elimina ninguna base de datos');
    return;
  }

  const admin = new Sequelize('postgres', config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await borrarBaseSiExiste(admin, config.database);
    logger.info({ event: 'test.database_removed' }, 'Base de datos de prueba eliminada');
  } catch (err) {
    logger.warn({ event: 'test.database_remove_failed', errorCode: err?.code }, 'No se pudo eliminar la base de pruebas');
  } finally {
    await admin.close();
  }
};
