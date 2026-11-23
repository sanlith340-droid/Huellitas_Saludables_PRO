# AGENTS.md — Instrucciones obligatorias para Huellitas Saludables

## Regla de entrada obligatoria

Antes de leer, modificar o ejecutar cualquier parte del proyecto, todo modelo, agente o colaborador debe leer este archivo completo y después revisar `.agents/README.md`. Luego debe consultar las Rules, Skills y Workflows relevantes a la tarea.

Si otro modelo toma el trabajo, debe leer también `.agents/workflows/transferencia-de-contexto.md` y el documento de estado indicado allí. No se debe asumir que la conversación anterior está disponible.

## Propósito del proyecto

Huellitas Saludables es un sistema de gestión veterinaria con frontend React/TypeScript, backend Node.js/Express, Prisma y PostgreSQL. Incluye autenticación por roles, mascotas, citas, disponibilidades, historias clínicas, recuperación de contraseña y notificaciones in-app para especialistas.

## Arquitectura del repositorio

- `back/`: API, servicios, modelos, rutas, esquemas, Prisma y pruebas backend.
- `front/`: aplicación React/TypeScript y sus páginas.
- `DOCS_PROYECTO/`: documentación funcional, técnica, de pruebas y bitácoras.
- `.agents/`: instrucciones para modelos: reglas, habilidades, workflows y perfiles.
- `docker-compose.yml`: orquesta base de datos, backend y frontend.

## Documentación obligatoria

Toda modificación debe documentarse en el lugar correspondiente:

- Decisión o cambio transversal: `DOCS_PROYECTO/back_DOCUMENTACION/` o la carpeta documental correspondiente.
- Cambio de frontend: `DOCS_PROYECTO/front_DOCUMENTACION/`.
- Prueba, validación o resultado de QA: `DOCS_PROYECTO/test_DOCUMENTACION/`.
- Toda prueba o ejecución realizada por la IA al levantar, correr, compilar, migrar, consultar o probar el proyecto: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.
- Cambio de funcionalidad, fusión, incidencia o pendiente: una `BITACORA_*.md` en la carpeta documental adecuada.
- Cambio de reglas para agentes: actualizar `.agents/` y registrar el cambio en una bitácora.
- Estado para continuidad entre modelos: actualizar `.agents/workflows/ESTADO_ACTUAL.md`.

No se considera terminada una tarea si el código cambia pero la documentación y la bitácora no se actualizan.

La auditoría de una ejecución es obligatoria aunque también se actualicen el plan de pruebas, la documentación funcional o una bitácora específica. Cada auditoría debe incluir fecha, modelo o responsable, objetivo, comando o procedimiento, entorno, resultado exacto, evidencia sanitizada, limitaciones y siguiente acción.

## Autorización previa para cambios importantes

Antes de aplicar cualquier cambio importante que pueda afectar el funcionamiento del proyecto, el modelo debe detenerse y presentar una solicitud de autorización. No debe editar código, migraciones, dependencias, configuración sensible ni borrar o mover archivos hasta recibir una autorización explícita del usuario.

Se considera importante, como mínimo, cualquier cambio que afecte la base de datos, migraciones, autenticación, autorización, contraseñas, roles, datos personales, correo SMTP, notificaciones, Docker, dependencias, estructura de carpetas, contratos de API, despliegue o una funcionalidad existente.

La solicitud debe indicar los archivos y carpetas que se modificarían, el comportamiento actual, el comportamiento propuesto, dependencias, riesgos, compatibilidad, plan de pruebas y plan de reversión. Debe incluir dos explicaciones: una explicación técnica detallada y otra explicación sencilla, como para una persona que no conoce programación. La explicación sencilla no puede ocultar riesgos ni condiciones importantes.

El modelo puede inspeccionar archivos, analizar, comparar versiones y preparar un plan sin autorización. Solo puede aplicar el cambio después de una respuesta explícita de autorización. Si la autorización es ambigua, debe pedir aclaración. La plantilla obligatoria está en `.agents/templates/solicitud-cambio-importante.md` y el procedimiento completo en `.agents/workflows/autorizacion-cambio-importante.md`.

## Reglas de desarrollo

1. No guardar secretos, contraseñas, tokens ni credenciales reales en el repositorio.
2. No modificar migraciones de Prisma ya aplicadas; crear una nueva migración cuando corresponda.
3. Validar entradas en el backend y comprobar permisos en el backend, no solo en el frontend.
4. Mantener la separación `back/` y `front/`; no crear un segundo backend en la raíz.
5. Toda funcionalidad nueva debe incluir pruebas y documentación.
6. Revisar el impacto de cualquier cambio en autenticación, roles, datos personales, correo o notificaciones.
7. No eliminar archivos por parecer duplicados sin comprobar sus referencias, Docker y scripts.
8. No afirmar que una prueba fue realizada si no existe evidencia de su ejecución.

## Comandos de validación

Backend:

```bash
cd back
npm test
npm run migrate:status
```

Frontend:

```bash
cd front
npm run build
```

Proyecto completo:

```bash
docker compose up --build
```

## Cierre obligatorio de una tarea

Antes de entregar:

- revisar los archivos modificados;
- ejecutar las pruebas aplicables;
- registrar resultados reales y pendientes;
- actualizar la bitácora correspondiente;
- actualizar `.agents/workflows/ESTADO_ACTUAL.md`;
- dejar instrucciones claras para el siguiente modelo si el trabajo continúa.

## Índice de instrucciones especializadas

- Reglas: `.agents/rules/`
- Skills: `.agents/skills/`
- Workflows: `.agents/workflows/`
- Perfiles opcionales: `.agents/agents/`
- Plantillas de solicitudes y autorizaciones: `.agents/templates/`
- Auditorías de pruebas de la IA: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`
- Documentación técnica: `DOCS_PROYECTO/`
