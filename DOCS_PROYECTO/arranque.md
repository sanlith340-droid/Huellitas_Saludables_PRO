# Arranque de Huellitas Saludables PRO

Guía canónica para levantar frontend, API y base de datos. El documento está directamente en `docs/` (no dentro de `docs/front/`).

## Requisitos

- **Docker recomendado:** Docker Engine/Desktop y Docker Compose v2.
- **Desarrollo local:** Node.js 22, npm y PostgreSQL 16.
- Para ejecutar la suite automatizada, consultar [docs/test/EJECUCION.md](test/EJECUCION.md), no reutilizar la base normal de desarrollo.

## Opción A: levantar todo con Docker

Desde la raíz del repositorio, crear el archivo de configuración local a partir de la plantilla:

```bash
cp .env.docker.example .env
```

Editar `.env` antes de iniciar. Cambiar por valores propios y seguros, como mínimo:

```env
DB_PASSWORD=una-clave-larga-y-unica
JWT_SECRET=un-secreto-aleatorio-largo
CORS_ORIGIN=http://localhost:8080
APP_PORT=8080
```

Para generar un secreto aleatorio con Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

No publiques ni compartas el `.env`. **No uses los valores de ejemplo/default en un entorno accesible a usuarios.** El template actual indica `CORS_ORIGIN=*`, pero el backend compara el origen literalmente; usa el origen exacto del navegador, por ejemplo `http://localhost:8080` si `APP_PORT=8080`.

### Datos demostrativos

Si se necesita cargar usuarios/datos de demostración en una base local vacía, configura temporalmente `NODE_ENV=development` y `DB_SEED=true` antes del primer arranque. La semilla contiene contraseñas conocidas para demo: nunca cargarlas en producción ni reutilizar esos datos con información real. Para una instalación sin demo, conservar `NODE_ENV=production` y `DB_SEED=false`.

### Iniciar y verificar

```bash
docker compose up -d --build
docker compose ps
curl -i http://localhost:8080/health
```

Cambiar `8080` por el valor de `APP_PORT` si se modificó. El Compose publica el frontend/Nginx; `/health` proxya a la API, que comprueba su acceso a la base. En el Compose principal hay healthchecks definidos para PostgreSQL y backend; el contenedor frontend solo depende de que el backend esté saludable.

| Servicio | Dirección local |
|---|---|
| Aplicación frontend | `http://localhost:8080` (o `APP_PORT`) |
| API/BD healthcheck | `http://localhost:8080/health` |
| Swagger/OpenAPI | `http://localhost:8080/api-docs` |

Comandos comunes:

```bash
docker compose logs -f backend
docker compose down                 # detiene servicios; conserva el volumen normal de BD
docker compose ps
```

> **Destructivo:** `docker compose down -v` elimina los volúmenes adjuntos a ese proyecto Compose y puede borrar la base persistente. Úsalo solo cuando realmente se quiera reiniciar desde cero y se haya confirmado qué datos se eliminan.

El backend ejecuta el entrypoint, espera PostgreSQL y aplica migraciones al arrancar. Revisa el estado del servicio si una migración falla; no borres el volumen como primer paso de diagnóstico.

## Opción B: desarrollo local sin Docker

### 1. PostgreSQL

Crear una base dedicada de desarrollo con PostgreSQL 16, si aún no existe. Ejemplo local:

```bash
createdb -U postgres proyectohs
```

No utilizar una base de producción para desarrollo o pruebas.

### 2. Backend

En una terminal:

```bash
cd back
npm ci
cp .env.example .env
```

Editar `back/.env` con credenciales reales de la base local, un `JWT_SECRET` propio y `CORS_ORIGIN` con los orígenes exactos usados (por ejemplo, `http://localhost:5173,http://localhost:8080`). No compartir el archivo `.env`.

```bash
npm run migrate
npm run seed       # solo para una base local de demostración, opcional
npm run dev
```

La API queda en `http://localhost:3000`; comprobar con:

```bash
curl -i http://localhost:3000/health
```

Antes de ejecutar `npm run migrate` sobre una base con datos preexistentes, hacer respaldo y verificar el estado; no es un comando para una base desconocida.

### 3. Frontend

En otra terminal, desde la raíz:

```bash
cd front
npm ci
npm run dev
```

Vite queda normalmente en `http://localhost:5173`. En desarrollo local el cliente usa `http://localhost:3000/api` como fallback. Si se necesita otra dirección, establecer `VITE_API_URL` para el build/frontend. Ver la guía [docs/front/README.md](front/README.md).

## Usuarios demo y disponibilidad

La semilla y contraseñas de demostración son exclusivamente para entornos locales aislados. Revisa `back/prisma/seed.js` para los datos vigentes en el checkout; no copies credenciales personales/demo a este documento. Si las franjas de demo están vencidas, crea disponibilidad con fecha futura como especialista o administrador antes de probar una reserva.

## Parar y consultar registros

```bash
docker compose logs -f backend
docker compose down
```

Para ejecutar pruebas usa la base temporal y las precauciones de [docs/test/EJECUCION.md](test/EJECUCION.md). El plan completo está en [docs/test/PLAN_MAESTRO_DE_PRUEBAS.md](test/PLAN_MAESTRO_DE_PRUEBAS.md).
