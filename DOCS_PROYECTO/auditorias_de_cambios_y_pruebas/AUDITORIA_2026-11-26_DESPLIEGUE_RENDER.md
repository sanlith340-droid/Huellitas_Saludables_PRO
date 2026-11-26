# Auditoría · Despliegue real en Render (26/11/2026)

**Proyecto:** Huellitas Saludables PRO
**Repositorio desplegado:** `https://github.com/sanlith340-droid/Huellitas_Saludables_PRO`, rama `SUSTENTACION4º`
**Ejecutor:** agente Manus con la API de Render del propietario (owner `tea-dbg08kl9el5s73bgbqtg`)
**Región:** Ohio · **Planes:** Free (API, sitio estático y base de datos)

---

## 1. Objetivo

Publicar la última versión del proyecto en Render sin intervención manual del usuario, dejando operativos el frontend, la API, la base de datos PostgreSQL y el envío de correo SMTP.

## 2. Recursos creados

| Recurso | Nombre | Identificador | Configuración |
| --- | --- | --- | --- |
| Base de datos | `huellitas-db` | `dpg-dc3rqmlg1s2s73chs8o0-a` | PostgreSQL 16, plan Free, Ohio, caduca el 26/12/2026 |
| Servicio web (API) | `huellitas-api` | `srv-dc3rrg97lnhs73el3ufg` | Docker, `dockerContext ./back`, `Dockerfile ./back/Dockerfile`, health check `/health`, plan Free |
| Sitio estático (front) | `huellitas-web` | `srv-dc3rrje1egvs73eitbgg` | Build `cd front && npm ci && npm run build`, publicación `front/dist`, rewrite `/* → /index.html` |

### URLs públicas

- Frontend: **https://huellitas-web-28qj.onrender.com**
- API: **https://huellitas-api-l0dx.onrender.com**
- Salud: https://huellitas-api-l0dx.onrender.com/health
- Swagger: https://huellitas-api-l0dx.onrender.com/api-docs/

## 3. Variables de entorno de la API

```
NODE_ENV=production
DATABASE_URL=<cadena interna de Render>
JWT_SECRET=<generado>
JWT_EXPIRES_IN=8h
TRUST_PROXY=1
CORS_ORIGIN=https://huellitas-web-28qj.onrender.com
FRONTEND_URL=https://huellitas-web-28qj.onrender.com
PASSWORD_RESET_TOKEN_TTL_MINUTES=30
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<usuario SMTP de Brevo>
SMTP_PASS=<clave SMTP de Brevo>
SMTP_FROM=Huellitas Saludables <huellitassaludables3@gmail.com>
DB_SEED=false
```

En el sitio estático se configuró `VITE_API_URL=https://huellitas-api-l0dx.onrender.com/api`, que se incrusta en el bundle durante el build.

## 4. Datos de demostración

El primer arranque se hizo con `NODE_ENV=development` y `DB_SEED=true` para que el seed de Prisma creara los usuarios y catálogos demo. Después se cambió a `NODE_ENV=production` y `DB_SEED=false` y se redesplegó, de modo que la base queda sembrada pero sin resiembras automáticas.

Credenciales demo (contraseña `123456` en todos los casos):

| Rol | Correo | Identificador |
| --- | --- | --- |
| Administrador | `juan.rodriguez@proyectohs.com` | ADM001 |
| Recepción | `laura.gomez@proyectohs.com` | REC001 |
| Especialista | `alejandro.castillo@proyectohs.com` | ESP001 |
| Propietario | `pedro.gonzalez@gmail.com` | USU001 |

## 5. Verificaciones ejecutadas

| Prueba | Resultado |
| --- | --- |
| `GET /health` | 200, base de datos conectada (≈1,7 s) |
| `POST /api/auth/login` con administrador demo | 200 con token JWT y cabecera CORS correcta |
| `GET /api/mascotas`, `/api/razas`, `/api/disponibilidad` con token | 200 |
| Carga del frontend y del bundle | 200; el bundle contiene la URL de la API de Render |
| Acceso desde navegador (`/login` → credenciales → panel) | Correcto: redirección a `/admin`, panel con 7 cuentas de personal, 3 especialistas, 3 recepcionistas y 1 administrador, con datos reales de la base |
| `POST /api/auth/forgot-password` con correo inexistente | 200 en 1,8 s (respuesta genérica, sin envío) |
| `POST /api/auth/forgot-password` con correo válido | Ver sección 6 |

