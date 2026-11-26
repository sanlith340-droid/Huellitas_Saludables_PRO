# Escenario de prueba: demo del 27 de noviembre de 2026

> Guía prospectiva para la demostración del 27/11/2026; las cantidades siguientes describen la configuración declarada por `back/prisma/seed.js`, no resultados de una ejecución de este pase ni aceptación. La semilla vigente define 3 mascotas por cada uno de 10 usuarios demo (30 en total) y 3 avisos por especialista (9 en total); no usar los conteos antiguos de 10 mascotas/15 avisos.

## Propósito

Validar que una instalación limpia pueda mostrar el funcionamiento integrado de Huellitas Saludables sin insertar manualmente los datos de la sustentación.

## Preparación segura

Usar una base PostgreSQL exclusiva de pruebas cuyo nombre termine en `_test`. No usar producción ni datos personales reales.

```bash
cd back
NODE_ENV=test npx prisma migrate deploy
NODE_ENV=test SEED_DEMO=true npm run seed
```

Para repetir la prueba de idempotencia:

```bash
NODE_ENV=test SEED_DEMO=true npm run seed
```

## Datos esperados

- 3 especialistas.
- 30 mascotas relacionadas con 10 propietarios/acudientes (3 por cuenta).
- 9 franjas del 27/11/2026.
- 9 citas del 27/11/2026: 3 atendidas, 3 canceladas y 3 pendientes.
- 30 historias clínicas demo (mínimo 3 por cada uno de los 10 usuarios); entre ellas, 3 corresponden a las citas atendidas demostrativas del 27/11.
- 9 notificaciones para especialistas (3 por especialista).
- 3 registros de cancelación.

Después de la segunda ejecución, los conteos deben mantenerse iguales.

## Recorrido manual sugerido

1. Iniciar sesión con un especialista demo y abrir sus citas del 27/11/2026.
2. Mostrar una cita atendida y abrir su historia clínica.
3. Editar diagnóstico, tratamiento u observaciones y guardar.
4. Iniciar sesión como propietario relacionado con la mascota y seleccionar esa mascota.
5. Consultar la historia en modo solo lectura.
6. Volver al panel del especialista y mostrar sus tres notificaciones demo.
7. Mostrar la cita pendiente y la cancelada, incluida su información de cancelación.
8. Confirmar que un propietario no puede consultar historias de una mascota ajena.

## Separación de la suite automatizada

`npm test` establece `NODE_ENV=test` y carga el seed base sin la demo. Esto conserva los fixtures que requieren 30 franjas históricas y especialistas sin notificaciones iniciales. La demo solo se activa con `SEED_DEMO=true` o en una ejecución normal fuera de `NODE_ENV=test`.

## Resultado documentado

La validación del escenario consignada el 23/11/2026 obtuvo 388/388 pruebas backend, build frontend y conteos demo idempotentes; es un resultado histórico de esa fecha y no debe confundirse con la última suite general. La auditoría está en [AUDITORIA_2026-11-23_SEED_DEMO_27_NOVIEMBRE.md](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-23_SEED_DEMO_27_NOVIEMBRE.md).

El pase local actual consignado en el [informe de verificación de calidad](../sustentacion_DOCUMENTACION/D4_DOCUMENTACION_Y_CALIDAD/INFORME_FINAL_VERIFICACION_CALIDAD.md) reporta 410/410 pruebas backend en 31 archivos, build correcto y lint frontend/backend con 0 errores/0 advertencias y 0 errores/4 advertencias, respectivamente. No midió cobertura ni volvió a ejecutar el seed/demo o su idempotencia; por tanto, no reemplaza este resultado histórico ni acredita el recorrido manual propuesto aquí.
