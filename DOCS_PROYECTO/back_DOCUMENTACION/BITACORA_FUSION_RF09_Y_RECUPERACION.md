# Bitácora — fusión de RF09 (avisos in-app) y recuperación de contraseña

> **Vigencia histórica:** se conservan las pruebas, pendientes y cantidades de migraciones registrados en la fecha de esta bitácora. Algunos pendientes (como filtros por propietario) han cambiado desde entonces. Para el comportamiento actual, consulta [`API.md`](./API.md), [`ARQUITECTURA.md`](./ARQUITECTURA.md) y [`DESARROLLO.md`](./DESARROLLO.md); la cifra de pruebas vigente consignada es 410/410 en 31 archivos, no el resultado histórico de abajo.

**Fecha:** 23 de noviembre de 2026
**Rama de trabajo:** `PRO_HUELLITAS_SALUDABLES`
**Motivo:** existían dos entregas parciales del mismo proyecto y ninguna reunía todas las funcionalidades.

## 1. Punto de partida

| Entrega | Qué tenía | Qué le faltaba |
|---|---|---|
| Versión del 23/11 (mañana) — `Huellitas_Saludables_PRO.zip` | Recuperación de contraseña completa: `password_reset_token`, servicios `passwordReset` y `passwordResetEmail`, tres rutas públicas, Swagger, pruebas unitarias y variables SMTP. Backend duplicado en la raíz (`app/`, `prisma/`, `tests/`) y copia desactualizada en `back/`. | RF09 real: las notificaciones solo se escribían en el log. |
| Versión del 23/11 (tarde) — `Huellitas_Saludables_PRO_RF09_actualizado.zip` | RF09 completo: modelo `Notificacion`, migración, controlador, rutas, servicio persistente, pantalla `Notificaciones.tsx` y pruebas de integración. Estructura limpia (`back/` + `front/`). | Recuperación de contraseña: sin tabla, sin servicios, sin rutas, sin `nodemailer`. |

Ninguna de las dos era un superconjunto de la otra; se descartó "elegir una y descartar la otra" porque se perdía una funcionalidad evaluable en ambos casos.

## 2. Decisión de estructura

Se tomó como base la **versión de la tarde** porque ya usa la estructura definitiva del repositorio (`back/`, `front/`, `DOCS_PROYECTO/`) y porque su RF09 está terminado y probado. Sobre esa base se reintegró la recuperación de contraseña que solo existía en el backend de la raíz de la versión de la mañana. La carpeta `back/` de la versión de la mañana no se usó como fuente: era una copia anterior del mismo código.

## 3. Cambios aplicados

### Archivos incorporados desde la versión de la mañana
| Archivo | Función |
|---|---|
| `back/app/models/passwordResetToken.model.js` | Consultas del token: invalidar anteriores, crear, buscar usable, consumir |
| `back/app/services/passwordReset.service.js` | Reglas: hash SHA-256, TTL, un solo uso, respuesta genérica |
| `back/app/services/passwordResetEmail.service.js` | Envío SMTP con `nodemailer` y plantilla del correo |
| `back/app/schemas/passwordReset.schema.js` | Validación Joi de las tres peticiones |
| `back/prisma/migrations/20261123150000_password_reset_token/migration.sql` | Tabla `password_reset_token` con índices y clave foránea |
| `back/tests/unit/services/passwordReset.service.test.js` | Pruebas unitarias del servicio |

### Archivos compartidos que hubo que fusionar a mano
| Archivo | Qué se hizo |
|---|---|
| `back/prisma/schema.prisma` | Se conservaron `Notificacion` y sus relaciones, y se añadieron `PasswordResetToken` y la relación `Usuario.passwordResetTokens` |
| `back/app/controllers/auth.controller.js` | Se conservaron `login`, `registro`, `registroAdmin`, `perfil`, `logout` y se añadieron `forgotPassword`, `verifyResetToken`, `resetPassword` |
| `back/app/routes/auth.routes.js` | Se conservaron `login` y `registro` con sus *rate limiters* y se añadieron las tres rutas públicas con `createAuthRateLimiter()` |
| `back/app/middlewares/identifyUser.js` | Se añadieron las tres rutas a `PUBLIC_ROUTES` (comparación exacta) |
| `back/app/config/swagger.js` | Se documentaron los tres endpoints junto a los de autenticación |
| `back/package.json` y `package-lock.json` | Se añadió `nodemailer ^7.0.13` y se regeneró el *lockfile* |
| `back/.env.example` | Se añadieron `PASSWORD_RESET_TOKEN_TTL_MINUTES`, `FRONTEND_URL` y las seis variables SMTP |
| `Readme.md` | Nueva sección de recuperación, rutas públicas actualizadas, tabla de endpoints, variables de entorno y cifras reales de pruebas |
| `DOCS_PROYECTO/back_DOCUMENTACION/API.md` | Tres rutas nuevas, rutas públicas y códigos 429/503 actualizados |
| `DOCS_PROYECTO/back_DOCUMENTACION/ARQUITECTURA_REGLAS_Y_DECISIONES_TECNICAS.md` | Nueva sección 5.4 con la decisión implementada; 5.3 dejó de presentar la recuperación como pendiente |

