# Guía para trabajar en el backend

El backend es una API Express escrita en JavaScript ESM (`back/package.json` usa `"type": "module"`), con Node.js 22, Prisma ORM 7.10.1 ESM, `@prisma/adapter-pg` y PostgreSQL 16 en Compose. El esquema está en `back/prisma/schema.prisma` y define 11 modelos; el historial contiene seis migraciones. La estructura funcional vive bajo `back/app/`.

## Preparar y ejecutar

Desde la raíz:

```bash
cd back
npm ci
```

En este checkout no se encontró `back/.env.example`; crea `.env` localmente y configura `DATABASE_URL` o `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `JWT_SECRET`. No publiques `.env`. La base debe existir y ser PostgreSQL compatible; Docker Compose declara PostgreSQL 16.

Scripts declarados en `back/package.json`:

```bash
npm start                  # servidor normal: tsx server.js
npm run dev                # nodemon + tsx, recarga en desarrollo
npm run prisma:generate    # genera cliente Prisma ESM
npm run migrate            # baseline seguro si aplica y prisma migrate deploy
npm run migrate:dev        # migración de desarrollo
npm run migrate:status     # estado de migraciones
npm run migrate:baseline   # marca 0_init como aplicada; revisar antes de usar
npm run seed               # seed configurado en Prisma
npm run passwords:migrate  # auditar/migrar hashes de contraseñas legado
npm test                   # Vitest, ejecución única
npm run test:watch         # Vitest interactivo
npm run test:coverage      # Vitest con cobertura
npm run lint               # ESLint
npm run lint:fix           # ESLint con correcciones
npm run db:reset           # destructivo: no usar para datos a conservar
```

`npm ci` ejecuta `prisma generate` por medio de `postinstall`. El último resultado de instalación consignado en la evidencia del proyecto reportó **8 vulnerabilidades (4 moderadas y 4 altas)**; no se ejecutó `npm ci` ni se hizo `npm audit fix` en esta actualización documental.

`npm run migrate` ejecuta `prisma/baseline-if-existing.js` y luego `prisma migrate deploy`. Para una base existente, el baseline compara estructuras antes de registrar `0_init`; si no coinciden, aborta. `migrate:baseline` marca el baseline manualmente sin ejecutar SQL: úsalo solo después de confirmar que el esquema y respaldo corresponden. Las migraciones ya compartidas no se editan; los cambios nuevos van en migraciones posteriores.

## Autenticación, contraseñas y permisos

El login devuelve JWT y las rutas privadas reciben `Authorization: Bearer <token>`. El backend vuelve a consultar identidad y rol vigentes. Los propietarios solo pueden listar/obtener mascotas asociadas a su usuario, consultar historias de sus mascotas y consultar/gestionar citas propias en los endpoints indicados por [API.md](./API.md); los recursos ajenos se ocultan con `404` donde corresponde. Un usuario puede registrar como máximo cinco mascotas (`409`, `MASCOTAS_LIMITE_ALCANZADO`).

Las contraseñas nuevas se hashean con bcrypt, 12 rondas por defecto; los hashes scrypt solo se verifican para compatibilidad y se actualizan a bcrypt tras autenticación correcta. Login no admite texto plano almacenado.

## Recuperación de contraseña y avisos

La recuperación pública usa `POST /api/auth/forgot-password`, `verify-reset-token` y `reset-password`. Para emitir correo se necesitan `SMTP_HOST`, `SMTP_PORT` (587 por defecto), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` y `FRONTEND_URL`. Sin configuración suficiente, la solicitud devuelve `503`; no revela si el correo existe. Los tokens son de un solo uso y el hash es lo que persiste en la base.

Las notificaciones son in-app, persistentes y destinadas al especialista autenticado. No hay correo, SMS ni push para esos avisos.

## Pruebas

```bash
# Crea back/.env.test manualmente con DB_HOST, DB_PORT, DB_USER,
# DB_PASSWORD, DB_NAME_TEST (sufijo _test) y JWT_SECRET.
# No se encontró plantilla .env.test.example en este checkout.
npm test
npm run test:coverage
```

Antes de correr la suite revisa el host y credenciales efectivos: `DB_NAME_TEST` debe terminar en `_test`, diferir de `DB_NAME` y el setup recrea esa base. No apuntes a datos de producción. La evidencia técnica más reciente registrada por el proyecto es **410/410 pruebas aprobadas en 31 archivos**; no se reejecutaron pruebas como parte de esta actualización documental. Consulta [`../test_DOCUMENTACION/EJECUCION.md`](../test_DOCUMENTACION/EJECUCION.md) para resultados fechados.

## Estructura principal

```text
back/
├── app/                  # Express: configuración, rutas, controladores, servicios, modelos
├── prisma/
│   ├── schema.prisma     # 11 modelos
│   ├── migrations/       # seis migraciones PostgreSQL versionadas
│   └── seed.js           # datos demo
├── prisma.config.ts      # configuración Prisma CLI / seed
├── package.json          # type: module, scripts y dependencias
└── tests/                # Vitest, suites unitarias e integración
```
