# Rules: arquitectura, alcance y ubicación de cambios

## Regla general

Antes de modificar cualquier archivo se debe leer `AGENTS.md`, `.agents/README.md`, el estado actual y la Rule relacionada. Si el cambio es importante, se debe solicitar autorización conforme a `.agents/workflows/autorizacion-cambio-importante.md`.

## Backend

**Puede tocar:**

- `back/app/` para rutas, controladores, servicios, modelos, esquemas, middlewares y utilidades.
- `back/tests/` para pruebas backend.
- `back/prisma/schema.prisma` para cambios de modelo, siempre acompañados de migración.
- `back/prisma/migrations/` únicamente para crear una nueva migración; no editar migraciones ya aplicadas.
- `back/prisma/seed.js` si cambian los datos de demostración.
- `back/package.json` y `back/package-lock.json` solo cuando una dependencia sea necesaria y esté justificada.
- `back/.env.example` y `back/.env.test.example` solo para documentar nombres de variables sin secretos reales.

**No puede tocar sin autorización explícita:**

- `front/` al realizar una tarea exclusivamente backend.
- `docker-compose.yml`, Dockerfiles o configuración de producción si el cambio no fue incluido en la solicitud.
- Migraciones ya aplicadas para corregirlas retroactivamente.
- `.env`, `.env.production`, credenciales, secretos o bases de datos reales.
- Archivos generados, `node_modules/`, `dist/`, `coverage/` o logs como si fueran código fuente.

**Debe documentar en:**

- `DOCS_PROYECTO/back_DOCUMENTACION/` para arquitectura, API y decisiones técnicas.
- `DOCS_PROYECTO/test_DOCUMENTACION/` para el plan de pruebas.
- `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/` para cada prueba o ejecución realizada por la IA.
- Una `BITACORA_*.md` cuando cambie comportamiento, seguridad, datos o arquitectura.

## Frontend

**Puede tocar:**

- `front/src/` para páginas, componentes, rutas, servicios y estado.
- `front/public/` para recursos públicos necesarios.
- `front/tests/` si existe o se incorpora una prueba frontend.
- `front/package.json` y `front/package-lock.json` solo si una dependencia está justificada.
- Documentación de interfaz en `DOCS_PROYECTO/front_DOCUMENTACION/`.

**No puede tocar sin autorización explícita:**

- `back/` cuando la tarea sea solo de interfaz.
- Contratos de API o permisos únicamente desde el frontend.
- Variables `.env` reales, secretos, tokens o configuración de producción.
- `node_modules/`, `dist/` o artefactos de compilación como código fuente.

**Debe documentar en:**

- `DOCS_PROYECTO/front_DOCUMENTACION/` para navegación, pantallas y estados.
- `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/` para cada build, ejecución o prueba hecha por la IA.
- Una bitácora cuando cambie un flujo visible, rol o comportamiento existente.

## Base de datos

**Puede tocar:**

- `back/prisma/schema.prisma`.
- Una nueva carpeta dentro de `back/prisma/migrations/`.
- `back/prisma/seed.js` para datos de demostración.
- Servicios, modelos y pruebas afectados por el cambio.

**No puede tocar sin autorización explícita:**

- Bases de datos reales o datos de usuarios.
- Migraciones ya aplicadas.
- Archivos de respaldo o dumps existentes.
- Relaciones, columnas críticas o datos productivos sin plan de reversión.

**Debe documentar en:**

- `DOCS_PROYECTO/back_DOCUMENTACION/`.
- `DOCS_PROYECTO/test_DOCUMENTACION/`.
- `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/` para cada migración ejecutada o verificada.

## Documentación y agentes

Los cambios de instrucciones se limitan a `.agents/`, `AGENTS.md` y las carpetas documentales. No deben cambiar código funcional salvo que la solicitud lo autorice expresamente. Cada cambio en estas reglas debe registrarse en una bitácora.
