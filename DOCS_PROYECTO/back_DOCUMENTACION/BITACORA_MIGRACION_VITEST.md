# BITÁCORA DE ACTIVIDADES
## Migración del framework de pruebas Jest a Vitest

**Proyecto:** HUELLITAS SALUDABLES  
**Responsable:** Sara Jasmin Cruz Calderon  
**Fecha de inicio:** 6 de noviembre de 2026  
**Fecha de finalización:** 8 de noviembre de 2026  

### 1. Objetivo

Realizar la migración del framework de pruebas automatizadas Jest a Vitest, adaptando la configuración del entorno de pruebas, los mocks, las funciones de simulación y la conexión con PostgreSQL, garantizando que las pruebas existentes continúen funcionando correctamente.

### 2. Criterios de finalización

- Vitest debe ejecutar las pruebas automatizadas del backend.
- La configuración debe ser compatible con Node.js y ES Modules.
- Las pruebas deben conservar sus validaciones y resultados.
- La base de datos de pruebas debe mantenerse separada de la base de datos principal.
- La ejecución debe finalizar correctamente sin procesos pendientes.
- Los comandos de pruebas y cobertura deben funcionar.

### 3. Registro de actividades

| Fecha | Hora | Actividad realizada |
|---|---|---|
| 06/11/2026 | 7:15 p. m. | Se inició la revisión de la configuración existente de Jest, identificando los scripts de ejecución y las dependencias relacionadas con Babel. |
| 06/11/2026 | 7:45 p. m. | Se analizaron los archivos de configuración global, preparación de la base de datos, cierre de conexiones y simulación de autenticación. |
| 06/11/2026 | 8:15 p. m. | Se revisó la estructura de las pruebas automatizadas y se identificaron los ajustes necesarios para migrarlas a Vitest. |
| 06/11/2026 | 8:45 p. m. | Se verificó el comportamiento de la base de datos de pruebas, incluyendo los procesos de limpieza y aislamiento entre ejecuciones. |
| 07/11/2026 | 7:15 p. m. | Se inició la sustitución de Jest por Vitest en las dependencias del proyecto. |
| 07/11/2026 | 7:45 p. m. | Se instaló Vitest versión 4.1.12 y el paquete `@vitest/coverage-v8` para generar informes de cobertura. |
| 07/11/2026 | 8:15 p. m. | Se modificaron los scripts `test`, `test:watch` y `test:coverage` del archivo `package.json`. |
| 07/11/2026 | 8:45 p. m. | Se creó `vitest.config.js`, configurando el entorno Node.js, las pruebas globales y la ejecución secuencial de archivos. |
| 07/11/2026 | 9:15 p. m. | Se configuró el aislamiento de procesos mediante forks y se establecieron tiempos máximos de ejecución para pruebas y hooks. |
| 07/11/2026 | 9:45 p. m. | Se adaptó `globalSetup` para preparar el entorno de pruebas, cargar las variables de entorno y ejecutar las operaciones necesarias sobre PostgreSQL. |
| 07/11/2026 | 10:15 p. m. | Se ajustó el proceso de finalización global para cerrar correctamente las conexiones y liberar los recursos utilizados durante las pruebas. |
| 07/11/2026 | 10:45 p. m. | Se adaptaron las rutas de configuración utilizando `fileURLToPath` e `import.meta.url`, manteniendo la compatibilidad con ES Modules. |
| 07/11/2026 | 11:15 p. m. | Se reemplazaron las funciones de Jest por sus equivalentes de Vitest, utilizando `vi.mock`, `vi.fn`, `vi.spyOn` y funciones de limpieza. |
| 07/11/2026 | 11:45 p. m. | Se adaptaron los mocks del modelo de autenticación para conservar la compatibilidad con las importaciones ESM y sus exportaciones por defecto. |
| 08/11/2026 | 12:15 a. m. | Se actualizaron las pruebas `auth.model.test.js` y `auth.service.security.test.js`, conservando las validaciones y expectativas originales. |
| 08/11/2026 | 12:45 a. m. | Se mantuvo Supertest para las pruebas HTTP y se verificó que las solicitudes continuaran funcionando con la nueva configuración. |
| 08/11/2026 | 1:15 a. m. | Se configuró el aislamiento de la base de datos de pruebas mediante el nombre independiente `proyectohs_test`, evitando afectar la base de datos principal. |
| 08/11/2026 | 1:45 a. m. | Se actualizó `.npmrc` con `legacy-peer-deps=true` para evitar problemas de resolución de dependencias durante la instalación. |
| 08/11/2026 | 2:15 a. m. | Se regeneró `package-lock.json` y se verificó la instalación limpia de dependencias mediante `npm ci`. |
| 08/11/2026 | 2:45 a. m. | Se actualizó el Dockerfile para copiar `.npmrc` antes de ejecutar la instalación de dependencias. |
| 08/11/2026 | 3:15 a. m. | Se ajustó `docker-compose.test.yml`, eliminando el parámetro `--runInBand` de Jest, debido a que la ejecución secuencial quedó configurada directamente en Vitest. |
| 08/11/2026 | 3:45 a. m. | Se actualizaron los documentos `DOCKER.md` y `back/Readme.md` con los nuevos comandos y procedimientos para ejecutar las pruebas. |
| 08/11/2026 | 4:15 a. m. | Se ejecutaron las pruebas con Vitest, obteniendo 11 archivos de pruebas y 179 pruebas aprobadas, sin pruebas omitidas. |
| 08/11/2026 | 4:45 a. m. | Se ejecutó nuevamente `npm ci` y posteriormente `npm test` para comprobar que la instalación limpia no afectara los resultados. |
| 08/11/2026 | 5:15 a. m. | Se generó el informe de cobertura mediante `npm run test:coverage`, verificando los porcentajes de sentencias, ramas, funciones y líneas. |
| 08/11/2026 | 5:45 a. m. | Se comprobó el cierre de las conexiones de ORM anterior y la finalización del proceso de pruebas sin necesidad de utilizar `forceExit`. |
| 08/11/2026 | 6:15 a. m. | Se verificó el inicio del backend y el funcionamiento del endpoint `/health`, además de una respuesta HTTP 401 al consultar el perfil sin token. |
| 08/11/2026 | 6:45 a. m. | Se verificó la autenticación desde el frontend, la redirección al dashboard y las consultas de mascotas, citas, razas y disponibilidad. |
| 08/11/2026 | 7:15 a. m. | Se compararon los archivos del frontend y del backend para confirmar que la migración del framework de pruebas no hubiera modificado la lógica funcional de la aplicación. |
| 08/11/2026 | 7:45 a. m. | Se documentaron los resultados, las dependencias modificadas y el procedimiento de ejecución en `docs/back/Bitacora_Migracion_Vitest.md`. |

