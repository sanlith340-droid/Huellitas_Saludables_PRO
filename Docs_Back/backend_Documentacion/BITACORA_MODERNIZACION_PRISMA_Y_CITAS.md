# Bitácora de modernización: Prisma, disponibilidad y citas

**Proyecto:** Huellitas Saludables PRO  
**Periodo documentado:** migración ORM y mejoras posteriores hasta el 10 de noviembre de 2026  
**Estado:** implementado y probado en el entorno local de desarrollo sin Docker.

## Propósito

Registrar qué se cambió desde la migración de Sequelize a Prisma, por qué se hizo, cómo se verificó y qué comportamiento quedó vigente. La bitácora distingue la migración técnica de los cambios funcionales posteriores para que sirva como historial de decisiones y como guía de operación.

## 1. Situación de partida y decisiones

El backend ya tenía una política central de errores y logging seguro. La modernización ORM debía conservar esos contratos: un único formato de respuesta, errores de validación comprensibles, mensajes genéricos ante fallos internos y logs sin datos sensibles. También se necesitaba mantener el contrato de los endpoints y preservar restricciones específicas que vivían en PostgreSQL, no solo las entidades visibles en el ORM.

Se continuó con **Prisma 7 en modo ESM**, usando PostgreSQL y `@prisma/adapter-pg`. Esto corresponde a la selección acordada para el proyecto; no se migró a Prisma 8. La validación de pruebas y desarrollo se hizo con PostgreSQL local, sin Docker.

## 2. Migración de Sequelize a Prisma

### Qué se hizo

- Se incorporó `back/prisma/schema.prisma` como fuente del esquema y las relaciones.
- Se mapearon los siete modelos de negocio originales: `Usuario`, `Raza`, `Mascota`, `UsuarioMascota`, `Disponibilidad`, `Cita` e `HistoriaClinica`.
- Se configuró el generador Prisma para ESM y se creó el cliente mediante un singleton en `back/app/config/prisma.js`, conectado con el adaptador PostgreSQL.
- Se añadió `back/prisma.config.ts` para configuración de Prisma 7, conexión, migraciones y seed.
- Se reescribieron modelos, servicios y semillas para usar Prisma Client y transacciones, retirando Sequelize del backend.
- Se consolidaron los datos demo en `back/prisma/seed.js`.

### Por qué

Prisma entrega un esquema explícito y un cliente tipado coherente con ESM. El singleton evita crear conexiones independientes desde cada módulo. Las transacciones permiten que cambios relacionados —por ejemplo, reservar un horario y registrar una cita— se confirmen o reviertan juntos. La semilla única reduce la dispersión de los fixtures de desarrollo.

### Migraciones y compatibilidad con PostgreSQL

- `back/prisma/migrations/0_init/migration.sql` establece la línea base inicial para Prisma.
- La línea base conserva objetos que no se representan por completo en `schema.prisma`: restricciones `CHECK`, triggers heredados, claves foráneas, índices y el índice parcial de citas activas.
- La migración posterior de auditoría es aditiva; no sustituye ni elimina los objetos heredados.
- Para aplicar el estado versionado de la base se usa `npm run migrate`, que ejecuta la preparación de baseline cuando corresponde y luego despliega las migraciones.

**Razón de preservación:** rehacer el ORM no debía debilitar reglas de integridad que ya aplicaba PostgreSQL ni requerir reconstruir la base con un proceso destructivo.

## 3. Continuidad del manejo de errores y de los logs

La política transversal de seguridad se mantuvo durante la migración:

- `back/app/middlewares/errorHandler.js` centraliza los errores y el formato de respuesta.
- Los errores de validación/regla de negocio mantienen mensajes claros para el usuario.
- Los errores internos `500` responden con un mensaje genérico; no se devuelve `error.message` técnico al cliente.
- `back/app/utils/logger.js` configura Pino por entorno: `error` en producción, `debug` en desarrollo y nivel acotado en pruebas.
- La configuración redacta tokens, contraseñas, cookies, identificadores y campos de datos personales.
- Las validaciones de formularios mantienen el rechazo de espacios en contraseñas y la normalización de texto que no corresponde a credenciales.

**Razón:** una migración de persistencia no debía reabrir fugas de datos ni hacer variar el contrato de error.

## 4. Integridad de disponibilidad y reservas por fecha/hora

### Validación backend

Se incorporó `back/app/utils/fechaHora.js` para comparar día y hora como un solo valor en `America/Bogota`. La validación se usa al crear una franja y al modificar su fecha/hora. Si el inicio ya pasó —incluida una hora vencida del día actual—, la API rechaza la operación con un error de validación claro.

