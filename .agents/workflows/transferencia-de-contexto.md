# Workflow: transferencia de contexto entre modelos

Usar cuando otro modelo vaya a continuar el proyecto o cuando una sesión esté cerca de terminar.

## Modelo que entrega

1. Actualizar `.agents/workflows/ESTADO_ACTUAL.md`.
2. Registrar en la bitácora correspondiente el objetivo, decisiones y cambios.
3. Indicar archivos modificados y archivos pendientes.
4. Registrar comandos ejecutados y resultados reales.
5. Separar claramente lo verificado de lo supuesto.
6. No dejar secretos ni datos personales en el resumen.

## Modelo que recibe

1. Leer `/AGENTS.md` sin excepción.
2. Leer `.agents/README.md`.
3. Leer `.agents/workflows/ESTADO_ACTUAL.md`.
4. Leer la bitácora de la funcionalidad.
5. Leer las Rules, Skills y Workflows aplicables.
6. Inspeccionar el estado real del repositorio antes de continuar.
7. Confirmar qué pendientes siguen vigentes.

## Formato mínimo de entrega

```text
Objetivo:
Estado: terminado / en progreso / bloqueado
Archivos modificados:
Pruebas ejecutadas:
Resultados:
Decisiones:
Pendientes:
Riesgos:
Siguiente paso:
```

La transferencia no debe depender únicamente del historial de conversación. El repositorio debe contener la información necesaria para continuar.
