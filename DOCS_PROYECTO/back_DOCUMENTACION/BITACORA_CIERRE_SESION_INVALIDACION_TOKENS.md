# Bitácora: cierre de sesión con invalidación real de tokens JWT (Tarea #12)

> **Estado de la tarea: IMPLEMENTADA PARCIALMENTE — pendiente de validación en un entorno con dependencias y PostgreSQL.**
> El código, la migración, las pruebas, el frontend y esta documentación están escritos. En el entorno de trabajo **no había red, `node_modules` ni PostgreSQL**, por lo que **no se ejecutaron** la migración, las pruebas automatizadas, `npm run type-check`, `npm run build` ni la prueba con Postman. Lo único que se ejecutó fueron comprobaciones de sintaxis (ver sección 12). Ningún resultado de este documento se da por aprobado sin evidencia de ejecución.

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | Huellitas Saludables PRO |
| Tarea | Cierre de sesión que invalida tokens JWT |
| Número de tarea | #12 |
| Fecha de implementación | jueves 19 de noviembre de 2026 (America/Bogotá) |
| Responsable | No identificado en el repositorio |
| Áreas involucradas | Backend, frontend, base de datos, seguridad, pruebas, documentación |
| Tecnologías | Node.js (ESM), Express 4, `jsonwebtoken` 9 (HS256), Prisma 7 + `@prisma/adapter-pg`, PostgreSQL, Vitest 4 + Supertest, React 18 + TypeScript, Axios, React Router 7 |
| Alcance de los archivos | Copia del ZIP `Huellitas_Saludables_PRO-FRONT-SAN-V_1.zip` (carpeta `Huellitas_Saludables_PRO-FRONT-SAN-V.1`) |

## 2. Descripción del problema

Antes del cambio, «Cerrar sesión» en la Navbar y en Perfil solo ejecutaba `logout()` de `AuthContext`, que borraba `usuario` y `token` del `localStorage` y ponía el estado de React en `null`. **El backend no se enteraba**: no existía ningún endpoint de logout.

El JWT es un token *sin estado*: su validez depende únicamente de la firma HS256 y de la fecha `exp` (por defecto `8h`, `10h` en `.env.example`). Eliminarlo del navegador no lo destruye; quien hubiera copiado el token (otra pestaña, una extensión, un log, un equipo compartido, una captura de red) podía seguir usándolo contra cualquier endpoint protegido **hasta que expirase**, aunque la persona ya hubiera cerrado sesión. La interfaz mostraba «sesión cerrada» mientras el servidor seguía aceptando el token.

## 3. Objetivo de la implementación

- Que cerrar sesión **revoque en el servidor** el token concreto usado en esa sesión.
- Que el middleware de autenticación rechace con HTTP 401 cualquier token revocado, de forma inmediata.
- Que revocar una sesión no afecte a otras sesiones del mismo usuario.
- Que el frontend use un único flujo centralizado de logout y limpie siempre el estado local, incluso con el backend caído.
- Documentar y probar el mecanismo sin almacenar JWT completos ni datos sensibles.

## 4. Estado inicial del proyecto

### 4.1 Hallazgos comprobados (lectura del código)

| Tema | Hallazgo | Evidencia |
|---|---|---|
| Generación del JWT | `generarToken` firma con HS256 y `expiresIn` (`JWT_EXPIRES_IN`, por defecto `8h`). Payload: `{ id, rol }` + `iat`/`exp` automáticos. **Sin `jti`.** | `back/app/utils/jwt.js` |
| Verificación | `verificarToken` usa `jwt.verify` con `algorithms: ['HS256']` (rechaza `none` y otros algoritmos). | `back/app/utils/jwt.js` |
| Middleware | `identifyUser` extrae `Bearer`, verifica firma/expiración, busca al usuario por `payload.id` en BD y fija `req.user = { id, rol }` con el rol **leído de la BD**, no del token. Rutas públicas por coincidencia exacta: `/api/auth/login`, `/api/auth/registro`, `/health`. **No consulta ninguna revocación.** | `back/app/middlewares/identifyUser.js` |
| Montaje | `app.use('/api', identifyUser, auditLog, apiRoutes)`: toda ruta `/api` no pública exige JWT. | `back/app/app.js` |
| Endpoint de logout | **No existía.** | `back/app/routes/auth.routes.js` |
| Revocación previa | **Ninguna** (sin tabla, modelo ni lista). Un usuario eliminado sí deja de ser válido porque el middleware lo busca en BD. | `schema.prisma`, `identifyUser.js` |
| Almacenamiento del token | `localStorage["token"]`; el usuario en `localStorage["usuario"]`. El token lo guarda `Login.tsx`. | `Login.tsx`, `AuthContext.tsx` |
| Envío del token | Interceptor de petición de Axios añade `Authorization: Bearer <token>`. | `front/src/services/api.ts` |
| Logout en el frontend | `AuthContext.logout()` síncrono: borra storage y `setUsuario(null)`. La Navbar (`navigate("/")`) y Perfil (`navigate("/")`) tenían **cada una su propia llamada** a `logout()` + navegación. | `Navbar.tsx`, `Perfil.tsx` |
| Respuesta 401 en el frontend | El interceptor de respuesta limpia storage y hace `window.location.href = "/login"` si no está ya en `/login`. | `api.ts` |
| Rutas protegidas | `PrivateRoute` y `RoleRoute` dependen solo de `autenticado` (derivado de `usuario` en el contexto). | `PrivateRoute.tsx`, `RoleRoute.tsx` |
| Tareas programadas | Existe un scheduler (`citaCancellationScheduler.js`) específico de citas, arrancado desde `app/server.js`. | `back/app/server.js` |
| Pruebas | Vitest + Supertest con BD `*_test` real (migraciones + seed por `globalSetup`). Ya existían `jwt.test.js`, `auth.test.js`, `auth.service.*.test.js`. No hay framework de pruebas en el frontend. | `back/vitest.config.js`, `front/package.json` |

