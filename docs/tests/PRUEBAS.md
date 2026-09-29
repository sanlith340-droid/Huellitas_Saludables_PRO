# Guía de pruebas

Aquí está explicado qué pruebas trae Huellitas Saludables, dónde están y cómo ejecutarlas. La suite del backend usa **Jest** para organizar los casos y **Supertest** para probar la API sin tener que abrir un servidor aparte. Ahora mismo hay 8 archivos de pruebas y 112 casos `it()` declarados; ese número puede cambiar cuando se agreguen o quiten pruebas. Jest busca `tests/**/*.test.js`, usa Node y permite hasta 30 segundos por caso (`back/jest.config.js`).

## Antes de ejecutarlas: cuidado con la base

**La suite borra y vuelve a crear la base de pruebas al comenzar, e intenta eliminarla al terminar.** El nombre por defecto es `proyectohs_test`.

Asegúrate de que `DB_NAME_TEST` apunte solamente a una base desechable de pruebas. No uses `proyectohs`, la base de desarrollo con datos que quieras conservar, ni una base de producción. El usuario de PostgreSQL configurado debe poder crear y eliminar bases de datos.

Las pruebas son del backend. Este proyecto no tiene una suite de tests automáticos configurada para el frontend.

## Cómo está organizada la suite

```text
back/tests/
├── integration/                 # Prueban peticiones HTTP reales contra Express
│   ├── auth.test.js             # login, registro, perfil, token y validación
│   ├── citas.test.js            # consulta, creación, permisos y cancelación
│   ├── disponibilidad.test.js   # filtros, fechas, paginación y cambios de horarios
│   ├── historia.test.js         # historias clínicas, roles y especialista asignado
│   ├── mascotas.test.js         # consulta, registro, datos y permisos
│   └── usuarios.test.js         # especialistas, usuarios y datos privados
├── unit/
│   ├── services/
│   │   └── auth.service.test.js # login, registro y alta de personal
│   └── utils/
│       └── jwt.test.js          # formato, payload y firma del token
├── fixtures/index.js            # IDs y datos demo que usan los casos
├── helpers/auth.helper.js       # inicia sesión y obtiene JWT para un rol
└── setup/
    ├── setupEnv.js              # carga la configuración de .env.test
    ├── globalSetup.js           # recrea la base, migra y carga seeders
    ├── dbHelper.js              # devuelve la base al estado de los seeders
    ├── setupAfterEnv.js         # cierra Sequelize y fija el timeout
    └── globalTeardown.js        # elimina la base de pruebas al final
```

Aunque `auth.service.test.js` está en `unit/`, usa la base de datos para probar login y registros. `jwt.test.js` sí prueba funciones de token sin llamar a la API ni necesitar datos de PostgreSQL.

## Qué se revisa

- Login, contraseñas incorrectas, registro y validación de campos.
- Emisión y comprobación de JWT, token alterado y token inválido.
- Respuestas `401` y `403`, roles permitidos y datos propios de cada usuario.
- Crear, leer, editar y cancelar citas; horarios ocupados y mascotas ajenas.
- Disponibilidad por especialista, filtros de fecha, paginación y conflictos de horario.
- Historias clínicas, especialista asignado, validación y registros repetidos.
- Mascotas, razas, usuarios y respuestas que no deben incluir la contraseña.

## Ejecutar las pruebas localmente

### 1. Instalar las dependencias

Abre una terminal en la carpeta del backend:

```bash
cd back
npm ci
```

### 2. Preparar PostgreSQL

PostgreSQL debe estar encendido. Crea una base temporal `proyectohs_test` si hace falta y usa una cuenta que pueda crear y eliminar bases. La configuración de ejemplo está en `back/.env.test.example`.

```bash
cp .env.test.example .env.test
```

Edita `back/.env.test` con los datos de tu PostgreSQL local. `DB_NAME_TEST` puede quedarse como `proyectohs_test`, que es el valor recomendado. El setup y el teardown usan el mismo nombre. El archivo `.env.test` es privado y ya está ignorado por `.gitignore`.

### 3. Correr toda la suite

Desde `back/`:

```bash
npm test
```

El script de `package.json` activa `NODE_ENV=test` y `--runInBand`, así que Jest ejecuta los archivos uno por uno. Esto evita que varias suites intenten borrar o sembrar la misma base al mismo tiempo.

Al iniciar, el proceso prepara la base, aplica las migraciones y los seeders. Varias suites también restablecen los datos antes de sus pruebas. Al terminar, el teardown intenta eliminar la base temporal.

## Ejecutar solo lo que necesitas

Desde `back/`, por ejemplo:

```bash
# Solo las pruebas de citas
npm test -- tests/integration/citas.test.js

# Solo los casos cuyo nombre contenga este texto
npm test -- -t "sin token devuelve 401"

# Modo watch: vuelve a ejecutar al detectar cambios
npm run test:watch

# Generar cobertura de los archivos configurados
npm run test:coverage
```

La cobertura se guarda en `back/coverage/`. Se recopila código bajo `back/app/`, con algunas exclusiones que están listadas en `back/jest.config.js`.

## Opción con Docker

Si prefieres no crear una base local, desde la raíz del proyecto puedes usar la base temporal que prepara Docker Compose:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
```

El comando devuelve el resultado de Jest: `0` significa que pasó y un valor distinto de cero indica que hubo fallos. Al terminar, limpia los contenedores de pruebas con:

```bash
docker compose -f docker-compose.test.yml down -v
```

Ese Compose usa PostgreSQL temporal y separado de la base normal de la app.

## Si algo falla

- **No conecta con PostgreSQL:** revisa que esté iniciado y que `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_PASSWORD` sean los correctos en `.env.test`.
- **No puede crear o borrar la base:** el usuario necesita permisos para crear y eliminar bases. Revisa también que `DB_NAME_TEST` sea la base temporal `proyectohs_test`.
- **Falta una tabla o un dato:** confirma que las migraciones y los seeders corrieron; `globalSetup.js` los ejecuta al principio.
- **Una suite deja datos diferentes:** los casos deben preparar datos con fixtures/seeders y no depender del orden; las suites que lo requieren llaman `resetDatabase()`.
- **Quieres ver un caso específico:** usa el nombre que aparece en la salida de Jest con `npm test -- -t "parte del nombre"`.

Los nombres de prueba, las opciones de Jest y la lista de cobertura están en `back/jest.config.js` y en los archivos `back/tests/**/*.test.js`.
