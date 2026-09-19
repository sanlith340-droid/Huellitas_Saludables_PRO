# Documentación completa actualizada - Backend Huellitas Saludables
## ORM + JWT + Tests automatizados + Bugs corregidos

---

# ÍNDICE

1. Introducción
2. Requisitos previos
3. Configuración del entorno
4. Instalación y arranque
5. Estructura del proyecto
6. Variables de entorno (.env)
7. Sequelize ORM
8. Migraciones
9. Seeders
10. Triggers de PostgreSQL
11. Modelos y relaciones
12. Servicios (con bugs corregidos)
13. Autenticación JWT
14. Tests automatizados (Jest + Supertest)
15. Scripts de prueba con curl
16. Endpoints disponibles
17. Bugs corregidos hoy
18. Errores comunes
19. Reglas y buenas prácticas
20. Pendientes
21. Glosario

---

# 1. INTRODUCCIÓN

Este documento describe el backend de **Huellitas Saludables** después de completar la integración de:

- **Sequelize ORM** — reemplaza SQL puro con modelos JavaScript
- **JWT** — autenticación con tokens firmados
- **Jest + Supertest** — 127 tests automatizados
- **Bugs corregidos** — encontrados por los tests

Pensado para un tecnólogo en software junior que necesita entender, mantener y extender el proyecto.

---

# 2. REQUISITOS PREVIOS

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 8+ | `npm -v` |
| PostgreSQL | 14+ | Ver sección 3 |
| Git Bash | Reciente | Ya instalado en Windows |

---

# 3. CONFIGURACIÓN DEL ENTORNO

## 3.1. Agregar `psql` al PATH

### Ruta de PostgreSQL en este proyecto

```
C:\Formacion\pgsql-18-3-2\pgsql\bin
```

Si no la recuerdas:

```bash
find /c -name "psql.exe" 2>/dev/null | head -5
```

### Configuración temporal

```bash
export PATH="/c/Formacion/pgsql-18-3-2/pgsql/bin:$PATH"
```

### Configuración permanente

Edita `~/.bashrc`:

```bash
code ~/.bashrc
```

Agrega al final:

```bash
# PostgreSQL bin
export PATH="/c/Formacion/pgsql-18-3-2/pgsql/bin:$PATH"
```

Recarga:

```bash
source ~/.bashrc
```

### Verificar

```bash
which psql
psql --version
```

## 3.2. Comandos útiles de psql

```bash
# Conectar
psql -U postgres -h localhost -d proyectohs

# Listar tablas
psql -U postgres -h localhost -d proyectohs -c "\dt"

# Ver estructura de una tabla
psql -U postgres -h localhost -d proyectohs -c "\d usuario"

# Ver triggers
psql -U postgres -h localhost -d proyectohs -c "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal;"

# Contar usuarios
psql -U postgres -h localhost -d proyectohs -c "SELECT COUNT(*) FROM usuario;"
```

---

# 4. INSTALACIÓN Y ARRANQUE

## 4.1. Crear el archivo `.env` (OBLIGATORIO)

Sin este archivo el servidor **no funciona correctamente**.

```bash
cd /c/Users/moise/OneDrive/Desktop/Huellitas_saludables_PRO/back
cp .env.example .env
code .env
```

Contenido de `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyectohs
DB_USER=postgres
DB_PASSWORD=H4ll1t4s_V3t_2026_S3cur3_M3d_B4ckend

CORS_ORIGIN=*

JWT_SECRET=<64+ caracteres aleatorios en hex>
JWT_EXPIRES_IN=8h
```

## 4.2. Crear `.env.test` (para tests)

```bash
cp .env.example .env.test
code .env.test
```

Contenido de `.env.test`:

```env
NODE_ENV=test
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyectohs
DB_USER=postgres
DB_PASSWORD=H4ll1t4s_V3t_2026_S3cur3_M3d_B4ckend

CORS_ORIGIN=*

JWT_SECRET=test_secret_solo_para_jest_no_usar_en_produccion_1234567890abcdef
JWT_EXPIRES_IN=1h
```

**Importante:** `DB_NAME=proyectohs` (sin `_test`). El `config.js` agrega `_test` automáticamente cuando corre en modo test → `proyectohs_test`.

## 4.3. Instalar dependencias

```bash
npm install
```

## 4.4. Verificar PostgreSQL

```bash
tasklist | grep postgres
```

Debe mostrar varios `postgres.exe`.

## 4.5. Crear la BD y cargar datos

```bash
psql -U postgres -c "CREATE DATABASE proyectohs WITH OWNER=postgres ENCODING='UTF8' TEMPLATE=template0;"
npm run migrate
npm run seed
```