### 4.2 Limitaciones encontradas

1. Un token copiado seguía siendo válido hasta `exp` aunque el usuario hubiera cerrado sesión.
2. Los tokens no tenían identificador propio, por lo que no era posible revocar uno concreto.
3. La lógica de cierre de sesión estaba duplicada en dos componentes.
4. No existe un sistema de notificaciones (toast) en el frontend.

> Las decisiones de implementación (sección 5) se distinguen de estos hallazgos: lo anterior es lo que había; lo siguiente es lo que se decidió hacer.

## 5. Análisis técnico y decisiones tomadas

### DT-12-01 — Lista de revocación (blacklist) por `jti`
**Decisión:** registrar en BD los tokens revocados y consultarlos en el middleware.
**Por qué:** es el mecanismo mínimo que cumple «revocación real» sin cambiar el modelo de autenticación (HS256, un solo token, sin refresh tokens, sin cookies). **Alternativas descartadas:** acortar `exp` (no invalida al instante); rotar `JWT_SECRET` (cierra *todas* las sesiones); refresh tokens (rediseño del login, fuera de alcance); versión de sesión por usuario (cerraría las demás sesiones del usuario, contrario al requisito).

### DT-12-02 — Identificador `jti`
`generarToken` añade `jwtid: randomUUID()` (UUID v4 del generador criptográfico de Node, `node:crypto`; **sin dependencias nuevas**). El `jti` es un claim estándar (RFC 7519) y queda dentro del JWT firmado, de modo que no se puede alterar sin invalidar la firma. Payload resultante: `id`, `rol`, `jti`, `iat`, `exp`.

### DT-12-03 — Qué se guarda: el `jti`, no el JWT ni un hash del JWT
Se guarda `jti` + `revocado_en` + `expira_en`. Se decidió **no** hashear el `jti`: ya viaja en claro dentro del payload del propio JWT (Base64), así que guardarlo no revela nada nuevo y un hash no añade protección; en cambio es una clave de búsqueda directa e indexada. **No se almacena el JWT completo, ni el `id` del usuario, ni el rol ni ningún dato personal.**

### DT-12-04 — PostgreSQL + Prisma
Es la base y el ORM del proyecto; la revocación debe sobrevivir a reinicios y ser compartida entre instancias del backend (a diferencia de un `Set` en memoria). Se usa el cliente Prisma existente (`config/prisma.js`) y una migración versionada.

### DT-12-05 — Verificación en el middleware (fallo seguro)
Orden en `identifyUser`: firma y expiración → exigir `jti` (string, 1–64 caracteres) y `exp` numérico → consultar revocación → buscar usuario → fijar `req.user`/`req.auth`.
- Token sin `jti` o sin `exp`: **401** (contrato de seguridad). Efecto de compatibilidad: los tokens emitidos *antes* del despliegue no tienen `jti`, por lo que **los usuarios con sesión abierta deberán iniciar sesión de nuevo una vez**.
- Token revocado: **401** con «La sesión ha sido cerrada. Inicia sesión nuevamente.» (formato estándar `fail()` vía `AppError`).
- Error al consultar la lista de revocación: **no se autoriza**; se responde **503** `SERVICE_UNAVAILABLE`.
  *Decisión sobre el código:* el prompt exige «no autorizar» sin fijar el código. Se eligió 503 y no 401 porque es un fallo del servidor, no una credencial inválida; además, el interceptor del frontend solo limpia la sesión ante 401, así que una caída momentánea de BD no cierra la sesión de todos los usuarios. Se registra `auth.revocation_check_failed` sin `jti` ni detalles técnicos.
- Costo: una consulta por clave única indexada por petición autenticada (además de la que ya hacía el middleware para buscar al usuario).
- `req.auth = { jti, exp }` se toma del token **ya verificado**; no se confía en headers manipulables.