También se valida que una cita nueva o reprogramada use una franja futura. Al reservar, se vuelve a comprobar la disponibilidad dentro de la transacción y con bloqueo de fila: esto evita que una franja se vuelva pasada entre la comprobación inicial y la escritura.

### Filtrado de consulta

La consulta de disponibilidad acepta `futuras=true`. El filtro se aplica en PostgreSQL y se comparte entre las consultas paginadas y no paginadas, para que filas, páginas y conteos no incluyan horarios vencidos.

### Interfaz

- `front/src/pages/Disponibilidad.tsx` añade límites de fecha/hora y validación visual al crear franjas.
- `front/src/pages/NuevaCita.tsx` solicita franjas con `futuras=true`.
- La pantalla de reserva filtra nuevamente conforme avanza el reloj y deselecciona el horario si vence mientras la página sigue abierta.

**Razón:** la validación visual previene errores comunes, pero la regla decisiva está en el backend/BD. El filtro de consulta evita mostrar turnos vencidos; la validación transaccional evita que una petición desactualizada los reserve.

## 5. Cancelación automática y auditoría

### Proceso automático

`back/app/services/citaCancellationScheduler.js` inicia una pasada al arrancar el servidor y repite el proceso cada 60 segundos. El entrypoint utilizado por los scripts npm (`back/server.js`) delega al servidor de `back/app/server.js`, donde se inicia el worker y se registra el cierre ordenado.

El proceso cancela solo citas en estado `pendiente` o `confirmado` cuya fecha/hora ya pasó según `America/Bogota`. No elimina la cita ni su disponibilidad. Las citas atendidas o ya canceladas quedan intactas. La consulta utiliza `FOR UPDATE SKIP LOCKED` para reducir el riesgo de procesamiento duplicado si hay más de una instancia.

El worker requiere que el backend esté activo. Si se apaga, al volver a arrancar hace una pasada inmediata y procesa vencimientos pendientes. En producción, los logs del worker no incluyen nombres, teléfonos, identificadores ni datos de las citas; solo se registran eventos y conteos permitidos por la política del logger.

### Registro de auditoría

Se añadió el modelo Prisma `CitaCancelacion` y la tabla PostgreSQL `cita_cancelacion`, mediante:

`back/prisma/migrations/20261110190000_cita_cancelacion_audit/migration.sql`

Cada registro guarda:

- `id_cita`: cita cancelada, con relación protegida a la cita;
- `id_usuario_actor`: usuario que inició una cancelación manual, o `NULL` para el proceso automático;
- `rol_actor`: rol de la sesión o `sistema`;
- `origen`: `manual` o `automatico`;
- `motivo`: explicación de la cancelación;
- `cancelada_en`: fecha y hora del registro.

La actualización del estado y la escritura de auditoría ocurren en la misma transacción. Una restricción única por cita impide registrar dos cancelaciones para la misma cita. Una cita cancelada manualmente que todavía tiene horario futuro puede liberar su disponibilidad; el proceso automático no libera la franja vencida.

Las citas ahora pueden devolver un objeto `cancelacion` en la respuesta de API. La interfaz de usuario muestra el estado, pero **no presenta todavía el detalle del origen y motivo**; esos datos quedan en la auditoría de la base.

**Razón:** el estado `cancelado` por sí solo no indica quién lo cambió ni por qué. La auditoría conserva esa diferencia para soporte y trazabilidad.

## 6. Pruebas realizadas

### Suite automatizada

Se migraron las pruebas a Vitest y Prisma. Al cierre de esta bitácora:

- **18 archivos de prueba** ejecutados;
- **249 pruebas aprobadas**;
- pruebas unitarias de comparación temporal en Bogotá;
- pruebas de integración de disponibilidad pasada, actualización, filtro `futuras=true` y paginación;
- pruebas de cancelación manual con actor/origen/motivo;
- prueba de cancelación automática y de que una segunda pasada no duplica el registro.

La preparación de integración usa una base de pruebas con sufijo `_test`, la crea/restaura con migraciones y seed, y la elimina al finalizar. El rol de PostgreSQL utilizado por Vitest debe poder crear esa base de pruebas. No se concedió de forma permanente ese privilegio tras la ejecución verificada.

### Verificación técnica

- `npx prisma validate`: esquema válido.
- `npx prisma migrate status`: migraciones aplicadas y esquema al día.
- `npm run build` en `front`: compilación TypeScript/Vite exitosa.
- Smoke test del entrypoint real: `/health` respondió `200` con PostgreSQL accesible.
- El proyecto se ejecutó y probó en local sin Docker.

