
## Política adicional: autorización antes de cambios importantes

Se estableció que cualquier cambio con capacidad de afectar el funcionamiento, los datos, la seguridad o la arquitectura debe presentarse primero como una solicitud de autorización. La solicitud debe indicar las rutas de archivos, el alcance, dependencias, riesgos, pruebas, reversión y documentación afectada.

Cada solicitud debe contener una explicación técnica detallada y otra explicación en lenguaje sencillo para personas sin conocimientos de programación. El modelo puede analizar y preparar la propuesta sin autorización, pero debe esperar una respuesta explícita antes de editar el proyecto. Si el alcance cambia materialmente, debe solicitar autorización nuevamente.

Se añadieron `.agents/templates/solicitud-cambio-importante.md`, `.agents/templates/entrada-bitacora-cambio.md` y `.agents/workflows/autorizacion-cambio-importante.md`.
