# Bitácora de encriptación de contraseñas

**Responsable:** Sara jasmin cruz calderon

**Proyecto:** Huellitas Saludables — backend Node.js (ESM), Express, Prisma ORM 7 ESM y PostgreSQL.

**Fecha de elaboración:** 08/11/2026 

---

## 1. Resumen

| Aspecto | Estado actual |
|---|---|
| Algoritmo | **scrypt** (módulo nativo `crypto` de Node.js; sin dependencias externas) |
| Salt | 16 bytes aleatorios por contraseña (`crypto.randomBytes`) |
| Parámetros | N = 16384, r = 8, p = 1, longitud de clave = 64 bytes |
| Formato guardado | `scrypt$N$r$p$salt_base64$hash_base64` |
| Columna | `usuario.contrasena` `VARCHAR(255)` (el hash ocupa unos 130 caracteres) |
| Comparación | `crypto.timingSafeEqual` (tiempo constante) |
| Migración de claves antiguas | Automática en el primer login correcto (texto plano → scrypt) |
| Archivo principal | `back/app/utils/password.js` |

---

## 2. Punto de partida (antes del cambio)

El registro de auditoría `docs/backend/Decisiones Técnicas — Huellitas Saludables (Backend).md` documentó el estado anterior como **riesgo alto**:

- `auth.service.js` comparaba contraseñas como texto plano.
- El valor recibido se registraba sin hash.
- Los comentarios del código sugerían bcrypt, pero no estaba implementado.
- Los INSERT de `database/data_jesus/3.INSERTAR_USUARIOS.sql` guardaban las claves en claro.


---

## 3. Decisión técnica: por qué scrypt

- **Es una función de derivación de claves con costo de memoria**, diseñada para encarecer ataques de fuerza bruta con hardware especializado.
- **Viene incluida en Node.js** (`crypto.scrypt`), así que no se añade ni se mantiene una dependencia como `bcrypt` (que requiere compilación nativa) o `argon2`.
- Es **asíncrona** (`crypto.scrypt` con callback envuelto en `Promise`), por lo que no bloquea el event loop durante el cálculo.



---

## 4. Cómo funciona

### 4.1 Encriptar al registrar (`hashContrasena`)

1. Valida que la contraseña sea un texto no vacío y de **máximo 1024 bytes** (en UTF-8). Si no, lanza `TypeError`.
2. Genera un **salt aleatorio de 16 bytes**.
3. Deriva una clave de 64 bytes con scrypt (N=16384, r=8, p=1, `maxmem` = 64 MB).
4. Devuelve la cadena `scrypt$16384$8$1$<salt base64>$<hash base64>`.

Se usa en tres lugares:

| Flujo | Archivo |
|---|---|
| Registro de usuario | `auth.service.js` → `registro()` |
| Registro por administrador | `auth.service.js` → `registroAdmin()` |
| Datos de demostración | `prisma/seed.js` |

### 4.2 Verificar al iniciar sesión (`verificarContrasena`)

1. Rechaza entradas inválidas (contraseña vacía o >1024 bytes; valor guardado vacío o >255 caracteres).
2. Si el valor guardado **no empieza por `scrypt$`**, se trata como contraseña antigua en texto plano y se compara de forma segura (ver sección 5).
3. Si es scrypt, `parsearHash` valida el formato **estricto** y recalcula la clave con el mismo salt y parámetros.
4. Compara con `timingSafeEqual`. Cualquier error devuelve `false` sin lanzar excepción.

### 4.3 Validaciones del formato (`parsearHash` / `esHashScrypt`)

El hash guardado se rechaza si:

- no tiene exactamente 6 partes separadas por `$`;
- el algoritmo no es `scrypt`;
- N, r o p no son enteros canónicos o **no coinciden con los parámetros soportados** (evita que un valor manipulado en la base fuerce un costo de CPU/memoria arbitrario);
- el salt no decodifica a exactamente 16 bytes, o el hash a 64 bytes;
- el Base64 no es canónico (se re-codifica y se compara).

---

## 5. Compatibilidad temporal y migración automática

Para no dejar fuera a usuarios con contraseñas antiguas en texto plano:

1. En `login()`, `verificarContrasena` acepta el valor en claro (comparación SHA-256 + `timingSafeEqual`, para no filtrar información por tiempo).
2. Si el login es correcto y el valor guardado **no** es scrypt, se calcula un hash nuevo y se guarda con `authModel.updatePassword`.
3. La migración es *best-effort*: si falla, **no bloquea** el login ya verificado; solo se registra un error genérico, sin datos sensibles.

