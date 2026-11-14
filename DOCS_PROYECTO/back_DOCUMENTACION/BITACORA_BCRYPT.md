# Bitácora — Seguridad BCRYPT

**Proyecto:** Huellitas Saludables — backend Node.js (ESM), Express, Prisma ORM 7 y PostgreSQL.

**Fecha:** 10/11/2026

**Responsable:** Sara Jasmin Cruz Calderon

---

## 1. Nombre del cambio

Implementación de Bcrypt para protección de contraseñas.

## 2. Descripción del problema

Las contraseñas se almacenaban y comparaban en texto plano, exponiendo las credenciales de los usuarios ante una posible filtración de la base de datos.

Estado encontrado al analizar el proyecto antes del cambio:

| Punto | Situación encontrada |
|---|---|
| Algoritmo | scrypt (`crypto` nativo) en `back/app/utils/password.js`; no se usaba bcrypt. |
| Login | `verificarContrasena()` aceptaba valores **en texto plano** guardados en la base (comparación SHA-256 + `timingSafeEqual`) como "compatibilidad temporal". |
| Script SQL de datos demo | `database/3.INSERTAR_USUARIOS.sql` insertaba 17 usuarios con la contraseña `123456` **en texto plano**. |
| Límite de longitud | El registro aceptaba hasta 255 caracteres; bcrypt solo procesa 72 bytes. |
| Enumeración de usuarios | Con un correo inexistente el login respondía sin calcular ningún hash (más rápido que con un correo real). |
| Respuestas de la API | Ya eliminaban `contrasena` (se mantuvo y se añadieron pruebas). |

## 3. Objetivo

Proteger las contraseñas mediante hashing seguro con bcrypt: ninguna contraseña en texto plano, salt generado por bcrypt, 12 rondas, validación con `bcrypt.compare()` y ningún hash expuesto por la API, sin romper registro, login, JWT, roles ni permisos.

## 4. Dependencias instaladas

| Paquete | Versión | Dónde |
|---|---|---|
| `bcrypt` | `^6.0.0` (instalada 6.0.0) | `back/package.json` → `dependencies` |

`bcrypt` 6 incluye binarios precompilados para Linux glibc y **musl** (x64 y arm64), por lo que funciona en la imagen `node:22-alpine` del `Dockerfile` sin herramientas de compilación. Arrastra `node-addon-api` y `node-gyp-build` (actualizado en `back/package-lock.json`).

## 5. Archivos modificados

| Archivo | Cambio |
|---|---|
| `back/app/utils/password.js` | Reescrito con bcrypt: `hashContrasena`, `verificarContrasena`, `simularVerificacion`, `esHashBcrypt`, `necesitaRehash`, `clasificarContrasenaGuardada`. scrypt queda solo como verificación heredada. Se eliminó la comparación de texto plano. |
| `back/app/services/auth.service.js` | `login()` usa `verificarContrasena` (bcrypt.compare), re-hashea a bcrypt cuando corresponde, iguala el tiempo con correo inexistente y registra (sin datos) las cuentas con texto plano pendiente. `registro()` y `registroAdmin()` sin cambios de lógica: ya llamaban a `hashContrasena`, que ahora es bcrypt. |
| `back/app/models/auth.model.js` | Las guardas de `create()` y `updatePassword()` exigen un hash **bcrypt** válido; cualquier otro valor lanza `TypeError`. |
| `back/app/schemas/auth.schema.js` | Contraseña nueva (registro y registro-admin): `min(4)` y **máximo 72 bytes UTF-8** (`max(72, 'utf8')`). El login no cambia. |
| `back/package.json` / `back/package-lock.json` | Dependencia `bcrypt` y script `passwords:migrate`. |
| `back/.env.example` | Variable opcional documentada `BCRYPT_SALT_ROUNDS` (por defecto 12). |
| `database/3.INSERTAR_USUARIOS.sql` | Las 17 contraseñas `'123456'` se reemplazaron por hashes bcrypt de 12 rondas (uno distinto por usuario). La contraseña demo sigue siendo `123456`. |
| `back/Readme.md`, `Readme.md`, `docs/test/README.md`, `docs/back/Bitacora_Encriptacion_Contrasenas.md` | Documentación actualizada. |

Archivos creados:

| Archivo | Propósito |
|---|---|
| `back/app/services/migracionContrasenas.service.js` | Lógica de análisis/migración de contraseñas almacenadas. |
| `back/prisma/migrar-contrasenas-bcrypt.js` | Comando `npm run passwords:migrate`. |
| `back/tests/unit/services/migracionContrasenas.service.test.js` | Pruebas de la migración. |
| `back/tests/integration/seguridad-bcrypt.test.js` | Pruebas de extremo a extremo contra PostgreSQL. |

`back/prisma/seed.js` **no se modificó**: ya llamaba a `hashContrasena()`, que ahora produce bcrypt.

## 6. Cambios realizados

### 6.1 Hashing (registro, registro-admin y semilla)

```js
const salt = await bcrypt.genSalt(12);   // salt aleatorio generado por bcrypt
return bcrypt.hash(contrasena, salt);    // "$2b$12$<salt 22><hash 31>" (60 caracteres)
```

- **Rondas:** 12 por defecto. `BCRYPT_SALT_ROUNDS` permite 10–15; cualquier valor fuera de ese rango se ignora y se usan 12 (nunca menos de 10).
- **Salt:** distinto en cada hash, incluido dentro del propio hash.
- **Límite de 72 bytes:** bcrypt ignora lo que sigue al byte 72. Para que dos contraseñas distintas no compartan hash se rechaza en la API (400, "La contraseña no puede exceder 72 caracteres.") y en `hashContrasena` (`TypeError`).
- Se conservan las reglas existentes: sin espacios, no vacía.
- Solo se guarda el hash: el modelo rechaza cualquier valor que no tenga formato bcrypt.

### 6.2 Inicio de sesión

1. Se busca el usuario con el mecanismo existente (`authModel.findByEmail`).
2. Si no existe, se ejecuta un `bcrypt.compare` contra un hash ficticio (mismo costo) y se responde 401 con el mensaje genérico de siempre.
3. Si el valor guardado es bcrypt → `bcrypt.compare(contrasena, hash)`.
4. Si es un hash scrypt heredado → se verifica con scrypt (solo para no dejar sin acceso a esos usuarios).
5. Si es texto plano u otro formato → **se rechaza** (401); no hay comparación de contraseñas en texto plano.
6. Si el login es correcto y `necesitaRehash()` es verdadero (scrypt o bcrypt con menos de 12 rondas) → se guarda un nuevo hash bcrypt. Si esa actualización falla, el login continúa y se registra un evento sin datos sensibles.
7. JWT, roles, permisos y la forma de la respuesta (`{ usuario, token }`) no cambian.

### 6.3 Respuestas de la API

`login`, `registro`, `registro-admin`, `perfil` y los listados de usuarios siguen sin incluir `contrasena`; ahora hay pruebas que verifican que ningún cuerpo de respuesta contenga `$2a$`/`$2b$`/`$2y$` ni la contraseña enviada.

## 7. Migración de datos

| Formato encontrado en `usuario.contrasena` | Procedimiento | ¿Se pierde el acceso? |
|---|---|---|
| bcrypt | Ninguno. | No |
| scrypt (versión anterior) | No se puede convertir sin la contraseña original (es irreversible). Se migra **automáticamente** a bcrypt en el siguiente login correcto. | No |
| Texto plano | Comando `npm run passwords:migrate`: hashea cada valor con bcrypt y guarda solo el hash. No imprime contraseñas ni hashes. | No (tras ejecutar el comando) |
| Vacío, con espacios o > 72 bytes | No se puede proteger con bcrypt de forma segura: el comando no lo toca y lista su `id_usuario` en `requieren_restablecimiento` para que se le asigne una contraseña nueva. | Requiere restablecimiento |

Uso del comando (desde `back/`):

```bash
# 1) Respaldo previo (ejemplo)
pg_dump -t usuario "$DATABASE_URL" > respaldo_usuario.sql

# 2) Análisis: solo cuenta, no modifica nada
npm run passwords:migrate

# 3) Aplicar: exige confirmar que existe respaldo
npm run passwords:migrate -- --aplicar --confirmo-respaldo

# 4) Comprobación (debe devolver 0 cuando no queden scrypt pendientes)
SELECT count(*) FROM usuario WHERE contrasena !~ '^\$2[aby]\$';
```

Medidas de seguridad del procedimiento:

- Sin `--aplicar` no modifica datos; con `--aplicar` pero sin `--confirmo-respaldo` termina con código 1 sin tocar nada.
- Cada actualización es condicional (`WHERE id_usuario = ? AND contrasena = <valor anterior>`), así no pisa un cambio concurrente.
- No es destructiva para el acceso: el usuario entra con la misma contraseña de antes.
- La salida solo contiene conteos e IDs.

Si alguna base se cargó con la versión anterior de `3.INSERTAR_USUARIOS.sql` (texto plano), esos usuarios recibirán 401 hasta ejecutar el comando; el backend registra el evento `auth.password_plaintext_pending_migration` para detectarlo.

## 8. Pruebas realizadas

Entorno: PostgreSQL 17 local, Node.js 22, Vitest 4.1.12, base de pruebas `proyectohs_test` creada y eliminada por la propia suite.

| Archivo | Pruebas | Qué verifica |
|---|---|---|
| `tests/unit/utils/password.test.js` | 16 | Formato `$2b$12$`, 60 caracteres, 12 rondas; salt distinto; mínimo 10 rondas aunque se configure menos; rechazo de > 72 bytes y de espacios; `bcrypt.compare` usado; contraseña correcta/incorrecta; **texto plano rechazado**; cargas `'OR'1'='1` como datos; formatos inválidos sin lanzar; verificación y re-hash de scrypt heredado. |
| `tests/unit/services/auth.service.security.test.js` | 10 | Login sin exponer contraseña/hash; 401 con contraseña incorrecta; scrypt → bcrypt tras login; login aunque falle el re-hash; correo inexistente con verificación ficticia; texto plano rechazado sin re-hash y sin registrar la contraseña; bcrypt vigente no se re-hashea; registro y registro-admin guardan hash. |
| `tests/unit/models/auth.model.test.js` | 4 | El modelo rechaza guardar valores que no sean bcrypt. |
| `tests/unit/services/migracionContrasenas.service.test.js` | 4 | Simulación sin cambios; migración a bcrypt verificable; casos no migrables reportados; no pisa cambios concurrentes. |
| `tests/integration/seguridad-bcrypt.test.js` | 7 | Semilla 100 % bcrypt; registro guarda hash y se puede iniciar sesión; contraseña incorrecta 401; > 72 bytes 400; registro-admin guarda hash; perfil y listados sin hashes; usuario scrypt entra y queda en bcrypt; usuario en texto plano 401 → migración → 200. |
| `tests/integration/auth.test.js` y `tests/unit/services/auth.service.test.js` (existentes) | 24 + 7 | Flujos de login/registro/perfil sin cambios de contrato. |

Además se ejecutó manualmente el comando de migración contra la base de pruebas con un usuario en texto plano insertado a mano: la simulación reportó 1 pendiente, `--aplicar` sin confirmación terminó con código 1 sin cambios, y con `--confirmo-respaldo` migró 1 registro (`$2b$12$…`, 60 caracteres); la consulta de comprobación devolvió 0. También se verificó que los 17 hashes de `3.INSERTAR_USUARIOS.sql` validan `123456` con `bcrypt.compare` y son distintos entre sí.

## 9. Resultados

| Ejecución | Resultado |
|---|---|
| Suite completa antes del cambio (línea base) | 18 archivos, **249/249** pruebas correctas |
| Suite completa después del cambio (`npm test`) | 23 archivos, **320/320** pruebas correctas |
| Pruebas con problemas | Ninguna en la ejecución final |

Problemas encontrados y corregidos durante el trabajo: los datos simulados de algunas pruebas usaban un hash scrypt con longitud inválida; se reemplazaron por hashes scrypt reales.

## 10. Estado final

**Implementado.**

Pendientes fuera del alcance de este cambio:

1. Ejecutar `npm run passwords:migrate` en cada base existente (desarrollo/producción) después de hacer el respaldo.
2. El proyecto no tiene un flujo de "olvidé mi contraseña" ni un endpoint para que un administrador cambie la contraseña de otro usuario; los IDs que el comando liste en `requieren_restablecimiento` deben atenderse manualmente (no apareció ninguno en las bases de prueba).
3. El frontend no limita la contraseña a 72 caracteres; si alguien envía más, la API responde 400 con un mensaje claro. No se modificó el frontend.
4. Siguen abiertos los riesgos ya documentados en `Readme.md` (límite de intentos de login, `JWT_SECRET` por defecto).
