# Auditoría 2026-11-24 — Límite de mascotas y estado visual

## Identificación

- **Fecha y hora:** 24 de noviembre de 2026, UTC-05.
- **Responsable:** Manus.
- **Tarea:** Mostrar un mensaje con imagen al intentar crear la sexta mascota.
- **Autorización:** autorizada explícitamente por el usuario en la conversación actual.

## Objetivo

Impedir que un usuario registre más de cinco mascotas y mostrar en frontend un estado visual relacionado con mascotas cuando la API rechaza el intento de registrar la sexta.

## Cambios realizados

El backend ahora cuenta las asociaciones del usuario dentro de la transacción de creación. Al llegar a cinco, devuelve HTTP 409 con código `MASCOTAS_LIMITE_ALCANZADO` y el mensaje `Has alcanzado el límite de 5 mascotas por usuario.`. El frontend reconoce ese código y muestra `EmptyState` con la ilustración existente `front/src/assets/feedback/vacio-mascotas.webp`, el título `Ya tienes 5 mascotas registradas`, explicación, recomendaciones y enlace a `/mascotas`.

Se añadió una prueba de integración en `back/tests/integration/mascotas.test.js` que llena el cupo y comprueba el rechazo de la sexta mascota.

## Validación ejecutada

- `npm test -- tests/integration/mascotas.test.js`: **22/22 pruebas aprobadas**.
- `npm test`: **389/389 pruebas aprobadas en 29 archivos**.
- `npm run build` en `front`: compilación TypeScript/Vite exitosa; el build contiene `vacio-mascotas-DvM8ZJle.webp`, `EmptyState-*.js` y `NuevaMascota-*.js`.

## Resultado

El límite funciona en backend y no depende únicamente del frontend. La sexta mascota no se crea y la interfaz muestra el mensaje con imagen relacionada del proyecto. La interacción manual quedó validada posteriormente en navegador; el detalle y la captura están en `AUDITORIA_2026-11-24_PRUEBA_VIVA_LIMITE_MASCOTAS.md`.

## Validación visual complementaria

La prueba viva confirmó desde `/mascotas/nueva` que el DOM muestra simultáneamente `vacio-mascotas.webp`, `Ya tienes 5 mascotas registradas`, la descripción, las recomendaciones y el enlace `Ver mis mascotas`. La evidencia completa está en `AUDITORIA_2026-11-24_PRUEBA_VIVA_LIMITE_MASCOTAS.md`.

## Entrega

El ZIP actualizado fue regenerado y verificado con `unzip -t` después de incorporar la documentación y la configuración necesaria para la prueba local.
