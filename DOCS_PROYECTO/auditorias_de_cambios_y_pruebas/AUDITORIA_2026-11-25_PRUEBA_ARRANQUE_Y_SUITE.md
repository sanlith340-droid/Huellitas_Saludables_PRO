# Auditoría — prueba del arranque local y suite

**Fecha:** 25 de noviembre de 2026 (UTC−05:00).  
**Responsable:** Manus (asistencia IA).  
**Objetivo:** comprobar los pasos locales de `DOCS_PROYECTO/arranque.md` y ejecutar validaciones principales en una copia aislada del proyecto.

## Entorno y preparación

- Sandbox Linux aislado; Node.js 22.23.4, npm 10.9.9 y PostgreSQL 16.15.
- Docker Engine/CLI no está instalado; por lo tanto, no se pudo ejecutar ni validar `docker compose up -d --build` (Opción A).
- El checkout no tenía `node_modules` ni archivos `.env`. Se instalaron dependencias mediante `npm ci` en `back/` y `front/`. Prisma Client 7.10.1 se generó en el postinstall del backend.
- Para probar la Opción B se creó una base local vacía `huellitas_startup_check` y un rol temporal limitado a `CREATEDB`, con variables efímeras fuera del repositorio. Para Vitest se usó el nombre `huellitas_startup_check_test`, que el setup del proyecto crea y elimina. No se conectó a bases de datos preexistentes ni a datos de usuario.

## Procedimientos y resultados

| Procedimiento | Resultado observado |
|---|---|
| `npm ci` en `back/` | Finalizó; generó Prisma Client. npm reportó 8 vulnerabilidades (4 moderadas y 4 altas). No se ejecutó `npm audit fix`. |
| `npm ci` en `front/` | Finalizó; 0 vulnerabilidades reportadas por npm en ese paquete. |
| `npm run migrate` en `back/` contra `huellitas_startup_check` | **Éxito**; aplicó las seis migraciones presentes, desde `0_init` hasta `20261124220000_consentimiento_y_foto_mascota`. |
| `npm test` en `back/` con `DB_NAME_TEST=huellitas_startup_check_test` | **410/410 pruebas aprobadas; 31 archivos; 140.69 s.** Vitest recreó la base de pruebas como define el setup y la eliminó al terminar. Se observó un `DeprecationWarning` de `pg` por `client.query()` concurrente; no hizo fallar la suite. |
| `npm run build` en `front/` | **Éxito**; TypeScript y Vite generaron `dist/`. |
| `npm run lint` en `front/` | **Éxito**, sin errores ni advertencias. |
| `npm run lint` en `back/` | **0 errores y 4 advertencias** de variables asignadas/no usadas en dos archivos de app y dos archivos de pruebas. |
| API (`npm run dev`) | Arrancó en puerto 3000; `GET /health` respondió HTTP 200 con estado de servicio y base de datos activos; `GET /api-docs` respondió HTTP 200. |
| Vite (`npm run dev -- --host 127.0.0.1`) | Arrancó en puerto 5173; `GET /` respondió HTTP 200 con HTML de la SPA. |

## Conclusión y límites

**La Opción B (desarrollo local sin Docker) de `arranque.md` funcionó en este sandbox**, incluyendo migración, salud de API y respuesta del frontend; además, la suite backend completa, el build y lint finalizaron con los resultados arriba descritos. Esto no demuestra que la Opción A/Docker funcione, porque Docker no está disponible aquí. Tampoco equivale a un despliegue público o prueba E2E en navegador real; el frontend se comprobó por HTTP y la suite backend por Vitest.

Después de verificar, se detuvieron API, Vite y PostgreSQL; se eliminó la base vacía `huellitas_startup_check`, el rol temporal y el archivo de variables efímeras. Vitest ya había eliminado `huellitas_startup_check_test`. También se retiraron `node_modules/` y `front/dist/` generados durante las comprobaciones y se restauró el árbol Prisma generado incluido en el ZIP original. No se modificó código fuente, schema, migraciones ni archivos lock.

## Siguiente paso

Para validar la Opción A, repetir los pasos en un equipo que tenga Docker Engine y Compose v2, con credenciales locales propias y un volumen de base desechable; no usar `down -v` si se desea conservar datos.
