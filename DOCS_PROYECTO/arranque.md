# Arranque de Huellitas Saludables

Guía para iniciar frontend, API y PostgreSQL en el checkout actual. La fuente de verdad de servicios y variables para Docker es `docker-compose.yml`; los nombres de scripts npm provienen de `back/package.json` y `front/package.json`.

## Requisitos

- **Docker:** Docker Engine y Docker Compose v2 para iniciar el conjunto completo.
- **Desarrollo sin Docker:** Node.js 22, npm y PostgreSQL 16.
- **Pruebas backend:** usa una base aislada y sigue las advertencias de [Ejecución de pruebas](test_DOCUMENTACION/EJECUCION.md); no uses una base que quieras conservar.

Este checkout incluye `back/.env.example` con `API_NINJAS_KEY` opcional, pero no contiene `.env.docker.example` ni `front/.env.example`. Para Docker Compose, agrega `API_NINJAS_KEY=<clave-opcional>` al `.env` de la raíz; Compose la entrega únicamente al backend. Para iniciar el backend local sin Docker, copia `back/.env.example` a `back/.env` y configura la clave solo si deseas cargar catálogos en vivo; sin ella se usan razas locales de respaldo. Mantén los `.env` fuera de Git y no reutilices credenciales compartidas.

## Opción A: Docker Compose

En la raíz del repositorio, crea `.env` con al menos los valores requeridos por el Compose:

```env
DB_PASSWORD=<contraseña-local-segura>
JWT_SECRET=<secreto-aleatorio-largo>
```

`docker-compose.yml` también admite `DB_NAME`, `DB_USER`, `APP_PORT`, `CORS_ORIGIN`, `DB_SEED`, `VITE_API_URL` y variables de SMTP. Si no se configuran, el archivo declara sus valores por defecto; las contraseñas de base de datos y el secreto JWT no tienen fallback y son obligatorios. El origen CORS por defecto es `http://localhost:8080`, y el puerto publicado por defecto es `8080`.

Genera un secreto para el entorno local con Node.js, sin guardar la salida en documentación:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Arranca los servicios desde la raíz:

```bash
docker compose up -d --build
docker compose ps
```

| Servicio | Dirección local por defecto |
|---|---|
| Aplicación frontend | `http://localhost:8080` |
| Healthcheck backend/BD | `http://localhost:8080/health` |
| Swagger/OpenAPI | `http://localhost:8080/api-docs` |

El Compose aplica migraciones mediante el arranque del backend y espera a que PostgreSQL y el backend estén saludables antes de iniciar el frontend. Eso describe la configuración; no significa que se haya ejecutado o desplegado en este entorno. Revisa los logs con `docker compose logs -f backend`.

Para detener sin eliminar datos, usa `docker compose down`. **`docker compose down -v` elimina el volumen de PostgreSQL y puede borrar datos persistentes**; úsalo solo si deseas descartar esa base.

La semilla está controlada por `DB_SEED` (por defecto `false`). Solo actívala en una base local desechable/de demostración: el seed contiene credenciales conocidas y no debe mezclarse con datos reales.

## Opción B: desarrollo local sin Docker

### 1. PostgreSQL

Instala/activa PostgreSQL 16 y crea una base local dedicada. No uses producción ni datos que necesites conservar para desarrollo.

### 2. Backend

Desde `back/`, instala las dependencias y crea un `back/.env` local con la conexión PostgreSQL y el secreto de JWT propios. La API utiliza `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y `CORS_ORIGIN`. En desarrollo, la API permite por defecto `localhost:5173` (Vite) y los puertos locales de Docker Compose; en producción no agrega orígenes locales y `CORS_ORIGIN` debe enumerar explícitamente el frontend autorizado.

```bash
cd back
npm ci
npm run migrate
# Opcional, solo para datos demo en una base local aislada:
npm run seed
npm run dev
```

La API de desarrollo normalmente queda en `http://localhost:3000`; `/health` indica disponibilidad de API y conexión a la base. Antes de `npm run migrate` contra una base existente, revisa su estado y conserva un respaldo adecuado.

### 3. Frontend

En otra terminal, crea `front/.env.local` solo si necesitas cambiar la URL de API; el cliente ya usa `http://localhost:3000/api` como destino local alternativo. No incluyas variables locales en Git.

```bash
cd front
npm ci
npm run dev
```

Vite normalmente sirve `http://localhost:5173`. `VITE_API_URL` permite declarar una URL distinta; en Docker Compose su valor predeterminado es `/api` y Nginx hace el proxy.

## Scripts disponibles

Consulta el manifiesto para detalles. Entre los scripts existentes están:

- **Backend:** `npm run dev`, `npm start`, `npm run migrate`, `npm run migrate:status`, `npm run seed`, `npm test`, `npm run test:coverage`, `npm run lint` y `npm run lint:fix`.
- **Frontend:** `npm run dev`, `npm run build`, `npm run preview`, `npm run type-check` y `npm run lint`.

El paquete frontend no declara un script de pruebas de componentes ni un E2E. Para usar `/estados`, inicia Vite en modo desarrollo: esa ruta solo se registra cuando `import.meta.env.DEV` es verdadero.

## Documentación relacionada

- [Índice de documentación](README.md)
- [Guía frontend](front_DOCUMENTACION/README.md)
- [Estados de interfaz](ESTADOS_DE_INTERFAZ.md)
- [Ejecución de pruebas](test_DOCUMENTACION/EJECUCION.md)
- [Prueba local de arranque y suite (25/11/2026)](auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_PRUEBA_ARRANQUE_Y_SUITE.md)
- [Auditoría de cierre T4 (25/11/2026)](auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md)

### Resultado de comprobación local

La opción de desarrollo sin Docker (PostgreSQL local, backend y Vite) se probó en un sandbox aislado el 25/11/2026: migraciones aplicadas, `/health`, `/api-docs` y frontend respondieron HTTP 200; la suite backend y el build finalizaron correctamente. **Docker Compose no se probó**, porque Docker no estaba disponible en ese entorno. Detalle y límites en la [auditoría de arranque](auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_PRUEBA_ARRANQUE_Y_SUITE.md).
