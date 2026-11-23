# Estructura `.agents`

Esta carpeta contiene instrucciones versionadas junto con el código para que cualquier modelo pueda continuar el proyecto de forma consistente.

## Orden de lectura

1. `/AGENTS.md`
2. `.agents/README.md`
3. `.agents/workflows/ESTADO_ACTUAL.md`
4. Las Rules relacionadas con la tarea.
5. La Skill o Skills relacionadas.
6. El Workflow que corresponda.
7. La bitácora y documentación técnica relacionada en `DOCS_PROYECTO/`.

## Qué contiene cada carpeta

- `rules/`: restricciones breves y obligatorias por área.
- `skills/`: procedimientos especializados y conocimiento reutilizable.
- `workflows/`: pasos repetibles, continuidad y transferencia de contexto.
- `agents/`: perfiles de responsabilidad; son opcionales y no sustituyen a `AGENTS.md`.
- `templates/`: formatos obligatorios para solicitar autorización y registrar cambios importantes.

## Regla de documentación

La información debe tener una única fuente principal. Las reglas de agentes viven en `.agents/`; la documentación de producto y de implementación vive en `DOCS_PROYECTO/`; el estado de continuidad vive en `.agents/workflows/ESTADO_ACTUAL.md`. Si una modificación afecta más de un área, se enlazan los documentos en lugar de duplicar el contenido completo.

Cada Rule especifica qué puede tocar el modelo, qué no puede tocar sin autorización y dónde debe documentar el resultado. La IA debe respetar esa delimitación antes de editar archivos.

Toda prueba o ejecución relacionada con el proyecto se audita en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`, usando `PLANTILLA_AUDITORIA_IA.md`. Esta obligación aplica aunque la prueba sea exitosa, fallida, manual, automatizada, local, en Docker o realizada desde un navegador.

## Incorporar una nueva Skill o Rule

1. Definir su propósito y cuándo se aplica.
2. Crear el archivo en la carpeta correspondiente.
3. Enlazarlo desde este índice o desde la Skill principal.
4. Probarlo en una tarea real.
5. Registrar la incorporación en una bitácora.
6. Actualizar `ESTADO_ACTUAL.md` si cambia el procedimiento de trabajo.

## Cambios importantes

Antes de aplicar un cambio importante, usar `.agents/templates/solicitud-cambio-importante.md` y seguir `.agents/workflows/autorizacion-cambio-importante.md`. La solicitud debe explicar el cambio con detalle técnico y también con lenguaje sencillo. El modelo debe esperar autorización explícita antes de modificar el proyecto.
