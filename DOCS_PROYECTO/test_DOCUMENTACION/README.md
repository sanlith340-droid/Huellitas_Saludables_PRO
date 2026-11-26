# Documentación de pruebas

Esta carpeta reúne la estrategia de pruebas y las instrucciones para ejecutar la suite.

| Documento | Contenido |
|---|---|
| [Plan Maestro de Pruebas v1.2](PLAN_MAESTRO_DE_PRUEBAS.md) | Borrador para revisión/aprobación, adaptado metodológicamente a ISO/IEC/IEEE 29119-3; alcance, riesgos, criterios, secuencia, responsables y límites. |
| [Plan Maestro de Pruebas PDF](PLAN_MAESTRO_DE_PRUEBAS.pdf) | Copia de lectura del plan; prevalece el Markdown como fuente editable. |
| [Matriz de casos PMP v1.2](Matriz_Casos_de_Prueba_PMP_v1.2.xlsx) | 78 casos planificados, exclusiones, trazabilidad, preparación y formatos de registro; no contiene ejecuciones nuevas. |
| [Ejecución de pruebas](EJECUCION.md) | Cómo ejecutar unitarias e integración con Docker o PostgreSQL local, con advertencias para proteger la base de datos. |
| [Seed demo del 27 de noviembre](SEED_DEMO_27_NOVIEMBRE.md) | Preparación, recorrido manual y conteos esperados para la demostración integrada. |

## Resumen actual

- **Existe:** pruebas unitarias e integración backend con Vitest/Supertest y PostgreSQL.
- **Evidencia manual documentada:** validación de formularios y algunos flujos, registrada en [`BITACORA_VALIDACION_FORMULARIOS.md`](../back_DOCUMENTACION/BITACORA_VALIDACION_FORMULARIOS.md).
- **Falta formalizar o implementar:** pruebas automatizadas de frontend, E2E de sistema, aceptación, pruebas dirigidas por IA como proceso supervisado, rendimiento/carga/estrés, compatibilidad y protocolo de usabilidad.
- **Seguridad:** hay pruebas focalizadas en backend, pero no equivalen a una auditoría completa ni a una prueba de penetración.

No se afirma que una prueba esté aprobada solo porque aparece código: para la última ejecución consulta/añade un reporte fechado siguiendo [`EJECUCION.md`](EJECUCION.md).

**Estado de esta documentación:** los 78 casos del PMP son planificación, no ejecuciones. Los 140 casos manuales reportados sin IDs/pasos fuente se conservan como brecha; esta matriz no los reemplaza. El pase local actual consignado en el [informe de verificación](../sustentacion_DOCUMENTACION/D4_DOCUMENTACION_Y_CALIDAD/INFORME_FINAL_VERIFICACION_CALIDAD.md) reporta 410/410 en 31 archivos, build correcto, lint frontend 0/0 y backend 0 errores/4 advertencias; no se calculó cobertura. La suite no se reejecutó al hacer esta edición documental y sus resultados no acreditan los casos nuevos del PMP.