### 4. Archivos modificados

- `back/package.json`
- `back/package-lock.json`
- `back/vitest.config.js`
- `back/globalSetup.js`
- `back/globalTeardown.js`
- Archivos de configuración de pruebas.
- `auth.model.test.js`.
- `auth.service.security.test.js`.
- `.npmrc`.
- `Dockerfile`.
- `docker-compose.test.yml`.
- `DOCKER.md`.
- `back/Readme.md`.

### 5. Resultados obtenidos

**Ejecución de pruebas:**

- Archivos de pruebas ejecutados: 11.
- Pruebas aprobadas: 179.
- Pruebas omitidas: 0.


## 6. Matriz de casos

### `tests/integration/auth.test.js` — 24 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 1 | AUTH-001 | POST /api/auth/login | login con credenciales válidas devuelve 200 + token | Aprobada |
| 2 | AUTH-002 | POST /api/auth/login | login con correo inexistente devuelve 401 | Aprobada |
| 3 | AUTH-003 | POST /api/auth/login | login con contraseña incorrecta devuelve 401 | Aprobada |
| 4 | AUTH-004 | POST /api/auth/login | sin correo devuelve 400 | Aprobada |
| 5 | AUTH-005 | POST /api/auth/login | correo con formato inválido devuelve 400 | Aprobada |
| 6 | AUTH-006 | POST /api/auth/login | contraseña de 3 caracteres devuelve 400 | Aprobada |
| 7 | AUTH-007 | POST /api/auth/login | login como usuario devuelve 200 y rol correcto | Aprobada |
| 8 | AUTH-008 | POST /api/auth/login | login como especialista devuelve 200 y rol correcto | Aprobada |
| 9 | AUTH-009 | POST /api/auth/login | login como recepcionista devuelve 200 y rol correcto | Aprobada |
| 10 | AUTH-010 | POST /api/auth/login | login como admin devuelve 200 y rol correcto | Aprobada |
| 11 | AUTH-011 | GET /api/auth/perfil | con token válido devuelve el perfil | Aprobada |
| 12 | AUTH-012 | GET /api/auth/perfil | sin token devuelve 401 | Aprobada |
| 13 | AUTH-013 | GET /api/auth/perfil | con token inválido devuelve 401 | Aprobada |
| 14 | AUTH-014 | GET /api/auth/perfil | con header sin "Bearer" devuelve 401 | Aprobada |
| 15 | AUTH-015 | POST /api/auth/registro | registra un usuario nuevo y devuelve 201 + JWT | Aprobada |
| 16 | AUTH-016 | POST /api/auth/registro | correo ya registrado devuelve 409 | Aprobada |
| 17 | AUTH-017 | POST /api/auth/registro | nombre de exactamente 100 caracteres se acepta | Aprobada |
| 18 | AUTH-018 | POST /api/auth/registro | nombre de 101 caracteres devuelve 400 | Aprobada |
| 19 | AUTH-019 | POST /api/auth/registro | sin nombre devuelve 400 | Aprobada |
| 20 | AUTH-020 | POST /api/auth/registro | sin apellidos devuelve 400 | Aprobada |
| 21 | AUTH-021 | POST /api/auth/registro | sin telefono devuelve 400 | Aprobada |
| 22 | AUTH-022 | POST /api/auth/registro | sin correo devuelve 400 | Aprobada |
| 23 | AUTH-023 | POST /api/auth/registro | sin direccion devuelve 400 | Aprobada |
| 24 | AUTH-024 | POST /api/auth/registro | sin contrasena devuelve 400 | Aprobada |

