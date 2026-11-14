# Despliegue Docker de Huellitas Saludables

## Requisitos y arranque

Se necesita Docker Engine con Docker Compose v2. Desde la raíz del repositorio:

```bash
cp .env.docker.example .env
# Cambia al menos DB_PASSWORD y JWT_SECRET.
docker compose up -d --build
```

La app queda en `http://localhost:8080`; Swagger en `/api-docs` y la salud de API/PostgreSQL en `/health`.

```bash
docker compose ps
docker compose logs -f backend
curl http://localhost:8080/health
```

`docker compose down` detiene servicios y conserva el volumen de PostgreSQL. `docker compose down -v` también elimina ese volumen y todos sus datos.

## Qué hace el backend

El servicio `backend` instala el cliente Prisma ESM, espera a PostgreSQL, ejecuta `npm run migrate` y arranca `npm start`. La migración `0_init` conserva los siete modelos, claves, checks, el índice parcial de citas activas y los triggers. La detección inicial solo registra como aplicado el baseline de una base existente si su estructura coincide; si no coincide, aborta sin alterar filas. Haz un respaldo antes de actualizar.

Los datos demo son opcionales: `DB_SEED=true` ejecuta `npm run seed` únicamente fuera de producción y cuando todavía no existen usuarios. Las contraseñas de demo son conocidas (`123456`) y nunca deben cargarse en producción.

Nginx sirve la SPA y hace proxy de `/api`, `/health` y `/api-docs`. El frontend usa `/api` como `VITE_API_URL` en Docker.

## Pruebas automatizadas en Docker

`docker-compose.test.yml` levanta PostgreSQL temporal (tmpfs) y ejecuta Vitest con `NODE_ENV=test`. El setup aplica las migraciones Prisma y la semilla sobre `DB_NAME_TEST`; al final elimina exclusivamente esa base desechable.

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f docker-compose.test.yml down -v
```

El primer comando devuelve 0 si pasan las pruebas. El entorno de test debe usar una base cuyo nombre termine en `_test`, distinta de `DB_NAME`.

## Comandos útiles

```bash
docker compose up -d --build
docker compose exec backend npm run migrate:status
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
docker compose exec backend sh
docker compose logs -f
```

## Seguridad

No copies archivos `.env` reales a imágenes ni al repositorio. Usa secretos propios y `JWT_SECRET` aleatorio; restringe `CORS_ORIGIN` al origen del frontend. En producción, sirve por HTTPS y planifica respaldos de PostgreSQL.
