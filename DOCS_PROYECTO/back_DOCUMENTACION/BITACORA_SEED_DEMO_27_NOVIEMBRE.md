# Bitácora: seed demo del 27 de noviembre de 2026

## Motivo

Se necesitaba una versión entregable de Huellitas Saludables que permitiera demostrar el flujo completo sin registrar manualmente cada cita, cancelación, mascota, disponibilidad, notificación e historia clínica.

## Alcance autorizado

El usuario autorizó agregar datos demo para los tres especialistas y generar un ZIP actualizado. No se autorizaron cambios a migraciones ni al esquema Prisma.

## Implementación

Archivo principal: `back/prisma/seed.js`.

El seed crea o conserva:

- usuarios demo de administración, recepción, propietarios, acudientes y especialistas;
- 10 mascotas y relaciones de acceso propietario-mascota;
- razas necesarias;
- 30 disponibilidades históricas por especialista para compatibilidad con fixtures;
- una historia clínica base asociada a una cita histórica;
- 9 franjas del 27/11/2026, 3 por especialista;
- 9 citas del 27/11/2026: atendida, cancelada y pendiente para cada especialista;
- 3 historias clínicas, una por especialista;
- 15 notificaciones, cinco por especialista;
- 3 auditorías de cancelación.

Las historias clínicas se relacionan mediante `id_cita`; las cancelaciones usan `origen: 'manual'`, valor permitido por el modelo actual.

## Modos de ejecución

```bash
# Demo normal para desarrollo o sustentación
npm run seed

# Seed base usado por la suite automatizada
NODE_ENV=test npm run seed

# Validar explícitamente la demo sobre una base de pruebas
NODE_ENV=test SEED_DEMO=true npm run seed
```

La variable `SEED_DEMO=true` permite probar la demostración con `.env.test` sin contaminar el seed base que necesita la suite.

## Idempotencia

El seed busca razas y mascotas existentes, usa `upsert` para relaciones, disponibilidades, historias y cancelaciones, y evita notificaciones repetidas mediante una búsqueda por usuario, tipo, asunto y mensaje. Se ejecutó dos veces y los conteos demo permanecieron en 9 franjas, 9 citas, 3 historias, 15 notificaciones y 3 cancelaciones.

## Validación final

- Backend: `npm test` → 388/388 pruebas aprobadas en 29 archivos.
- Frontend: `npm run build` → compilación exitosa.
- Migraciones sobre base limpia → aplicadas correctamente.
- Seed demo sobre base de pruebas → conteos esperados e idempotencia confirmada.

## Seguridad

No se incluyeron secretos reales, tokens de recuperación, archivos `.env` ni dependencias pesadas en la entrega. Las cuentas y contraseñas del seed son datos locales de demostración; no deben reutilizarse en producción. El filtro de mascotas e historias continúa verificándose en backend.
