# Auditoría: seed demo del 27 de noviembre de 2026

## Identificación

- **Fecha:** 23 de noviembre de 2026, UTC-05.
- **Responsable:** Manus.
- **Objetivo:** dejar una versión reproducible para sustentación con datos demo de historias clínicas, notificaciones, citas, mascotas y franjas.
- **Autorización:** el usuario autorizó expresamente generar el ZIP con información demo para mostrar el funcionamiento total sin insertar manualmente citas atendidas ni canceladas.
- **Entorno:** Sandbox, Node.js, Prisma 7, PostgreSQL local de pruebas `proyectohs_test`.

## Cambio aplicado

Se actualizó `back/prisma/seed.js` para conservar los usuarios demo, razas, mascotas, relaciones propietario-mascota y datos base requeridos por los fixtures. En una ejecución normal del seed se agregan además los datos demostrativos del **27 de noviembre de 2026** para los tres especialistas:

- 9 franjas: 3 por especialista, correspondientes a una cita atendida, una cancelada y una pendiente.
- 9 citas: 3 atendidas, 3 canceladas y 3 pendientes.
- 3 historias clínicas: una asociada a cada cita atendida.
- 15 notificaciones: 5 por especialista, incluyendo nueva cita, cambio de cita, cambios de estado y cambio de disponibilidad.
- 3 registros de cancelación, uno por cita cancelada.
- 10 mascotas y sus relaciones con propietarios y acudientes.

Las operaciones usan búsquedas previas y `upsert` donde corresponde, por lo que repetir el seed no duplica los registros demo.

## Compatibilidad con pruebas

El seed distingue dos modos:

- `NODE_ENV=test`: carga únicamente el conjunto base compatible con los fixtures automatizados; no agrega las franjas demo ni las notificaciones demo.
- Ejecución normal (`development`/`production`): carga el conjunto base y la demostración del 27 de noviembre.
- Para validar explícitamente la demo usando la configuración de pruebas: `NODE_ENV=test SEED_DEMO=true npm run seed`.

Esta separación evita que los tests que verifican exactamente 30 franjas históricas o un especialista sin notificaciones iniciales sean alterados por datos de sustentación. No se eliminaron los datos demo solicitados.

## Comandos ejecutados y resultados

### Suite backend

```bash
cd back
npm test
```

**Resultado:** 388 pruebas aprobadas en 29 archivos; código de salida 0.

### Build frontend

```bash
cd front
npm run build
```

**Resultado:** compilación Vite exitosa; código de salida 0.

### Migraciones y seed demo

En una base de pruebas recién creada se ejecutó:

```bash
cd back
NODE_ENV=test npx prisma migrate deploy
NODE_ENV=test SEED_DEMO=true npm run seed
NODE_ENV=test SEED_DEMO=true npm run seed
```

**Resultado de conteos sanitizados:**

| Elemento | Resultado |
|---|---:|
| Especialistas | 3 |
| Mascotas | 10 |
| Franjas del 27/11/2026 | 9 |
| Citas del 27/11/2026 | 9 |
| Historias del 27/11/2026 | 3 |
| Notificaciones de especialistas | 15 |
| Cancelaciones del 27/11/2026 | 3 |

La segunda ejecución mantuvo los mismos conteos, confirmando idempotencia.

## Incidencias y resolución

La primera ejecución completa de la suite después de agregar la demo presentó cinco incompatibilidades: los tests esperaban 30 franjas por especialista y ningún aviso inicial para el segundo especialista. La resolución fue condicionar la carga demo al entorno, no eliminar información de demostración ni relajar controles de seguridad.

Durante una validación inicial se intentó apuntar a `proyectohs_test` sin que la base existiera y Prisma informó `P1003`. Se creó únicamente la base local de pruebas, se aplicaron las migraciones y se repitió la validación con éxito. No se tocó la base productiva ni se incluyeron credenciales reales.

## Seguridad y limitaciones

No se modificaron `schema.prisma` ni migraciones. El seed no contiene tokens de recuperación, secretos SMTP ni credenciales reales. Las contraseñas incluidas son exclusivamente cuentas demo locales para la sustentación y deben cambiarse o aislarse antes de cualquier despliegue público. La suite backend valida permisos y aislamiento de historias y notificaciones, pero el build frontend no sustituye pruebas E2E visuales.

## Explicación sencilla

Se preparó una caja de demostración que ya trae personas, mascotas, horarios, citas y avisos. Al abrir el proyecto se puede mostrar una cita atendida con su historia, una cita cancelada, una cita pendiente y las notificaciones sin tener que crear todo a mano. Cuando se ejecutan las pruebas automáticas, esa caja demo se mantiene aparte para no confundir las pruebas.

## Evidencia

- Seed: `back/prisma/seed.js`.
- Suite backend: 388/388 aprobadas.
- Build frontend: exitoso.
- ZIP final: `/home/ubuntu/work/entrega/Huellitas_Saludables_PRO_DEMO_27_NOVIEMBRE_2026_FINAL.zip`.
- Verificación: contiene `back/prisma/seed.js`, los componentes de historia clínica, la auditoría, la bitácora, el escenario de pruebas y `ESTADO_ACTUAL.md`; no contiene `node_modules`, `dist`, `coverage`, archivos `.env` ni logs.
