# Backend — Huellitas Saludables

API Node.js 22 + Express 4 en JavaScript ESM, PostgreSQL y Prisma ORM 7.10.1. Prisma genera un cliente ESM en `app/generated/prisma` con el provider `prisma-client`; el backend lo usa mediante `@prisma/adapter-pg` y el singleton `app/config/prisma.js`. El schema vigente contiene **11 modelos**: `Usuario`, `PasswordResetToken`, `Raza`, `Mascota`, `UsuarioMascota`, `Disponibilidad`, `Cita`, `CitaCancelacion`, `HistoriaClinica`, `TokenRevocado` y `Notificacion`.

## Requisitos y configuración

Usa Node.js 22 o posterior y PostgreSQL compatible con el proyecto (Docker Compose declara PostgreSQL 16). Desde `back/`:

```bash
npm ci
```

En esta copia no existe `back/.env.example`; crea `.env` localmente con `DATABASE_URL` o `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `JWT_SECRET`. No subas `.env`, secretos ni contraseñas. Para probar, crea `.env.test` manualmente con `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME_TEST` y `JWT_SECRET`; la base indicada debe terminar en `_test` y diferir de `DB_NAME` porque el setup la recrea. No se encontró `.env.test.example` en este checkout.

El `postinstall` ejecuta `prisma generate`; también puedes llamar `npm run prisma:generate` o `npx prisma validate`.

## Prisma y migraciones

El historial contiene **seis migraciones**:

1. `0_init` — baseline original de las entidades iniciales.
2. `20261110190000_cita_cancelacion_audit`.
3. `20261119200000_token_revocado`.
4. `20261123150000_password_reset_token`.
5. `20261123190000_notificacion_in_app`.
6. `20261124220000_consentimiento_y_foto_mascota`.

El baseline inicial no es el total del esquema vigente: consulta `prisma/schema.prisma` y todas las migraciones. Las migraciones contienen reglas SQL adicionales a lo expresado por Prisma, incluidos `CHECK`, índice parcial y triggers; no las elimines ni edites migraciones aplicadas.

```bash
npm run migrate          # baseline existente cuando procede + migrate deploy
npm run migrate:status    # estado del historial
npm run migrate:dev       # crear/aplicar migración en desarrollo
npm run migrate:baseline  # marca 0_init sin ejecutar su SQL; requiere verificar esquema
```

`npm run migrate` no resetea ni borra datos. En una base existente, el script verifica que el esquema corresponda antes de registrar `0_init`; si es parcial o distinto, aborta. Conserva un respaldo antes de actualizar. `npm run db:reset` es destructivo y no debe ejecutarse sobre datos a conservar.

## Semillas y contraseñas demo

```bash
npm run seed
```

La semilla está en `prisma/seed.js`; los datos y credenciales demo solo deben usarse en desarrollo/pruebas. Docker solo carga seed con `DB_SEED=true`, fuera de producción y cuando corresponde.

## Autenticación, permisos y contraseñas

Las rutas privadas requieren `Authorization: Bearer <token>`. El middleware vuelve a consultar al usuario y rol vigentes desde PostgreSQL. El backend limita a cinco mascotas por propietario; la sexta alta devuelve `409` y `MASCOTAS_LIMITE_ALCANZADO`. Los propietarios solo listan/obtienen mascotas asociadas, historias clínicas de sus mascotas y citas propias en los endpoints de propietario; recursos ajenos reciben `404` genérico en las consultas donde se aplica ocultamiento. Recepción, especialistas y administración tienen el alcance de cada ruta definido en [la guía de API](../DOCS_PROYECTO/back_DOCUMENTACION/API.md).

Las contraseñas nuevas se guardan con bcrypt (`bcrypt` 6, 12 rondas por defecto). Los hashes `scrypt` solo se conservan como compatibilidad legada: se verifican con parámetros restringidos y, tras un login correcto, se rehashan a bcrypt. Contraseñas almacenadas en texto plano no se aceptan en login. `npm run passwords:migrate` sirve para analizar/migrar valores heredados; respalda y verifica datos antes de aplicar la opción de escritura.

## Recuperación y notificaciones

La recuperación de contraseña utiliza endpoints públicos de solicitud, verificación y cambio, con tokens aleatorios de un solo uso; la base conserva el hash del token. El envío necesita `SMTP_HOST`, `SMTP_PORT` (587 por defecto), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` y `FRONTEND_URL`. Si falta configuración SMTP o la URL, el backend responde `503`; el mensaje no revela si el correo solicitado pertenece a una cuenta. Una configuración de SMTP local de pruebas no equivale a tener proveedor SMTP de producción decidido.

Las notificaciones actuales son persistentes e in-app para especialistas autenticados, con consultas/lectura limitadas a las del usuario. No se envían por email, SMS ni push.

## Scripts npm disponibles

| Script | Uso |
|---|---|
| `start` | Inicia `tsx server.js`. |
| `dev` | Ejecuta nodemon + tsx con recarga. |
| `postinstall`, `prisma:generate` | Genera Prisma Client. |
| `migrate`, `migrate:dev`, `migrate:status`, `migrate:baseline` | Aplicar, crear, consultar y marcar baseline. |
| `seed` | Ejecuta la semilla Prisma. |
| `passwords:migrate` | Analiza o migra hashes legados bajo el procedimiento del script. |
| `db:reset` | Reinicio destructivo de Prisma Migrate. |
| `test`, `test:watch`, `test:coverage` | Vitest ejecución única, interactiva y con cobertura. |
| `lint`, `lint:fix` | ESLint 9. |

## Pruebas y vulnerabilidades consignadas

La evidencia técnica más reciente consignada en el paquete/estado del proyecto es **410/410 pruebas aprobadas en 31 archivos**. No se ejecutó `npm test` ni se generó una nueva evidencia durante esta tarea documental.

El último `npm ci` consignado reportó **8 vulnerabilidades (4 moderadas y 4 altas)**. No se ejecutó `npm ci` de nuevo, no se corrió `npm audit fix` y no se modificaron dependencias; revisa avisos y versiones en el flujo autorizado de mantenimiento antes de resolverlos.

La guía detallada vigente está en [`DOCS_PROYECTO/back_DOCUMENTACION/README.md`](../DOCS_PROYECTO/back_DOCUMENTACION/README.md); contratos de rutas y errores en [`API.md`](../DOCS_PROYECTO/back_DOCUMENTACION/API.md), desarrollo en [`DESARROLLO.md`](../DOCS_PROYECTO/back_DOCUMENTACION/DESARROLLO.md) y creación de una base vacía en [`database_original/0.CREAR_DATABASE.MD`](../database_original/0.CREAR_DATABASE.MD).
