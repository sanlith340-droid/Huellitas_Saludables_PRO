# Auditoría de cambio o prueba ejecutada por IA

## Identificación
- **Fecha y hora:** 25 de noviembre de 2026
- **Modelo o responsable:** Claude (Anthropic), a solicitud del equipo
- **Tarea relacionada:** cerrar brechas detectadas al evaluar el proyecto contra la Lista de Chequeo T4
- **Autorización relacionada:** solicitud explícita del usuario en la conversación; los cambios no tocan `schema.prisma` ni migraciones

## Objetivo
Corregir la falta de autorización por propietario en GET de mascotas y citas, quitar credenciales por defecto, configurar análisis estático y CI, y documentar despliegue, respaldos, calidad, backlog final y sustentación.

## Alcance y archivos
- **Revisados:** todo el ZIP (código, documentación D1–D5, lista de chequeo).
- **Modificados (código):** `back/app/services/{mascota,cita}.service.js`, `back/app/controllers/{mascota,cita}.controller.js`, `back/app/models/cita.model.js`, `back/app/config/databaseUrl.js`, `back/docker-entrypoint.sh`, `back/app/services/auth.service.js` (`let`→`const`), `docker-compose.yml`, `.env.docker.example`, `back/package.json` y `front/package.json` (+ lockfiles).
- **Creados:** `back/eslint.config.js`, `front/eslint.config.js`, `.github/workflows/ci.yml`, `render.yaml`, `ambientes/*`, `scripts/backup-db.sh`, `scripts/restore-db.sh`, `back/tests/integration/autorizacion-propietario.test.js`, `back/tests/unit/config/databaseUrl.test.js` y los documentos nuevos en `DOCS_PROYECTO/sustentacion_DOCUMENTACION/`.
- **No modificados deliberadamente:** `schema.prisma`, migraciones, `seed.js`, helpers de prueba, frontend funcional.

## Ejecución
- **Procedimiento:** PostgreSQL 16 local temporal; `npm ci`; `vitest run --coverage`; `eslint .` en back y front; `npm run build` del front; backup y restore con los scripts nuevos.
- **Entorno:** local, base de prueba. Docker **no** estaba disponible.
- **Dependencias externas:** el motor de esquema de Prisma no se pudo descargar (sin acceso a `binaries.prisma.sh`). Para validar, solo en la sesión de prueba, las migraciones SQL se aplicaron directamente y el seed se ejecutó con Node; **los helpers de prueba originales se restauraron y no se entregan modificados**. `prisma migrate deploy` no se ejecutó en este entorno.

## Resultado técnico
- Antes del cambio de autorización: 392/392. Después: **410/410 en 31 archivos** (14 pruebas de autorización + 4 de `databaseUrl`).
- Cobertura: 81,2 % sentencias · 67,3 % ramas · 87,3 % funciones · 83,5 % líneas.
- Lint: backend 0 errores/4 advertencias; frontend 0/0. Build frontend OK.
- Backup/restore: 17 usuarios, 30 mascotas, 36 citas, 30 historias en origen y restauración.

## Explicación sencilla
Antes, un dueño autenticado podía pedir por número una mascota o cita de otra persona y el sistema se la entregaba. Ahora responde "no existe", igual que si el número no existiera. También se quitaron claves por defecto, se añadió un revisor automático de código y se dejó listo el procedimiento de copias de seguridad, que se probó con datos reales de demostración.

## Evidencia
Pruebas en `back/tests/integration/autorizacion-propietario.test.js`; informe en `D4/INFORME_FINAL_VERIFICACION_CALIDAD.md`; copias en `D3/ESTRATEGIA_BACKUPS_Y_MIGRACION.md`.

## Limitaciones y riesgos
- **No hay despliegue ni URL**: `render.yaml` y la guía están listos, pero no se desplegó nada.
- Docker no se probó; `prisma migrate deploy` no se ejecutó en esta sesión.
- Los manuales DOCX/PDF no se regeneraron (ver `00_CIERRE_T4_PENDIENTES_MANUALES.md`).
- Backlog 91,2 % y retrospectiva son borradores a validar por el equipo; las reflexiones personales están vacías por diseño.
- Endpoints `GET /api/mascotas` (listado) y comportamiento de roles `recepcionista`/`admin` no cambiaron.

## Siguiente acción
Ejecutar los pendientes de `00_CIERRE_T4_PENDIENTES_MANUALES.md`: desplegar, repetir backup/restore en la BD desplegada, pruebas manuales M1–M8, actualizar manuales y firmar.
