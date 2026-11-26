# D4 — Documentación y calidad

**Criterios asociados:** 10 y 11. **Estado global:** 🟡 Parcial; no se midió cobertura ni se obtuvo aceptación.

## Resultado del pase local actual

- Backend: **410/410 pruebas aprobadas en 31 archivos** con PostgreSQL 16 local. La base temporal de pruebas terminó eliminada; consulte el [log Vitest](EVIDENCIAS_EJECUCION_ACTUAL/Vitest_410_31_archivos.log).
- Frontend: `npm run build` correcto; lint sin errores ni advertencias. Consulte los logs de [build](EVIDENCIAS_EJECUCION_ACTUAL/Frontend_build.log) y [lint frontend](EVIDENCIAS_EJECUCION_ACTUAL/Frontend_lint.log).
- Backend: lint con 0 errores y 4 advertencias; consulte el [log de lint backend](EVIDENCIAS_EJECUCION_ACTUAL/Backend_lint.log).
- `npm ci` reportó 8 vulnerabilidades en dependencias del backend: 4 moderadas y 4 altas. No se ejecutó `npm audit fix`; requiere triage.
- La API local respondió HTTP 200 en `/health`. Esto es un smoke mínimo, no aceptación funcional.
- Se capturaron 11 pantallas locales con datos sintéticos; no se enviaron formularios ni se cambiaron estados.

## Qué falta para el cumplimiento total

1. **Criterio 10:** ejecutar y adjuntar una corrida de CI en el repositorio remoto; medir cobertura en una nueva ejecución y contrastarla con umbrales aprobados; revisar las 8 vulnerabilidades y registrar acciones. Los porcentajes de cobertura heredados no se presentan como medición actual.
2. **Criterio 11:** ejecutar la muestra manual/E2E y casos negativos con resultados observados; registrar defectos reproducidos y su estado; completar el informe de incidencias y validar en un ambiente externo. No se ejecutaron E2E, pruebas de carga, backup/restore ni aceptación en este pase.
3. Obtener revisión y aprobación del equipo y de la persona evaluadora. El acta de aceptación permanece vacía/sin firmas.

## Precauciones sobre archivos heredados

- `ejemplo-plan-de-pruebas.pdf` es un ejemplo ajeno, no es evidencia del proyecto: **no presentar**.
- `Revision_Estatica_Codigo.md`, planillas, dossier y reportes heredados se conservan; comprobar su fecha/alcance antes de exponerlos. Los resultados actuales están en el [informe de verificación](INFORME_FINAL_VERIFICACION_CALIDAD.md), el [reporte de ejecución](Reporte_Ejecucion_y_Revision.md) y los logs enlazados arriba.
- Consulte también el [Plan Maestro de Pruebas](../../test_DOCUMENTACION/PLAN_MAESTRO_DE_PRUEBAS.md) y la [guía de ejecución](../../test_DOCUMENTACION/EJECUCION.md): el primero es prospectivo y la segunda no acredita la ejecución de los casos planeados.
- El dossier DOCX/PDF y algunas planillas de calidad son artefactos heredados con corte anterior (20/11/2026); cualquier cifra distinta a la del pase local del 25/11 es histórica. En particular, `Dossier_Calidad_Software.docx` y `Criterios_Finalizacion.xlsx` retienen el antecedente 336/336 en 24 archivos; no sustituir los resultados actuales por esas métricas antiguas. El [informe actual](INFORME_FINAL_VERIFICACION_CALIDAD.md) es la fuente de la ejecución más reciente.
- `QA_artefactos.json` e `Inventario_Evidencias.csv` son snapshots previos a esta actualización documental; no se modificaron ni regeneraron para preservar la evidencia. Los hashes de documentos editados podrían no coincidir con esos snapshots; regenérelos en un cierre documental autorizado antes de presentar un paquete con manifiestos vigentes.