### `tests/integration/citas.test.js` — 20 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 25 | CITAS-025 | GET /api/citas | usuario autenticado lista citas (200) | Aprobada |
| 26 | CITAS-026 | GET /api/citas | filtro por estado funciona | Aprobada |
| 27 | CITAS-027 | GET /api/citas | sin token devuelve 401 | Aprobada |
| 28 | CITAS-028 | GET /api/citas | estado inválido devuelve 400 | Aprobada |
| 29 | CITAS-029 | GET /api/citas/:id | cita existente devuelve 200 | Aprobada |
| 30 | CITAS-030 | GET /api/citas/:id | cita inexistente devuelve 404 | Aprobada |
| 31 | CITAS-031 | POST /api/citas | usuario crea cita para su propia mascota (201) | Aprobada |
| 32 | CITAS-032 | POST /api/citas | recepcionista puede crear cita (201) | Aprobada |
| 33 | CITAS-033 | POST /api/citas | especialista NO puede crear cita (403) | Aprobada |
| 34 | CITAS-034 | POST /api/citas | sin token devuelve 401 | Aprobada |
| 35 | CITAS-035 | POST /api/citas | usuario intentando usar mascota ajena devuelve 403 | Aprobada |
| 36 | CITAS-036 | POST /api/citas | disponibilidad ya ocupada devuelve 409 | Aprobada |
| 37 | CITAS-037 | POST /api/citas | disponibilidad inexistente devuelve 404 | Aprobada |
| 38 | CITAS-038 | POST /api/citas | motivo de exactamente 200 caracteres se acepta | Aprobada |
| 39 | CITAS-039 | POST /api/citas | motivo de 201 caracteres devuelve 400 | Aprobada |
| 40 | CITAS-040 | POST /api/citas | id_mascota inválido (0) devuelve 400 | Aprobada |
| 41 | CITAS-041 | POST /api/citas | id_mascota inválido (-1) devuelve 400 | Aprobada |
| 42 | CITAS-042 | POST /api/citas | id_mascota inválido (abc) devuelve 400 | Aprobada |
| 43 | CITAS-043 | PATCH /api/citas/:id/cancelar | usuario puede cancelar su propia cita | Aprobada |
| 44 | CITAS-044 | PATCH /api/citas/:id/cancelar | cancelar cita ya cancelada devuelve 409 | Aprobada |

