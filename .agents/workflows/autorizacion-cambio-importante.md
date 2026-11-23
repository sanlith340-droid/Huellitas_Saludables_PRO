# Workflow: autorización de cambios importantes

## Cuándo usarlo

Usar este workflow antes de cambiar base de datos, migraciones, autenticación, roles, contraseñas, datos personales, correo, notificaciones, Docker, dependencias, contratos de API, despliegue, estructura de carpetas o una funcionalidad existente.

## Fase 1: análisis sin modificar

El modelo puede leer archivos, comparar versiones, buscar referencias, revisar documentación, estimar impacto y preparar un plan. No puede editar código ni configuración importante durante esta fase.

## Fase 2: solicitud

Completar `.agents/templates/solicitud-cambio-importante.md`. La solicitud debe incluir rutas exactas, explicación técnica, explicación sencilla, riesgos, pruebas, reversión y documentación que se actualizará.

## Fase 3: autorización

Presentar la solicitud al usuario y esperar una respuesta inequívoca como `autorizo`, `aprobado` o una instrucción equivalente. Una respuesta ambigua no autoriza el cambio. Si el usuario pide ajustes, actualizar la solicitud y volver a esperar autorización.

## Fase 4: implementación

Solo después de la autorización se aplican los cambios aprobados. Si el alcance cambia de forma material, detenerse y solicitar autorización adicional.

## Fase 5: verificación y documentación

Ejecutar las pruebas previstas, registrar resultados reales, actualizar la documentación técnica y la bitácora, y actualizar `.agents/workflows/ESTADO_ACTUAL.md`. Informar por separado qué quedó verificado y qué quedó pendiente.

## Excepciones

Las acciones de lectura, diagnóstico, comparación y preparación de una propuesta no requieren autorización. Las correcciones pequeñas de redacción solicitadas expresamente no requieren una nueva autorización, pero deben registrarse si afectan instrucciones del proyecto. Nunca se deben omitir controles de autorización para cambios con riesgo de pérdida de datos, seguridad o interrupción del servicio.
