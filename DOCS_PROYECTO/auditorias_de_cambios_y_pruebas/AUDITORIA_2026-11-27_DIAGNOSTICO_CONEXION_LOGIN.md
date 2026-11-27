# Auditoría — Diagnóstico de aviso de conexión en login

## Identificación

- **Fecha y hora:** 27 de noviembre de 2026, 15:22–15:25 UTC−05.
- **Responsable:** Manus.
- **Tarea:** investigar la pantalla «No hay conexión con la clínica» al iniciar sesión.
- **Autorización:** el usuario solicitó el diagnóstico.

## Objetivo y alcance

Comprobar si el aviso correspondía a una base fuera de servicio, API/backend no disponible, URL errónea del frontend o bloqueo CORS. Se revisaron de forma local `front/src/services/api.ts`, `front/src/pages/Login.tsx` y `front/src/utils/erroresApi.ts`. Se hicieron únicamente solicitudes públicas de lectura y un preflight OPTIONS al despliegue documentado. No se envió correo, contraseña, JWT ni se intentó autenticar una cuenta; no se modificó código, configuración, base de datos ni despliegue.

## Procedimiento y resultado

| Comprobación | Resultado |
|---|---|
| Primera solicitud `curl -sS -L --max-time 35 ... https://huellitas-api-l0dx.onrender.com/health` | Timeout a los 35.00 s, HTTP 000, 0 bytes recibidos. |
| Página `https://huellitas-web-28qj.onrender.com/` | HTTP 200 en 1.91 s. |
| `GET /api/razas/catalogo?especie=perro` sin credenciales | HTTP 401 en 16.71 s, con mensaje esperado de JWT ausente; confirma que el backend empezó a responder. No fue un intento de login. |
| Repetición de `GET /health` con timeout de 60 s | HTTP 200 en 2.07 s; `success: true`, «Servicio y base de datos activos» y `db_time` válido. |
| Bundle JavaScript público | Contiene `https://huellitas-api-l0dx.onrender.com/api` como URL base; no se encontró el identificador `API_NINJAS_KEY`. |
| `OPTIONS /api/auth/login` con origen `https://huellitas-web-28qj.onrender.com` | HTTP 204, con `Access-Control-Allow-Origin` igual al frontend y métodos/cabeceras permitidos. |

## Diagnóstico

En el momento de la comprobación, la API respondió correctamente y confirmó que PostgreSQL estaba conectado. El frontend público apunta al backend esperado y el preflight CORS pasa. El primer timeout, seguido por una respuesta lenta de arranque y luego por respuestas rápidas, es **compatible con un cold start/despertar del servicio backend en Render**, no con una base apagada. No hay acceso a los logs del proveedor en esta comprobación, por lo que se registra como diagnóstico probable, no como causa confirmada.

## Limitaciones y siguiente paso

No se ejecutó un inicio de sesión real ni se verificó la cuenta del usuario. Se recomienda abrir `https://huellitas-api-l0dx.onrender.com/health`, esperar una respuesta JSON con `success: true` y «Servicio y base de datos activos», volver al sitio y reintentar. Si persiste, compartir únicamente el estado HTTP de `POST /api/auth/login` desde la pestaña Network del navegador, sin enviar el cuerpo, contraseñas ni tokens. Si el primer acceso después de inactividad vuelve a fallar, valorar mantener el backend activo para evitar la latencia de arranque.