### `tests/integration/disponibilidad.test.js` — 52 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 45 | DISPON-045 | GET /api/disponibilidad | usuario autenticado lista (200) | Aprobada |
| 46 | DISPON-046 | GET /api/disponibilidad | filtro por id_usuario funciona | Aprobada |
| 47 | DISPON-047 | GET /api/disponibilidad | sin token devuelve 401 | Aprobada |
| 48 | DISPON-048 | GET /api/disponibilidad | estado inválido devuelve 400 | Aprobada |
| 49 | DISPON-049 | GET /api/disponibilidad - filtros y paginación | sin page ni limit mantiene el comportamiento original (arreglo completo, sin meta) | Aprobada |
| 50 | DISPON-050 | GET /api/disponibilidad - filtros y paginación | con limit devuelve solo esa cantidad y trae meta de paginación | Aprobada |
| 51 | DISPON-051 | GET /api/disponibilidad - filtros y paginación | fecha_desde y fecha_hasta filtran por rango (ambos extremos incluidos) | Aprobada |
| 52 | DISPON-052 | GET /api/disponibilidad - filtros y paginación | solo fecha_desde funciona (sin fecha_hasta) | Aprobada |
| 53 | DISPON-053 | GET /api/disponibilidad - filtros y paginación | solo fecha_hasta funciona (sin fecha_desde) | Aprobada |
| 54 | DISPON-054 | GET /api/disponibilidad - filtros y paginación | "fecha" exacta tiene prioridad sobre el rango | Aprobada |
| 55 | DISPON-055 | GET /api/disponibilidad - filtros y paginación | fecha_hasta anterior a fecha_desde devuelve 400 | Aprobada |
| 56 | DISPON-056 | GET /api/disponibilidad - filtros y paginación | page inválido "0" devuelve 400 | Aprobada |
| 57 | DISPON-057 | GET /api/disponibilidad - filtros y paginación | page inválido "-1" devuelve 400 | Aprobada |
| 58 | DISPON-058 | GET /api/disponibilidad - filtros y paginación | page inválido "abc" devuelve 400 | Aprobada |
| 59 | DISPON-059 | GET /api/disponibilidad - filtros y paginación | limit inválido "0" devuelve 400 | Aprobada |
| 60 | DISPON-060 | GET /api/disponibilidad - filtros y paginación | limit inválido "101" devuelve 400 | Aprobada |
| 61 | DISPON-061 | GET /api/disponibilidad - filtros y paginación | limit inválido "abc" devuelve 400 | Aprobada |
| 62 | DISPON-062 | GET /api/disponibilidad/especialista/:id_usuario | devuelve SOLO las franjas del especialista pedido (200) | Aprobada |
| 63 | DISPON-063 | GET /api/disponibilidad/especialista/:id_usuario | la ruta no es capturada por /:id (no responde 400 por id no numérico) | Aprobada |
| 64 | DISPON-064 | GET /api/disponibilidad/especialista/:id_usuario | siempre pagina: aplica el límite por defecto (20) y trae los datos del especialista | Aprobada |
| 65 | DISPON-065 | GET /api/disponibilidad/especialista/:id_usuario | la página 2 trae el resto y no repite franjas de la página 1 | Aprobada |
| 66 | DISPON-066 | GET /api/disponibilidad/especialista/:id_usuario | una página fuera de rango devuelve lista vacía (200), no error | Aprobada |
| 67 | DISPON-067 | GET /api/disponibilidad/especialista/:id_usuario | viene ordenado por fecha y luego por hora | Aprobada |
| 68 | DISPON-068 | GET /api/disponibilidad/especialista/:id_usuario | filtra por estado y el resumen ignora ese filtro (para mostrar contadores) | Aprobada |
| 69 | DISPON-069 | GET /api/disponibilidad/especialista/:id_usuario | combina especialista + rango de fechas | Aprobada |
| 70 | DISPON-070 | GET /api/disponibilidad/especialista/:id_usuario | un id inexistente devuelve 404 | Aprobada |
| 71 | DISPON-071 | GET /api/disponibilidad/especialista/:id_usuario | un usuario que NO es especialista devuelve 404 | Aprobada |
| 72 | DISPON-072 | GET /api/disponibilidad/especialista/:id_usuario | id_usuario de más de 10 caracteres devuelve 400 | Aprobada |
| 73 | DISPON-073 | GET /api/disponibilidad/especialista/:id_usuario | sin token devuelve 401 | Aprobada |
| 74 | DISPON-074 | GET /api/disponibilidad/especialista/:id_usuario | cualquier usuario autenticado puede consultarla (200) | Aprobada |
| 75 | DISPON-075 | GET /api/disponibilidad/:id | devuelve una disponibilidad existente (200) | Aprobada |
| 76 | DISPON-076 | GET /api/disponibilidad/:id | id inexistente devuelve 404 | Aprobada |
| 77 | DISPON-077 | POST /api/disponibilidad | recepcionista puede crear (201) | Aprobada |
| 78 | DISPON-078 | POST /api/disponibilidad | admin puede crear (201) | Aprobada |
| 79 | DISPON-079 | POST /api/disponibilidad | rol usuario no puede crear (403) | Aprobada |
| 80 | DISPON-080 | POST /api/disponibilidad | rol especialista no puede crear (403) | Aprobada |
| 81 | DISPON-081 | POST /api/disponibilidad | sin token devuelve 401 | Aprobada |
| 82 | DISPON-082 | POST /api/disponibilidad | id_usuario que no es especialista devuelve 400 | Aprobada |
| 83 | DISPON-083 | POST /api/disponibilidad | mismo especialista + fecha + hora devuelve 409 | Aprobada |
| 84 | DISPON-084 | POST /api/disponibilidad | hora inválida "25:00:00" devuelve 400 | Aprobada |
| 85 | DISPON-085 | POST /api/disponibilidad | hora inválida "08:60:00" devuelve 400 | Aprobada |
| 86 | DISPON-086 | POST /api/disponibilidad | hora inválida "8:00" devuelve 400 | Aprobada |
| 87 | DISPON-087 | POST /api/disponibilidad | hora inválida "abc" devuelve 400 | Aprobada |
| 88 | DISPON-088 | POST /api/disponibilidad | hora inválida "" devuelve 400 | Aprobada |
| 89 | DISPON-089 | POST /api/disponibilidad | fecha con formato inválido devuelve 400 | Aprobada |
| 90 | DISPON-090 | POST /api/disponibilidad | id_usuario > 10 chars devuelve 400 | Aprobada |
| 91 | DISPON-091 | PUT /api/disponibilidad/:id | recepcionista actualiza una disponibilidad libre (200) | Aprobada |
| 92 | DISPON-092 | PUT /api/disponibilidad/:id | intentar modificar fecha de una ocupada devuelve 409 | Aprobada |
| 93 | DISPON-093 | PUT /api/disponibilidad/:id | body vacío devuelve 400 | Aprobada |
| 94 | DISPON-094 | DELETE /api/disponibilidad/:id | recepcionista elimina una disponibilidad libre (200) | Aprobada |
| 95 | DISPON-095 | DELETE /api/disponibilidad/:id | eliminar una ocupada devuelve 409 | Aprobada |
| 96 | DISPON-096 | DELETE /api/disponibilidad/:id | id inexistente devuelve 404 | Aprobada |

