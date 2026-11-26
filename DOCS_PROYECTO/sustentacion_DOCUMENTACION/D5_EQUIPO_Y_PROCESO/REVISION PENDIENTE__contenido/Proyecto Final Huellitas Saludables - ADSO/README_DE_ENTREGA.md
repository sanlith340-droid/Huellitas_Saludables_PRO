# Entrega de calidad — Huellitas Saludables

**Versión:** 1.0  
**Preparación documental:** 2026-11-20  
**Aceptación:** pendiente, sin firmas.

## Contenido principal

- `Matriz_Trazabilidad_RTM.xlsx`: RF, RNF, historias, criterios GWT, reglas, tarjetas Project 4, decisiones abiertas, convención de estados y vínculos a casos candidatos por historia.
- `Matriz_Casos_de_Prueba.xlsx`: 140 casos manuales reportados sin detalle y no ejecutados, 80 candidatos GWT separados y resultados automatizados solo reportados anteriormente.
- `Control_Incidencias_y_Defectos.xlsx`: hallazgos estáticos/documentales, agregación de 36 observaciones no itemizadas y exclusión de ejemplos ajenos.
- `Bitacora_Aseguramiento_de_Calidad.xlsx` y `Criterios_Finalizacion.xlsx`: actividades, límites y criterios pendientes.
- `Especificacion_Requerimientos_Adaptada.docx` y `.pdf`; `Historias_de_Usuario_Adaptadas.xlsx` (Historias_US, Criterios_GWT y Revision_INVEST); `Reglas_de_Negocio_Adaptadas.docx` y `.pdf`.
- `Dossier_Calidad_Software.docx` y `.pdf`; `Acta_Aceptacion_Final.docx` y `.pdf` (pendiente, sin firmas).
- `QA_artefactos.json`, `Inventario_Evidencias.csv`, `Informe_Adaptacion.md` y `Evidencias-Pruebas/`.

El manifiesto y el inventario enumeran y calculan SHA-256 de los artefactos de contenido; excluyen ambos archivos de manifiesto para evitar autorreferencia. Los dos están incluidos en el ZIP.

## Tres estados que no deben confundirse

La columna del Project informa estado de trabajo. El estado técnico informa revisión estática de código. El estado de calidad/aceptación informa ejecución de prueba individual y aceptación. “Verificado en código” no es “prueba aprobada”. “HECHO” en GitHub no es aceptación ni evidencia suficiente de implementación.

## Límites explícitos

1. Se usó la captura Project 4 de `2026-11-20 09:42 COT (hora local consignada en la captura heredada)`; la consulta web posterior no expuso contenido dinámico de tarjetas. No se reporta como refresco completo al momento de la entrega.
2. La fuente recibida declara 140 casos manuales y 36 observaciones estáticas/cobertura, pero no incluye el detalle de ninguno. La matriz recibida tiene cinco ejemplos ajenos. Los 140 índices no inventan IDs ni pasos. Los 80 escenarios GWT reconstruidos son candidatos adicionales, no se suman a los 140 y no se ejecutaron.
3. 336/336 pruebas, build, type-check y smoke se conservan como resultados previos reportados por el usuario. No se reejecutaron ni hay logs adjuntos en el ZIP recibido.
4. RF012/US-12 y RN28 se contradicen; RN39 requiere conciliar el contrato de errores; alcance de cuidador/guardería, tarjetas #2/#13 y restauración por correo requieren decisión.
5. No se firmó ni aprobó el acta. No se modificó código fuente ni archivos `.env`.

## Revisión recomendada

Revisar primero `Informe_Adaptacion.md`, luego `Matriz_Trazabilidad_RTM.xlsx` (hojas `RTM_Requisitos`, `Criterios_GWT`, `Reglas_RN`, `Backlog_GitHub`, `Decisiones_Abiertas`) y `Evidencias-Pruebas/Revision_Estatica_Codigo.md`. Antes de aceptar el producto, aportar los 140 casos fuente, registrar ejecuciones manuales, adjuntar los logs automatizados/smoke y cerrar las decisiones abiertas.