### DT-12-06 — Endpoint `POST /api/auth/logout`
Se monta en `auth.routes.js` **sin añadirlo a `PUBLIC_ROUTES`**, por lo que el middleware global exige un JWT válido y no revocado antes de llegar al controlador: una petición sin autenticación no puede revocar nada, y solo se puede revocar el token con el que se hace la petición (el `jti` nunca se lee del cuerpo ni de headers).
*Idempotencia (adaptación a la arquitectura):* un segundo logout con el mismo token ya revocado devuelve **401** (lo rechaza el middleware, comportamiento correcto de «token revocado»), **no crea registros duplicados y no produce 5xx**. A nivel de datos la revocación es idempotente (`createMany` con `skipDuplicates` → `INSERT … ON CONFLICT DO NOTHING`, y restricción `UNIQUE` en `jti`). Se descartó hacer público el logout para devolver siempre 200: permitiría llamadas sin autenticación.
El servicio confirma la persistencia (`estaRevocado`) antes de responder éxito.

### DT-12-07 — Limpieza de expirados
Se creó `tokenRevocadoCleanupScheduler.js` con el **mismo patrón** que `citaCancellationScheduler.js` (sin solapamiento, `unref()`, función de parada) y se arranca/detiene desde `app/server.js` junto al scheduler existente. Intervalo: 1 hora y una ejecución al iniciar. Borra solo `expira_en < ahora`. *Por qué no reutilizar el scheduler de citas:* es específico de citas; mezclarlas acoplaría dos responsabilidades. No se añadieron dependencias (ni `node-cron`).

### DT-12-08 — Frontend
- `AuthContext.logout` pasa a ser `async` y centraliza: `POST /auth/logout` (con *timeout* de 5 s) → limpieza local en `finally` (siempre) → `navigate("/login", { replace: true })` → aviso informativo.
- Protección contra pulsaciones repetidas: bandera `useRef` + estado `cerrandoSesion` (los botones se deshabilitan).
- `api.ts`: nueva opción `omitirManejo401` para que la petición de logout no dispare la limpieza/redirección del interceptor (evita doble limpieza y navegación conflictiva) y una bandera para no repetir `window.location.href` cuando varias peticiones reciben 401 a la vez.
- *Aviso informativo:* no existe sistema de toasts; se reutiliza la clase existente `message message-success` con `role="status"` en `Login.tsx`, alimentado por `avisoSesion` del contexto (no por `location.state`, para evitar una carrera con el `<Navigate>` de `PrivateRoute` cuando el contexto queda sin usuario).
- *Redirección:* antes `/`, ahora `/login` (permitido por el prompt: «página pública o de login») para mostrar el aviso en el lugar donde el usuario vuelve a entrar.
- *Si el backend no responde / error ≠ 401:* se limpia la sesión local igualmente y el aviso lo dice honestamente («no pudimos confirmarlo con el servidor»). Si responde 401 (token ya expirado o revocado) se trata como cierre correcto.

### DT-12-09 — Rutas protegidas
`PrivateRoute.tsx`, `RoleRoute.tsx` y `AppRoutes.tsx` **no se modificaron**: ya dependen de `autenticado`, que `logout` pone en `false` al limpiar el contexto. La protección definitiva sigue en el backend.

## 6. Archivos revisados

| Archivo | Función | Relación con la tarea |
|---|---|---|
| `back/app/utils/jwt.js` | Firma/verificación JWT | Se añade `jti` |
| `back/app/middlewares/identifyUser.js` | Autenticación y roles | Se añade comprobación de revocación |
| `back/app/controllers/auth.controller.js` | Controlador de auth | Se añade `logout` |
| `back/app/services/auth.service.js` | Lógica de auth | Se añaden `logout` y limpieza |
| `back/app/models/auth.model.js` | Acceso a usuarios | Revisado; sin cambios |
| `back/app/models/usuario.model.js` | `findById` usado por el middleware para cargar al usuario | Revisado; sin cambios |
| `back/app/routes/auth.routes.js` | Rutas de auth | Se añade `POST /logout` |
| `back/app/routes/index.js`, `app/app.js` | Montaje de rutas y middlewares | Revisado; confirma que `/api/*` pasa por `identifyUser` |
| `back/app/utils/{AppError,response,logger}.js`, `middlewares/errorHandler.js` | Formato de errores y logs | Reutilizados |
| `back/app/services/citaCancellationScheduler.js`, `app/server.js` | Scheduler existente y arranque | Patrón reutilizado para la limpieza |
| `back/prisma/schema.prisma`, `migrations/*`, `seed.js` (solo se comprobó que no vacía tablas), `baseline-if-existing.js`, `docker-entrypoint.sh` | Esquema, migraciones y despliegue | Nuevo modelo/migración; la migración se aplica con `npm run migrate` |
| `back/tests/**` (setup, helpers, `auth.test.js`, `jwt.test.js`, `auth.service.*.test.js`) | Convenciones de pruebas | Base para las pruebas nuevas |
| `front/src/context/AuthContext.tsx`, `components/Navbar.tsx`, `pages/Perfil.tsx`, `pages/Login.tsx`, `services/api.ts` | Autenticación en la SPA | Modificados |
| `front/src/components/PrivateRoute.tsx`, `RoleRoute.tsx`, `routes/AppRoutes.tsx`, `main.tsx` | Protección de rutas y árbol de proveedores | Revisados; sin cambios (`AuthProvider` está dentro de `BrowserRouter`, lo que permite `useNavigate` en el contexto) |
| `front/src/pages/Registro.tsx` | Registro público | Revisado: no guarda token ni llama a `login()` (solo redirige a `/login`); sin cambios |
| `DOCS_PROYECTO/**` | Documentación existente | Bitácoras de referencia; `API.md` y `README.md` actualizados |

