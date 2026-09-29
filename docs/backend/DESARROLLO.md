# Guía para trabajar en el backend

El backend es la parte que recibe las peticiones de la app, aplica las reglas y se comunica con PostgreSQL. Está hecho con Express y Sequelize. Algunas guías viejas hablan de SQL puro o de headers `x-user-*`, pero eso ya no coincide con el código actual.

## Antes de empezar

Vas a necesitar Node.js, npm y PostgreSQL. Si quieres correr las pruebas en un entorno separado, también puedes usar Docker Compose.

## Preparar el backend

Desde la carpeta principal del proyecto:

```bash
cd back
npm install
cp .env.example .env
```

Abre `back/.env` y completa los datos de conexión: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. También configura `JWT_SECRET`. La base indicada en `DB_NAME` tiene que existir antes de correr las migraciones.

Puedes crear una clave aleatoria para desarrollo con este comando:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Usa claves distintas para desarrollo, pruebas y producción. No publiques el secreto que pongas en `.env`.

## Tablas y datos de ejemplo

Sequelize se conecta desde `app/config/database.js`. El CLI usa `app/config/config.js` y `.sequelizerc`. Las migraciones de `migrations/` arman las tablas; los modelos y sus relaciones están en `app/models/index.js`.

```bash
npm run migrate       # aplica las migraciones pendientes
npm run seed          # opcional: agrega datos demo
npx sequelize-cli db:migrate:status
```

También existen estos comandos:

```bash
npm run migrate:undo       # revierte la última migración
npm run migrate:undo:all   # revierte todas las migraciones
npm run seed:undo          # deshace los seeders
npm run db:reset           # borra y vuelve a crear todo; úsalo con cuidado
```

**Importante:** los comandos de reversión y `db:reset` pueden borrar datos o tablas. Haz pruebas solo con una base que puedas perder y no los ejecutes en producción.

## Arrancar la API

```bash
npm run dev
```

Por defecto, el servidor usa el puerto `3000`.

- `GET /health` revisa que la API pueda conectarse a PostgreSQL. Si no puede, responde `503`.
- `/api-docs` abre Swagger.
- Las rutas de la aplicación empiezan con `/api`.

## Iniciar sesión y permisos

Al iniciar sesión en `POST /api/auth/login`, la API devuelve un JWT. Las demás peticiones privadas deben incluirlo así:

```http
Authorization: Bearer <token>
```

El backend revisa que el token sea válido y que el usuario siga existiendo en la base de datos. No uses `x-user-id` ni `x-user-role`: esos headers ya no sirven para autenticar.

Las rutas de registro, login y el healthcheck son públicas. El resto necesita token; algunas operaciones además necesitan un rol concreto. Si falta el token o no sirve, la respuesta es `401`; si el token sirve pero el rol no tiene permiso, es `403`. La lista está en [API.md](API.md).

## Correr las pruebas

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Las pruebas usan Jest y Supertest. Configura una base aparte, por ejemplo `proyectohs_test` mediante `DB_NAME_TEST`. Algunos hooks preparan y eliminan esa base, así que no apuntes las pruebas a una base con datos importantes.

También puedes correrlas con una base temporal de Docker, desde la carpeta principal:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

## ¿Dónde está cada cosa?

```text
back/
├── app/
│   ├── app.js                 # configura Express y los middlewares
│   ├── config/                # conexión a PostgreSQL y Swagger
│   ├── controllers/           # reciben las peticiones HTTP
│   ├── middlewares/           # JWT, roles, auditoría y errores
│   ├── models/                # tablas y relaciones de Sequelize
│   ├── routes/                # direcciones de la API
│   ├── schemas/               # validación de datos recibidos
│   ├── services/              # reglas de negocio
│   └── utils/                 # funciones de apoyo
├── migrations/                # cambios en las tablas
├── seeders/                   # datos demo
└── tests/                     # pruebas automáticas
```

## Para tener presente

Las variables están explicadas en `back/.env.example`; ese archivo es una plantilla, no lleva claves reales. Aunque existe la variable `CORS_ORIGIN`, por ahora el backend acepta todos los orígenes. O sea, todavía no sirve para restringir quién se conecta; hay que cambiar el código en `app/app.js` para hacerlo.
