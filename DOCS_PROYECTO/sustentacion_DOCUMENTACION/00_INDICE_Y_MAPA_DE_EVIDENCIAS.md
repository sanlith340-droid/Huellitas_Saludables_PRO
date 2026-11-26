# Sustentación final — Huellitas Saludables

Expediente ordenado según los cinco dominios y los 12 criterios de la Lista de Chequeo T4 (ADSO 228118, SENA CGMLTI). Este paquete **no declara cumplimiento del 100 %, aprobación ni aceptación final**. El despliegue externo en Render sí está acreditado con auditoría y verificación fechadas.

## Estado sintético de criterios

| # | Dimensión | Criterio | Estado de la evidencia disponible | Falta principal |
|--:|---|---|---|---|
| 1 | D1 | Backlog, porcentaje y retrospectiva de T1–T4 | 🟡 Borrador; 15,5/17 = 91,2 % solo sobre 17 tarjetas identificadas | Confirmar universo/estados y agregar validación personal de cada integrante |
| 2 | D1 | Plan de implantación con secuencia, responsables y éxito | 🟡 Plan documentado, prospectivo | Confirmar responsables/fechas/criterios y registrar implantación realmente ejecutada |
| 3 | D2 | Sistema integrado sin errores críticos | 🟡 Ejecución local; `/health` HTTP 200, 6 migraciones y 410/410 pruebas backend | Demostrar flujo completo y aceptación en el ambiente objetivo |
| 4 | D2 | Errores robustos e integridad referencial | 🟡 Hay validaciones, esquema y pruebas, pero no se demostraron exhaustivamente | Casos de integridad/errores por niveles y evidencia de resultados |
| 5 | D2 | Roles, permisos y código organizado | 🟡 Controles por rol/propietario en código y pruebas; no hay validación de seguridad en staging | Demostración permitida/denegada por rol y revisión en entorno externo |
| 6 | D2* | IoT/móvil, si aplica | ➖ No se encontró evidencia de integración IoT/móvil | Confirmar formalmente que no aplica al alcance con equipo/jurado |
| 7 | D3 | Despliegue externo y ambientes separados | 🟡 Render verificado: frontend, API, PostgreSQL, `/health`, login y Swagger | Completar separación formal de ambientes y documentar operación/retención |
| 8 | D3 | Manual técnico y manual de usuario con capturas reales | 🟡 Manuales revisados y capturas actuales locales | Validar instalación desde ambiente limpio y confirmar acceso disponible |
| 9 | D3 | Copias de seguridad y migración | 🟡 Política documentada; ensayo local citado en antecedente no reejecutado aquí | Repetir backup/restore, adjuntar logs y probar mecanismo del ambiente desplegado |
| 10 | D4 | Plan de calidad, métricas y análisis estático | 🟡 Plan y ESLint configurados; lint local ejecutado | Ejecutar CI remoto, medir cobertura y tratar hallazgos de dependencias |
| 11 | D4 | Informe final de calidad | 🟡 410/410 backend, build y lint documentados | Ejecutar E2E/manual/aceptación; no se midió cobertura ni se hizo backup/restore actual |
| 12 | D5 | Explicación individual y reflexión de 4 trimestres | 🟡 Guion y plantilla; reflexiones personales vacías, ensayo no acreditado | Aportes reales y ensayo de cada integrante |

## Carpetas por dimensión

| Carpeta | Qué reúne | Estado y guía de pendientes |
|---|---|---|
| `D1_GESTION_Y_PLANEACION/` | Gestión, backlog, planeación y retrospectiva | [README D1](D1_GESTION_Y_PLANEACION/README.md) |
| `D2_ARTEFACTOS_TECNICOS/` | Requisitos, reglas, diagramas y acta | [README D2](D2_ARTEFACTOS_TECNICOS/README.md) |
| `D3_IMPLANTACION_Y_DESPLIEGUE/` | Manuales, ambientes, backups y capturas | [README D3](D3_IMPLANTACION_Y_DESPLIEGUE/README.md) |
| `D4_DOCUMENTACION_Y_CALIDAD/` | Plan, pruebas, defectos, calidad y logs | [README D4](D4_DOCUMENTACION_Y_CALIDAD/README.md) |
| `D5_EQUIPO_Y_PROCESO/` | Guion y reflexión individual | [README D5](D5_EQUIPO_Y_PROCESO/README.md) |

## Fuentes documentales del proyecto

La raíz documental real se llama `DOCS_PROYECTO/`. Los documentos fuente de cada área están en las carpetas hermanas de `sustentacion_DOCUMENTACION/`:

| Área | Fuente documental |
|---|---|
| Backend | [README de back_DOCUMENTACION](../back_DOCUMENTACION/README.md) |
| Frontend | [README de front_DOCUMENTACION](../front_DOCUMENTACION/README.md) |
| Pruebas | [README de test_DOCUMENTACION](../test_DOCUMENTACION/README.md) |

## Hechos verificados en la revisión local

- Proyecto ejecutado en sandbox local aislado con Node.js 22, PostgreSQL 16, seis migraciones Prisma y datos sintéticos de `back/prisma/seed.js`; frontend y API accesibles localmente. La API devolvió HTTP 200 en `/health`.
- Suite backend: 410/410 pruebas en 31 archivos. Build frontend correcto; lint frontend 0 errores/0 advertencias; lint backend 0 errores/4 advertencias.
- `npm ci` reportó 8 vulnerabilidades en dependencias del backend: 4 moderadas y 4 altas. No se ejecutó `npm audit fix`.
- No se midió cobertura, no se ejecutaron pruebas E2E/carga, no se reejecutó backup/restore, no se validó CI remoto y no se emitió aceptación.
- Las 18 capturas son pantallas locales con datos demo; no sustituyen la auditoría externa de Render. Véase `D3_IMPLANTACION_Y_DESPLIEGUE/EVIDENCIA_CAPTURAS_ACTUAL/README.md`, sus hashes y la auditoría Render.

## Conservación y uso

El código ejecutable de la aplicación está en `back/` y `front/` en la raíz de esta copia; su documentación fuente está organizada bajo `DOCS_PROYECTO/back_DOCUMENTACION/`, `DOCS_PROYECTO/front_DOCUMENTACION/` y `DOCS_PROYECTO/test_DOCUMENTACION/`. `CRITERIOS_D1/DOCX/` y `CRITERIOS_D1/PDF/` son copias espejo de los manuales finales de D3 por compatibilidad; la versión fuente documental está en `D3_IMPLANTACION_Y_DESPLIEGUE/`. Los ZIP y artefactos que parecen plantilla o expediente previo se conservan, pero no sustituyen evidencia vigente ni deben presentarse como prueba de estado actual sin validación. La ponderación/calificación y la decisión final corresponden al jurado.
