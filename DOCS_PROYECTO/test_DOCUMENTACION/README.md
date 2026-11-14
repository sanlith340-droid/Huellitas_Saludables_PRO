# Documentación de pruebas

Esta carpeta reúne la estrategia de pruebas y las instrucciones para ejecutar la suite.

| Documento | Contenido |
|---|---|
| [Plan Maestro de Pruebas](PLAN_MAESTRO_DE_PRUEBAS.md) | Las 18 categorías solicitadas, su definición, estado observado, brechas, escenarios, criterios y orden recomendado. |
| [Ejecución de pruebas](EJECUCION.md) | Cómo ejecutar unitarias e integración con Docker o PostgreSQL local, con advertencias para proteger la base de datos. |

## Resumen actual

- **Existe:** pruebas unitarias e integración backend con Vitest/Supertest y PostgreSQL.
- **Evidencia manual documentada:** validación de formularios y algunos flujos, registrada en [`BITACORA_VALIDACION_FORMULARIOS.md`](../back/BITACORA_VALIDACION_FORMULARIOS.md).
- **Falta formalizar o implementar:** pruebas automatizadas de frontend, E2E de sistema, aceptación, pruebas dirigidas por IA como proceso supervisado, rendimiento/carga/estrés, compatibilidad y protocolo de usabilidad.
- **Seguridad:** hay pruebas focalizadas en backend, pero no equivalen a una auditoría completa ni a una prueba de penetración.

No se afirma que una prueba esté aprobada solo porque aparece código: para la última ejecución consulta/añade un reporte fechado siguiendo [`EJECUCION.md`](EJECUCION.md).
