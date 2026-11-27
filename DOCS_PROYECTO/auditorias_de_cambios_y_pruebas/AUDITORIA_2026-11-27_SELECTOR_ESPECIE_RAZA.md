# Auditoría de cambio y pruebas — Selector de especie y raza

## Identificación

- **Fecha y hora:** 27 de noviembre de 2026, 15:11 UTC−05 (20:11 UTC).
- **Modelo o responsable:** Manus.
- **Tarea relacionada:** actualización del formulario de registro de mascotas con catálogo dinámico por especie, API Ninjas y razas personalizadas.
- **Autorización relacionada:** sí; el usuario autorizó explícitamente el alcance antes de la implementación.

## Objetivo

Revisar los cambios del selector y del contrato relacionado, ejecutar validaciones aplicables sin tocar datos productivos y dejar evidencia de las limitaciones del entorno.

## Alcance y archivos

Los archivos funcionales incluyen `front/src/components/FormularioMascota.tsx`, `front/src/utils/especies.ts`, `front/src/components/ListaMascotas.tsx`, `front/src/pages/Dashboard.tsx`, `back/app/services/raza.service.js`, `back/app/routes/raza.routes.js`, `back/app/controllers/raza.controller.js`, `back/app/models/raza.model.js`, `back/app/schemas/mascota.schema.js`, `back/app/services/mascota.service.js` y `back/app/config/swagger.js`. Las pruebas incorporadas son `back/tests/unit/services/raza.service.test.js` y `back/tests/integration/mascotas.test.js`.

También se actualizaron `docker-compose.yml`, `back/.env.example`, `back/Readme.md`, `Readme.md`, `DOCS_PROYECTO/arranque.md`, `DOCS_PROYECTO/back_DOCUMENTACION/API.md`, `DOCS_PROYECTO/front_DOCUMENTACION/README.md`, este informe, la [bitácora funcional](../back_DOCUMENTACION/BITACORA_SELECTOR_ESPECIE_RAZA_2026-11-27.md) y `.agents/workflows/ESTADO_ACTUAL.md`. Se dejaron sin modificar `back/prisma/schema.prisma`, migraciones, dependencias/lockfiles, archivos `.env` reales y configuración/despliegue de Render.

## Ejecución

**Entorno:** Manus Sandbox aislado; Node.js y npm disponibles. La copia de trabajo procede del ZIP original del usuario.

Durante la implementación se ejecutaron `cd front && npm ci`, `npm run build` y `npm run lint`; desde `back/`, `npm ci`, `npm run lint` y `npx prisma validate`. La prueba unitaria final aislada se ejecutó desde `back/` con `npx vitest run --config /tmp/huellitas-vitest-unit.config.mjs`. Esa configuración temporal limitó Vitest exclusivamente a `tests/unit/services/raza.service.test.js` y no inició preparación de base de datos. Se hizo `node --check` sobre los ocho archivos JavaScript backend pertinentes y se importó la especificación OpenAPI para comprobar por aserciones `bearerAuth` en `GET/POST /api/mascotas`, ausencia de parámetros obsoletos `UserId`/`UserRole` y presencia de `raza_nombre`. También se buscaron referencias a la clave/API Ninjas y a las etiquetas de especie en el frontend.

Para evaluar si era seguro correr pruebas de integración: `pg_isready -h localhost -p 5432` no pudo ejecutarse porque `pg_isready` no está instalado; `ss -ltn '( sport = :5432 )'` no mostró listener y `pgrep -a postgres` no encontró proceso. No se ejecutó `npm test`. No se llamó a API Ninjas en vivo; el usuario no proporcionó `API_NINJAS_KEY`, y la cabecera se verificó con un mock unitario.

El empaquetado final se realizó con `zip -qr /home/ubuntu/work/huellitas/Huellitas_Saludables_SELECTOR_ESPECIE_RAZA_2026-11-27.zip Huellitas_Saludables_PRO-SUSTENTACION4- -x '*/node_modules/*' '*/node_modules/' '*/dist/*' '*/dist/' '*/app/generated/prisma/*' '*/app/generated/prisma/' '*.tsbuildinfo' '*/coverage/*' '*/.git/*' '*/.git/'`. `unzip -tq` terminó sin errores. El archivo contiene 521 entradas (39 MB); se verificó que no incluya node_modules, dist, Prisma generado, coverage, tsbuildinfo ni `.git`. La única plantilla de entorno incluida es `back/.env.example` y declara `API_NINJAS_KEY=` vacía.