### `tests/integration/historia.test.js` — 27 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 97 | HISTOR-097 | GET /api/historia | especialista lista historias (200) | Aprobada |
| 98 | HISTOR-098 | GET /api/historia | rol usuario NO puede listar (403) | Aprobada |
| 99 | HISTOR-099 | GET /api/historia | rol admin NO puede listar (403) | Aprobada |
| 100 | HISTOR-100 | GET /api/historia | sin token devuelve 401 | Aprobada |
| 101 | HISTOR-101 | POST /api/historia | especialista asignado crea historia para su cita (201) | Aprobada |
| 102 | HISTOR-102 | POST /api/historia | especialista que no es el asignado devuelve 403 | Aprobada |
| 103 | HISTOR-103 | POST /api/historia | usuario NO puede crear (403) | Aprobada |
| 104 | HISTOR-104 | POST /api/historia | cita inexistente devuelve 404 | Aprobada |
| 105 | HISTOR-105 | POST /api/historia | cita que ya tiene historia devuelve 409 | Aprobada |
| 106 | HISTOR-106 | POST /api/historia | diagnostico de 200 caracteres se acepta | Aprobada |
| 107 | HISTOR-107 | POST /api/historia | diagnostico de 201 caracteres devuelve 400 | Aprobada |
| 108 | HISTOR-108 | POST /api/historia | peso inválido (0) devuelve 400 | Aprobada |
| 109 | HISTOR-109 | POST /api/historia | peso inválido (-1) devuelve 400 | Aprobada |
| 110 | HISTOR-110 | POST /api/historia | peso inválido (1000) devuelve 400 | Aprobada |
| 111 | HISTOR-111 | POST /api/historia | peso inválido (999.995) devuelve 400 | Aprobada |
| 112 | HISTOR-112 | PUT /api/historia/:id | especialista dueño actualiza (200) | Aprobada |
| 113 | HISTOR-113 | PUT /api/historia/:id | otro especialista NO puede actualizar (403) | Aprobada |
| 114 | HISTOR-114 | PUT /api/historia/:id | body vacío devuelve 400 | Aprobada |
| 115 | HISTOR-115 | GET /api/historia/:id | el especialista asignado puede consultar la historia (200) | Aprobada |
| 116 | HISTOR-116 | GET /api/historia/:id | otro especialista no puede consultar la historia (403) | Aprobada |
| 117 | HISTOR-117 | GET /api/historia/:id | sin token devuelve 401 | Aprobada |
| 118 | HISTOR-118 | GET /api/historia/mascota/:id_mascota | el especialista recibe las historias de su ámbito autorizado (200) | Aprobada |
| 119 | HISTOR-119 | GET /api/historia/mascota/:id_mascota | otro especialista no recibe historias pertenecientes a ESP001 | Aprobada |
| 120 | HISTOR-120 | GET /api/historia/mascota/:id_mascota | sin token devuelve 401 | Aprobada |
| 121 | HISTOR-121 | GET /api/historia/cita/:id_cita | devuelve la historia de la cita 1 | Aprobada |
| 122 | HISTOR-122 | GET /api/historia/cita/:id_cita | otro especialista no puede consultar la historia de la cita (403) | Aprobada |
| 123 | HISTOR-123 | GET /api/historia/cita/:id_cita | cita sin historia devuelve 404 | Aprobada |

