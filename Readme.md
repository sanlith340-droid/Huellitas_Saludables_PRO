# Huellitas Saludables

Huellitas Saludables es una app para organizar varias cosas de una veterinaria: registrar mascotas, pedir citas, revisar horarios de especialistas y guardar historias clínicas.

El proyecto tiene estas partes:

- **Frontend:** React, TypeScript y Vite. Está en `front/`.
- **Backend:** Node.js, Express y Sequelize. Está en `back/`.
- **Base de datos:** PostgreSQL.
- **Inicio de sesión:** usa JWT. Las peticiones privadas mandan `Authorization: Bearer <token>`.
- **API:** se puede explorar desde Swagger en `/api-docs`.

## La forma rápida: Docker

Necesitas Docker y Docker Compose v2. Desde la carpeta principal del proyecto, copia la plantilla:

```bash
cp .env.docker.example .env
```

Abre `.env` y cambia `DB_PASSWORD` y `JWT_SECRET` por valores tuyos y seguros. Los valores de ejemplo sirven para mostrar el formato, no para dejar tu sistema publicado así.

```bash
docker compose up -d --build
docker compose ps
```

Después puedes abrir <http://localhost:8080>. La API se conecta por `/api`, el estado del servidor se revisa en `/health` y la documentación interactiva está en `/api-docs`.

Para apagarlo sin borrar la base de datos:

```bash
docker compose down
```

**Ojo:** `docker compose down -v` también borra el volumen de PostgreSQL y los datos guardados. Úsalo solo si de verdad quieres empezar de cero.

Más detalles en [la guía de Docker](DOCKER.md).

## Para trabajar sin Docker

Necesitas Node.js, npm y PostgreSQL funcionando. Primero prepara el backend:

```bash
cd back
npm install
cp .env.example .env
```

Edita `back/.env` con los datos de tu PostgreSQL y un `JWT_SECRET` aleatorio. Si la base indicada por `DB_NAME` todavía no existe, créala. Luego:

```bash
npm run migrate
npm run seed       # opcional: agrega datos de ejemplo
npm run dev
```

Abre otra terminal para el frontend:

```bash
cd front
npm install
npm run dev
```

Vite te muestra en la terminal la dirección para abrir la app (normalmente usa el puerto `5173`). Si la API está en otra dirección, configura `VITE_API_URL`. En Docker normalmente queda como `/api`, porque Nginx se encarga de pasar las peticiones al backend.

## Comandos que puedes necesitar

| Carpeta | Comando | Para qué sirve |
|---|---|---|
| `back/` | `npm run dev` | Arrancar la API mientras desarrollas |
| `back/` | `npm start` | Arrancar la API normalmente |
| `back/` | `npm run migrate` | Crear o actualizar las tablas pendientes |
| `back/` | `npm run seed` | Cargar datos de ejemplo |
| `back/` | `npm test` | Ejecutar las pruebas |
| `back/` | `npm run test:coverage` | Ejecutar pruebas y revisar cobertura |
| `front/` | `npm run dev` | Abrir Vite para desarrollar |
| `front/` | `npm run build` | Revisar tipos y compilar el frontend |
| `front/` | `npm run lint` | Revisar el estilo del código |

## Guías del proyecto

- [Backend y desarrollo](docs/DESARROLLO.md)
- [Rutas de la API y roles](docs/API.md)
- [Cómo está organizado el proyecto](docs/ARQUITECTURA.md)
- [Levantarlo con Docker](DOCKER.md)
- [Mensajes de permisos por rol](MENSAJES_DE_ERROR_POR_ROL.md)

Los detalles de cada petición y respuesta están en Swagger y en `back/app/config/swagger.js`.

## Unas notas de seguridad

- No subas archivos `.env` reales ni claves a Git o a un ZIP que vayas a compartir.
- Cambia las claves de ejemplo antes de publicar la app.
- Por ahora, el backend acepta peticiones de cualquier origen: `CORS_ORIGIN` todavía no se usa para limitarlo. Antes de exponer el sistema en Internet, hay que revisar esa parte en `back/app/app.js`.
- Para un despliegue real también hacen falta HTTPS y claves guardadas de forma segura.
