# Auditoría — reglas de alcance, documentación y estructura de agentes

## Identificación

- **Fecha:** 23 de noviembre de 2026
- **Responsable:** IA del proyecto
- **Tarea:** precisar archivos permitidos, archivos protegidos y ubicación de auditorías.
- **Autorización:** solicitada expresamente por el usuario.

## Objetivo

Verificar y documentar la nueva política para que cada Rule indique qué puede tocar la IA, qué no puede tocar sin autorización y dónde debe registrar el cambio. También establecer la auditoría obligatoria de todas las pruebas y ejecuciones del proyecto.

## Cambios realizados

- Se actualizaron `AGENTS.md` y `.agents/README.md`.
- Se actualizaron `.agents/rules/architecture.md`, `documentation.md` y `security.md`.
- Se creó `.agents/rules/testing.md`.
- Se creó `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.
- Se creó `PLANTILLA_AUDITORIA_IA.md`.
- Se creó `BITACORA_AUDITORIAS_IA.md`.

## Ejecuciones y comandos

```bash
mkdir -p DOCS_PROYECTO/auditorias_de_cambios_y_pruebas
find .agents -type f -print
```

También se verificó mediante lectura y búsqueda que `AGENTS.md` menciona la ruta obligatoria de auditoría y que las Rules contienen secciones de archivos permitidos, archivos protegidos y ubicación documental.

## Resultado técnico

La estructura documental quedó creada y las Rules fueron reemplazadas por versiones que especifican alcance, restricciones y documentación. La plantilla de auditoría se encuentra en la carpeta obligatoria.

## Explicación sencilla

Se dejaron instrucciones para que la IA sepa qué carpetas puede usar, cuáles no debe tocar sin permiso y dónde debe anotar cada prueba que haga. Así, otra persona puede revisar lo que ocurrió y no depende de confiar solamente en lo que la IA diga.

## Limitaciones

Esta auditoría valida la presencia y contenido de la estructura documental; no ejecuta las pruebas completas del backend ni el build del frontend porque el cambio realizado es de instrucciones y documentación.

## Siguiente acción

Actualizar el ZIP entregable y mantener esta auditoría junto con las futuras auditorías de ejecución.