### `tests/integration/mascotas.test.js` — 21 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 124 | MASCOT-124 | GET /api/mascotas | usuario autenticado puede listar (200) | Aprobada |
| 125 | MASCOT-125 | GET /api/mascotas | sin token devuelve 401 | Aprobada |
| 126 | MASCOT-126 | GET /api/mascotas/:id | obtener Max (id=1) devuelve sus propietarios | Aprobada |
| 127 | MASCOT-127 | GET /api/mascotas/:id | id inexistente devuelve 404 | Aprobada |
| 128 | MASCOT-128 | GET /api/mascotas/:id | id no numérico devuelve 400 | Aprobada |
| 129 | MASCOT-129 | POST /api/mascotas | usuario puede crear una mascota (201) | Aprobada |
| 130 | MASCOT-130 | POST /api/mascotas | admin también puede crear (201) | Aprobada |
| 131 | MASCOT-131 | POST /api/mascotas | rol especialista NO puede crear (403) | Aprobada |
| 132 | MASCOT-132 | POST /api/mascotas | sin token devuelve 401 | Aprobada |
| 133 | MASCOT-133 | POST /api/mascotas | especie "conejo" devuelve 400 | Aprobada |
| 134 | MASCOT-134 | POST /api/mascotas | especie "ave" devuelve 400 | Aprobada |
| 135 | MASCOT-135 | POST /api/mascotas | especie "reptil" devuelve 400 | Aprobada |
| 136 | MASCOT-136 | POST /api/mascotas | especie "perro " devuelve 400 | Aprobada |
| 137 | MASCOT-137 | POST /api/mascotas | nombre de exactamente 200 caracteres se acepta | Aprobada |
| 138 | MASCOT-138 | POST /api/mascotas | nombre de 201 caracteres devuelve 400 | Aprobada |
| 139 | MASCOT-139 | POST /api/mascotas | id_raza inexistente devuelve 404 | Aprobada |
| 140 | MASCOT-140 | POST /api/mascotas | sin nombre devuelve 400 | Aprobada |
| 141 | MASCOT-141 | POST /api/mascotas | sin fecha_nacimiento devuelve 400 | Aprobada |
| 142 | MASCOT-142 | POST /api/mascotas | sin especie devuelve 400 | Aprobada |
| 143 | MASCOT-143 | POST /api/mascotas | sin genero devuelve 400 | Aprobada |
| 144 | MASCOT-144 | POST /api/mascotas | sin id_raza devuelve 400 | Aprobada |

