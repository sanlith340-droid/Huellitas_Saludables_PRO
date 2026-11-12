# Backend — Huellitas Saludables

API Node.js 22 + Express 4 en ESM, PostgreSQL y Prisma ORM 7. Prisma Client se genera como ESM en `app/generated/prisma` y se usa desde el singleton `app/config/prisma.js`. El modelo Prisma contiene los siete modelos: `Usuario`, `Raza`, `Mascota`, `UsuarioMascota`, `Disponibilidad`, `Cita` e `HistoriaClinica`.

## Requisitos y configuración

Instala Node.js 22 o posterior y PostgreSQL 12 o posterior. Desde `back/`, instala las dependencias y copia el archivo de ejemplo:

```bash
npm ci
cp .env.example .env
```

Configura `.env` con el puerto, JWT y la conexión a PostgreSQL. Puedes definir `DATABASE_URL`, o los campos `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. No subas `.env` al repositorio. Las pruebas deben tener un `DB_NAME_TEST` separado que termine en `_test` y no sea igual a `DB_NAME`.

`npm ci` ejecuta `prisma generate` automáticamente. También puedes regenerar el cliente con `npm run prisma:generate`; validar el schema con `npx prisma validate`.

## Migraciones y preservación de datos

Las migraciones versionadas están en `prisma/migrations/`. La migración `0_init` contiene las siete tablas, claves, restricciones, el índice parcial de citas activas y los triggers PostgreSQL que actualizan la disponibilidad y el estado de la cita al crear una historia clínica.

```bash
npm run migrate
npm run migrate:status
```

`npm run migrate` no resetea ni borra datos. En una base vacía crea el schema. Si detecta una base ya existente, verifica tablas, columnas, constraints, índice parcial y triggers; únicamente cuando coinciden con el modelo esperado registra `0_init` como aplicado y continúa. Si detecta un schema parcial o diferente, aborta sin modificar filas. Haz un respaldo antes de cualquier actualización.

Existe también `npm run migrate:baseline`, que registra manualmente `0_init` como aplicado sin aplicar su SQL. Úsalo únicamente cuando hayas verificado por separado que la base existente corresponde exactamente al baseline y tengas un respaldo. No se utiliza para bases vacías.

Para crear y aplicar una migración de desarrollo después de editar `schema.prisma`, utiliza `npm run migrate:dev` en una base local de desarrollo. No ejecutes `db:reset` sobre datos que deban conservarse; ese comando es destructivo.

## Semillas de desarrollo

```bash
npm run seed
```

La semilla `prisma/seed.js` es idempotente para los registros demo: crea usuarios, razas, mascotas, asociaciones, disponibilidades, una cita y su historia clínica si faltan. Las contraseñas de demo son `123456`; usa esos datos exclusivamente en desarrollo/pruebas, nunca en producción. Docker solo ejecuta la semilla si `DB_SEED=true` y `NODE_ENV` no es `production`.

## Ejecutar la API

```bash
npm run dev
```

Para iniciar en modo normal:

```bash
npm start
```

La API conserva las rutas y el formato público existentes. PostgreSQL sigue usando nombres de tabla y columna en snake_case; los modelos aplanan los resultados Prisma para mantener las formas consumidas por el frontend.

## Regla de contraseñas

Las contraseñas se guardan únicamente como hash **bcrypt** (12 rondas, salt generado por bcrypt) y se validan con `bcrypt.compare()`. Las nuevas contraseñas admiten como máximo 72 bytes (límite de bcrypt). Los hashes scrypt de la versión anterior se migran solos a bcrypt en el siguiente login correcto; las contraseñas que aún estén en texto plano se migran con:

```bash
npm run passwords:migrate                                   # solo analiza, no modifica nada
npm run passwords:migrate -- --aplicar --confirmo-respaldo  # migra (hacer respaldo antes)
```

Detalle completo en `docs/backend/BITACORA_BCRYPT.md`. Las consultas SQL crudas y su protección contra SQL Injection se documentan en `docs/backend/BITACORA_SQL_INJECTION.md`.

El login, el registro público y el registro administrativo rechazan cualquier carácter de espacio en la contraseña, incluidos espacios al inicio, al final o en medio, tabulaciones, saltos de línea y espacios Unicode. La API responde con `400 BAD_REQUEST` y `La contraseña no puede contener espacios.`; el frontend muestra el mismo mensaje antes de enviar el formulario. Los espacios siguen permitidos en nombres, apellidos y direcciones.

## Pruebas

```bash
cp .env.test.example .env.test
# Revisa DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_TEST y JWT_SECRET.
npm test
```

Vitest prepara la base aislada, aplica las migraciones Prisma y la semilla, y luego los tests pueden reiniciarla. El helper exige que la base termine en `_test` y sea distinta de `DB_NAME`; solo esa base se elimina/recrea. El usuario PostgreSQL necesita permisos para crear y eliminar esa base de prueba. No apuntes la configuración de pruebas a producción.

Docker ejecuta `npm run migrate` antes de iniciar `npm start`. Para activar datos demo en un entorno no productivo, define `DB_SEED=true`.