## 4.6. Verificar que los datos están

```bash
psql -U postgres -h localhost -d proyectohs -c "SELECT COUNT(*) FROM usuario;"
```

**Debe devolver `17`.**

## 4.7. Arrancar el servidor

```bash
npm run dev
```

Salida esperada:

```
[server] Huellitas Saludables API
[server] Servidor ejecutándose en http://localhost:3000
[server] Healthcheck: http://localhost:3000/health
[server] API Docs: http://localhost:3000/api-docs
```

---

# 5. ESTRUCTURA DEL PROYECTO

```
back/
├── .env                          <- Variables de entorno (NO subir a git)
├── .env.example                  <- Plantilla
├── .env.test                     <- Variables para tests
├── .sequelizerc                  <- Config del CLI
├── jest.config.js                <- Config de Jest
├── package.json                  <- Scripts y dependencias
├── server.js                     <- Punto de entrada
│
├── migrations/                   <- Archivos que crean tablas
│   ├── 20240101000000-create-usuario.js
│   ├── 20240101000001-create-raza.js
│   ├── 20240101000002-create-mascota.js
│   ├── 20240101000003-create-usuario-mascota.js
│   ├── 20240101000004-create-disponibilidad.js
│   ├── 20240101000005-create-cita.js
│   └── 20240101000006-create-historia-clinica.js
│
├── seeders/                      <- Datos de prueba
│   ├── 20240101000000-demo-usuarios.js
│   ├── 20240101000001-demo-razas-mascotas.js
│   ├── 20240101000002-demo-disponibilidad.js
│   ├── 20240101000003-demo-cita.js
│   └── 20240101000004-demo-historia-clinica.js
│
├── scripts/                      <- Scripts útiles
│   ├── setup-path.sh             <- Agrega psql al PATH
│   └── test-endpoints.sh         <- Pruebas con curl
│
├── tests/                        <- Tests automatizados
│   ├── setup/
│   │   ├── setupEnv.js
│   │   ├── globalSetup.js
│   │   ├── globalTeardown.js
│   │   ├── setupAfterEnv.js
│   │   └── dbHelper.js
│   ├── fixtures/
│   │   └── index.js
│   ├── helpers/
│   │   └── auth.helper.js
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── mascotas.test.js
│   │   ├── citas.test.js
│   │   ├── disponibilidad.test.js
│   │   ├── historia.test.js
│   │   └── usuarios.test.js
│   └── unit/
│       ├── services/auth.service.test.js
│       └── utils/jwt.test.js
│
└── app/
    ├── app.js
    ├── config/
    │   ├── database.js           <- Sequelize runtime
    │   ├── config.js             <- Config para CLI
    │   └── swagger.js
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── schemas/
    ├── services/
    └── utils/
```

---

# 6. VARIABLES DE ENTORNO

## 6.1. `.env` (desarrollo)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyectohs
DB_USER=postgres
DB_PASSWORD=H4ll1t4s_V3t_2026_S3cur3_M3d_B4ckend

CORS_ORIGIN=*

JWT_SECRET=<64+ caracteres hex>
JWT_EXPIRES_IN=8h
```

## 6.2. Reglas para el `DB_PASSWORD`

- Mínimo 20 caracteres
- Sin `$`, `!`, `#`, `&`, comillas
- Sin comillas alrededor del valor

## 6.3. Reglas para el `JWT_SECRET`

- Mínimo 64 caracteres
- Generado con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Solo caracteres hex (`0-9`, `a-f`)
- Nunca compartir
- Diferente en desarrollo y producción

---

# 7. SEQUELIZE ORM

## 7.1. Qué es

Sequelize es un ORM (Object-Relational Mapping) que traduce JavaScript a SQL.

```javascript
// Antes (SQL puro)
const resultado = await query('SELECT * FROM usuario WHERE correo = $1', [correo]);

// Ahora (Sequelize)
const usuario = await Usuario.findOne({ where: { correo } });
```

## 7.2. Configuración

### `app/config/database.js` (runtime)

```javascript
require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbName = process.env.NODE_ENV === 'test'
  ? (process.env.DB_NAME_TEST || `${process.env.DB_NAME || 'proyectohs'}_test`)
  : (process.env.DB_NAME || 'proyectohs');

const sequelize = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: { freezeTableName: true },
});

module.exports = { sequelize, Sequelize, testConnection, query };
```

### `app/config/config.js` (solo para CLI)

```javascript
require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: { ...base, logging: false },
};
```

## 7.3. Consultas comunes

