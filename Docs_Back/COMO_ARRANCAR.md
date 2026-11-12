# Cómo arrancar Huellitas Saludables

Guía paso a paso para levantar **base de datos + backend + frontend** y comprobar que **bcrypt** y la **protección contra SQL Injection** funcionan. Hay dos caminos; elige uno:

| Camino | Cuándo usarlo | Qué necesitas |
|---|---|---|
| **A. Docker** (recomendado) | Quieres todo funcionando con 3 comandos | Docker + Docker Compose v2 |
| **B. Local** | Vas a programar y quieres recarga en caliente | Node.js 22 + PostgreSQL 16 |

> Importante: los comandos `npm` se ejecutan **dentro de `back/` o de `front/`**, nunca en la raíz del repositorio (el `package.json` de la raíz es un resto antiguo del frontend y no arranca nada útil).

---
## NOTA DEBE HABER FRANAJS CREADAS DE LOS ESPECIALISTAS

## Usuarios de demostración

Para la demostracion, en la termianl poner (`npm run migrate`)

La semilla (`npm run seed`) crea estos usuarios. **Todos tienen la contraseña `123456`** y se guardan con hash bcrypt.

| Rol | Correo |
|---|---|
| Dueño (`usuario`) | `pedro.gonzalez@gmail.com` |
| Acudiente | `camila.vargas@gmail.com` |
| Recepcionista | `laura.gomez@proyectohs.com` |
| Especialista | `alejandro.castillo@proyectohs.com` |
| Admin | `juan.rodriguez@proyectohs.com` |

Nunca cargues estos datos en producción.

##  NOTA ASEGURARSE QUE DENTRO DEL BACK ESTE EL ARCHIVO ENV


---

## Camino A: Docker

Desde la raíz del proyecto:

```bash
cp .env.docker.example .env
```
Esto genera el JWT SECRET node -e "console.log(require('crypto').randomBytes48 ? '' : require('crypto').randomBytes(48).toString('hex'))"


Edita `.env` y cambia como mínimo:

```env
DB_PASSWORD=una-clave-fuerte
JWT_SECRET=un-texto-largo-y-aleatorio
CORS_ORIGIN=http://localhost:8080     # debe coincidir con APP_PORT; NO uses "*"
```

**Para tener los usuarios demo** (necesarios para entrar la primera vez) agrega también:

```env
NODE_ENV=development
DB_SEED=true
```

La semilla solo corre fuera de producción y solo si la tabla `usuario` está vacía. Con `NODE_ENV=production` (el valor por defecto) no se cargan datos y no habrá nadie con quien iniciar sesión salvo que alguien se registre desde la pantalla de registro.

Levantar todo:

```bash
docker compose up -d --build
docker compose ps                    # los 3 servicios deben estar "healthy"/"running"
curl http://localhost:8080/health    # debe responder success: true
```

| Qué | URL |
|---|---|
| Aplicación (frontend) | http://localhost:8080 |
| Documentación Swagger | http://localhost:8080/api-docs |
| Salud de API y BD | http://localhost:8080/health |

Comandos útiles:

```bash
docker compose logs -f backend            # ver logs
docker compose down                       # detener (conserva los datos)
docker compose down -v                    # detener y BORRAR la base de datos
docker compose exec backend npm run migrate:status
```

El backend, al arrancar, espera a PostgreSQL, aplica las migraciones Prisma y (si corresponde) la semilla. No hay que crear la base de datos a mano.

---

## Camino B: Local (sin Docker)

### 1. Crear la base de datos

Prisma crea las tablas, pero **no crea la base**. Créala una vez:

```bash
psql -U postgres -c "CREATE DATABASE proyectohs;"
```

### 2. Backend

```bash
cd back
npm ci                    # instala dependencias y genera Prisma Client (postinstall)
cp .env.example .env      # en Windows (cmd): copy .env.example .env
```

Edita `back/.env`: pon tu `DB_PASSWORD` real de PostgreSQL y un `JWT_SECRET` propio. Deja `CORS_ORIGIN=http://localhost:5173,http://localhost:8080` (orígenes exactos, sin `*`).

```bash
npm run migrate           # crea tablas, índices y triggers
npm run seed              # usuarios, mascotas y disponibilidad demo
npm run dev               # API en http://localhost:3000
```

Comprueba: `curl http://localhost:3000/health`.

### 3. Frontend (otra terminal)

```bash
cd front
npm ci
npm run dev               # http://localhost:5173
```

Sin configuración extra, el frontend habla con `http://localhost:3000/api`. Si tu API está en otra dirección, crea `front/.env` con `VITE_API_URL=http://tu-host:3000/api`.

Abre http://localhost:5173 e inicia sesión con un usuario demo.

---

## Verificar bcrypt

**Qué hace el proyecto:** las contraseñas nuevas se guardan siempre como hash bcrypt (`$2b$12$...`, 12 rondas por defecto, configurable entre 10 y 15 con `BCRYPT_SALT_ROUNDS`); el login usa `bcrypt.compare()`; para correos inexistentes se simula una verificación bcrypt (el tiempo de respuesta no revela si el correo existe); los hashes `scrypt` antiguos se re-hashean a bcrypt en el primer login correcto; el texto plano ya no se acepta.

