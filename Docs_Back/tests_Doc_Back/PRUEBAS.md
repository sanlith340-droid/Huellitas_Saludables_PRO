# Guía de pruebas

El backend usa **Vitest** y **Supertest**. Las pruebas cubren endpoints de autenticación, mascotas, razas, disponibilidad, citas, historias clínicas y usuarios, además de utilidades unitarias.

## Seguridad de la base de pruebas

El setup crea, migra, siembra y elimina la base `DB_NAME_TEST`. Esa base debe terminar en `_test` y ser distinta de `DB_NAME`. El usuario PostgreSQL necesita permisos para crear y eliminar bases. **No apuntes `DB_NAME_TEST` a una base con datos que debas conservar ni a producción.**

## Organización

```text
back/tests/
├── integration/       # Peticiones HTTP a Express y contratos de API
├── unit/              # Pruebas unitarias de servicios, utilidades y middleware
├── fixtures/          # Datos de prueba
├── helpers/           # Login y autenticación para los tests
└── setup/
    ├── setupEnv.js        # Carga .env.test
    ├── globalSetup.js     # Crea DB de test, aplica migrate deploy y seed
    ├── dbHelper.js        # Reinicia solo la DB de test con Prisma Migrate
    ├── setupAfterEnv.js   # Desconecta el singleton Prisma
    └── globalTeardown.js  # Elimina solo la DB de test
```

## Ejecución local

Desde `back/`:

```bash
npm ci
cp .env.test.example .env.test
# Ajusta DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_TEST y JWT_SECRET.
npm test
```

El nombre de ejemplo es `proyectohs_test`. Vitest ejecuta los archivos secuencialmente porque los hooks restablecen una base compartida. Para casos concretos:

```bash
npm test -- tests/integration/citas.test.js
npm test -- -t "texto del nombre del caso"
npm run test:watch
npm run test:coverage
```

La cobertura queda en `back/coverage/`.

## Ejecución con Docker

Desde la raíz del proyecto:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f docker-compose.test.yml down -v
```

El PostgreSQL de `docker-compose.test.yml` es temporal y está separado de la base normal de la aplicación.

## Si algo falla

- Si no conecta PostgreSQL, revisa host, puerto y credenciales de `.env.test`.
- Si no puede crear la base, da permiso `CREATEDB` al usuario dedicado de pruebas.
- Si el setup rechaza la base, verifica que `DB_NAME_TEST` termine en `_test` y no coincida con `DB_NAME`.
- Si falla una consulta, ejecuta `npx prisma validate` y `npm run migrate:status` apuntando a la base correcta.
