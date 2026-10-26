# Despliegue en Render — Huellitas Saludables PRO

Esta guía describe la arquitectura de producción prevista. No contiene secretos ni dominios definitivos.

## Arquitectura elegida

- **Frontend:** Static Site de Render, construido con Vite.
- **Backend:** Web Service nativo de Node.js, sin Docker en producción.
- **Base de datos:** PostgreSQL administrado por Render.
- **Desarrollo local:** se conserva Docker Compose, Nginx y el entrypoint actuales.

## Antes de conectar Render

- Revisar y versionar todos los cambios. En particular, `back/app/utils/password.js` y `back/app/config/databaseUrl.js` son necesarios en tiempo de ejecución y actualmente no están registrados en Git.
- No subir archivos `.env` reales ni secretos al repositorio.
- Rotar el secreto JWT antes de publicar; el anterior debe considerarse comprometido.
- No ejecutar seeders ni scripts SQL de demostración en producción.

## Decisiones que faltan

Antes de crear un `render.yaml` definitivo hay que confirmar:

1. Nombre del servicio backend.
2. Nombre del servicio frontend.
3. Nombre de la base de datos.
4. Región de Render.
5. Plan de cada servicio.
6. Dominio del frontend y del backend, o uso de dominios `onrender.com`.
7. Si las migraciones se ejecutarán manualmente o mediante un comando controlado de pre-despliegue.

No se debe inventar ninguno de estos valores.

## Frontend: Static Site

- Directorio raíz: `front`.
- Comando de construcción: `npm ci --include=dev && npm run build`.
- Directorio de publicación: `dist`.
- Rutas SPA: reescribir `/*` hacia `/index.html` con estado 200.
- Versión de Node: fijar Node 22, igual que el Dockerfile local.
- Variable de construcción:

```text
VITE_API_URL=https://<backend-domain>/api
```

`VITE_API_URL` se incorpora al bundle durante la construcción. Si cambia, hay que volver a construir el frontend. No debe contener secretos.

El fallback local de `front/src/services/api.ts` se conserva únicamente para desarrollo con Vite. En producción, si `VITE_API_URL` no está definida, la aplicación usa `/api`; por eso en Render es obligatorio configurar la URL pública del backend.

No se modifica Nginx: sigue siendo la pieza del entorno Docker local.

## Backend: Web Service nativo

- Directorio raíz: `back`.
- Comando de instalación/construcción: `npm ci --include=dev`.
- Comando de inicio: `npm start`.
- Puerto: Render lo inyecta en `process.env.PORT`; no se debe fijar manualmente en producción.
- Endpoint de salud: `GET /health`.
- Versión de Node: el Dockerfile local usa Node 22. En Render conviene fijar Node 22 con `NODE_VERSION=22` para mantener la reproducibilidad; `package.json` no declara `engines`.

### Variables de entorno

Configurar en Render:

```text
NODE_ENV=production
DATABASE_URL=<cadena-interna-de-postgresql>
JWT_SECRET=<secreto-nuevo-y-exclusivo>
JWT_EXPIRES_IN=10h
CORS_ORIGIN=https://<frontend-domain>
DB_SEED=false
```

Notas:

- No configurar `PORT` manualmente.
- No usar `CORS_ORIGIN=*`.
- `CORS_ORIGIN` no debe terminar en `/`. Si hay más de un dominio autorizado, sepáralos con comas.
- `DB_SEED=false` evita cargar datos de demostración.
- Las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` siguen disponibles para desarrollo local y pruebas. En producción se prefiere `DATABASE_URL`.

### CORS

El backend compara el encabezado `Origin` con una lista exacta tomada de `CORS_ORIGIN`. No se admite `*` como comodín porque la configuración usa credenciales.

Ejemplo de producción, sustituyendo el dominio real:

```text
CORS_ORIGIN=https://<frontend-domain>
```

Si se añade un dominio personalizado, inclúyelo también como origen exacto.

### JWT

El backend no arranca si `JWT_SECRET` falta o está vacío. El secreto anterior del historial público debe considerarse comprometido y no debe reutilizarse.

Genera un secreto nuevo y exclusivo para producción, guárdalo únicamente en Render o en el gestor de secretos del propietario y no lo escribas en el repositorio ni en esta guía. No se reescribe el historial de Git en esta misión.

### PostgreSQL y SSL

Usa la URL interna de PostgreSQL administrado por Render para el backend. El código acepta:

- `postgres://...`
- `postgresql://...`
- `sslmode=require`
- `sslmode=disable`
- `sslmode=no-verify`
- `ssl=true|false`

Si la URL de Render no incluye SSL y la conexión lo exige, añade `?sslmode=require`. Evita `sslmode=no-verify` salvo que exista una razón justificada y revisada: desactiva la verificación del certificado.