### `tests/integration/usuarios.test.js` — 5 casos (integración)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 145 | USUARI-145 | GET /api/usuarios/especialistas | devuelve la lista de especialistas (200) | Aprobada |
| 146 | USUARI-146 | GET /api/usuarios/especialistas | sin token devuelve 401 | Aprobada |
| 147 | USUARI-147 | GET /api/usuarios/:documento | usuario existente devuelve 200 sin contraseña | Aprobada |
| 148 | USUARI-148 | GET /api/usuarios/:documento | usuario inexistente devuelve 404 | Aprobada |
| 149 | USUARI-149 | GET /api/usuarios/:documento | sin token devuelve 401 | Aprobada |

### `tests/unit/models/auth.model.test.js` — 4 casos (unitaria)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 150 | MODELS-150 | — | rechaza crear un usuario con un valor que no sea hash scrypt | Aprobada |
| 151 | MODELS-151 | — | permite crear un usuario con un hash scrypt válido y no lo devuelve | Aprobada |
| 152 | MODELS-152 | — | rechaza actualizar la contraseña con un valor arbitrario | Aprobada |
| 153 | MODELS-153 | — | acepta actualizar la contraseña con un hash scrypt válido | Aprobada |

### `tests/unit/services/auth.service.security.test.js` — 7 casos (unitaria)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 154 | SERVIC-154 | login | verifica un hash scrypt válido y no devuelve la contraseña | Aprobada |
| 155 | SERVIC-155 | login | rechaza una contraseña incorrecta | Aprobada |
| 156 | SERVIC-156 | login | migra una contraseña antigua después de verificarla | Aprobada |
| 157 | SERVIC-157 | login | permite el login aunque falle la actualización del hash | Aprobada |
| 158 | SERVIC-158 | login | no informa una migración exitosa si updatePassword no actualiza | Aprobada |
| 159 | SERVIC-159 | registro | guarda un hash y no la contraseña original | Aprobada |
| 160 | SERVIC-160 | registroAdmin | guarda un hash al crear una cuenta administrativa | Aprobada |

