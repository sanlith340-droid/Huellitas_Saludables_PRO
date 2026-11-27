# Bitácora QA local — 27 de noviembre de 2026

**Proyecto:** Huellitas Saludables  
**Tipo de ejecución:** pruebas locales en Sandbox aislado  
**Estado:** suite completa pendiente de quedar verde; no se cambió código funcional ni de pruebas en esta ronda.

## Registro de la ejecución

Se ejecutó `npm run test:coverage` en una base PostgreSQL temporal del Sandbox. El resultado fue **416 pruebas aprobadas y 1 fallida, en 32 archivos**. No se debe reportar como suite aprobada. El comando se inició con `NODE_ENV=test`, contra `127.0.0.1` y una base cuyo nombre terminaba en `_test`; la base fue eliminada al terminar.

El único fallo fue el caso `nombre de exactamente 200 caracteres se acepta`, dentro de `back/tests/integration/mascotas.test.js`. Esperaba HTTP 201 y recibió HTTP 409. El caso se volvió a ejecutar solo, con una base recién sembrada, y **pasó (1 aprobado; 23 omitidos)**.

## Diagnóstico del hallazgo

El archivo reinicia la base una sola vez antes de comenzar todos sus casos. El usuario de prueba ya tiene tres mascotas por el seed y dos pruebas anteriores agregan una más cada una. Así se alcanza el límite de cinco antes del caso del nombre largo; el backend responde 409 por límite de mascotas. El esquema admite 200 caracteres y el caso aislado pasó.

**Conclusión:** evidencia consistente con dependencia del orden/aislamiento de los tests. No prueba un defecto del campo de nombre ni justifica cambiar el código funcional. El resultado global sigue siendo 416/417 hasta corregir el test y repetir la suite.

## Pendiente y evidencia

- Con autorización del responsable, aislar los datos del caso (por ejemplo, usuario dedicado o reinicio de fixture entre altas).
- Después, ejecutar de nuevo la suite completa y guardar sus resultados y, si la corrida finaliza correctamente, el reporte de cobertura.
- No editar `mascotas.test.js` ni el código de aplicación como parte de esta bitácora.
- También quedan pendientes E2E/interacción real en navegador y la respuesta en vivo de API Ninjas con una clave configurada de forma segura.

La descripción paso a paso y el resto de resultados están en la [auditoría de pruebas locales del 27/11/2026](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_PRUEBA_INTEGRAL_LOCAL.md). La guía de ejecución y el Plan Maestro conservan el estado vigente y las limitaciones.
