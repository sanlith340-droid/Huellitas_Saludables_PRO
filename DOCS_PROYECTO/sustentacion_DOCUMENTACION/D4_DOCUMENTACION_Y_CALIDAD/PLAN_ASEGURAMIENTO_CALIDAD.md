# Plan de aseguramiento de calidad (SQA) — Huellitas Saludables

**Versión 1.1 · 25/11/2026** · Responsables y revisores propuestos: validar con el equipo antes de asumir compromisos.

## 1. Prácticas y estándares de trabajo

| Área | Práctica documentada |
|---|---|
| Código | ESM y arquitectura por capas (rutas, middlewares, controladores, servicios, modelos, esquemas, utilidades); aplicar revisión de cambios |
| API | Validación de entrada, esquema común de respuestas y OpenAPI; contrastar siempre contrato y respuesta efectiva |
| Seguridad | Hash de contraseñas, JWT, limitación de intentos, validación de roles/propietarios y consultas parametrizadas; requiere pruebas específicas y revisión de riesgos |
| Base de datos | Migraciones Prisma versionadas y restricciones/relaciones del esquema; validar casos positivos, negativos y concurrencia |
| Automatización | ESLint en `back/` y `front/`; workflow en `.github/workflows/ci.yml`. Su presencia no prueba una ejecución remota verde |
| Documentación | Registrar cambio, procedimiento, resultado y limitaciones; no llamar “cerrado” a un caso sin evidencia reproducible |

## 2. Herramientas configuradas

| Herramienta | Comando | Propósito |
|---|---|---|
| ESLint backend/frontend | `npm run lint` (desde cada paquete: [backend](../../../back/package.json), [frontend](../../../front/package.json)) | Análisis estático de JavaScript/TypeScript |
| TypeScript y Vite | `npm run build` (desde [front/](../../../front/package.json)) | Tipado y compilación del frontend |
| Vitest + Supertest | `npm test` (desde [back/](../../../back/package.json)); configuración en [vitest.config.js](../../../back/vitest.config.js) | Pruebas unitarias/de integración backend |
| Cobertura V8 | `npm run test:coverage` (desde [back/](../../../back/package.json)) | Medición de cobertura; **no ejecutada en el pase actual**; V8 y reporters `text`/`html`/`lcov` están configurados |
| npm audit | `npm audit` / `npm audit --omit=dev` | Triage de dependencias; la salida de `npm ci` no sustituye un análisis de explotabilidad |
| GitHub Actions | [workflow CI](../../../.github/workflows/ci.yml) | Flujo CI configurado; **sin evidencia de corrida remota en esta revisión** |

## 3. Umbrales y medición disponible

Los umbrales siguientes son objetivos documentados, no certificación. Las cifras actuales corresponden a la ejecución local indicada; cobertura/CI no se infieren de resultados anteriores.

| Métrica | Objetivo | Resultado del pase local actual | Estado |
|---|---:|---|:-:|
| Pruebas backend aprobadas | 100 % | 410/410, 31 archivos | ✅ en la suite local |
| Cobertura de sentencias | ≥ 75 % | No medida en este pase | 🟡 pendiente |
| Cobertura de ramas | ≥ 60 % | No medida en este pase | 🟡 pendiente |
| Cobertura de funciones/líneas | ≥ 80 % | No medida en este pase | 🟡 pendiente |
| Errores ESLint | 0 | Front 0; back 0 | ✅ local |
| Advertencias ESLint | ≤ 10 | Front 0; back 4 | ✅ local |
| Build frontend | Sin errores | `npm run build` correcto | ✅ local |
| Defectos críticos abiertos | 0 | No se emitió una clasificación/aceptación integral en este pase | 🟡 no determinado |
| Vulnerabilidades altas/críticas | Revisar antes de liberar | `npm ci` backend reportó 8: 4 moderadas y 4 altas; sin triage ni `npm audit fix` | 🟡 pendiente |

La suite usó PostgreSQL 16 local y una base temporal separada que fue eliminada al finalizar. El smoke comprobó `/health` HTTP 200; no fue una prueba funcional completa. Consulte el [informe actual](INFORME_FINAL_VERIFICACION_CALIDAD.md) y la [guía de ejecución](../../test_DOCUMENTACION/EJECUCION.md) para alcance y límites.

## 4. Ciclo recomendado y evidencias por conservar

Antes de fusionar o entregar, ejecutar lint, pruebas y build; revisar defectos y dependencias; guardar comandos, versiones, logs y hashes; completar pruebas de permisos, integridad y recorridos de usuario. Adjuntar también la corrida CI remota, cobertura actual, defectos abiertos/cerrados y aceptación cuando existan.

## 5. Límites de esta revisión

No se ejecutaron cobertura, frontend/E2E, carga, CI remoto, backup/restore ni aceptación. Las capturas locales son inspección visual con cuentas/datos sintéticos; no equivalen a pruebas de flujo porque no se enviaron formularios ni se cambiaron estados. El cumplimiento del plan debe revisarse con el equipo y el jurado.