## 7. Vulnerabilidades o problemas encontrados

| # | Ubicación | Descripción | Riesgo | Solución aplicada |
|---|---|---|---|---|
| 1 | `AuthContext.tsx`, `Navbar.tsx`, `Perfil.tsx`; backend sin endpoint | El logout solo limpiaba el navegador; el JWT seguía válido hasta `exp`. | Reutilización de un token copiado después del cierre de sesión (sesión de hasta 8–10 h). | Endpoint `POST /api/auth/logout` + lista de revocación + comprobación en el middleware. |
| 2 | `jwt.js` | Los tokens no tenían identificador único. | Imposible revocar un token concreto sin cerrar todas las sesiones. | `jti` UUID v4 por token. |
| 3 | `Navbar.tsx` / `Perfil.tsx` | Lógica de logout duplicada. | Riesgo de que un lugar quedara sin actualizar. | Función única `logout` en `AuthContext`. |
| 4 | `api.ts` (interceptor 401) | Cada respuesta 401 reasigna `window.location.href`; una petición de logout con 401 provocaría limpieza y navegación propias en conflicto con el contexto. | Redirecciones repetidas/estado inconsistente. | Opción `omitirManejo401` y bandera de redirección única. |

No se registran otras vulnerabilidades: no se auditó el resto del sistema en esta tarea.

## 8. Cambios realizados

| Archivo | Tipo de cambio | Descripción del cambio | Justificación |
|---|---|---|---|
| `back/prisma/schema.prisma` | Modificado | Nuevo modelo `TokenRevocado` (`@@map("token_revocado")`). | Persistir los `jti` revocados. |
| `back/prisma/migrations/20261119200000_token_revocado/migration.sql` | **Nuevo** | `CREATE TABLE`, índice único `token_revocado_jti_key`, índice `token_revocado_expira_en_idx`. Aditiva. | Migración versionada y no destructiva. |
| `back/app/utils/jwt.js` | Modificado | `jwtid: randomUUID()`; comentarios actualizados. | Identificar cada token. |
| `back/app/models/tokenRevocado.model.js` | **Nuevo** | `revocar` (idempotente), `estaRevocado`, `eliminarExpirados`. | Acceso a la lista con el cliente Prisma existente. |
| `back/app/middlewares/identifyUser.js` | Modificado | Exige `jti`/`exp`, consulta revocación con fallo seguro, 401 si revocado, fija `req.auth`. | Rechazar tokens revocados. |
| `back/app/services/auth.service.js` | Modificado | `logout({ jti, exp })` y `limpiarTokensRevocadosExpirados`. | Lógica de negocio fuera del controlador. |
| `back/app/controllers/auth.controller.js` | Modificado | Controlador `logout` (usa `req.auth`; formato `ok()`). | Exponer el endpoint. |
| `back/app/routes/auth.routes.js` | Modificado | `router.post('/logout', controller.logout)`. | Ruta autenticada. |
| `back/app/services/tokenRevocadoCleanupScheduler.js` | **Nuevo** | Limpieza periódica (cada hora). | Evitar crecimiento indefinido de la tabla. |
| `back/app/server.js` | Modificado | Arranca y detiene el scheduler de limpieza en el cierre ordenado. | Integración con el arranque existente. |
| `back/app/config/swagger.js` | Modificado | Documenta `POST /api/auth/logout`. | Swagger en sincronía. |
| `back/scripts/test-endpoints.sh` | Modificado | Paso 21: login → perfil → logout → reutilización → nuevo login. | Prueba manual con curl del flujo de revocación. |
| `back/tests/unit/utils/jwt.test.js` | Modificado | +6 casos (jti UUID v4, unicidad, payload mínimo, expirado, secreto ajeno, `alg: none`). Los 4 originales siguen intactos. | Cobertura de `jti`. |
| `back/tests/unit/models/tokenRevocado.model.test.js` | **Nuevo** | 4 casos con Prisma simulado. | Garantizar `skipDuplicates` y limpieza acotada. |
| `back/tests/unit/services/tokenRevocadoCleanupScheduler.test.js` | **Nuevo** | 4 casos con temporizadores falsos. | Scheduler sin solapamiento, errores sin filtrar datos. |
| `back/tests/integration/cierre-sesion.test.js` | **Nuevo** | 28 casos contra la app y la BD de pruebas (ver sección 11). | Demostrar la revocación real. |
| `front/src/context/AuthContext.tsx` | Modificado | `logout` asíncrono y centralizado; `cerrandoSesion`, `avisoSesion`, `limpiarAvisoSesion`. | Logout contra el backend con limpieza garantizada. |
| `front/src/services/api.ts` | Modificado | Opción `omitirManejo401`; redirección 401 única. | Sin conflictos con el logout ni ciclos. |
| `front/src/components/Navbar.tsx` | Modificado | Usa `logout` del contexto; botón deshabilitado y «Cerrando sesión...»; se retira `useNavigate`. | Un solo flujo, sin solicitudes duplicadas. |
| `front/src/pages/Perfil.tsx` | Modificado | Misma función `logout`; mismo estado del botón. | No crear una segunda implementación. |
| `front/src/pages/Login.tsx` | Modificado | Muestra el aviso «Sesión cerrada correctamente.» (`role="status"`). | Notificación informativa. |
| `front/src/index.css` | Modificado | Regla `.navbar__logout:disabled`. | Indicar visualmente el estado deshabilitado (sin rediseño). |
| `DOCS_PROYECTO/back_DOCUMENTACION/API.md` | Modificado | Fila del endpoint y mensajes 401/503. | Documentación de la API. |
| `DOCS_PROYECTO/back_DOCUMENTACION/README.md` | Modificado | Enlace a esta bitácora. | Hacerla localizable. |
| `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_CIERRE_SESION_INVALIDACION_TOKENS.md` | **Nuevo** | Este documento. | Entregable obligatorio. |

