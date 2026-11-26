# Informe de verificación de calidad — Huellitas Saludables

**Corte:** 25/11/2026, hora local (UTC−05:00). **Entorno:** sandbox local aislado. **Estado:** evidencia técnica parcial; no reemplaza la evaluación, la aceptación ni la validación de un despliegue.

## 1. Alcance del pase

Se ejecutó la versión de trabajo con frontend React/Vite, API Express y PostgreSQL 16 local. Se aplicaron seis migraciones Prisma a una base nueva de demostración con datos sintéticos. La API respondió HTTP 200 en `/health`; el frontend respondió HTTP 200 en su origen local. Se ejecutaron pruebas backend, build y lint. Se inspeccionaron 11 pantallas por rol sin enviar formularios ni cambiar estado de datos.

## 2. Resultados reproducidos

| Comprobación | Resultado | Evidencia y límite |
|---|---|---|
| Pruebas backend | **410/410 aprobadas, 31 archivos** | [Log Vitest](EVIDENCIAS_EJECUCION_ACTUAL/Vitest_410_31_archivos.log); Vitest sobre PostgreSQL local y base temporal de pruebas, eliminada al terminar |
| Build frontend | Correcto (`npm run build`) | [Log de build](EVIDENCIAS_EJECUCION_ACTUAL/Frontend_build.log); `tsc -b` + Vite; compilación no equivale a prueba funcional |
| Lint frontend | 0 errores, 0 advertencias | [Log lint frontend](EVIDENCIAS_EJECUCION_ACTUAL/Frontend_lint.log) |
| Lint backend | 0 errores, 4 advertencias | [Log lint backend](EVIDENCIAS_EJECUCION_ACTUAL/Backend_lint.log) |
| API `/health` | HTTP 200 | Comprobación local, sin evidencia de URL pública ni disponibilidad externa |
| Capturas por rol | 11 imágenes actuales | Cuentas/datos demo sintéticos; inspección visual sin mutaciones, no prueba de flujo completo |
| Dependencias backend | `npm ci` reportó 8 vulnerabilidades: 4 moderadas y 4 altas | Triage pendiente; no se ejecutó `npm audit fix` |

El resultado de Vitest no implica cobertura total, aceptación de requisitos, pruebas E2E ni seguridad exhaustiva. La suite incluye pruebas de integración para autorización por propietario en consultas de mascotas/citas y lectura de historias clínicas de mascotas propias (rechaza mascotas ajenas); no se realizó una prueba manual de intrusión en un ambiente publicado.

## 3. No ejecutado en este pase

No se calculó cobertura; los porcentajes citados en reportes anteriores son históricos y no se deben presentar como medición actual. Tampoco se ejecutaron pruebas frontend/E2E/carga, un flujo de negocio completo con envío de formularios, CI remoto, Docker, backup/restore, restauración productiva ni aceptación por jurado/cliente. La estrategia de backups contiene un ensayo local reportado previamente, pero no se reejecutó aquí.

## 4. Hallazgos y pendientes conocidos

| Tema | Estado sustentado | Acción pendiente |
|---|---|---|
| Autorización por propietario | Código actual limita consultas GET de mascotas/citas y permite lectura de historias solo para mascotas propias; `historia.test.js` cubre acceso propio/ajeno y restricciones de rol | Revalidar manualmente todos los roles en staging y conservar evidencia externa |
| Notificaciones | Avisos persistentes dentro de la aplicación para citas y disponibilidad; la suite incluye pruebas de integración | No hay correo/SMS/push configurados; esta inspección no disparó un evento desde la UI |
| Dependencias | 8 avisos reportados por `npm ci` del backend (4 moderados, 4 altos) | Clasificar y actualizar con pruebas; no modificar a ciegas |
| Contratos/requisitos | Hay diferencias documentales por conciliar (p. ej., RN39 y consulta de historia clínica) | Decisión del equipo, trazabilidad y actualización coherente |
| Auditoría durable, E2E y despliegue | No demostrados como capacidades operativas en este pase | Definir alcance y generar evidencia antes de declarar cierre |

No se asigna una cantidad global de defectos críticos “abiertos/cerrados” porque esta ejecución no incluyó una revisión exhaustiva de aceptación ni una clasificación completa del registro de defectos.

## 5. Conclusión

La evidencia reproducida confirma que la suite backend aprobó, que el frontend compila y que lint finalizó con los resultados arriba consignados en el entorno local. Persisten límites relevantes: vulnerabilidades pendientes de triage, cobertura no medida, ausencia de E2E/CI remoto/backup-restore actual y aceptación. Por ello, el informe **no declara cumplimiento del 100 %, aprobación para etapa productiva ni aceptación final**. El [PMP](../../test_DOCUMENTACION/PLAN_MAESTRO_DE_PRUEBAS.md) y la [guía de ejecución](../../test_DOCUMENTACION/EJECUCION.md) son documentación prospectiva y no alteran los resultados registrados en este corte.