```javascript
// Buscar por ID
const u = await Usuario.findByPk('USU001');

// Buscar por campo
const u = await Usuario.findOne({ where: { correo: 'x@email.com' } });

// Traer todos
const usuarios = await Usuario.findAll();

// Con filtro
const citas = await Cita.findAll({ where: { estado: 'pendiente' } });

// Crear
const nuevo = await Usuario.create({ id_usuario: 'USU011', nombre: 'Ana', ... });

// Actualizar
await usuario.update({ telefono: '3001112233' });

// Borrar
await usuario.destroy();

// Con relaciones
const cita = await Cita.findByPk(1, {
  include: [{ model: Mascota, as: 'Mascota' }],
});

// Contar
const total = await Usuario.count();
```

## 7.4. Transacciones

```javascript
const creada = await sequelize.transaction(async (t) => {
  const m = await Mascota.create({ ... }, { transaction: t });
  await UsuarioMascota.create({ ... }, { transaction: t });
  return m;
});
```

## 7.5. Regla de locks

**No usar `include` + `lock` en la misma consulta.** PostgreSQL no lo permite.

```javascript
// MAL
const cita = await Cita.findByPk(id, {
  include: [{ model: Disponibilidad }],
  lock: t.LOCK.UPDATE,
});

// BIEN
const cita = await Cita.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
const disp = await Disponibilidad.findByPk(cita.id_disponibilidad, { transaction: t });
```

---

# 8. MIGRACIONES

## 8.1. Qué son

Archivos que describen cambios en la BD. Se versionan en git.

## 8.2. Comandos

| Comando | Qué hace |
|---|---|
| `npm run migrate` | Ejecutar pendientes |
| `npm run migrate:undo` | Deshacer la última |
| `npm run migrate:undo:all` | Deshacer todas |
| `npx sequelize-cli db:migrate:status` | Ver estado |
| `npx sequelize-cli migration:generate --name X` | Crear plantilla |

## 8.3. Migraciones del proyecto

| Archivo | Qué crea |
|---|---|
| `20240101000000-create-usuario.js` | Tabla `usuario` |
| `20240101000001-create-raza.js` | Tabla `raza` |
| `20240101000002-create-mascota.js` | Tabla `mascota` |
| `20240101000003-create-usuario-mascota.js` | Tabla intermedia `usuario_mascota` |
| `20240101000004-create-disponibilidad.js` | Tabla `disponibilidad` + UNIQUE constraint |
| `20240101000005-create-cita.js` | Tabla `cita` + trigger 1 |
| `20240101000006-create-historia-clinica.js` | Tabla `historia_clinica` + trigger 2 |

## 8.4. Reglas

1. `down` debe deshacer lo de `up`
2. Nombres descriptivos
3. Una cosa por migración
4. No editar migraciones ya aplicadas
5. No meter datos de prueba (eso es para seeders)

---

# 9. SEEDERS

## 9.1. Qué son

Archivos que insertan datos de prueba.

## 9.2. Comandos

| Comando | Qué hace |
|---|---|
| `npm run seed` | Ejecutar todos |
| `npm run seed:undo` | Deshacer todos |

## 9.3. Seeders del proyecto

| Archivo | Qué inserta |
|---|---|
| `20240101000000-demo-usuarios.js` | 17 usuarios |
| `20240101000001-demo-razas-mascotas.js` | 14 razas + 10 mascotas + 16 relaciones |
| `20240101000002-demo-disponibilidad.js` | 90 franjas de disponibilidad |
| `20240101000003-demo-cita.js` | 1 cita de ejemplo |
| `20240101000004-demo-historia-clinica.js` | 1 historia clínica |

**Orden obligatorio** (por las foreign keys): usuario → raza → mascota → usuario_mascota → disponibilidad → cita → historia_clinica.

---

# 10. TRIGGERS DE POSTGRESQL

## 10.1. Triggers del proyecto

### `trg_actualizar_disponibilidad_cita`

- **Cuándo:** AFTER INSERT ON cita
- **Qué hace:** marca la disponibilidad como `ocupado`

### `trg_historia_cita_atendida`

- **Cuándo:** AFTER INSERT ON historia_clinica
- **Qué hace:** marca la cita como `atendido`

## 10.2. Regla

**Los servicios NO deben duplicar esta lógica.** El trigger ya lo hace.

## 10.3. Verificar

```bash
psql -U postgres -h localhost -d proyectohs -c "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal;"
```

---

# 11. MODELOS Y RELACIONES

## 11.1. Los 6 modelos

| Modelo | Tabla |
|---|---|
| Usuario | usuario |
| Raza | raza |
| Mascota | mascota |
| Disponibilidad | disponibilidad |
| Cita | cita |
| HistoriaClinica | historia_clinica |

## 11.2. Relaciones