**No se modificaron:** `PrivateRoute.tsx`, `RoleRoute.tsx`, `AppRoutes.tsx`, roles y permisos, `Registro.tsx`, `package.json`/lockfiles (sin dependencias nuevas), `docker-compose*.yml`, `seed.js`.

## 9. Cambios en la base de datos

- **Modelo Prisma:** `TokenRevocado` → tabla `token_revocado`.
- **Campos:** `id_token_revocado` `SERIAL` (PK); `jti` `VARCHAR(64)` `NOT NULL`; `revocado_en` `TIMESTAMPTZ(6)` `NOT NULL DEFAULT CURRENT_TIMESTAMP`; `expira_en` `TIMESTAMPTZ(6)` `NOT NULL`.
- **Restricciones:** `token_revocado_pkey` (PK); `token_revocado_jti_key` (`UNIQUE` sobre `jti`: impide duplicados y sirve de índice de búsqueda del middleware).
- **Índices:** `token_revocado_expira_en_idx` sobre `expira_en` (limpieza).
- **Sin claves foráneas:** a propósito, para no almacenar datos del usuario ni acoplar la tabla a `usuario` (borrar un usuario no debe borrar su auditoría de revocación y viceversa).
- **Migración:** `back/prisma/migrations/20261119200000_token_revocado/migration.sql`, posterior a `20261110190000_cita_cancelacion_audit`. Solo `CREATE TABLE` y `CREATE INDEX`: **no modifica ni elimina datos ni tablas existentes**; compatible con los datos actuales.
- **Comandos que debe ejecutar el equipo** (procedimiento habitual del proyecto):
  ```bash
  cd back
  npm run migrate          # baseline-if-existing + prisma migrate deploy (lo ejecuta también docker-entrypoint.sh)
  npm run prisma:generate  # regenera el cliente (app/generated/prisma); `npm install` ya lo hace en postinstall
  npx prisma migrate status
  ```
- **Resultado de la migración: NO EJECUTADA** (no había PostgreSQL). El SQL se escribió a mano siguiendo la convención de nombres de Prisma y de la migración anterior. **Recomendación:** tras aplicarla, ejecutar `npx prisma migrate status` y, en desarrollo, `npx prisma migrate dev` para confirmar que Prisma no detecta diferencias entre el esquema y la migración.

## 10. Endpoints implementados

### `POST /api/auth/logout` (nuevo)

| Aspecto | Detalle |
|---|---|
| Autenticación | JWT válido, vigente y **no revocado** (cualquier rol) |
| Encabezados | `Authorization: Bearer <token>` |
| Cuerpo | Ninguno (el `jti` se toma del token verificado; cualquier `jti` enviado se ignora) |
| Funcionamiento | `identifyUser` verifica el token → `controller.logout` → `authService.logout` guarda `jti` y `exp` → confirma con `estaRevocado` → responde |

Respuesta exitosa (`200`):
```json
{ "success": true, "message": "Sesión cerrada correctamente", "data": null }
```

| Código | Cuándo | Cuerpo |
|---|---|---|
| `401` | Sin token, token inválido/expirado/sin `jti`, usuario inexistente, o token **ya revocado** (mensaje «La sesión ha sido cerrada. Inicia sesión nuevamente.») | `{ success:false, message, code:"UNAUTHORIZED", details:null }` |
| `503` | No se pudo consultar la lista de revocación (fallo seguro) | `{ success:false, message:"Servicio temporalmente no disponible.", code:"SERVICE_UNAVAILABLE" }` |
| `5xx` | La revocación no pudo persistirse | Formato estándar de error; el token **no** queda revocado |