**Prueba manual** (con la base levantada y sembrada):

```bash
# Docker:
docker compose exec db psql -U postgres -d proyectohs -c "SELECT id_usuario, left(contrasena,7) AS prefijo, length(contrasena) AS largo FROM usuario LIMIT 3;"
# Local:
psql -U postgres -d proyectohs -c "SELECT id_usuario, left(contrasena,7) AS prefijo, length(contrasena) AS largo FROM usuario LIMIT 3;"
```

Debes ver prefijo `$2b$12$` y largo `60`; nunca `123456`.

**Pruebas automáticas** (desde `back/`, ver la sección “Pruebas” más abajo para requisitos):

```bash
npm test -- tests/unit/utils/password.test.js tests/unit/services/auth.service.test.js tests/unit/services/auth.service.security.test.js tests/unit/services/migracionContrasenas.service.test.js tests/integration/seguridad-bcrypt.test.js
```

**Si tienes una base antigua con contraseñas en texto plano:**

```bash
cd back
npm run passwords:migrate                                    # solo analiza, no modifica nada
npm run passwords:migrate -- --aplicar --confirmo-respaldo   # aplica (haz antes un pg_dump)
```

---

## Verificar la protección contra SQL Injection

**Qué hace el proyecto:** todo acceso a datos pasa por Prisma (consultas parametrizadas); las pocas consultas crudas usan únicamente `` $queryRaw`...${valor}` `` (el valor viaja como parámetro, nunca concatenado); `app/utils/sqlSeguro.js` exige enteros/fechas válidos antes de esas consultas; Joi aplica listas blancas y límites de longitud a las entradas HTTP; y una prueba revisa el código fuente para impedir `$queryRawUnsafe`, `$executeRawUnsafe` y `Prisma.raw`.

**Prueba manual** con la API en marcha (usa el puerto 8080 en Docker o 3000 en local):

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"' OR 1=1 --\",\"contrasena\":\"123456\"}"
```

Debe responder **400 o 401** y **sin token**. Lo mismo para `correo = juan.rodriguez@proyectohs.com'--`.

**Pruebas automáticas** (desde `back/`):

```bash
npm test -- tests/unit/security/consultas-sql.test.js tests/unit/utils/sqlSeguro.test.js tests/integration/seguridad-sql-injection.test.js
```

---

## Pruebas

**Con Docker** (no necesita nada instalado; usa un PostgreSQL temporal):

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -f docker-compose.test.yml down -v
```

**En local** (desde `back/`):

```bash
cp .env.test.example .env.test   # ajusta DB_PASSWORD a la clave real de tu PostgreSQL
npm test                         # toda la suite
npm test -- tests/integration/citas.test.js   # un archivo
```

El usuario de PostgreSQL debe poder crear y borrar bases. Las pruebas crean y eliminan **solo** la base `proyectohs_test` (el nombre debe terminar en `_test` y ser distinto de `DB_NAME`); tu base `proyectohs` no se toca.

---

## Notas sobre los datos demo

La semilla crea disponibilidad para los días **19–21 de agosto de 2026**. Como esas fechas ya pasaron, esos horarios no sirven para agendar y el proceso automático (corre cada minuto) cancela las citas pendientes vencidas, incluida la cita demo. Para probar el flujo completo: inicia sesión como **recepcionista o admin**, crea disponibilidad con fechas futuras para un especialista y luego, como dueño, solicita la cita. Las pruebas automáticas no tienen este problema porque fijan una fecha simulada.

---

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El login falla con 403 “Origen no autorizado por CORS” | `CORS_ORIGIN` no contiene el origen exacto del navegador (por ejemplo `http://localhost:8080` o `http://localhost:5173`). No acepta `*`. Corrígelo en `.env` y reinicia el backend. |
| Login con 401 aunque el correo es correcto | La base no tiene datos demo. En Docker: `NODE_ENV=development` y `DB_SEED=true` con volumen vacío (`docker compose down -v` y volver a levantar). En local: `npm run seed`. |
| `database "proyectohs" does not exist` | Falta el paso de crear la base (camino B, paso 1). |
| `password authentication failed` | `DB_PASSWORD` de `.env` (o `.env.test`) no coincide con la clave real de PostgreSQL. |
| `npm run migrate` aborta diciendo que la base no coincide con el baseline | La base ya tenía tablas con otra estructura. No se modificó nada; usa una base nueva o revisa el esquema (ver `docs/backend/DESARROLLO.md`). |
| El puerto 8080 / 3000 / 5173 está ocupado | Cambia `APP_PORT` (y `CORS_ORIGIN` en consecuencia), `PORT` del backend, o cierra el proceso que lo usa. |
| Error de `bcrypt` al instalar | Usa Node.js 22 (el del proyecto). Con Docker no ocurre. |
| Quiero empezar de cero | Docker: `docker compose down -v`. Local: `cd back && npm run db:reset` (**borra todos los datos**). |
