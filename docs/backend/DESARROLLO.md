# Guía para trabajar en el backend

El backend es una API Express ESM conectada a PostgreSQL mediante Prisma ORM 7 y `@prisma/adapter-pg`. Las consultas viven en `app/models/`, la fuente del modelo relacional en `prisma/schema.prisma`, y las migraciones versionadas en `prisma/migrations/`.

## Preparar y ejecutar

Desde la raíz:

```bash
cd back
npm ci
cp .env.example .env
```

Configura `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` o `DATABASE_URL`, además de `JWT_SECRET`. La base de datos indicada debe existir. No publiques `.env` ni secretos.

```bash
npm run migrate          # migración Prisma; baseline existente se valida sin borrar datos
npm run migrate:status   # estado del historial
npm run seed             # datos demo opcionales; solo desarrollo/pruebas
npm run dev              # servidor con recarga, puerto 3000 por defecto
```

Prisma Client se genera en `npm ci` mediante `postinstall`. También puedes ejecutar `npm run prisma:generate` o validar el schema con `npx prisma validate`.

`npm run migrate` aplica `migrate deploy` y, al detectar tablas sin historial Prisma, compara columnas, restricciones, índice parcial y triggers antes de registrar `0_init`. Si el esquema existente es parcial o no coincide, aborta sin modificar filas. Haz un respaldo antes de cualquier actualización. `npm run migrate:baseline` es una operación manual que marca el baseline sin aplicar SQL; úsala solo tras verificar el esquema y no en una base vacía.

No ejecutes `npm run db:reset` sobre información que quieras conservar: es destructivo.

## Autenticación y permisos

`POST /api/auth/login` devuelve un JWT que debe enviarse como `Authorization: Bearer <token>`. El backend verifica firma y existencia del usuario y toma el rol vigente desde la base. La documentación de rutas y roles está en [API.md](API.md).

## Errores y registros

Las rutas usan un único manejador de errores y un formato de respuesta compartido. Las excepciones internas se responden al cliente con mensaje genérico en HTTP 500; los errores de validación, permisos y recursos inexistentes conservan mensajes claros. Pino controla los niveles según el entorno y redacta campos sensibles.

## Pruebas

```bash
cp .env.test.example .env.test
npm test
npm run test:watch
npm run test:coverage
```

`DB_NAME_TEST` debe terminar en `_test` y ser distinta de `DB_NAME`; el setup recrea solo esa base. Más detalles en [PRUEBAS.md](../tests/PRUEBAS.md).

## Estructura principal

```text
back/
├── app/                 # Express: rutas, controladores, servicios, modelos
├── prisma/
│   ├── schema.prisma    # siete modelos y relaciones
│   ├── migrations/      # SQL versionado para PostgreSQL
│   └── seed.js          # datos demo idempotentes
├── prisma.config.ts     # configuración de Prisma CLI 7
└── tests/               # pruebas unitarias e integración
```
