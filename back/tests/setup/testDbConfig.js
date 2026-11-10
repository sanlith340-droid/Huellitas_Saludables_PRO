import './setupEnv.js';
import { getTestDatabaseConfig } from '../../app/config/databaseUrl.js';

function obtenerConfigPruebas() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `[test-setup] NODE_ENV debe ser "test" (actual: "${process.env.NODE_ENV || 'sin definir'}"). ` +
      'Usa "npm test" o el comando de Docker Compose para pruebas.'
    );
  }

  const config = getTestDatabaseConfig();
  const nombreBdNormal = process.env.DB_NAME || 'proyectohs';
  if (!/^[a-zA-Z0-9_]+$/.test(config.database)
    || !/_test$/.test(config.database)
    || config.database === nombreBdNormal) {
    throw new Error(
      `[test-setup] Por seguridad no se borra la base "${config.database}": ` +
      'la BD de pruebas debe ser un identificador seguro, terminar en "_test" y ser distinta de DB_NAME. ' +
      'Revisa DB_NAME_TEST.'
    );
  }

  return config;
}

function describirError(error) {
  const codigo = error?.code || error?.name || 'SIN_CODIGO';
  const mensaje = String(error?.message || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgresql://[REDACTADO]')
    .replace(/password\s*[=:]\s*[^\s]+/gi, 'password=[REDACTADO]');
  return `${error?.name || 'Error'} / ${codigo}${mensaje ? ` / ${mensaje}` : ''}`;
}

async function borrarBaseSiExiste(admin, nombreBd) {
  if (!/^[a-zA-Z0-9_]+$/.test(nombreBd) || !nombreBd.endsWith('_test')) {
    throw new Error('Se rechazó una operación destructiva sobre una base de datos que no es de pruebas.');
  }
  await admin.query(
    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
    [nombreBd],
  );
  await admin.query(`DROP DATABASE IF EXISTS "${nombreBd}"`);
}

export { obtenerConfigPruebas, describirError, borrarBaseSiExiste };
export default { obtenerConfigPruebas, describirError, borrarBaseSiExiste };