| Relación | Tipo | Alias |
|---|---|---|
| Usuario ↔ Mascota | N:M | `Mascotas` / `Propietarios` |
| Mascota → Raza | N:1 | `Raza` |
| Usuario → Disponibilidad | 1:N | `Especialista` |
| Disponibilidad → Cita | 1:1 | - |
| Mascota → Cita | 1:N | `Mascota` |
| Usuario → Cita | 1:N | `Recepcionista` |
| Cita → HistoriaClinica | 1:1 | `Cita` |

Todas definidas en `app/models/index.js`.

---

# 12. SERVICIOS (CON BUGS CORREGIDOS)

## 12.1. Servicios del proyecto

| Servicio | Funciones |
|---|---|
| auth.service.js | login, registro, registroAdmin |
| usuario.service.js | obtenerPorDocumento, listarEspecialistas |
| mascota.service.js | listar, obtenerPorId, crearConUsuario |
| disponibilidad.service.js | listar, crear, actualizar, eliminar |
| cita.service.js | listar, crear, editar, cancelar |
| historia.service.js | listar, crear, actualizar |

## 12.2. Corrección: `mascota.controller.js` con `asyncHandler`

**Bug corregido hoy:** el archivo `mascota.controller.js` no usaba `asyncHandler`, por lo que los errores en funciones async no se capturaban y la petición quedaba colgada.

**Solución:**

```javascript
const listar = asyncHandler(async (req, res) => { ... });
const obtener = asyncHandler(async (req, res) => { ... });
const crear = asyncHandler(async (req, res) => { ... });
```

## 12.3. Corrección: `disponibilidad.service.js` con `findExacta`

**Bug corregido hoy:** comparar horas en JavaScript era problemático porque Sequelize convierte `TIME` a `Date`. La comparación `String(item.hora) === String(datos.hora)` nunca funcionaba.

**Solución:** nueva función `findExacta` en el modelo que usa SQL crudo con casts explícitos:

```javascript
async function findExacta({ id_usuario, fecha, hora }) {
  const fechaStr = fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);

  const [rows] = await sequelize.query(
    `SELECT * FROM disponibilidad
     WHERE id_usuario = $1
       AND fecha = $2::date
       AND hora = $3::time
     LIMIT 1`,
    { bind: [id_usuario, fechaStr, hora] }
  );
  return rows[0] || null;
}
```

**Por qué funciona:** el `::date` y `::time` fuerzan a PostgreSQL a castear bien los valores, sin problemas de zona horaria.

## 12.4. Corrección: `mascota.schema.js` con `idParamSchema`

**Bug corregido hoy:** faltaba validar el param `:id`. Un `GET /api/mascotas/abc` devolvía 409 en vez de 400.

**Solución:** agregar `idParamSchema` y usarlo en la ruta.

---

# 13. AUTENTICACIÓN JWT

## 13.1. Cómo funciona

1. Usuario hace `POST /api/auth/login` con correo y contraseña
2. Backend valida contra BD
3. Firma un token JWT con `JWT_SECRET`
4. Devuelve el token
5. Cliente lo envía: `Authorization: Bearer <token>`
6. Middleware `identifyUser` verifica el token
7. Si es válido, agrega `req.user = { id, rol }`

## 13.2. Estructura del token

```
eyJhbGci...   <- header
.
eyJpZCI6...   <- payload (id, rol, iat, exp)
.
RA1jm7KF...   <- firma
```

## 13.3. Duración

8 horas (`JWT_EXPIRES_IN=8h`).

## 13.4. Endpoints públicos

- `POST /api/auth/login`
- `POST /api/auth/registro`
- `GET /health`

## 13.5. Uso con curl

```bash
# Login y guardar token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"pedro.gonzalez@gmail.com","contrasena":"123456"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Usar el token
curl http://localhost:3000/api/mascotas -H "Authorization: Bearer $TOKEN"
```

---

# 14. TESTS AUTOMATIZADOS (JEST + SUPERTEST)

## 14.1. Stack

| Herramienta | Para qué |
|---|---|
| **Jest** | Framework de tests |
| **Supertest** | HTTP sin abrir servidor |
| **cross-env** | Variables de entorno en cualquier SO |

## 14.2. Estructura de tests