## 7. Prueba manual desde el frontend — 10 de noviembre de 2026

Se usaron las cuentas demo locales de recepcionista y usuario:

1. Desde **Disponibilidad**, se creó para el especialista una franja del 11/11/2026 a las 09:00 y se eliminó desde la interfaz. Se confirmó que ya no quedó en la tabla `disponibilidad`.
2. Se crearon franjas de prueba a las 09:15 y 09:30 del mismo día.
3. Desde **Agendar cita**, se reservaron esas franjas con una mascota demo.
4. La cita de las 09:15 se canceló con el botón del frontend.
5. La cita de las 09:30 se dejó pendiente y se ejecutó el servicio real de cancelación automática con un reloj de prueba posterior a ese turno. La primera pasada procesó una cita; la segunda procesó cero, comprobando que no se duplica la auditoría.
6. La pantalla de citas mostró ambas como `Cancelada` y se consultó la tabla de auditoría para confirmar los datos de actor/origen/motivo.

### Registros de prueba que se dejaron en la base local

En `huellitas_local_flow` quedaron intencionalmente las dos citas de prueba canceladas y sus auditorías:

| Cita | Horario | Estado | Actor / rol | Origen | Motivo de auditoría |
|---|---|---|---|---|---|
| Cita `2` — prueba manual | 11/11/2026 09:15 | cancelado | `USU001` / `usuario` | `manual` | Cancelada manualmente por el rol usuario. |
| Cita `3` — prueba automática | 11/11/2026 09:30 | cancelado | `NULL` / `sistema` | `automatico` | Cancelada automáticamente porque la fecha y hora de la cita ya pasaron. |

La disponibilidad de las 09:15 quedó libre por ser una cancelación manual de una cita futura. La disponibilidad de las 09:30 quedó ocupada: una cancelación automática de un horario vencido no libera ese turno para reventa.

La base se inspeccionó de forma agregada antes de esta prueba y no tenía auditorías anteriores; por eso los dos registros anteriores son datos demostrativos de la verificación, no registros históricos recuperados.

## 8. Comportamiento sobre franjas antiguas

La limpieza automática de franjas antiguas **no forma parte de esta implementación**:

- una franja libre de un mes anterior permanece en la BD, pero no se ofrece para nuevas reservas;
- si una franja antigua tenía cita pendiente o confirmada, se cancela la cita y se registra el motivo;
- la cita y la disponibilidad se conservan como historial;
- una franja con citas asociadas no puede borrarse, porque la relación protege la trazabilidad.

**Razón:** borrar automáticamente franjas o referencias podría destruir el historial y comprometer las relaciones de integridad. Si se desea una política de purga, debe acordarse como requisito separado, con retención y respaldo definidos.

## 9. Comandos de operación sin Docker

Desde la raíz del proyecto, configura los archivos `.env` locales con los datos de tu PostgreSQL y los secretos propios. No copies credenciales del entorno de prueba.

Migrar y arrancar el backend:

```bash
cd back
npm install
npm run migrate
npm run dev
```

En otra terminal, arrancar el frontend:

```bash
cd front
npm install
npm run dev
```

Ejecutar pruebas y compilar la interfaz:

```bash
cd back
npm test

cd ../front
npm run build
```

`npm test` recrea únicamente la BD indicada por `DB_NAME_TEST` (debe terminar en `_test` y ser distinta de `DB_NAME`). **No apuntes `DB_NAME_TEST` a una base con datos que quieras conservar.**

## 10. Archivos principales para mantenimiento

| Área | Archivos |
|---|---|
| Esquema y migraciones | `back/prisma/schema.prisma`, `back/prisma.config.ts`, `back/prisma/migrations/` |
| Conexión Prisma | `back/app/config/prisma.js` |
| Fechas y disponibilidad | `back/app/utils/fechaHora.js`, `back/app/services/disponibilidad.service.js`, `back/app/models/disponibilidad.model.js` |
| Reservas y cancelaciones | `back/app/services/cita.service.js`, `back/app/models/cita.model.js` |
| Worker y arranque | `back/app/services/citaCancellationScheduler.js`, `back/app/server.js`, `back/server.js` |
| Errores y logging | `back/app/middlewares/errorHandler.js`, `back/app/utils/logger.js`, `back/app/utils/response.js` |
| Interfaz | `front/src/pages/Disponibilidad.tsx`, `front/src/pages/NuevaCita.tsx` |
| Pruebas | `back/tests/integration/`, `back/tests/unit/utils/fechaHora.test.js` |