## Resultado técnico

| Validación | Resultado |
|---|---|
| `front npm run build` | Aprobado. |
| `front npm run lint` | Aprobado: 0 errores y 0 advertencias. |
| `back npm run lint` (ejecución final tras Swagger) | 0 errores y 4 advertencias en archivos no modificados: `auth.controller.js`, `disponibilidad.model.js`, `citas.test.js` y `disponibilidad.test.js`. |
| `npx prisma validate` | Aprobado; no se aplicaron migraciones. |
| Vitest unitario aislado | 1 archivo, **5/5 pruebas aprobadas**: normalización/orden, respaldo sin clave, cabecera `X-Api-Key`, error HTTP del proveedor y respuesta vacía. |
| `node --check` | Correcto en los 8 archivos inspeccionados. |
| OpenAPI generado | `GET/POST /api/mascotas` declaran JWT Bearer, no conservan parámetros obsoletos y documentan `raza_nombre`. |
| ZIP actualizado | `unzip -tq` sin errores; 521 entradas, 39 MB y exclusiones de artefactos verificadas. |

La primera invocación unitaria con una ruta de importación errónea en la configuración temporal terminó con `UNRESOLVED_IMPORT`; se corrigió la configuración temporal y la ejecución final indicada arriba pasó sin cambios adicionales al código del producto. Las instalaciones `npm ci` de la implementación reportaron 0 vulnerabilidades frontend y 8 backend (4 moderadas y 4 altas); no se actualizaron dependencias ni se intentó remediarlas.

La revisión independiente de código encontró tres puntos: Swagger de mascotas documentaba autenticación antigua, las guías afirmaban incorrectamente que no existía `back/.env.example`, y no había tests automatizados de componente frontend. Se corrigieron los dos primeros y se verificó Swagger generado. El último permanece como limitación: no existe runner frontend declarado y no se añadieron dependencias ni configuración de pruebas de interfaz.

La inspección de archivos no encontró un `.env` real. Las referencias de clave están limitadas al backend, Compose y documentación; no se encontraron usos en `front/src`. No se confirmó conexión real con API Ninjas ni se cambió o verificó Render.

## Explicación sencilla

El formulario y los catálogos de respaldo compilan, el servicio superó cinco pruebas aisladas y la documentación OpenAPI ahora indica el acceso por JWT. La clave permanece del lado servidor. No se ejecutaron pruebas de base de datos en este entorno y tampoco se comprobó una respuesta real de API Ninjas. El ZIP fue verificado y no incluye dependencias ni archivos de build.

## Evidencia

Resultados de terminal del 27/11/2026: build y lint frontend; lint backend; `prisma validate`; Vitest unitario aislado; `node --check`; importación y aserciones OpenAPI; inspección de disponibilidad PostgreSQL y referencias de clave; y comprobación de integridad y contenido del ZIP. Los casos están en `back/tests/unit/services/raza.service.test.js` y `back/tests/integration/mascotas.test.js`. La configuración temporal `/tmp/huellitas-vitest-unit.config.mjs` se eliminó tras la prueba y no forma parte del ZIP.

## Limitaciones y riesgos

No se ejecutó la suite completa ni la integración porque las pruebas resetean la base de datos y no se comprobó un PostgreSQL de pruebas desechable. No se proporcionó una clave del proveedor, así que la red y el formato de la respuesta en vivo no fueron comprobados. Para usar el catálogo remoto, el backend debe recibir `API_NINJAS_KEY` como secreto; Render quedó intacto. Persisten las vulnerabilidades reportadas por `npm ci` en backend. Los cambios del selector aún carecen de tests frontend de componente.

## Siguiente acción

Para validar la integración, preparar y confirmar una base `_test` desechable antes de ejecutar la suite backend. Si se desea catálogo remoto, configurar la clave como secreto del backend en el entorno elegido y realizar una prueba controlada sin exponerla en frontend, logs ni documentos. Considerar más adelante incorporar pruebas de componente frontend con aprobación para el runner/dependencias necesarios.