```
tests/
├── setup/                    <- Configuración inicial
│   ├── setupEnv.js           <- Carga .env.test
│   ├── globalSetup.js        <- Crea y llena BD de test
│   ├── globalTeardown.js     <- Borra BD al terminar
│   ├── setupAfterEnv.js      <- Cierra conexión
│   └── dbHelper.js           <- resetDatabase()
├── fixtures/
│   └── index.js              <- IDs y datos conocidos
├── helpers/
│   └── auth.helper.js        <- getToken(rol)
├── integration/              <- Tests de endpoints
│   ├── auth.test.js
│   ├── mascotas.test.js
│   ├── citas.test.js
│   ├── disponibilidad.test.js
│   ├── historia.test.js
│   └── usuarios.test.js
└── unit/                     <- Tests aislados
    ├── services/auth.service.test.js
    └── utils/jwt.test.js
```

## 14.3. Separación de BD

| Archivo | BD que usa |
|---|---|
| `.env` (desarrollo) | `proyectohs` |
| `.env.test` (tests) | `proyectohs_test` |
| `app/config/config.js` | `_test` cuando `NODE_ENV=test` |
| `app/config/database.js` | `_test` cuando `NODE_ENV=test` |

**La BD de tests nunca toca la BD real.**

## 14.4. Flujo de ejecución

```
1. Jest lee jest.config.js
2. setupEnv.js carga .env.test
3. globalSetup.js:
   - Borra "proyectohs_test"
   - La crea de nuevo
   - Corre migraciones
   - Corre seeders
4. Para CADA archivo de test:
   - Abre conexión (setupAfterEnv)
   - beforeAll: resetDatabase() limpia la BD
   - Corre los it()
   - afterAll: cierra conexión
5. globalTeardown.js borra "proyectohs_test"
6. Jest imprime resumen
```

## 14.5. `resetDatabase()`

Cada archivo de test llama `resetDatabase()` al inicio:

1. Borra todas las tablas (`migrate:undo:all`)
2. Las recrea (`migrate`)
3. Vuelve a llenarlas con datos (`seed:all`)

**Por qué no usar `TRUNCATE`:** PostgreSQL no siempre reinicia las secuencias `GENERATED ALWAYS AS IDENTITY` con `TRUNCATE`. Borrar y recrear tablas es 100% confiable.

## 14.6. Comandos para correr tests

| Comando | Qué hace |
|---|---|
| `npm test` | Todos los tests |
| `npm run test:watch` | Modo watch |
| `npm run test:coverage` | Con cobertura |
| `npm run test:integration` | Solo endpoints |
| `npm run test:unit` | Solo unitarios |

### Correr un archivo específico

```bash
npx cross-env NODE_ENV=test jest tests/integration/auth.test.js --runInBand
```

### Correr un test específico

```bash
npx cross-env NODE_ENV=test jest -t "login con credenciales válidas" --runInBand
```

## 14.7. Resultado esperado

```
PASS tests/integration/auth.test.js
PASS tests/integration/mascotas.test.js
PASS tests/integration/citas.test.js
PASS tests/integration/disponibilidad.test.js
PASS tests/integration/historia.test.js
PASS tests/integration/usuarios.test.js
PASS tests/unit/services/auth.service.test.js
PASS tests/unit/utils/jwt.test.js

Test Suites: 8 passed, 8 total
Tests:       127 passed, 127 total
```

## 14.8. Tipos de tests

### Positivos (caso correcto)

```javascript
it('login con credenciales válidas devuelve 200', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: '123456' });

  expect(res.status).toBe(200);
  expect(res.body.data.token).toMatch(/^eyJ/);
});
```

### Negativos (errores)

```javascript
it('login con contraseña incorrecta devuelve 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'pedro.gonzalez@gmail.com', contrasena: 'wrong' });

  expect(res.status).toBe(401);
});
```

### De frontera (límites)

```javascript
it('nombre de exactamente 100 caracteres se acepta', async () => {
  const res = await request(app)
    .post('/api/auth/registro')
    .send({ nombre: 'A'.repeat(100), ... });

  expect(res.status).toBe(201);
});

it('nombre de 101 caracteres devuelve 400', async () => {
  const res = await request(app)
    .post('/api/auth/registro')
    .send({ nombre: 'A'.repeat(101), ... });

  expect(res.status).toBe(400);
});
```

### Parametrizados (mismos casos con distintos valores)

```javascript
it.each([
  ['usuario',       'pedro.gonzalez@gmail.com',          'USU001'],
  ['especialista',  'alejandro.castillo@proyectohs.com', 'ESP001'],
  ['recepcionista', 'laura.gomez@proyectohs.com',        'REC001'],
  ['admin',         'juan.rodriguez@proyectohs.com',     'ADM001'],
])('login como %s devuelve 200', async (rol, correo, idEsperado) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo, contrasena: '123456' });

  expect(res.status).toBe(200);
  expect(res.body.data.usuario.id_usuario).toBe(idEsperado);
});
```

### Con fixtures (datos reales)