### Endpoints existentes con comportamiento modificado
Todos los protegidos bajo `/api/*` (vía `identifyUser`): ahora responden `401` a un token revocado o sin `jti`/`exp`, y `503` si no se puede consultar la revocación. `login`, `registro` y `/health` (públicos) no cambian su contrato; los tokens que emiten ahora incluyen `jti`.

## 11. Pruebas realizadas

> **Todas las pruebas automatizadas de esta sección están ESCRITAS pero NO EJECUTADAS** (sin dependencias ni PostgreSQL en el entorno de trabajo). La columna «Resultado obtenido» refleja eso; deben ejecutarse con `cd back && npm test`.

### 11.1 Pruebas de backend — mapa contra los casos exigidos

| Caso exigido | Archivo | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| Login correcto genera JWT con JTI | `integration/cierre-sesion.test.js` (+ `unit/utils/jwt.test.js`) | 200, `jti` UUID v4, `id`, `rol`, `iat`, `exp`, sin contraseña | No ejecutado | Pendiente |
| Logout correcto registra el token como revocado | `integration/cierre-sesion.test.js` | 200; fila en `token_revocado` con `expira_en = exp*1000`; el JWT completo no aparece en ninguna columna | No ejecutado | Pendiente |
| Reutilización de token revocado | `integration/cierre-sesion.test.js` | 401 + mensaje «La sesión ha sido cerrada…» (en `/perfil` y en `/mascotas`) | No ejecutado | Pendiente |
| Token expirado | `integration/cierre-sesion.test.js`, `unit/utils/jwt.test.js` | 401 | No ejecutado | Pendiente |
| Token mal firmado | ambos | 401 | No ejecutado | Pendiente |
| Petición sin token | `integration/cierre-sesion.test.js` (+ `auth.test.js` existente) | 401 | No ejecutado | Pendiente |
| Token sin JTI | `integration/cierre-sesion.test.js` | 401 (también sin `exp`, `jti` > 64 caracteres y `alg: none`) | No ejecutado | Pendiente |
| Token válido y no revocado | `integration/cierre-sesion.test.js` | 200 | No ejecutado | Pendiente |
| Usuario inexistente | `integration/cierre-sesion.test.js` | 401 «El usuario del token ya no existe.» | No ejecutado | Pendiente |
| Error al consultar revocaciones | `integration/cierre-sesion.test.js` | 503, sin `data`, evento `auth.revocation_check_failed`; el token sigue sirviendo al recuperarse la BD | No ejecutado | Pendiente |
| Fallo al persistir la revocación | `integration/cierre-sesion.test.js` | ≥500, sin fila creada | No ejecutado | Pendiente |
| Revocación repetida | `integration/cierre-sesion.test.js` | 2.º logout 401, una sola fila; `revocar` dos veces → `true`/`false`, una fila | No ejecutado | Pendiente |
| Dos sesiones del mismo usuario | `integration/cierre-sesion.test.js` | Revocar A → A 401 y B 200 | No ejecutado | Pendiente |
| Logout sin autenticación / revocar token ajeno | `integration/cierre-sesion.test.js` | 401 y sin filas nuevas; un `jti` ajeno en cuerpo o header se ignora | No ejecutado | Pendiente |
| Roles (regresión) | `integration/cierre-sesion.test.js` | Admin 200 / usuario 403 en `/api/usuarios/personal`; rol salido de la BD, no del payload; admin tras logout → 401 | No ejecutado | Pendiente |
| Limpieza de expirados | `integration/cierre-sesion.test.js`, `unit/models/tokenRevocado.model.test.js`, `unit/services/tokenRevocadoCleanupScheduler.test.js` | Solo se borran `expira_en < ahora`; el token vigente revocado sigue rechazado | No ejecutado | Pendiente |

Total de casos nuevos escritos: 28 (integración) + 4 (modelo) + 4 (scheduler) + 6 (JWT) = **42**. Las pruebas existentes no se modificaron (salvo la ampliación de `jwt.test.js`, que conserva los 4 casos originales); `auth.service.security.test.js` mockea `jwt.js` solo con `generarToken` y no se ve afectado porque `auth.service.js` no importa nada más de ese módulo.

### 11.2 Pruebas de frontend (manuales; el proyecto no tiene framework de pruebas de frontend)

| Comprobación | Resultado esperado | Estado |
|---|---|---|
| Cerrar sesión desde Navbar | Una sola petición `POST /auth/logout`, limpieza de `localStorage`, redirección a `/login`, aviso «Sesión cerrada correctamente.» | **No ejecutada** |
| Cerrar sesión desde Perfil | Idéntico (misma función del contexto) | **No ejecutada** |
| Doble clic rápido | Un solo `POST` (botón deshabilitado + bandera `useRef`) | **No ejecutada** |
| Backend apagado | Sale tras ≤5 s, limpia local, aviso «no pudimos confirmarlo con el servidor» | **No ejecutada** |
| Token ya expirado/revocado | 401 en logout tratado como cierre correcto, sin doble redirección | **No ejecutada** |
| Token revocado y navegar a otra página | La API responde 401 → el interceptor limpia y redirige una sola vez | **No ejecutada** |
| Consola sin errores | — | **No ejecutada** |

