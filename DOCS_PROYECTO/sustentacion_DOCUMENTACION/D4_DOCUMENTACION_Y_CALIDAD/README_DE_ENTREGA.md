# Entrega documental D4 — Huellitas Saludables

**Preparación:** 25/11/2026 (UTC−05:00). **Estado de aceptación:** pendiente; el acta no tiene nombres ni firmas. Este dossier reúne el plan de calidad, los informes y las evidencias disponibles; no es certificación ni declaración de aprobación.

## Evidencias principales

- [PLAN_ASEGURAMIENTO_CALIDAD.md](PLAN_ASEGURAMIENTO_CALIDAD.md): prácticas, herramientas y umbrales; distingue la medición local de métricas aún no medidas.
- [INFORME_FINAL_VERIFICACION_CALIDAD.md](INFORME_FINAL_VERIFICACION_CALIDAD.md) y [Reporte_Ejecucion_y_Revision.md](Reporte_Ejecucion_y_Revision.md): resultados consignados en el pase actual y límites.
- `EVIDENCIAS_EJECUCION_ACTUAL/`: log Vitest 410/410 en 31 archivos, build frontend y lint de ambos proyectos.
- Matrices, bitácora, incidencias, criterios de finalización y dossier conservados como material de trazabilidad; revisar fecha y estado antes de presentarlos.
- `QA_artefactos.json` e `Inventario_Evidencias.csv`: inventario actualizado de tamaño/hash; se excluyen mutuamente para evitar autorreferencia.

## Resultado actual resumido

Backend 410/410; frontend build correcto; lint frontend 0 errores/0 advertencias y backend 0 errores/4 advertencias. PostgreSQL 16 fue local; `/health` respondió 200. `npm ci` reportó 8 vulnerabilidades en dependencias del backend (4 moderadas y 4 altas), sin triage ni `npm audit fix`.

No se midió cobertura; no se ejecutaron E2E, carga, CI remoto, backup/restore actual ni aceptación. El recuento 336/336, 378/378 y los porcentajes de cobertura de versiones anteriores son históricos, no resultados del pase actual. La matriz de casos PMP y sus escenarios son prospectivos y no quedan aprobados por el resultado 410/410 de la suite backend.

## Elementos que no se deben presentar como evidencia del proyecto

`ejemplo-plan-de-pruebas.pdf` es un ejemplo ajeno y debe quedar fuera de la sustentación. El dossier DOCX/PDF y los anexos heredados de procedencia/estática corresponden a cortes previos (entre ellos 20/11/2026); si muestran métricas distintas, son históricas. Use el [informe actual](INFORME_FINAL_VERIFICACION_CALIDAD.md) para el estado de la última ejecución. `Acta_Aceptacion_Final` sigue en blanco y no prueba aceptación.