En modo test, el código ignora `DATABASE_URL` y mantiene la separación con `DB_*` y `DB_NAME_TEST`.

## Migraciones

Comando previsto:

```text
npm run migrate
```

Ese script ejecuta `npx sequelize-cli db:migrate`.

Consideraciones:

- `sequelize-cli` está en `devDependencies`. Por eso el backend se construye con `npm ci --include=dev`; si se instala solo producción, el comando de migración puede no estar disponible.
- Las migraciones actuales están en `back/migrations` y tienen orden por marca de tiempo. No se deben renombrar ni reordenar sin revisar el estado de la base.
- No se ejecutan seeders en producción. `DB_SEED=false` y el entrypoint de Docker ya bloquean los seeders en producción.
- No se deben ejecutar scripts SQL de demostración en producción.
- No se debe borrar ni reiniciar la base para “arreglar” una migración.

Procedimiento recomendado para el primer despliegue:

1. Crear la base administrada.
2. Configurar `DATABASE_URL` y las demás variables.
3. Hacer una copia de seguridad si la base ya contiene datos.
4. Ejecutar `npm run migrate` una sola vez desde un entorno controlado, con la misma `DATABASE_URL`.
5. Revisar los logs y el estado de las migraciones.
6. Recién después, habilitar tráfico o verificar el backend.

No se configuró una migración automática en `render.yaml`. Un comando de pre-despliegue puede ser útil, pero debe evaluarse por idempotencia, concurrencia y bloqueos antes de activarlo.

Queda pendiente confirmar el orden y el estado real de las migraciones contra una base vacía o existente. No se ejecutaron migraciones en esta misión.

## Plantilla opcional de `render.yaml`

No crear este archivo como definitivo hasta completar los valores entre `<...>`. Un YAML con marcadores no está listo para desplegar.

```yaml
services:
  - type: web
    name: <backend-name>
    runtime: node
    rootDir: back
    plan: <backend-plan>
    buildCommand: npm ci --include=dev
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: <database-name>
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 10h
      - key: CORS_ORIGIN
        value: https://<frontend-domain>
      - key: DB_SEED
        value: "false"

  - type: web
    name: <frontend-name>
    runtime: static
    rootDir: front
    buildCommand: npm ci --include=dev && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://<backend-domain>/api

databases:
  - name: <database-name>
    databaseName: <database-name>
    plan: <database-plan>
```

La plantilla no incluye secretos, dominios reales, planes concretos ni comandos de migración automáticos.

## Comprobaciones posteriores al despliegue

Realizar manualmente:

1. Abrir `https://<backend-domain>/health` y confirmar una respuesta correcta sin detalles internos.
2. Abrir el frontend y recargar una ruta interna, por ejemplo `/login`, para comprobar la reescritura SPA.
3. Iniciar sesión con un usuario creado para producción, no con datos de demostración.
4. Verificar en el navegador que las peticiones al backend no fallan por CORS.
5. Revisar los logs de Render sin buscar ni copiar secretos.
6. Confirmar que la conexión PostgreSQL usa la URL y el SSL esperados.
7. Confirmar que `/api-docs` no expone información que no deba ser pública; si no se necesita, considerar restringirlo en una tarea posterior.

## Diferencias entre Docker local y Render

- **Docker local:** Nginx sirve el frontend y hace proxy de `/api`; el backend usa `DB_*`; el entrypoint espera PostgreSQL y aplica migraciones; el frontend suele construirse con `VITE_API_URL=/api`.
- **Render:** no hay Nginx; el frontend llama directamente al backend mediante `VITE_API_URL`; CORS debe autorizar el dominio exacto; el backend usa `DATABASE_URL`; Render inyecta `PORT`; no se usa el entrypoint de Docker ni se cargan seeders.

Conservar Docker no impide el despliegue nativo: son dos formas de ejecución separadas.

## Pendientes clasificados

### CRÍTICO

- Definir y rotar el `JWT_SECRET` de producción. El anterior debe considerarse comprometido.
- Configurar `CORS_ORIGIN` con el dominio exacto del frontend, sin `*`.
- Confirmar que las migraciones se aplicaron correctamente antes de usar la aplicación con datos reales.

### IMPORTANTE

- Completar nombres, región, planes y dominios antes de crear `render.yaml`.
- Verificar que `npm ci --include=dev` esté disponible en el entorno de construcción de Render.
- Revisar el orden y el estado de las migraciones contra la base real.
- Decidir si `/api-docs` debe ser público en producción.
- Confirmar el requisito SSL de la URL de PostgreSQL.

### POSTERIOR

- Evaluar un comando de pre-despliegue para migraciones si el procedimiento manual resulta poco práctico.
- Revisar periódicamente dependencias y secretos.
- Añadir pruebas de integración para la configuración de producción cuando se autoricen ejecuciones.
