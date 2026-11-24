# Bitácora — auditorías de cambios y pruebas realizadas por IA

**Fecha:** 23 de noviembre de 2026

## Decisión

Toda prueba o ejecución que la IA realice relacionada con levantar, correr, compilar, migrar, consultar o probar el proyecto debe quedar registrada en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.

La auditoría es obligatoria aunque también se actualicen la documentación funcional, el plan de pruebas o una bitácora específica. Su finalidad es conservar trazabilidad sobre qué se ejecutó, en qué entorno, con qué resultado y con qué limitaciones.

## Alcance

La regla cubre backend, frontend, Docker, PostgreSQL, migraciones, API, navegador, SMTP, integraciones y validaciones usadas para aceptar o rechazar cambios.

## Protección de información

Las auditorías no deben incluir contraseñas, tokens, secretos, credenciales, datos clínicos ni datos personales. Los logs deben sanitizarse antes de copiarse.

## Actualización — 24 de noviembre de 2026

Se registró la prueba viva del límite de mascotas en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_PRUEBA_VIVA_LIMITE_MASCOTAS.md`. La validación cubrió el inicio de sesión demo, la navegación a `/mascotas/nueva`, el rechazo de una sexta mascota y la comprobación visual de la imagen, el mensaje y el enlace de administración.
