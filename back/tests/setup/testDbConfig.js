// tests/setup/testDbConfig.js
// Configuración ÚNICA de la base de datos de pruebas.
//
// globalSetup y globalTeardown usan este archivo, así el nombre de la
// base de datos ya no se repite (antes estaba escrito a mano en el teardown).
//
// Además protege la BD normal: si el nombre de la BD de pruebas no termina
// en "_test" o es igual a la BD normal, las pruebas se detienen ANTES de
// borrar nada.

const path = require('path');

// Carga .env.test con ruta absoluta (no depende de desde dónde se ejecute Jest).
// dotenv NO sobrescribe variables que ya existan (por ejemplo las de Docker Compose).
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env.test') });

function obtenerConfigPruebas() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `[test-setup] NODE_ENV debe ser "test" (actual: "${process.env.NODE_ENV || 'sin definir'}"). ` +
      'Usa "npm test" o el comando de Docker Compose para pruebas.'
    );
  }

  const config = require('../../app/config/config.js').test;
  const nombreBd = config.database;
  const nombreBdNormal = process.env.DB_NAME || 'proyectohs';

  if (!/_test$/.test(nombreBd) || nombreBd === nombreBdNormal) {
    throw new Error(
      `[test-setup] Por seguridad no se borra la base "${nombreBd}": ` +
      'la BD de pruebas debe terminar en "_test" y ser distinta de DB_NAME. ' +
      'Revisa DB_NAME_TEST.'
    );
  }

  return config;
}

// Descripción del error SIN credenciales (nunca incluye usuario ni contraseña).
function describirError(err) {
  const codigo = err?.original?.code || err?.parent?.code || err?.code || err?.name || 'SIN_CODIGO';
  return `${err?.name || 'Error'} / ${codigo}`;
}

module.exports = { obtenerConfigPruebas, describirError };
