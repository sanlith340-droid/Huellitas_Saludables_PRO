# Entorno Docker de Huellitas Saludables

## Requisitos y arranque

Se necesita Docker Engine y Docker Compose v2. Desde la raíz del repositorio:

```bash
# No se encontró una plantilla .env.docker.example en este checkout.
# Crea .env en la raíz y define al menos DB_PASSWORD y JWT_SECRET,
# ambos con valores propios, antes de arrancar.
docker compose up -d --build
```

Compose usa `DB_NAME=proyectohs`, `DB_USER=postgres`, `DB_PASSWORD` y `JWT_SECRET`; configura opcionalmente `APP_PORT`, `CORS_ORIGIN`, `FRONTEND_URL`, `SMTP_*` y demás variables según `docker-compose.yml`. La aplicación local se publica por defecto en `http://localhost:8080`; Swagger en `/api-docs` y la salud de API/PostgreSQL en `/health`.

```bash
docker compose ps
docker compose logs -f backend
curl http://localhost:8080/health
```

`docker compose down` detiene servicios y conserva el volumen PostgreSQL. `docker compose down -v` elimina también el volumen y todos sus datos.

## Qué prepara el backend

El servicio backend instala dependencias, genera el cliente Prisma 7 ESM, espera a PostgreSQL y aplica las migraciones con `npm run migrate` antes de iniciar. PostgreSQL usa `postgres:16-alpine`. El historial actual contiene seis migraciones; `0_init` es el baseline histórico original y no representa por sí solo todas las entidades actuales. El esquema vigente contiene 11 modelos Prisma, incluidos tokens de recuperación, revocación de sesión y notificaciones.

La detección de una base existente registra el baseline solo si la estructura coincide; si el esquema es parcial o diferente, aborta. Conserva respaldo antes de actualizar. Las migraciones compartidas no se modifican retroactivamente.

Los datos demo son opcionales: `DB_SEED=true` carga la semilla solo fuera de producción y cuando no hay usuarios. Las credenciales demo conocidas son exclusivamente de desarrollo/pruebas; nunca las uses en producción.

Nginx sirve la SPA y proxyfica `/api`, `/health` y `/api-docs`. Las rutas de negocio se describen en [`API.md`](./API.md).

## Pruebas en Docker

`docker-compose.test.yml` prepara PostgreSQL temporal con `tmpfs` y ejecuta Vitest en modo test. El setup valida `DB_NAME_TEST`, crea/recrea la base aislada, aplica las migraciones y seed y la elimina al concluir. Confirma host y nombre de base antes de ejecutar: el setup de pruebas es destructivo para esa base.

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f docker-compose.test.yml down -v
```

La evidencia técnica más reciente del repositorio es 410/410 pruebas backend aprobadas en 31 archivos. No se volvió a ejecutar esta secuencia al actualizar estas guías.

## Comandos útiles

```bash
docker compose up -d --build
docker compose exec backend npm run migrate:status
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
docker compose exec backend sh
docker compose logs -f
```

## Seguridad y operación

No copies `.env` reales a imágenes ni al repositorio. Usa secretos únicos gestionados por entorno, restringe `CORS_ORIGIN` a los orígenes necesarios y sirve por HTTPS fuera de local. Hay scripts de backup/restauración en el repositorio, pero la existencia de scripts no equivale a un despliegue productivo validado: el estado actual indica que aún no hay despliegue real.