El código deja una nota para retirar esta compatibilidad **solo después de una migración verificable** que confirme que no quedan valores sin formato scrypt.

---

## 6. Defensa en la capa de datos

`back/app/models/auth.model.js` impide guardar una contraseña sin hash aunque un servicio lo intente:

- `create()` lanza `TypeError('La contraseña debe ser un hash scrypt válido')` si el valor no es scrypt.
- `updatePassword()` aplica la misma guarda.
- `findById` consulta solo los atributos públicos (`ATTRS_PUBLICOS`), así que nunca carga `contrasena`.
- `create`, `updateTipo` y `updateEspecializacion` devuelven el usuario sin `contrasena`.
- `findByEmail` es el **único** método que la incluye, porque la necesita el login; el servicio la elimina antes de responder.

Además, `auth.service.js` y `auth.controller.js` quitan `contrasena` de cualquier respuesta (`login`, `registro`, `registroAdmin`, perfil).

---

## 7. Datos de demostración

- El seeder JS aplica `hashContrasena` a cada usuario antes de insertarlo. Las claves demo siguen siendo de uso exclusivo para pruebas (el login de demostración es `123456`, según `Bitacora_Integracion_Front_PRO.md`).
- `database/data_jesus/3.INSERTAR_USUARIOS.sql` **sigue con contraseñas sin hash**; el archivo lo advierte en sus comentarios y recomienda usar el seeder JS. Esos usuarios se migran solos en su primer login.

---

## 8. Pruebas que cubren el cambio

| Archivo | Qué verifica |
|---|---|
| `tests/unit/utils/password.test.js` | Hash scrypt verificable y compatible con `VARCHAR(255)`; salts distintos para la misma clave; rechazo de claves vacías o >1024 bytes; clave incorrecta; formatos inválidos sin lanzar; parámetros no soportados; compatibilidad con texto plano; `esHashScrypt`. |
| `tests/unit/services/auth.service.security.test.js` | Login con hash válido sin devolver la contraseña; clave incorrecta; migración tras login; login aunque falle la actualización; no se informa éxito si `updatePassword` no actualiza; `registro` y `registroAdmin` guardan hash y no el texto original. |
| `tests/unit/models/auth.model.test.js` | El modelo rechaza valores que no sean hash scrypt al crear o actualizar y acepta hashes válidos. |
| `tests/integration/auth.test.js` y afines | Flujos de registro y login contra la API. |

Se ejecutan con Vitest (`npm test` en `back/`). Esta bitácora no incluye un resultado de ejecución reciente; conviene correr la suite antes de entregar.

---

## 9. Pendientes y recomendaciones

1. **Retirar la compatibilidad con texto plano** una vez confirmado que todas las filas de `usuario.contrasena` empiezan por `scrypt$` (por ejemplo, `SELECT count(*) FROM usuario WHERE contrasena NOT LIKE 'scrypt$%';` debe dar 0).
2. **Política de contraseñas:** los esquemas Joi (`auth.schema.js`) solo exigen `min(4)`. Para un despliegue real conviene subir el mínimo (p. ej. 8–12 caracteres) y valorar reglas de complejidad.
3. **Rehash por parámetros:** hoy cualquier hash con N/r/p distintos se rechaza. Si en el futuro se aumenta el costo, habrá que aceptar los parámetros anteriores y re-hashear en el login.
4. **Secreto JWT:** no está relacionado con el hash, pero sigue señalado en la auditoría: en producción debe fallar el arranque si falta un `JWT_SECRET` fuerte.
5. **Limitación de intentos:** no se encontró en el código revisado un límite de intentos de login (rate limiting) ni bloqueo de cuenta; scrypt encarece cada intento, pero no lo sustituye.
6. **Datos SQL de ejemplo:** no usar `3.INSERTAR_USUARIOS.sql` en entornos expuestos.

---

## 10. Archivos relacionados

- `back/app/utils/password.js` — hash, verificación y validación del formato.
- `back/app/services/auth.service.js` — login, registro, registro admin y migración.
- `back/app/models/auth.model.js` — guardas que exigen hash scrypt.
- `back/app/schemas/auth.schema.js` — validación de entrada.
- `back/prisma/seed.js` — usuarios demo hasheados.
- `back/prisma/migrations/0_init/migration.sql` — columna `contrasena STRING(255)`.
- `docs/backend/Decisiones Técnicas — Huellitas Saludables (Backend).md` — auditoría del estado anterior.

Conclusion: Es adelanto, por lo tanto esta parte va en proceso.