### 11.3 Prueba de integración manual (Postman / curl)

Procedimiento definido (no ejecutado): 1) `POST /api/auth/login`, copiar `data.token`; 2) `GET /api/auth/perfil` con ese token → 200; 3) `POST /api/auth/logout` → 200; 4) volver a usar **el mismo token** en `GET /api/auth/perfil` desde Postman → debe dar **401** «La sesión ha sido cerrada…»; 5) iniciar sesión de nuevo → el token nuevo da 200. El paso 21 de `back/scripts/test-endpoints.sh` automatiza esta secuencia con curl (solo se verificó su sintaxis con `bash -n`). **Estado: pendiente de ejecución.**

## 12. Resultados de ejecución

| Comprobación | Resultado real |
|---|---|
| Pruebas unitarias / integración / seguridad (backend) | **No ejecutadas** (sin `node_modules`, sin red, sin PostgreSQL). 0 ejecutadas, 0 aprobadas, 0 fallidas. |
| Migración Prisma | **No ejecutada** |
| `npm run type-check` (frontend) | **No ejecutado.** Sin `react`, `axios` ni `@types`, `tsc` no puede resolver módulos. Un `tsc --ignoreConfig` parcial sobre los 5 archivos solo reportó errores atribuibles a esas ausencias (módulos no encontrados, `any` implícito derivado de ellos y `import.meta.env`), pero **no es un type-check válido y no se da por aprobado**. |
| `npm run build` (frontend) | **No ejecutado** |
| Lint | No hay `lint` configurado en el backend; el del frontend (`eslint .`) no se ejecutó. |
| **Sí ejecutado:** sintaxis backend | `node --check` OK en `jwt.js`, `identifyUser.js`, `auth.service.js`, `auth.controller.js`, `auth.routes.js`, `tokenRevocado.model.js`, `tokenRevocadoCleanupScheduler.js`, `server.js`, `swagger.js` y los 4 archivos de pruebas nuevos o ampliados. |
| **Sí ejecutado:** sintaxis frontend | `esbuild` transformó sin errores `AuthContext.tsx`, `api.ts`, `Navbar.tsx`, `Perfil.tsx` y `Login.tsx`. |
| **Sí ejecutado:** script | `bash -n back/scripts/test-endpoints.sh` OK. |

Una verificación de sintaxis no demuestra que el comportamiento sea correcto.

**Comandos para completar la validación:**
```bash
cd back  && npm install && npm run migrate && npm test
cd ../front && npm install && npm run type-check && npm run build
cd ../back && npm run dev     # y luego: bash scripts/test-endpoints.sh
```
Actualizar esta sección con los resultados reales. Referencia histórica (no es resultado de esta tarea): la bitácora de límite de intentos registró 24 archivos y 336 pruebas aprobadas antes de estos cambios.

## 13. Comparación antes y después

| Característica | Antes | Después |
|---|---|---|
| Cierre de sesión | Solo limpieza local | `POST /api/auth/logout` (revocación en servidor) y limpieza local |
| Token revocado | Seguía válido hasta `exp` | Rechazado con 401 por el middleware |
| Verificación en cada petición | Firma, expiración, usuario en BD | Firma, expiración, `jti`/`exp` presentes, **revocación**, usuario en BD |
| Contenido del JWT | `id`, `rol`, `iat`, `exp` | `id`, `rol`, **`jti`**, `iat`, `exp` |
| Persistencia | Sin lista de revocación | Tabla `token_revocado` (PostgreSQL + Prisma) |
| Varias sesiones del mismo usuario | No aplicaba | Revocación independiente por `jti` |
| Fallo de BD al verificar | No aplicaba | Fallo seguro (503; no autoriza) |
| Lógica de logout en la SPA | Duplicada en Navbar y Perfil | Una sola función en `AuthContext` |
| Pulsaciones repetidas | Sin control | Un solo logout en curso; botones deshabilitados |
| Backend caído al salir | Salía (solo local) | Sale igualmente (máx. 5 s) y avisa que no se pudo confirmar |
| Destino tras cerrar sesión | `/` | `/login` con aviso |
| Tokens antiguos (sin `jti`) | Válidos | Rechazados: hay que iniciar sesión de nuevo (una vez) |
| Limpieza de registros | No aplicaba | Scheduler cada hora; borra solo expirados |

## 14. Impacto y compatibilidad

