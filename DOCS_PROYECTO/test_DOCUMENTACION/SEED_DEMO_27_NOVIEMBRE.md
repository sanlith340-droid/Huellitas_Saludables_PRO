# Escenario de prueba: demo del 27 de noviembre de 2026

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
- 10 mascotas relacionadas con propietarios y acudientes.
- 9 franjas del 27/11/2026.
- 9 citas del 27/11/2026: 3 atendidas, 3 canceladas y 3 pendientes.
- 3 historias clínicas asociadas a las citas atendidas.
- 15 notificaciones para especialistas.
- 3 registros de cancelación.

Después de la segunda ejecución, los conteos deben mantenerse iguales.

## Recorrido manual sugerido

1. Iniciar sesión con un especialista demo y abrir sus citas del 27/11/2026.
2. Mostrar una cita atendida y abrir su historia clínica.
3. Editar diagnóstico, tratamiento u observaciones y guardar.
4. Iniciar sesión como propietario relacionado con la mascota y seleccionar esa mascota.
5. Consultar la historia en modo solo lectura.
6. Volver al panel del especialista y mostrar las cinco notificaciones demo.
7. Mostrar la cita pendiente y la cancelada, incluida su información de cancelación.
8. Confirmar que un propietario no puede consultar historias de una mascota ajena.

## Separación de la suite automatizada

`npm test` establece `NODE_ENV=test` y carga el seed base sin la demo. Esto conserva los fixtures que requieren 30 franjas históricas y especialistas sin notificaciones iniciales. La demo solo se activa con `SEED_DEMO=true` o en una ejecución normal fuera de `NODE_ENV=test`.

## Resultado documentado

La validación realizada obtuvo 388/388 pruebas backend aprobadas, build frontend exitoso y conteos demo idempotentes. La evidencia completa está en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-23_SEED_DEMO_27_NOVIEMBRE.md`.
