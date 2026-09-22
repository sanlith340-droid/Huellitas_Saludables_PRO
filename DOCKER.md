# Despliegue Docker de Huellitas Saludables

## Requisitos

Se necesita Docker Engine con Docker Compose v2 (`docker compose`). El proyecto queda dividido en tres contenedores: PostgreSQL, API Express y frontend React/Vite servido por Nginx.

## Arranque rápido

Desde la raíz del proyecto:

```bash
cp .env.docker.example .env
# Edita .env y cambia, como mínimo, DB_PASSWORD y JWT_SECRET.
docker compose up -d --build
```

La aplicación queda disponible en `http://localhost:8080`. También se publican, mediante el proxy de Nginx:

- `http://localhost:8080/health`: salud de la API y conexión a PostgreSQL.
- `http://localhost:8080/api-docs`: documentación Swagger.
- `http://localhost:8080/api/...`: endpoints del backend.

Para ver el arranque y las migraciones:

```bash
docker compose logs -f backend
```

Para comprobar el estado:

```bash
docker compose ps
curl http://localhost:8080/health
```

Para detener los servicios sin borrar los datos:

```bash
docker compose down
```

Para borrar también la base de datos persistida y empezar desde cero —**esto elimina los datos del volumen**—:

```bash
docker compose down -v
```

## Cómo funciona

`db` usa la imagen oficial `postgres:16-alpine`. La base se guarda en el volumen Docker `postgres_data`, por lo que reiniciar o recrear los contenedores no elimina los datos.

`backend` se construye desde `back/Dockerfile`. Su entrypoint espera hasta que PostgreSQL acepte conexiones, ejecuta `npx sequelize-cli db:migrate` y finalmente inicia `node server.js`. Los seeders son opcionales: se ejecutan cuando `DB_SEED=true`. Las migraciones son idempotentes porque Sequelize registra las ya aplicadas en `SequelizeMeta`.

`frontend` usa una construcción multi-stage. En la primera etapa, Node instala las dependencias y ejecuta `npm run build`; en la segunda, Nginx sirve los archivos estáticos resultantes. Nginx también hace proxy de `/api`, `/health` y `/api-docs` al servicio interno `backend`, evitando que el navegador tenga que conocer el nombre de red Docker.

La variable `VITE_API_URL` se inserta durante el build de Vite. Su valor predeterminado es `/api`, que es la opción recomendada cuando frontend y backend se sirven detrás del mismo Nginx.

## Tests automatizados dentro de Docker

El archivo `docker-compose.test.yml` define un flujo separado para Jest. Levanta un PostgreSQL de pruebas (`db-test`) con almacenamiento temporal (`tmpfs`) y un contenedor `tests` que reutiliza la imagen del backend, pero reemplaza el entrypoint normal por `npm test -- --runInBand`.

La suite actual ya contiene pruebas unitarias y de integración con Jest y Supertest. Sus hooks crean `proyectohs_test`, ejecutan las migraciones y seeders, y eliminan la base al terminar. En Docker, `DB_HOST=db-test` hace que esos hooks se conecten al servicio correcto en lugar de intentar usar `localhost`.

Para ejecutar todos los tests:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

El comando devuelve código `0` si todas las pruebas pasan y un código distinto de cero si alguna falla. Después de una ejecución normal, se pueden eliminar los contenedores de prueba con:

```bash
docker compose -f docker-compose.test.yml down -v
```

En CI/CD, el primer comando debe ser el paso de validación. Por ejemplo, un pipeline puede construir las imágenes, ejecutar ese comando y solamente después ejecutar `docker compose up -d` para desplegar. La base de pruebas está separada de la base de desarrollo/producción y se destruye al finalizar, de modo que las pruebas no modifican los datos de la aplicación.

## Archivos agregados

| Archivo | Función |
|---|---|
| `docker-compose.yml` | Orquesta PostgreSQL, backend y frontend, redes implícitas, volumen, puertos y healthchecks. |
| `back/Dockerfile` | Construye la imagen de Node para la API. |
| `back/docker-entrypoint.sh` | Espera la base, corre migraciones y opcionalmente seeders. |
| `front/Dockerfile` | Compila React/Vite y crea la imagen final de Nginx. |
| `front/nginx.conf` | Sirve la SPA, resuelve rutas de React y proxifica la API. |
| `.env.docker.example` | Plantilla de configuración para Docker sin incluir secretos reales. |
| `docker-compose.test.yml` | Ejecuta Jest en un contenedor contra un PostgreSQL efímero de pruebas. |
| `.dockerignore` y variantes | Evitan enviar `.env`, `node_modules`, `dist` y logs al contexto de build. |

## Notas de seguridad

No se deben copiar los archivos `.env` reales a una imagen ni subirlos al repositorio. En un servidor real, crea `.env` fuera del control de versiones, usa un `JWT_SECRET` aleatorio y restringe `CORS_ORIGIN` al dominio del frontend. Para producción con HTTPS, coloca un proxy TLS externo delante de este stack o termina TLS en Nginx.

## Comandos útiles

```bash
# Reconstruir después de modificar código
docker compose up -d --build

# Entrar a la API
docker compose exec backend sh

# Ejecutar migraciones manualmente
docker compose exec backend npx sequelize-cli db:migrate

# Cargar datos demo
docker compose exec backend npx sequelize-cli db:seed:all

# Ver logs de todos los servicios
docker compose logs -f
```