```javascript
const { MASCOTAS } = require('../fixtures');

it('obtener Max (id=1) devuelve sus propietarios', async () => {
  const res = await request(app)
    .get(`/api/mascotas/${MASCOTAS.MAX.id}`)
    .set('Authorization', `Bearer ${token}`);

  expect(res.body.data.mascota).toBe('Max');
});
```

## 14.9. Regla de oro: disponibilidades únicas

Los tests dentro de un mismo archivo comparten la BD. Cuando un test crea una cita, esa disponibilidad queda `ocupado`. El siguiente test la ve ocupada.

**Solución:** cada test usa un ID de disponibilidad distinto.

```javascript
// Test 1: usa ID 2
// Test 2: usa ID 3
// Test 3: usa ID 6
// Test 4: usa ID 7
```

Hay 90 disponibilidades en el seeder. Sobra espacio.

## 14.10. Configuración de Jest (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/setupEnv.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupAfterEnv.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
};
```

## 14.11. Scripts de npm para tests

```json
"scripts": {
  "test": "cross-env NODE_ENV=test jest --runInBand",
  "test:watch": "cross-env NODE_ENV=test jest --watch --runInBand",
  "test:coverage": "cross-env NODE_ENV=test jest --coverage --runInBand",
  "test:integration": "cross-env NODE_ENV=test jest tests/integration --runInBand",
  "test:unit": "cross-env NODE_ENV=test jest tests/unit --runInBand"
}
```

## 14.12. Cómo leer los resultados

### Test que pasa

```
✓ login con credenciales válidas devuelve 200 (45 ms)
```

### Test que falla

```
✕ login con credenciales válidas devuelve 200 (50 ms)

expect(received).toBe(expected)

Expected: 200
Received: 500
```

**Cómo leerlo:**
- `Expected: 200` → lo que esperabas
- `Received: 500` → lo que el servidor devolvió

---

# 15. SCRIPTS DE PRUEBA CON CURL

## 15.1. Script `scripts/test-endpoints.sh`

Prueba los 20 endpoints de la API en vivo.

### Crear la carpeta y el archivo

```bash
mkdir scripts
touch scripts/test-endpoints.sh
code scripts/test-endpoints.sh
```

Pegar el contenido del script (ver sección de archivos). Guardar.

### Dar permisos y correr

```bash
chmod +x scripts/test-endpoints.sh
bash scripts/test-endpoints.sh
```

**Requiere el servidor corriendo** en otra terminal (`npm run dev`).

## 15.2. Script `scripts/setup-path.sh`

Agrega `psql` al PATH. Contenido:

```bash
#!/bin/bash
PG_BIN="/c/Formacion/pgsql-18-3-2/pgsql/bin"
if [ ! -d "$PG_BIN" ]; then
  echo "[ERROR] No se encontro $PG_BIN"
  return 1 2>/dev/null || exit 1
fi
export PATH="$PG_BIN:$PATH"
echo "[OK] psql disponible"
psql --version
```

Uso:

```bash
source scripts/setup-path.sh
```

## 15.3. Comandos curl básicos

### Login

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"pedro.gonzalez@gmail.com","contrasena":"123456"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

### Usar el token

```bash
curl http://localhost:3000/api/mascotas -H "Authorization: Bearer $TOKEN"
```

### Con acentos (usar archivo)

```bash
cat > /tmp/body.json << 'EOF'
{"id_cita":1,"diagnostico":"Otitis externa","tratamiento":"Gotas óticas"}
EOF

curl -X POST http://localhost:3000/api/historia \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary @/tmp/body.json
```

---

# 16. ENDPOINTS DISPONIBLES

## 16.1. Públicos

| Método | Ruta |
|---|---|
| GET | `/health` |
| POST | `/api/auth/login` |
| POST | `/api/auth/registro` |
| GET | `/api-docs` |

## 16.2. Protegidos (requieren JWT)

### Auth

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/auth/perfil` | Cualquiera |
| POST | `/api/auth/registro-admin` | admin |

### Mascotas

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/mascotas` | Cualquiera |
| GET | `/api/mascotas/:id` | Cualquiera |
| POST | `/api/mascotas` | usuario, admin |

### Citas

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/citas` | Cualquiera |
| GET | `/api/citas/:id` | Cualquiera |
| POST | `/api/citas` | usuario, recepcionista, admin |
| PUT | `/api/citas/:id` | usuario, recepcionista, admin |
| PATCH | `/api/citas/:id/cancelar` | usuario, recepcionista, admin |

