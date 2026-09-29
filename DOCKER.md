# Levantar Huellitas Saludables con Docker

Con Docker puedes iniciar la base de datos, la API y el frontend juntos, sin instalar cada parte por separado.

## Lo que necesitas

- Docker Engine.
- Docker Compose v2, que se usa como `docker compose`.

## Arranque

Desde la carpeta principal del proyecto:

```bash
cp .env.docker.example .env
```

Edita `.env` antes de arrancar y cambia `DB_PASSWORD` y `JWT_SECRET` por valores tuyos. No publiques la app con las claves de ejemplo.

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8080/health
```

Abre <http://localhost:8080> para ver la app. Swagger está en <http://localhost:8080/api-docs> y el puerto público se puede cambiar con `APP_PORT`.

## Comandos útiles

```bash
docker compose logs -f                 # ver todos los logs
docker compose logs -f backend        # ver solo la API
docker compose exec backend sh        # abrir una shell en el backend
docker compose exec backend npx sequelize-cli db:migrate
```

Para apagar el proyecto y conservar los datos:

```bash
docker compose down
```

**Ojo:** este comando sí borra los datos del volumen:

```bash
docker compose down -v
```

Úsalo solo cuando quieras borrar la base y empezar de cero.

## ¿Qué hacen los contenedores?

- `db` usa PostgreSQL 16 y guarda los datos en el volumen `postgres_data`.
- `backend` espera a que PostgreSQL esté listo, aplica las migraciones y arranca Express. Los datos demo solo se cargan si `DB_SEED=true`.
- `frontend` compila React/Vite y Nginx sirve los archivos. Nginx también pasa `/api`, `/health` y `/api-docs` al backend.

La URL de API del frontend se configura durante la compilación. Con Docker, `/api` es el valor recomendado porque Nginx se encarga del resto.

## Correr las pruebas

El archivo `docker-compose.test.yml` levanta una base PostgreSQL temporal y corre Jest/Supertest en otro contenedor:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

Cuando termines, puedes limpiar los contenedores de pruebas así:

```bash
docker compose -f docker-compose.test.yml down -v
```

Esa base es temporal y está separada de la base normal del proyecto.

## Claves y CORS

Las variables principales están en `.env.docker.example`. Copia ese archivo a `.env` y cambia los valores de ejemplo. No subas `.env` a Git ni lo incluyas en imágenes o ZIP que compartas.

Hay un detalle importante: aunque Docker pasa `CORS_ORIGIN` al backend, el código actual acepta cualquier origen. Esa variable todavía no limita quién se conecta; hay que implementar esa regla en `back/app/app.js` antes de publicar la API. En un servidor real también configura HTTPS.

Para conocer los endpoints, mira [la guía de API](docs/API.md); para entender cómo se conectan las partes, mira [la arquitectura](docs/ARQUITECTURA.md).
