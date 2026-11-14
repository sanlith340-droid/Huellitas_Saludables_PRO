# Ejecución de pruebas

Guía operativa de la suite automatizada existente. Para conocer qué cubre cada tipo de prueba y qué falta, consulta el [Plan Maestro de Pruebas](PLAN_MAESTRO_DE_PRUEBAS.md).

## Suite actual

- Runner: Vitest; cliente HTTP de pruebas: Supertest.
- Ubicación: `back/tests/unit/` y `back/tests/integration/`.
- Base de integración: PostgreSQL; configuración común en `back/tests/setup/`.
- Archivos: `back/tests/**/*.test.js`.
- Frontend: no se encontró framework/suite automatizada de componentes ni E2E en `front/`.

La bitácora [`BITACORA_VALIDACION_FORMULARIOS.md`](../back/BITACORA_VALIDACION_FORMULARIOS.md) reporta una ejecución anterior con 23 archivos y 334 pruebas aprobadas. Es evidencia histórica, no el resultado de la última ejecución de este documento.

## Opción A: PostgreSQL temporal con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

El servicio `db-test` usa PostgreSQL 16 y almacenamiento temporal. El Compose fija `DB_NAME=proyectohs` y `DB_NAME_TEST=proyectohs_test`; `globalSetup` crea/aplica migraciones/semilla y el cierre limpia la base de pruebas. Al terminar, detener el entorno:

```bash
docker compose -f docker-compose.test.yml down -v
```

El `-v` elimina volúmenes asociados al proyecto Compose. Verifica el contexto antes de usarlo y no ejecutes por error el comando sobre el Compose principal si deseas conservar su volumen de datos.

## Opción B: PostgreSQL local desechable

Desde `back/`:

```bash
npm ci
cp .env.test.example .env.test
```

Edita `back/.env.test` con un usuario/base PostgreSQL de pruebas y confirma como mínimo:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyectohs
DB_NAME_TEST=proyectohs_test
DB_USER=usuario_de_pruebas
DB_PASSWORD=clave_de_prueba
JWT_SECRET=secreto_exclusivo_de_prueba
```

Ejecutar desde `back/`:

```bash
npm test
```

Otros comandos:

```bash
npm test -- tests/integration/citas.test.js
npm test -- -t "texto del nombre del caso"
npm run test:watch
npm run test:coverage
```

El usuario PostgreSQL necesita permisos para crear y eliminar bases. La cobertura configurada queda en `back/coverage/`.

## Protección obligatoria de la base de datos

El setup valida `NODE_ENV=test`; además exige que `DB_NAME_TEST` sea un identificador seguro, termine en `_test` y sea diferente de `DB_NAME`. **Ese control no verifica que `DB_HOST` sea local ni que el servidor sea desechable.** Antes de ejecutar tests fuera del Compose aislado, verifica host, puerto, usuario, base y credenciales efectivas. No uses datos personales reales ni una base de producción. El setup tiene operaciones destructivas `CREATE/DROP DATABASE` sobre la base de pruebas.

Si hay duda sobre a qué base apunta la configuración, no ejecutes la suite hasta corregirla.

## Resultados y registro

Al terminar, registrar commit/versión, fecha, comando, ambiente, base usada, resultado, número de casos, fallos y artefactos relevantes sin incluir tokens, contraseñas ni datos personales. No registrar como aprobado un build/type-check si el objetivo era validar pruebas funcionales.

## Diagnóstico básico

- **Conexión rechazada:** revisar PostgreSQL, `DB_HOST`, `DB_PORT` y si el contenedor `db-test` está saludable.
- **No puede crear/eliminar base:** asignar permisos mínimos necesarios a un usuario dedicado de test; nunca ampliar permisos de un usuario de producción.
- **Setup rechaza `DB_NAME_TEST`:** debe terminar en `_test`, usar solo letras/números/guion bajo y ser diferente de `DB_NAME`.
- **Migración/seed falla:** revisar las migraciones y el estado de la BD de prueba; no apuntar a otra base para “probar si funciona”.
- **Pruebas intermitentes:** considerar que la configuración desactiva paralelismo entre archivos porque comparten una base.