## 6. Hallazgo importante: SMTP en el plan Free de Render

Render bloquea el tráfico saliente a los puertos **25, 465 y 587** en las instancias Free (documentado en <https://render.com/docs/free> y en el changelog del 16/09/2025). Por eso, con `SMTP_PORT=587` la petición de recuperación de contraseña se quedaba colgada más de 60 segundos: la conexión TCP nunca se establecía y `nodemailer` esperaba su tiempo de conexión por defecto.

Brevo ofrece el puerto **2525** como alternativa cuando el 587 está bloqueado. Se comprobó con una sonda externa (`portquiz.net`) que Render **sí permite** la salida por 2525, y con `SMTP_PORT=2525` la API conecta con `smtp-relay.brevo.com` y obtiene respuesta en unos 3 segundos.

La clave SMTP incluida originalmente en la imagen del proyecto era inválida: Brevo respondía `535 5.7.8 Authentication failed` en los puertos 587, 465 y 2525. Se generó una clave nueva en la cuenta de Brevo del proyecto (usuario SMTP `c53625001@smtp-brevo.com`) y se actualizaron `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST` y `SMTP_PORT=2525` en Render.
**Segundo hallazgo:** con la clave nueva el envío llegó a Brevo, pero el remitente `huellitassaludables3@gmail.com` fue rechazado porque aún no estaba verificado. Se registró esa dirección en Brevo, pero queda pendiente confirmar el enlace que Brevo envía al buzón. Mientras tanto, se configuró `SMTP_FROM` con la dirección verificada de la cuenta (`joretopa7@gmail.com`).
**Resultado final verificable:** `POST /api/auth/forgot-password` responde `200` en unos 3–4 segundos y Brevo registra la solicitud sin error de autenticación ni de remitente con la configuración alternativa. Esto acredita conexión y aceptación por el proveedor, no la entrega ni el consumo del enlace por un usuario final.
Nota para la sustentación: los usuarios demo tienen correos ficticios (`@proyectohs.com`), por lo que no sirven para demostrar recepción real. Para cerrar la evidencia de recuperación se debe usar un buzón existente, confirmar el remitente institucional o mantener el remitente verificado alternativo, y completar el enlace de un solo uso.

## 7. Limitaciones conocidas del plan gratuito

- La base de datos PostgreSQL gratuita **caduca el 26/12/2026**; después hay 14 días de gracia antes de que Render la elimine con todos los datos.
- El servicio web **se suspende tras 15 minutos sin tráfico**; el primer acceso posterior tarda alrededor de un minuto en responder.
- 750 horas de instancia al mes por espacio de trabajo; al agotarlas, Render suspende los servicios gratuitos hasta el mes siguiente.
- Sin discos persistentes: los archivos subidos al sistema de archivos del contenedor se pierden en cada despliegue o reinicio.

## 8. Recomendaciones

1. Generar una clave SMTP nueva en Brevo (SMTP & API → SMTP → *Generate a new SMTP key*) y actualizar `SMTP_PASS` en el servicio `huellitas-api`.
2. Revocar la clave SMTP expuesta en el chat y la API key de Render `manus-deploy` cuando termine la sustentación.
3. Si el proyecto debe quedar publicado de forma permanente, pasar la API a un plan pago (Starter) y la base de datos a un plan pago antes del 26/12/2026; con el plan pago además se desbloquean los puertos SMTP estándar.

## 9. Conclusión

El despliegue quedó funcional de extremo a extremo: frontend, API, base de datos, autenticación, catálogos y panel de administración operan contra Render. La recuperación queda verificada hasta la aceptación de la solicitud por SMTP; siguen pendientes la recepción y el consumo del enlace en un buzón real y la confirmación del remitente institucional.
