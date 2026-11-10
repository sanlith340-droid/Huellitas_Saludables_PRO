# Franjas futuras y cancelación automática de citas

## Regla horaria

La API usa la zona `America/Bogota` para validar la fecha y la hora como un solo valor local. La creación de una disponibilidad se rechaza si su inicio ya pasó; también se rechaza mover una franja a una fecha/hora pasada. El backend es la validación de autoridad y la pantalla de disponibilidad añade `min` en los controles de fecha y hora como ayuda visual.

El formulario de reserva consulta `GET /api/disponibilidad?estado=disponible&futuras=true`, y la API filtra las franjas vencidas en PostgreSQL. La creación o cambio de una cita también valida que la franja elegida siga en el futuro, por lo que omitir el filtro de la interfaz no permite reservar un horario vencido.

## Cancelación automática

Al iniciar `back/server.js`, el backend ejecuta una pasada inmediata y luego revisa cada 60 segundos. Se cancelan únicamente las citas `pendiente` o `confirmado` cuyo día y hora sean anteriores o iguales al momento actual de Bogotá. Las citas `atendido` y `cancelado` no se modifican. El bloqueo SQL `FOR UPDATE SKIP LOCKED` permite ejecutar más de una instancia sin procesar dos veces la misma cita.

La tarea requiere que el proceso backend esté activo. Si el backend estuvo apagado, la pasada que se ejecuta al reiniciarlo cancela las citas que vencieron durante ese periodo.

## Auditoría

Cada cancelación nueva, manual o automática, escribe en `cita_cancelacion` dentro de la misma transacción que actualiza el estado. El registro conserva el identificador del actor cuando es manual, su rol, el origen (`manual` o `automatico`), el motivo y la fecha/hora de registro. La clave única por cita evita auditorías duplicadas.

- Cancelación manual: `id_usuario_actor` y `rol_actor` corresponden a la sesión que realizó la acción.
- Cancelación automática: el actor es `sistema`, el origen es `automatico` y el motivo indica que la hora pasó.
- Las franjas de citas que ya pasaron no se liberan para volver a reservarse. Una cancelación manual de una cita futura sí puede liberar su horario.

Las respuestas de citas incluyen un objeto `cancelacion` (o `null` si no se ha cancelado). Las auditorías históricas anteriores a esta migración no se inventan ni se rellenan porque no existe una fuente confiable para deducir el actor o el motivo original.

## Migración y ejecución local

La migración aditiva está en `back/prisma/migrations/20261110190000_cita_cancelacion_audit/`. Para aplicarla en la base configurada:

```bash
cd back
npm run migrate
```

Para levantar la API sin Docker:

```bash
cd back
npm run dev
```

La migración conserva los objetos heredados del baseline; el código nuevo usa Prisma y no Sequelize. El worker registra solo el conteo de citas procesadas en desarrollo y no escribe identificadores ni datos de usuarios en logs. En producción, el nivel del logger continúa restringido a errores.