### Disponibilidad

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/disponibilidad` | Cualquiera |
| GET | `/api/disponibilidad/:id` | Cualquiera |
| POST | `/api/disponibilidad` | recepcionista, admin |
| PUT | `/api/disponibilidad/:id` | recepcionista, admin |
| DELETE | `/api/disponibilidad/:id` | recepcionista, admin |

### Usuarios

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/usuarios/especialistas` | Cualquiera |
| GET | `/api/usuarios/:documento` | Cualquiera |

### Historia Clínica

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/historia` | especialista |
| GET | `/api/historia/:id` | especialista |
| POST | `/api/historia` | especialista |
| PUT | `/api/historia/:id` | especialista |

---

# 17. BUGS CORREGIDOS HOY

## Bug 1 — `mascota.controller.js` sin `asyncHandler`

**Síntoma:** `GET /api/mascotas/99999` dejaba la petición colgada por 30 segundos. El error nunca llegaba al cliente.

**Causa:** Express 4 no captura errores de funciones `async`. Sin `asyncHandler`, los `throw` no se propagan.

**Solución:** envolver los handlers en `asyncHandler`.

```javascript
const obtener = asyncHandler(async (req, res) => {
  const mascota = await mascotaService.obtenerPorId(req.params.id);
  return ok(res, mascota, 'Mascota encontrada correctamente');
});
```

## Bug 2 — `mascota.schema.js` sin `idParamSchema`

**Síntoma:** `GET /api/mascotas/abc` devolvía 409 en vez de 400.

**Causa:** no se validaba el param `:id` antes de llegar a la BD.

**Solución:** agregar `idParamSchema` y usarlo en la ruta.

```javascript
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});
```

## Bug 3 — Comparación de `TIME` en JavaScript

**Síntoma:** `POST /api/disponibilidad` con duplicado devolvía 201 en vez de 409.

**Causa:** Sequelize convierte el tipo `TIME` a `Date`, y `String(Date)` nunca es igual a `"08:00:00"`.

**Solución:** nueva función `findExacta` en el modelo que usa SQL crudo con casts explícitos `::date` y `::time`.

## Bug 4 — `jest.config.js` con opción mal escrita

**Síntoma:** el archivo `setupAfterEnv.js` nunca se ejecutaba. Jest mostraba warning.

**Causa:** la opción se llamaba `setupFilesAfterEach` (no existe).

**Solución:** cambiar a `setupFilesAfterEnv`.

## Bug 5 — `database.js` no cambiaba a BD de test

**Síntoma:** los tests pasaban a veces y otras no. La app usaba la BD real.

**Causa:** `database.js` leía `DB_NAME` directamente sin agregar `_test` en modo test.

**Solución:** calcular `dbName` según `NODE_ENV`.

---

# 18. ERRORES COMUNES

## 18.1. `psql: command not found`

Falta agregar PostgreSQL al PATH. Ver sección 3.

## 18.2. `password authentication failed`

- Verifica `DB_PASSWORD` en `.env`
- Verifica que PostgreSQL esté corriendo

## 18.3. `ECONNREFUSED`

PostgreSQL no está corriendo.

## 18.4. `relation "usuario" does not exist`

Falta correr migraciones:

```bash
npm run migrate
```

## 18.5. `Usuario no encontrado` en login

La BD está vacía. Solución:

```bash
psql -U postgres -h localhost -d proyectohs -c "SELECT COUNT(*) FROM usuario;"
```

Si devuelve 0:

```bash
npm run migrate
npm run seed
```

## 18.6. `llave duplicada viola restricción de unicidad`

La BD ya tiene datos. Resetear:

```bash
psql -U postgres -h localhost -d proyectohs -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run seed
```

## 18.7. `Unable to find migration`

Hay registros fantasma en `SequelizeMeta`. Resetear:

```bash
psql -U postgres -h localhost -d proyectohs -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run seed
```

## 18.8. `FOR UPDATE cannot be applied to the nullable side of an outer join`

No usar `include` + `lock` juntos.

## 18.9. `Falta el token de autenticación`

El endpoint requiere JWT. Usa:

```bash
curl ... -H "Authorization: Bearer <token>"
```

## 18.10. `Token inválido o expirado`

- El token expiró (8h)
- El token fue firmado con otro `JWT_SECRET`
- Hacer login de nuevo

## 18.11. Los acentos se ven como `Ã³`

La terminal no muestra UTF-8. Los datos en la BD están bien. Verifica con Node.

## 18.12. `Unknown option "setupFilesAfterEach"`

Cambiar a `setupFilesAfterEnv`.

## 18.13. Tests fallan con `Usuario no encontrado`

La app se conecta a la BD equivocada. Verifica que `database.js` cambie a `_test` cuando `NODE_ENV=test`.

## 18.14. Tests fallan con `disponibilidad ya ocupada`

Dos tests usan la misma disponibilidad. Cambia uno de ellos para que use otro ID.

## 18.15. `event not found` al usar `!`

```bash
set +H
```

## 18.16. `node: -e requires an argument`

Git Bash parte mal los comandos con `-e` multilínea. Usar comillas simples o crear un archivo `.js`.

---

# 19. REGLAS Y BUENAS PRÁCTICAS

1. Nunca subir `.env` a git
2. No duplicar la lógica de los triggers en los servicios
3. Usar modelos Sequelize, no SQL puro en los servicios
4. Usar transacciones para operaciones compuestas
5. Pasar `{ transaction: t }` a cada operación dentro de una transacción
6. Los `as` de las relaciones deben coincidir entre `index.js` e `include`
7. Los passwords no llevan `$`, `!`, `#`, `&`, comillas
8. No editar migraciones ya aplicadas. Crear nuevas
9. Los seeders son para datos de prueba, no producción
10. Respetar el orden de las foreign keys al insertar
11. Nunca compartir el `JWT_SECRET`
12. Cada test usa un ID de disponibilidad único
13. No usar `include` + `lock` en la misma consulta
14. En tests, `resetDatabase()` antes de cada archivo
15. Los controllers siempre usan `asyncHandler`