### Archivos nuevos que no estaban en ninguna de las dos entregas
El backend enviaba el enlace a `/nueva-contrasena`, pero esa pantalla no existía en ninguna versión: el correo llegaba a un 404. Para que la funcionalidad fuera utilizable de punta a punta se añadieron:

| Archivo | Función |
|---|---|
| `front/src/pages/RecuperarContrasena.tsx` | Formulario para pedir el enlace, con respuesta genérica y manejo del 503 |
| `front/src/pages/NuevaContrasena.tsx` | Valida el token al abrir y define la contraseña nueva, con confirmación y estados de enlace inválido |
| `front/src/routes/AppRoutes.tsx` | Rutas públicas `/recuperar-contrasena` y `/nueva-contrasena` (carga diferida, como el resto) |
| `front/src/pages/Login.tsx` | Enlace «¿Olvidaste tu contraseña?» |

## 4. Conflictos encontrados y criterio de resolución

1. **Modelo de datos.** Ambas versiones partían del mismo `schema.prisma`, pero cada una había añadido un modelo distinto en el mismo punto. Se sumaron los dos en lugar de elegir: no hay colisión de nombres ni de relaciones, y las migraciones tienen marcas de tiempo distintas (`20261123150000` y `20261123190000`), así que aplican en orden sobre una base vacía.
2. **Servicio de notificaciones.** La versión de la mañana tenía un `notificacion.service.js` que solo escribía en el log; la de la tarde lo reemplaza por persistencia real. Se conservó el de la tarde, porque el de la mañana no era una funcionalidad, era el marcador de posición que RF09 vino a resolver.
3. **Doble backend.** La versión de la mañana traía `app/` en la raíz y también `back/`. Se conservó únicamente `back/`, que es la ruta que usan Docker, las pruebas y la documentación.
4. **Rutas públicas.** El middleware `identifyUser` compara rutas exactas; si se añadían los endpoints sin tocar `PUBLIC_ROUTES`, la recuperación habría respondido 401 siempre. Se añadieron las tres entradas.
5. **Swagger y API.md.** La versión de la tarde había documentado RF09; la de la mañana, la recuperación. Se sumaron ambos bloques sin eliminar ninguno.

## 5. Verificación ejecutada

| Prueba | Resultado |
|---|---|
| `npm test` (Vitest, PostgreSQL 16 local, base `proyectohs_test`) | **383 pruebas aprobadas en 29 archivos** (14 unitarios y 15 de integración), incluidas las de notificaciones y recuperación |
| `prisma migrate deploy` sobre base vacía | Aplica las cinco migraciones en orden, sin errores |
| `npm run build` del frontend | Compila con TypeScript y Vite; genera las pantallas nuevas |
| Flujo de recuperación con SMTP local | `forgot-password` 200 → correo recibido → `verify-reset-token` 200 → `reset-password` 200 → login con la contraseña nueva 200 → reutilizar el enlace 400 → login con la contraseña anterior 401 |
| Enumeración de cuentas | Correo inexistente devuelve el mismo 200 y el mismo mensaje |
| RF09 con datos reales | Crear disponibilidad y cita como recepción generó dos avisos (`nueva_cita`, `cambio_disponibilidad`) visibles en la bandeja del especialista |
| Interfaz | `/recuperar-contrasena`, `/nueva-contrasena`, login con contraseña nueva y bandeja de notificaciones revisadas en el navegador |

## 6. Pendientes que siguen abiertos

- **Proveedor SMTP de producción:** la recuperación exige SMTP real; sin él responde 503 (comportamiento intencional). Falta decidir el proveedor y las credenciales del despliegue.
- **`lint` del frontend:** el comando está declarado pero ESLint no figura en `devDependencies`.
- **Filtro por propietario en consultas GET:** el riesgo señalado en la revisión anterior sigue vigente.
- **Manuales de sustentación (DOCX/PDF):** no describen todavía ni la recuperación de contraseña ni la pantalla de notificaciones; se actualizaron solo los documentos Markdown.
- **Pruebas de correo real:** el envío se verificó con un receptor SMTP local; no hay prueba automatizada contra un proveedor real.
- **Auditoría persistida (RF15):** sin cambios.

## 7. Cómo levantar esta versión

```bash
cd back
cp .env.example .env          # completa BD, JWT y SMTP
npm install
npm run migrate               # aplica las 5 migraciones
npm run seed                  # datos de demostración
npm start                     # API en :3000

cd ../front
npm install
npm run dev                   # SPA en :5173
```

Para pruebas: `cp back/.env.test.example back/.env.test`, ajusta credenciales y ejecuta `npm test` dentro de `back`.