### `tests/unit/services/auth.service.test.js` — 7 casos (unitaria)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 161 | SERVIC-161 | login | con credenciales válidas devuelve usuario + token | Aprobada |
| 162 | SERVIC-162 | login | con correo inexistente lanza error 401 | Aprobada |
| 163 | SERVIC-163 | login | con contraseña incorrecta lanza error 401 | Aprobada |
| 164 | SERVIC-164 | registro | crea un usuario nuevo con rol usuario | Aprobada |
| 165 | SERVIC-165 | registro | con correo duplicado lanza error 409 | Aprobada |
| 166 | SERVIC-166 | registroAdmin | admin puede crear un especialista | Aprobada |
| 167 | SERVIC-167 | registroAdmin | no-admin intentando crear lanza error 403 | Aprobada |

### `tests/unit/utils/jwt.test.js` — 4 casos (unitaria)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 168 | UTILSJ-168 | — | generarToken devuelve un JWT (3 segmentos) | Aprobada |
| 169 | UTILSJ-169 | — | verificarToken devuelve el payload correcto | Aprobada |
| 170 | UTILSJ-170 | — | verificarToken con token inválido lanza error | Aprobada |
| 171 | UTILSJ-171 | — | verificarToken con firma alterada lanza error | Aprobada |

### `tests/unit/utils/password.test.js` — 8 casos (unitaria)

| # | ID | Endpoint / Grupo | Descripción del caso | Estado |
|---|---|---|---|---|
| 172 | UTILSP-172 | hashContrasena | genera un hash scrypt verificable y compatible con VARCHAR(255) | Aprobada |
| 173 | UTILSP-173 | hashContrasena | genera salts distintos para la misma contraseña | Aprobada |
| 174 | UTILSP-174 | hashContrasena | rechaza contraseñas vacías o superiores a 1024 bytes | Aprobada |
| 175 | UTILSP-175 | verificarContrasena | rechaza una contraseña incorrecta | Aprobada |
| 176 | UTILSP-176 | verificarContrasena | rechaza formatos inválidos sin lanzar | Aprobada |
| 177 | UTILSP-177 | verificarContrasena | rechaza parámetros de derivación no soportados | Aprobada |
| 178 | UTILSP-178 | verificarContrasena | mantiene compatibilidad temporal con contraseñas antiguas en texto plano | Aprobada |
| 179 | UTILSP-179 | esHashScrypt | distingue hashes válidos de valores no válidos | Aprobada |


**Verificaciones adicionales:**

- Instalación limpia mediante `npm ci`.
- Ejecución satisfactoria de `npm test`.
- Generación del informe de cobertura.
- Cierre correcto de las conexiones a PostgreSQL.
- Separación de la base de datos de pruebas.
- Funcionamiento de la autenticación y consultas desde el frontend.

### 7. Observaciones

- Se mantuvo la lógica de autenticación, los mecanismos de hash de contraseñas y JWT.
- No se modificaron las rutas de la API ni los permisos.
- La migración no implicó actualizar masivamente dependencias ajenas al proceso.
- La instalación reportó 7 vulnerabilidades moderadas en dependencias existentes.
- La configuración de Docker fue actualizada, pero no se realizó una ejecución de validación de Docker.
- El modo interactivo `test:watch` quedó configurado, pero no se realizó una validación interactiva.

### 8. Conclusión

Se completó la migración del framework de pruebas automatizadas Jest a Vitest, adaptando la configuración, los mocks, las variables de entorno y la conexión con PostgreSQL. Se conservaron las pruebas existentes y se obtuvieron 179 pruebas aprobadas, junto con un informe de cobertura. La migración permitió mantener la validación automatizada del backend bajo el nuevo entorno de módulos ES Modules.