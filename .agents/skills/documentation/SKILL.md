---
name: project-documentation
description: Documentar cambios, decisiones, pruebas y transferencia de contexto en Huellitas Saludables. Usar en toda tarea que modifique código, configuración, base de datos, pruebas o instrucciones de agentes.
---

# Skill: documentación del proyecto

## Procedimiento obligatorio

1. Leer `/AGENTS.md`, `.agents/README.md` y `.agents/workflows/ESTADO_ACTUAL.md`.
2. Identificar la carpeta documental correcta en `DOCS_PROYECTO/`.
3. Antes de modificar, anotar objetivo y alcance en la tarea o bitácora correspondiente.
4. Después de modificar, registrar archivos, decisiones, pruebas, resultados y pendientes.
5. Actualizar `ESTADO_ACTUAL.md` para que otro modelo pueda continuar.
6. Si cambia una regla de agentes, actualizar `.agents/` y registrar la decisión.

## Clasificación

- Backend y arquitectura: `DOCS_PROYECTO/back_DOCUMENTACION/`.
- Frontend: `DOCS_PROYECTO/front_DOCUMENTACION/`.
- Pruebas: `DOCS_PROYECTO/test_DOCUMENTACION/`.
- Sustentación y manuales: `DOCS_PROYECTO/sustentacion_DOCUMENTACION/`.
- Cambios históricos: bitácora `BITACORA_*.md` en la carpeta pertinente.

## Registro mínimo

Cada entrada debe incluir fecha, objetivo, archivos afectados, decisión, pruebas ejecutadas, resultado, limitaciones y siguiente paso. Nunca incluir secretos ni afirmar resultados no comprobados.