---

# 20. PENDIENTES PARA PRODUCCIÓN

| Prioridad | Tarea |
|---|---|
| Alta | Hash de contraseñas con bcrypt |
| Alta | Cambiar `pg_hba.conf` de `trust` a `scram-sha-256` |
| Media | Refresh tokens (evitar re-login cada 8h) |
| Media | Más tests (cobertura > 80%) |
| Baja | Docker para no depender de PostgreSQL local |
| Baja | Limpiar `package.json` (sacar `react`, `vite` del backend) |
| Baja | Rate limiting en endpoints públicos |

---

# 21. GLOSARIO

| Término | Significado |
|---|---|
| ORM | Object-Relational Mapping |
| Modelo | Representación en JavaScript de una tabla |
| Migración | Archivo que describe cambios en la BD |
| Seeder | Archivo que inserta datos de prueba |
| Trigger | Función que la BD ejecuta automáticamente |
| Transacción | Grupo de operaciones atómicas |
| Include | Traer datos de tablas relacionadas |
| FK / PK | Foreign Key / Primary Key |
| JWT | JSON Web Token |
| Bearer | Esquema de autorización HTTP con token |
| Pool | Grupo de conexiones reutilizables |
| `SequelizeMeta` | Tabla que guarda historial de migraciones y seeders |
| Test | Verificación automática |
| Jest | Framework de tests |
| Supertest | Librería para requests HTTP en tests |
| `describe()` / `it()` | Agrupar tests / un test |
| `expect()` | Verificar resultado |
| `beforeAll()` / `afterAll()` | Ejecutar antes/después de todos los tests |
| Fixture | Dato de prueba |
| Helper | Función reutilizable entre tests |
| `asyncHandler` | Wrapper que captura errores de funciones async |

---

# CREDENCIALES DE PRUEBA

| Rol | Correo | Contraseña |
|---|---|---|
| usuario | pedro.gonzalez@gmail.com | 123456 |
| usuario | maria.lopez@gmail.com | 123456 |
| especialista | alejandro.castillo@proyectohs.com | 123456 |
| especialista | carolina.mendez@proyectohs.com | 123456 |
| recepcionista | laura.gomez@proyectohs.com | 123456 |
| admin | juan.rodriguez@proyectohs.com | 123456 |

---

# COMANDOS DE REFERENCIA RÁPIDA

## Backend

```bash
npm install              # Instalar dependencias
npm run dev              # Servidor con auto-reload
npm start                # Servidor en producción
npm run migrate          # Aplicar migraciones
npm run seed             # Cargar datos de prueba
npm run db:reset         # Reset completo
```

## Base de datos

```bash
source scripts/setup-path.sh    # Agregar psql al PATH
psql -U postgres -h localhost -d proyectohs
```

## Tests

```bash
npm test                        # Todos los tests
npm run test:integration        # Solo integración
npm run test:unit               # Solo unitarios
npm run test:coverage           # Con cobertura
npm run test:watch              # Modo watch
```

## Reset completo de BD

```bash
psql -U postgres -h localhost -d proyectohs -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run seed
```

## Probar todos los endpoints

```bash
bash scripts/test-endpoints.sh
```

---

**Fin del documento.**

**Estado del proyecto hoy:** 100% funcional
- 127/127 tests pasando
- 5 bugs corregidos
- Todos los endpoints probados
- Base de datos estable
- Documentación completa