# Decisiones Técnicas — Huellitas Saludables (Backend)

> **Versión**: 1.1  
> **Alcance**: API, persistencia, autenticación, pruebas y ejecución del backend  
---

## Índice

1. [¿Qué es este documento?](#qué-es-este-documento)
2. [Convenciones y alcance](#convenciones-y-alcance)
3. [El stack del backend](#el-stack-del-backend)
4. [Las decisiones](#las-decisiones)
   - [DT-001: Node.js y JavaScript para el servidor](#dt-001)
   - [DT-002: Express para la API HTTP](#dt-002)
   - [DT-003: PostgreSQL para los datos relacionales](#dt-003)
   - [DT-004: Sequelize como ORM](#dt-004)
   - [DT-005: Migraciones, seeders y restricciones de base de datos](#dt-005)
   - [DT-006: JWT para autenticar solicitudes](#dt-006)
   - [DT-007: Autorización de backend por roles](#dt-007)
   - [DT-008: Joi para validar entradas](#dt-008)
   - [DT-009: Organización del backend por capas](#dt-009)
   - [DT-010: Jest, Supertest y base aislada para tests](#dt-010)
   - [DT-011: OpenAPI y Swagger UI para documentar la API](#dt-011)
   - [DT-012: Configuración y ejecución del backend](#dt-012)
5. [Buenas prácticas y pendientes identificados](#buenas-prácticas-y-pendientes-identificados)
6. [Conclusión](#conclusión)

---

## ¿Qué es este documento?

Este documento registra las decisiones técnicas que se observan en el **backend de Huellitas Saludables** y explica cómo encajan con el diseño actual. Se limita a la API, el acceso a datos, la autenticación y autorización, las pruebas, la documentación de API y la ejecución del servicio.

No es una guía de instalación ni un registro histórico de reuniones. El código confirma las tecnologías y mecanismos implementados, pero el repositorio no conserva evidencia de todas las conversaciones ni de todas las alternativas que el equipo evaluó. Por ello, las razones se presentan como **justificaciones técnicas basadas en el diseño observable**, no como decisiones históricas documentadas cuando no existe esa evidencia.

---

## Convenciones y alcance

- Cada decisión usa un código **DT-XXX**; los números no se reutilizan.
- **Estado: Implementada** significa que hay evidencia en el código, la configuración o las dependencias del backend.
- Las alternativas son opciones de comparación para el futuro. No se afirma que hayan sido evaluadas históricamente si el repositorio no lo demuestra.
- Los riesgos y las carencias describen el código revisado; documentarlos no significa que se consideren aceptables para producción.
- La versión de PostgreSQL se toma de Docker Compose (`postgres:16-alpine`). Las versiones de librerías se toman de `back/package.json`; los rangos `^` no fijan exactamente todas las revisiones secundarias.

---

## El stack del backend

| Área | Tecnología observada | Para qué se usa |
|---|---|---|
| Runtime | **Node.js 22** (imagen Docker `node:22-alpine`) | Ejecutar el servidor |
| Lenguaje | **JavaScript, CommonJS** | Rutas, controladores, servicios y configuración |
| Framework HTTP | **Express 4** | API, rutas y middlewares |
| Base de datos | **PostgreSQL 16** en Compose | Usuarios, mascotas, razas, horarios, citas e historias clínicas |
| ORM | **Sequelize 6** | Modelos, asociaciones y consultas |
| Migraciones | **sequelize-cli** | Versionar y aplicar cambios de esquema |
| Autenticación | **jsonwebtoken 9 (JWT)** | Firmar y verificar tokens |
| Validación | **Joi 17** | Validar y normalizar entradas HTTP |
| Pruebas | **Jest 30 y Supertest 7** | Pruebas unitarias y de integración de la API |
| Documentación API | **swagger-jsdoc y swagger-ui-express** | Generar y servir documentación OpenAPI |
| Configuración | **dotenv y cross-env** | Cargar variables de entorno y configurar scripts de prueba |
| Empaquetado | **Docker** | Construir y ejecutar el servicio backend |

---

## Las decisiones

### DT-001
**Node.js y JavaScript para el servidor**  
**Estado**: Implementada

#### Contexto
El backend debe atender solicitudes HTTP para autenticación y operaciones sobre usuarios, mascotas, razas, disponibilidad, citas e historias clínicas.

#### Decisión
Ejecutar la API con **Node.js** y escribir el backend en **JavaScript con módulos CommonJS**.

#### Evidencia y justificación técnica
- `back/package.json` define `server.js` como punto de entrada y scripts para iniciar el servidor.
- `back/Dockerfile` parte de `node:22-alpine` y ejecuta `node server.js`.
- Los archivos del backend usan `require()` y `module.exports`.
- El backend es una API de gestión con operaciones HTTP y acceso a PostgreSQL; el perfil que muestra el repositorio es principalmente I/O, no una carga de cálculo científico o procesamiento intensivo de CPU.
- El modelo asíncrono de Node.js puede atender otras operaciones mientras solicitudes esperan I/O no bloqueante. No es una garantía automática de más rendimiento: callbacks largos o trabajo de CPU bloqueante pueden frenar el event loop y deben evitarse o trasladarse a workers/servicios especializados.

#### Consecuencias
**A favor:** el runtime y el ecosistema npm cubren el servidor, el driver de PostgreSQL, las pruebas y la documentación de API.  
**A considerar:** JavaScript no impone tipos estáticos por defecto. La validación de datos, las pruebas y las reglas de base de datos son importantes para detectar errores de contrato y de ejecución.

#### ¿Por qué Node.js/Express y no Python o Java?

La elección se justifica por **adecuación al backend existente y al tipo de trabajo**, no porque Python o Java sean opciones inferiores. El repositorio ya contiene una API funcional basada en Node.js, Express, Sequelize, Joi, Jest y PostgreSQL. Mantener ese stack evita reescribir el servidor y sus capas para resolver el mismo conjunto de operaciones.

| Criterio | Node.js + Express (actual) | Python + FastAPI | Java + Spring Boot |
|---|---|---|---|
| Adecuación a una API CRUD que consulta PostgreSQL | Adecuado; es el patrón implementado en el proyecto | También adecuado; FastAPI está diseñado para APIs y admite I/O asíncrono | También adecuado; Spring Boot ofrece infraestructura madura para aplicaciones web |
| Concurrencia e I/O | Event loop y operaciones no bloqueantes; hay que evitar bloquear el hilo de JavaScript con trabajo largo de CPU | FastAPI admite `async`/`await`; el beneficio depende de usar librerías compatibles con async y manejar correctamente las llamadas bloqueantes | Puede usar el modelo de ejecución de Spring; Spring Boot documenta soporte para virtual threads con Java 21 o posterior |
| Tipos y validación | JavaScript es dinámico; Joi valida entradas externas, pero no añade tipado estático a todo el código | Type hints y validación integrada con el ecosistema de FastAPI ofrecen otra forma de expresar contratos | El tipado estático permite detectar ciertas incompatibilidades durante compilación |
| Encaje con este repositorio | Máximo: coincide con el código, scripts, dependencias, pruebas y despliegue ya existentes | Requeriría reimplementar API, persistencia, autenticación, validaciones y pruebas en otro ecosistema | También requeriría reimplementar esas capas y adoptar la cadena de herramientas Java/Spring |

#### Criterio de decisión basado en buenas prácticas

1. **Elegir por requisitos y carga real, no por popularidad.** El backend observado es una API de operaciones y persistencia; no hay evidencia en el repositorio de una necesidad de cómputo intensivo que justifique cambiar de runtime.
2. **Evitar reescrituras sin beneficio medible.** El servicio ya está implementado en Node.js. Una migración a Python o Java tendría sentido si aparece una necesidad concreta —por ejemplo, integración profunda con un ecosistema Python o requisitos de tipado/convenciones empresariales que el equipo no quiera cubrir en JavaScript— y se demuestra que el beneficio compensa su costo.
3. **No afirmar que un lenguaje es más rápido sin medir el sistema.** El rendimiento depende también de consultas SQL, índices, conexiones, serialización, carga y despliegue. Si el rendimiento se vuelve un requisito, medir con perfiles y pruebas representativas antes de migrar.
4. **Compensar las limitaciones conocidas del stack actual.** Mantener esquemas Joi en los límites HTTP, pruebas automatizadas, restricciones en PostgreSQL, manejo seguro de errores y revisión de dependencias. Joi protege las entradas, pero no sustituye tipos estáticos ni revisiones del resto del código.
5. **Mantener el event loop disponible.** No ejecutar cálculos costosos o trabajo síncrono largo dentro de los manejadores de solicitudes; usar workers, colas o servicios especializados cuando el caso de uso lo requiera.

#### Otras opciones posibles
Python con FastAPI y Java con Spring Boot siguen siendo alternativas válidas. El repositorio confirma el stack actual, pero no demuestra cuál fue la motivación histórica del equipo; por eso, esta comparación documenta una justificación técnica para conservar la implementación actual, no una afirmación sobre lo que se discutió originalmente.

#### Fuentes oficiales para los criterios

- [Node.js: Don't Block the Event Loop (or the Worker Pool)](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop): explica el modelo de event loop, I/O no bloqueante y el impacto de bloquear con trabajo largo.
- [FastAPI: Concurrency and async / await](https://fastapi.tiangolo.com/async/): explica cuándo `async def` ayuda y por qué las bibliotecas bloqueantes requieren un tratamiento distinto.
- [Spring Boot: Virtual threads](https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.virtual-threads): documenta los requisitos y consideraciones de virtual threads.

---

### DT-002
**Express para la API HTTP**  
**Estado**: Implementada

#### Contexto
El servidor necesita definir endpoints, procesar solicitudes y aplicar autenticación, validación y manejo de errores de forma consistente.

#### Decisión
Usar **Express** como framework HTTP del backend.

#### Evidencia y justificación técnica
- `back/package.json` declara Express.
- `back/app/app.js` configura JSON, CORS, healthcheck, documentación Swagger, rutas y middleware de errores.
- `back/app/routes/` separa los endpoints por dominio.
- Express permite componer el procesamiento de solicitudes mediante middlewares y mantener el servidor separado de la lógica de cada operación.

#### Consecuencias
**A favor:** integra el enrutamiento de la API con middlewares reutilizables y tiene un ecosistema ampliamente conocido.  
**A considerar:** Express es flexible y no impone una estructura única. El equipo debe mantener convenciones claras para validación, autenticación, errores y separación de responsabilidades.

#### Otras opciones posibles
Fastify o NestJS son alternativas del ecosistema Node.js con distintos niveles de rendimiento, estructura y convenciones. No consta en el repositorio una comparación formal entre ellas.

---

### DT-003
**PostgreSQL para los datos relacionales**  
**Estado**: Implementada

#### Contexto
El dominio contiene relaciones entre usuarios y mascotas, mascotas y razas, especialistas y disponibilidad, citas e historias clínicas. La base debe hacer cumplir integridad referencial y restricciones de negocio.

#### Decisión
Usar **PostgreSQL 16** en los entornos definidos por Docker Compose.

#### Evidencia y justificación técnica
- `docker-compose.yml` y `docker-compose.test.yml` usan `postgres:16-alpine`.
- Las migraciones crean claves foráneas, restricciones únicas y restricciones `CHECK`.
- Los modelos de `back/app/models/` representan las entidades y sus relaciones.
- Las transacciones y restricciones relacionales son adecuadas para evitar referencias inválidas y proteger operaciones como la asignación de citas.

#### Consecuencias
**A favor:** el motor puede hacer cumplir integridad relacional y soporta transacciones para operaciones que deben completarse de forma consistente.  
**A considerar:** el despliegue requiere gestionar copias de seguridad, permisos, actualizaciones y persistencia del volumen. La versión que muestra el proyecto es PostgreSQL 16; no debe documentarse como PostgreSQL 17.

#### Otras opciones posibles
MySQL/MariaDB también pueden modelar relaciones y restricciones. Una base documental tendría sentido si el modelo o las consultas fueran diferentes. El repositorio no registra una evaluación comparativa formal.

---

### DT-004
**Sequelize como ORM**  
**Estado**: Implementada

#### Contexto
La API necesita consultar PostgreSQL desde JavaScript y representar asociaciones entre usuarios, mascotas, citas, horarios e historias clínicas.

#### Decisión
Usar **Sequelize 6** como ORM y `sequelize-cli` para tareas de esquema y datos.

#### Evidencia y justificación técnica
- `back/package.json` declara `sequelize`, `pg` y `sequelize-cli`.
- `back/app/models/index.js` define entidades y asociaciones `belongsTo`, `hasMany`, `belongsToMany` y `hasOne`.
- `back/app/config/database.js` configura la conexión, el pool y el logging de SQL en desarrollo.
- El ORM expresa consultas y relaciones desde JavaScript, mientras PostgreSQL mantiene las restricciones persistentes.

#### Consecuencias
**A favor:** centraliza modelos y asociaciones que usan los servicios del backend y facilita trabajar con el esquema relacional desde JavaScript.  
**A considerar:** el ORM no garantiza por sí solo consultas eficientes ni sustituye las restricciones de base de datos. Las consultas complejas pueden requerir SQL explícito y revisión de rendimiento.

#### Otras opciones posibles
Prisma, Knex o SQL parametrizado directamente podrían ser adecuados según las necesidades del equipo. No consta que se hayan comparado formalmente en el repositorio.

---

### DT-005
**Migraciones, seeders y restricciones de base de datos**  
**Estado**: Implementada

#### Contexto
El esquema evoluciona con el código y debe poder prepararse en los distintos entornos. El flujo de citas también requiere impedir que una misma franja de disponibilidad se asigne a más de una cita.

#### Decisión
Versionar cambios de esquema mediante **migraciones**, cargar datos de demostración mediante **seeders** y aplicar reglas de integridad en PostgreSQL cuando corresponda.

#### Evidencia y justificación técnica
- `back/migrations/` contiene los cambios de esquema versionados.
- `back/seeders/` contiene los datos de demostración.
- `back/docker-entrypoint.sh` aplica migraciones al iniciar el servicio y ejecuta seeders solo cuando `DB_SEED=true` y no hay usuarios.
- La migración de citas crea una restricción única para `id_disponibilidad` y un trigger que cambia el estado de la disponibilidad al insertar una cita.

#### Consecuencias
**A favor:** el esquema y los datos iniciales se pueden preparar de manera reproducible; las restricciones en la base de datos protegen integridad aunque una escritura no pase por una ruta específica.  
**A considerar:** una migración ya compartida no debería modificarse para representar un cambio nuevo; se crea una migración posterior. La lógica duplicada entre base de datos y aplicación debe probarse y mantenerse coordinada.

#### Otras opciones posibles
SQL versionado manualmente puede funcionar con controles equivalentes. `sequelize.sync()` puede ayudar en prototipos, pero no sustituye un historial explícito de cambios para entornos compartidos.

---

### DT-006
**JWT para autenticar solicitudes**  
**Estado**: Implementada; requiere correcciones de seguridad antes de producción

#### Contexto
Las rutas privadas necesitan identificar al usuario que realiza una solicitud y rechazar tokens inválidos, vencidos o asociados a cuentas que ya no existen.

#### Decisión
Usar **JWT** mediante `jsonwebtoken`. El backend emite tokens con identificador y rol; las solicitudes privadas llevan `Authorization: Bearer <token>`.

#### Evidencia y justificación técnica
- `back/app/utils/jwt.js` firma el payload con el secreto configurado y define una expiración por defecto de `8h`.
- `back/app/middlewares/identifyUser.js` verifica el token y consulta el usuario en PostgreSQL antes de establecer `req.user`.
- La consulta vuelve a obtener el rol actual desde la base de datos, de modo que la autorización no depende únicamente del rol que tenía el token al emitirse.

#### Consecuencias y riesgos observados
**A favor:** no se mantiene una sesión de servidor individual por token y la API puede verificar la identidad en cada solicitud.  
**Riesgo alto — contraseñas:** `back/app/services/auth.service.js` compara contraseñas como texto y registra el valor recibido sin hash. Los comentarios del código indican que debería usarse bcrypt en producción, pero no está implementado. **No debe exponerse el backend con este manejo de contraseñas.** Añadir hashing apropiado y probar el flujo antes de producción.  
**Riesgo alto — secreto JWT:** el código y Compose contienen valores de fallback de desarrollo para `JWT_SECRET`. En producción, el backend debería fallar al arrancar si falta un secreto fuerte gestionado fuera del repositorio; no debe usar el valor predeterminado.  
**Riesgo a considerar — expiración y revocación:** la expiración limita la vida del token, pero no existe en el código revisado un mecanismo general de revocación inmediata. Definir cómo se invalidarán tokens cuando sea necesario.

#### Otras opciones posibles
Sesiones con cookies del servidor o un proveedor de identidad externo podrían ser adecuados según el modelo de despliegue. El repositorio no documenta una comparación formal entre ellos.

---

### DT-007
**Autorización de backend por roles**  
**Estado**: Implementada

#### Contexto
No todas las operaciones deben estar disponibles para cualquier usuario autenticado. El dominio usa roles `admin`, `recepcionista`, `especialista` y `usuario`.

#### Decisión
Aplicar autorización en la API mediante el usuario verificado por `identifyUser` y middlewares de rol, como `requireRole`, asociados a las rutas protegidas.

#### Evidencia y justificación técnica
- `back/app/middlewares/identifyUser.js` establece `req.user` desde el usuario encontrado en la base de datos y exporta `requireRole`.
- Las rutas de cada dominio aplican los roles permitidos para operaciones específicas.
- `docs/backend/API.md` documenta roles y rutas; esta guía describe el contrato del backend, no sustituye las verificaciones en tiempo de ejecución.

#### Consecuencias
**A favor:** autenticación y autorización son controles distintos: tener un token válido no concede automáticamente acceso a todas las operaciones.  
**A considerar:** cada ruta nueva o modificada debe recibir una política de autorización revisada. Las reglas aplicadas en el servidor son la frontera de seguridad; no deben confiar en datos de rol enviados libremente por el cliente.

#### Otras opciones posibles
Permisos granulares por recurso o políticas centralizadas pueden ser necesarios si aumentan los roles y excepciones. No consta una comparación formal de modelos de autorización en el repositorio.

---

### DT-008
**Joi para validar entradas**  
**Estado**: Implementada

#### Contexto
Los valores recibidos por HTTP no son confiables y deben validarse antes de llegar a la lógica de negocio o a las consultas.

#### Decisión
Usar **Joi** para definir esquemas y un middleware común para validar las propiedades de las solicitudes.

#### Evidencia y justificación técnica
- `back/package.json` declara Joi.
- `back/app/schemas/` contiene esquemas de validación por dominio.
- `back/app/middlewares/validate.js` acumula errores, descarta propiedades desconocidas y asigna a la solicitud el valor validado.

#### Consecuencias
**A favor:** las reglas de entrada quedan explícitas y se reutiliza el middleware para responder a datos inválidos antes de ejecutar la operación.  
**A considerar:** cada ruta debe conectar el esquema adecuado. La validación HTTP complementa —no reemplaza— las restricciones de PostgreSQL, la autorización ni el manejo seguro de errores.

#### Otras opciones posibles
Zod, express-validator o validaciones manuales centralizadas son alternativas posibles. No consta una comparación formal en el repositorio.

---

### DT-009
**Organización del backend por capas**  
**Estado**: Implementada

#### Contexto
La API incluye varios dominios y necesita separar el transporte HTTP, la lógica de negocio y el acceso a datos.

#### Decisión
Organizar el código de `back/app/` principalmente por responsabilidad técnica.

```text
back/app/
├── config/        # Configuración y conexión
├── controllers/   # Adaptación entre HTTP y servicios
├── middlewares/   # Autenticación, validación, errores y auditoría
├── models/        # Modelos Sequelize y asociaciones
├── routes/        # Rutas HTTP por dominio
├── schemas/       # Esquemas Joi
├── services/      # Lógica de negocio
└── utils/         # Errores y funciones compartidas
```

Las migraciones, los seeders y las pruebas están fuera de `app/`, bajo `back/`.

#### Evidencia y justificación técnica
La estructura real separa `controllers`, `services`, `models`, `routes`, `middlewares`, `schemas` y `config`. Las rutas delegan operaciones a controladores y servicios en lugar de concentrar toda la lógica en `server.js`.

#### Consecuencias
**A favor:** permite ubicar responsabilidades y probar partes del backend con distintos niveles de integración.  
**A considerar:** hay que evitar duplicar reglas entre controladores, servicios, modelos y base de datos. Si aumentan los dominios, se puede evaluar agrupar por módulo funcional conservando responsabilidades claras.

#### Otras opciones posibles
Una estructura por feature puede acercar archivos de un mismo dominio; una estructura plana puede resultar sencilla al inicio, pero más difícil de navegar al crecer. El repositorio no documenta una comparación histórica formal.

---

### DT-010
**Jest, Supertest y base aislada para tests**  
**Estado**: Implementada; la suite recrea y elimina la base configurada

#### Contexto
La API requiere pruebas repetibles de autenticación, validación, permisos y operaciones persistentes. Las pruebas no deben compartir accidentalmente la base de desarrollo.

#### Decisión
Usar **Jest** como runner y **Supertest** para probar la API HTTP. La suite configura `NODE_ENV=test`, ejecuta Jest en serie y prepara una base de datos específica para pruebas.

#### Evidencia y justificación técnica
- `back/package.json` declara Jest y Supertest; el script `test` usa `cross-env NODE_ENV=test jest --runInBand`.
- `back/jest.config.js` conecta `globalSetup`, `globalTeardown` y la configuración de cada suite.
- `back/tests/setup/globalSetup.js` ejecuta `DROP DATABASE IF EXISTS ... WITH (FORCE)`, crea la base, aplica migraciones y seeders.
- `back/tests/setup/globalTeardown.js` intenta eliminar la base de pruebas al finalizar.
- `docker-compose.test.yml` prepara un PostgreSQL temporal con almacenamiento `tmpfs`.

#### Consecuencias
**A favor:** las pruebas de integración ejercitan Express y PostgreSQL; el modo serial evita que varias suites manipulen simultáneamente la misma base. El Compose de pruebas separa la base temporal de la base normal del servicio.  
**Riesgo operativo:** el setup elimina por la fuerza el nombre configurado en `DB_NAME_TEST`. Un valor equivocado puede borrar datos ajenos a las pruebas. Verificar la variable antes de ejecutar la suite; no usar nombres de bases de desarrollo o producción. El usuario PostgreSQL necesita permisos para crear y eliminar bases.

#### Otras opciones posibles
Una base temporal por suite o transacciones con rollback pueden reducir interferencias en ciertos diseños. Los mocks son útiles para pruebas unitarias, pero no sustituyen por sí solos la integración con PostgreSQL.

---

### DT-011
**OpenAPI y Swagger UI para documentar la API**  
**Estado**: Implementada

#### Contexto
Quienes desarrollan, prueban o integran el backend necesitan conocer rutas, parámetros, respuestas y esquemas disponibles.

#### Decisión
Configurar **OpenAPI** con `swagger-jsdoc` y servir una interfaz con `swagger-ui-express` en `/api-docs`.

#### Evidencia y justificación técnica
- `back/app/config/swagger.js` configura la especificación.
- `back/app/app.js` monta Swagger UI en `/api-docs`.
- `docs/backend/API.md` resume rutas y roles del backend.

#### Consecuencias
**A favor:** el contrato puede consultarse desde navegador y compartirse con quienes consumen la API.  
**A considerar:** las anotaciones deben mantenerse en sincronía con rutas y esquemas Joi; publicar Swagger no garantiza por sí solo que la especificación esté completa ni que existan pruebas de contrato.

#### Otras opciones posibles
Un archivo OpenAPI mantenido por separado, documentación Markdown o colecciones de Postman pueden complementar el trabajo. No consta una evaluación formal de alternativas en el repositorio.

---

### DT-012
**Configuración y ejecución del backend**  
**Estado**: Implementada; requiere endurecimiento antes de producción

#### Contexto
La API necesita credenciales y configuración distintas según el entorno, y debe esperar a PostgreSQL y aplicar los cambios de esquema antes de empezar a atender solicitudes en Docker.

#### Decisión
Usar **dotenv** para cargar configuración local, **cross-env** para definir el entorno en scripts multiplataforma y un contenedor Node.js para ejecutar el backend. Compose coordina el backend con PostgreSQL.

#### Evidencia y justificación técnica
- `back/app/config/database.js` y `back/app/config/config.js` cargan variables de entorno.
- `back/package.json` usa `cross-env` en los scripts de test.
- `back/Dockerfile` usa `node:22-alpine`, instala dependencias con `npm ci` y ejecuta `server.js`.
- `back/docker-entrypoint.sh` espera a que PostgreSQL responda, aplica migraciones y carga seeders solo bajo la condición configurada.
- `docker-compose.yml` define el servicio `backend`, la conexión al servicio de base de datos y healthchecks.

#### Consecuencias
**A favor:** la configuración puede cambiar entre entornos sin codificar cada valor en el servidor y el inicio del contenedor ordena dependencias esenciales del backend.  
**A considerar:** los archivos `.env` reales no deben versionarse ni compartirse; los valores de ejemplo no son adecuados como credenciales de producción. Las operaciones de migración al inicio deben coordinarse cuidadosamente al escalar a varias réplicas.

#### Riesgos de configuración observados
- `CORS_ORIGIN` se pasa desde Compose, pero `back/app/app.js` no lo usa para restringir orígenes: el callback CORS acepta cualquier origen y además habilita credenciales. Configurar y probar una lista de orígenes permitidos antes de exponer la API.
- Los defaults de `JWT_SECRET` y de las credenciales PostgreSQL son valores de desarrollo. La API debería rechazar el arranque de producción si no recibe secretos seguros de la plataforma de despliegue.
- Mantener secretos en un gestor o mecanismo de secretos del entorno; no incorporarlos a la imagen, al repositorio ni a paquetes compartidos.

#### Otras opciones posibles
Secretos gestionados por la plataforma de despliegue, migraciones ejecutadas como paso separado del release o imágenes base distintas son opciones posibles. El repositorio no documenta una comparación histórica formal.

---

## Buenas prácticas y pendientes identificados

1. **No documentar versiones distintas a las que muestra el backend.** Compose usa PostgreSQL 16 y la imagen Node 22.
2. **Reemplazar el almacenamiento de contraseñas en texto plano por hashing apropiado** antes de cualquier despliegue expuesto a usuarios reales.
3. **Eliminar defaults de secretos para producción** y fallar al iniciar si faltan credenciales seguras.
4. **Restringir CORS a orígenes concretos** y hacer que la aplicación lea la configuración destinada a esa restricción.
5. **Proteger la base de datos de pruebas:** verificar `DB_NAME_TEST`; el setup y teardown eliminan esa base.
6. **No incluir archivos `.env` reales en Git ni en archivos ZIP compartidos.** El ZIP recibido contiene archivos con nombre `.env`; no se copiaron valores ni credenciales a esta documentación. Si el archivo se compartió fuera del equipo, revisar y rotar los secretos que pudiera contener.
7. Mantener modelos, asociaciones, migraciones, restricciones, triggers y documentación OpenAPI coordinados.
8. Revisar autenticación y autorización en cada ruta nueva o modificada; un JWT válido no concede permiso automáticamente para cualquier operación.
9. Mantener los seeders de demostración separados de datos y credenciales reales.
10. Registrar cambios de diseño futuros como nuevas entradas en lugar de reescribir silenciosamente su historia.

---

## Conclusión

El backend de Huellitas Saludables está construido como una API Node.js/Express que usa PostgreSQL y Sequelize, con validación Joi, autenticación JWT, autorización por roles, pruebas Jest/Supertest, documentación OpenAPI y ejecución en Docker.

Este registro describe exclusivamente componentes del backend y distingue lo que confirma el repositorio de las razones inferidas. También identifica riesgos concretos —en especial contraseñas sin hash, secretos por defecto, CORS permisivo y la eliminación de la base configurada para tests— para que no se confundan con recomendaciones de producción.