| Área | Impacto |
|---|---|
| Login | Contrato igual; el token ahora trae `jti`. |
| Registro (público y admin) | Igual; el token entregado también trae `jti`. |
| Perfil | Botón usa la función central; muestra «Cerrando sesión...» mientras corre. |
| Navbar | Igual en diseño; mismo comportamiento del botón. |
| Rutas protegidas / roles | Sin cambios de código ni de permisos; el rol sigue leyéndose de la BD. |
| Endpoints existentes | Mismas rutas y formatos; ahora 401 ante token revocado o sin `jti`. |
| PostgreSQL | Una tabla nueva y dos índices; migración aditiva; una lectura indexada extra por petición autenticada. |
| Frontend | Sin dependencias nuevas; `omitirManejo401` es opcional y no afecta al resto de peticiones. |
| Despliegue | `docker-entrypoint.sh` ya ejecuta `npm run migrate`, que aplicará la nueva migración. **Efecto visible:** al desplegar, las sesiones abiertas con tokens antiguos se cierran una vez (no tienen `jti`). |

Se mantuvo la compatibilidad funcional, con la única excepción deliberada de los tokens previos sin `jti`.

## 15. Seguridad y consideraciones

**Qué protege:** el servidor ya no acepta un token revocado aunque la firma y la fecha sigan siendo válidas; la lista guarda solo `jti` y fechas (sin JWT, usuario, rol ni datos personales); los logs no incluyen `jti`, tokens ni errores técnicos; `jti` y `exp` salen del token firmado, nunca de headers manipulables; `alg: none`, secretos ajenos, tokens sin `jti`/`exp` o con `jti` desproporcionado se rechazan; la verificación falla cerrada.

**Limitaciones que permanecen:**
1. El token sigue en `localStorage`: un ataque XSS podría robarlo *antes* del logout (esta tarea no cambia el almacenamiento).
2. Otras pestañas del navegador conservan el estado en memoria hasta su siguiente petición (que recibirá 401 y las redirigirá). No se añadió sincronización por evento `storage`.
3. No existe «cerrar todas las sesiones» ni revocación al cambiar la contraseña (no hay endpoint de cambio de contraseña en el alcance revisado).
4. Si el backend no responde durante el logout, el token **no** queda revocado en el servidor (se informa al usuario); seguirá válido hasta `exp`.
5. Una consulta adicional por petición; si el volumen lo justificara, podría evaluarse una caché con invalidación (no implementada).
6. La limpieza es por instancia: con varias réplicas todas ejecutan el mismo `DELETE` inocuo e idempotente.

## 16. Estado final de la tarea

**IMPLEMENTADA PARCIALMENTE.**

| Criterio de aceptación | Estado | Evidencia |
|---|---|---|
| JWT con identificador único | Implementado (sin ejecutar) | `jwt.js`; sintaxis verificada |
| Mecanismo persistente de revocación | Implementado (sin ejecutar) | modelo, esquema, migración |
| La migración funciona | **No verificado** | No se pudo ejecutar |
| `POST /api/auth/logout` | Implementado (sin ejecutar) | ruta, controlador, servicio |
| El backend registra y el middleware rechaza revocados con 401 | Implementado (sin ejecutar) | `identifyUser.js` |
| Tokens válidos y sesiones independientes siguen funcionando | **No verificado** | Pruebas escritas, no ejecutadas |
| Frontend ejecuta el logout; Navbar y Perfil comparten flujo | Implementado (sin ejecutar) | `AuthContext.tsx`, `Navbar.tsx`, `Perfil.tsx` |
| Autorización por roles intacta | Sin cambios de código; **regresión no ejecutada** | — |
| Pruebas automatizadas pasan o fallos documentados | **No ejecutadas** | Sección 12 |
| Reutilización del token desde Postman | **No ejecutada** | Sección 11.3 |
| `type-check` y `build` | **No ejecutados** | Sección 12 |
| Bitácora e índice documental | Completados | Este archivo y `back_DOCUMENTACION/README.md` |

No se marca como «Implementada» porque las comprobaciones que demostrarían el comportamiento no se ejecutaron. Pasa a «Implementada» cuando el equipo complete la sección 12 sin fallos.

## 17. Observaciones y trabajo pendiente

1. Ejecutar migración, `npm test`, `type-check`, `build` y la prueba con Postman, y registrar los resultados reales en la sección 12. Si alguna prueba falla, documentar la causa (no se debe debilitar la prueba).
2. Verificar con `prisma migrate dev`/`migrate status` que el SQL escrito a mano coincide con el esquema.
3. Regenerar el cliente Prisma (`npm run prisma:generate`) antes de arrancar: el cliente generado (`back/app/generated/prisma`) no forma parte del ZIP.
4. Comunicar el efecto de despliegue: una sola reautenticación para quien tenga sesión abierta.
5. Mejoras opcionales: sincronización entre pestañas (`storage`), revocación de todas las sesiones de un usuario, mover el token a una cookie `HttpOnly`, y pruebas automatizadas de frontend (hoy no hay framework).
6. Si el proyecto crece a varias réplicas con carga alta, evaluar una caché de corta duración para la consulta de revocación.
