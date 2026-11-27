# Ejecución de pruebas

Guía operativa prospectiva de la suite automatizada existente. Para conocer el alcance planificado y sus brechas, consulta el [Plan Maestro de Pruebas](PLAN_MAESTRO_DE_PRUEBAS.md). Esta guía no acredita por sí misma que se ejecute una ronda.

## Suite actual

- Runner: Vitest; cliente HTTP de pruebas: Supertest.
- Ubicación: `back/tests/unit/` y `back/tests/integration/`; Vitest usa el patrón `tests/**/*.test.js` desde `back/`.
- Base de integración: PostgreSQL; configuración común en `back/tests/setup/`.
- El setup crea, migra, siembra y al terminar elimina `DB_NAME_TEST`; debe ser distinta de `DB_NAME` y terminar en `_test`. La configuración valida el nombre, pero no garantiza que el host sea local o desechable.
- El paquete backend declara `npm test`, `npm run test:watch`, `npm run test:coverage` y `npm run lint`; el frontend declara `npm run build`, `npm run lint` y `npm run type-check`. No hay script de test frontend.
- La suite contiene pruebas backend unitarias y de integración; entre las áreas con archivos de prueba figuran autenticación/rate limit, permisos y propiedad de mascotas/citas, citas, historias clínicas, notificaciones y controles SQL. La presencia de esos archivos no prueba por sí sola que cada escenario pase.
- Frontend: no se encontró framework/suite automatizada de componentes ni E2E en `front/`; no hay configuración Playwright/Cypress en los paquetes revisados.

La bitácora [`BITACORA_VALIDACION_FORMULARIOS.md`](../back_DOCUMENTACION/BITACORA_VALIDACION_FORMULARIOS.md) y los informes anteriores registraron cifras históricas (incluidos 334/334 en 23 archivos); no describen el pase actual. El resultado vigente se encuentra en la [auditoría integral local](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_PRUEBA_INTEGRAL_LOCAL.md) y la [bitácora QA](BITACORA_QA_LOCAL_2026-11-27.md); no debe inferirse del número de archivos presentes.

## Estado de la última ejecución consignada

La última ejecución local se realizó el **27/11/2026** y está documentada en la [auditoría integral local](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_PRUEBA_INTEGRAL_LOCAL.md). `npm run test:coverage` ejecutó 32 archivos: **416/417 pruebas pasaron y 1 falló** en `mascotas.test.js`. El caso de nombre de exactamente 200 caracteres recibió HTTP 409 en la suite porque pruebas anteriores llenaron las cinco plazas del mismo usuario; al ejecutarlo solo sobre una base recién sembrada, pasó (1 aprobado, 23 omitidos). Es un problema de aislamiento/orden del test pendiente de corregir; la suite **no está completamente aprobada**.

En la misma ronda pasaron lint frontend, comprobación TypeScript, build frontend y `npx prisma validate`; backend lint terminó con 0 errores y 4 advertencias. El smoke local comprobó `/health` (200), `/api-docs/` (200), catálogo sin token (401), preflight CORS (204), Vite `/` (200) y `/login` (200). La cobertura se solicitó, pero la corrida fallida no generó `back/coverage/index.html` ni `lcov.info`; no se informa porcentaje vigente. No se hicieron interacciones reales en navegador, pruebas E2E, CI remoto, Docker Compose, consulta real a API Ninjas ni envío SMTP real. Las cifras 410/410 del 25/11 y las 8 vulnerabilidades (4 moderadas y 4 altas) de `npm ci` son antecedentes históricos, no resultados nuevos de esta ronda.

## Opción A: PostgreSQL temporal con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

El servicio `db-test` usa PostgreSQL 16 y almacenamiento temporal. El Compose fija `DB_NAME=proyectohs` y `DB_NAME_TEST=proyectohs_test`; `globalSetup` crea/aplica migraciones/semilla y el cierre limpia la base de pruebas. Al terminar, detener el entorno:

```bash
docker compose -f docker-compose.test.yml down
```

El Compose de pruebas usa `tmpfs` para PostgreSQL y no declara volúmenes persistentes; al detenerlo se elimina el contenedor temporal. No ejecutes por error el comando sobre el Compose principal si deseas conservar su volumen de datos.

## Opción B: PostgreSQL local desechable

Desde `back/`:

```bash
npm ci
```

No existe `back/.env.test.example` en la copia revisada. Crea localmente `back/.env.test` (archivo no versionado) con variables exclusivas para la base de prueba; no copies una configuración productiva ni guardes secretos en documentación o en el repositorio.

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
npm run lint
```

Validaciones frontend disponibles (desde `front/`):

```bash
npm run lint
npm run type-check
npm run build
```

El usuario PostgreSQL necesita permisos para crear y eliminar bases. La cobertura, cuando se solicite explícitamente mediante `npm run test:coverage`, queda en `back/coverage/`; ejecutar el comando no equivale a un resultado hasta guardar la salida y reportar métricas. `npm run build` y `npm run type-check` validan compilación/tipado, no el comportamiento funcional de la interfaz.

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


> **Actualización 27/11/2026:** La cifra vigente de la ejecución local es 416/417 en 32 archivos; el informe completo, el diagnóstico del test y las limitaciones están en la [auditoría integral local](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_PRUEBA_INTEGRAL_LOCAL.md). La cifra 410/410 del 25/11 permanece solo como antecedente histórico.
