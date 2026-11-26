# Guía de despliegue y configuración por ambiente

Esta guía describe opciones y controles esperados y, desde el 26 de noviembre de 2026, registra también el despliegue efectivamente realizado en Render (véase la sección 2). Docker Compose sigue sin probarse porque Docker no estuvo disponible en el entorno de revisión.

## 1. Ambientes previstos

| Ambiente | Estado de archivos/configuración en esta copia | Base de datos | Datos/secretos |
|---|---|---|---|
| Desarrollo | No se encontró plantilla `.env` de ejemplo incluida; definir valores localmente según README y configuración del proyecto | Local aislada | Sintéticos; no incorporar credenciales al repositorio |
| Pruebas | No se encontró `.env.test.example`; la suite requiere `DB_NAME_TEST` dedicado que termine en `_test` | Base exclusiva de pruebas | Fixtures; no reutilizar datos que se quieran conservar |
| Staging (opcional) | No hay archivo de ambiente staging incluido; configurar variables en el proveedor elegido | Propia | Datos ficticios y secretos distintos |
| Producción | No hay archivo de ambiente producción incluido; configurar variables en el panel seguro del proveedor | Propia | Datos reales; sin seed demo; secretos administrados fuera del repositorio |

La copia revisada no incluye plantillas `.env`; crear la configuración de cada ambiente de forma controlada y mantener los valores privados fuera del repositorio y del ZIP. No subir `.env` reales. Configurar orígenes exactos en `CORS_ORIGIN`, URL del front y secretos no predecibles; confirmar TLS y restricciones del plan del proveedor antes de abrir acceso público.

## 2. Opción documentada: Render

El repositorio incluye `render.yaml` como Blueprint. Procedimiento previsto: subir el código al repositorio autorizado, importar el Blueprint, completar manualmente variables privadas, revisar plan/retención de base, aplicar migraciones y verificar endpoints. Tras el despliegue, comprobar `/health`, `/api-docs`, login y un flujo autorizado; registrar URL, fecha, responsables y resultados.

**Estado actual (26/11/2026): despliegue realizado y verificado.** En lugar de importar el Blueprint se crearon los recursos con la API de Render, que permite fijar el contexto Docker y el comando de build del sitio estático con precisión:

| Recurso | Nombre | Configuración |
|---|---|---|
| Base de datos | `huellitas-db` | PostgreSQL 16, plan Free, Ohio, caduca el 26/12/2026 |
| API | `huellitas-api` | Docker, contexto `./back`, `./back/Dockerfile`, health check `/health`, plan Free |
| Frontend | `huellitas-web` | Sitio estático, build `cd front && npm run build`, publicación `front/dist`, rewrite `/*` → `/index.html`, `VITE_API_URL` apuntando a la API |

- Frontend: https://huellitas-web-28qj.onrender.com
- API: https://huellitas-api-l0dx.onrender.com · Swagger: `/api-docs/` · Salud: `/health`

Verificado: `/health` con base conectada, login de administrador con CORS correcto, catálogos (`/api/mascotas`, `/api/razas`, `/api/disponibilidad`) y recorrido completo en navegador desde `/login` hasta el panel de administración con datos reales.

**SMTP:** el plan Free de Render bloquea la salida a los puertos 25, 465 y 587. Se configuró `SMTP_PORT=2525` (alternativa de Brevo), con lo que la conexión ya se establece; queda pendiente sustituir la clave SMTP de Brevo, que el proveedor rechaza con `535 Authentication failed`.

**Limitaciones del plan Free:** la base caduca a los 30 días (26/12/2026), el servicio se suspende tras 15 minutos sin tráfico y no hay discos persistentes. Para uso permanente hay que pasar a planes pagos.

Detalle completo en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-26_DESPLIEGUE_RENDER.md`.

## 3. Opción documentada: Docker Compose

Los archivos Compose describen el servicio de base, backend y frontend/Nginx. La guía prevé completar `.env` local y ejecutar `docker compose up -d --build`. Debe probarse primero en un entorno descartable, con contraseñas/secretos propios y una base aislada.

**Estado actual:** no se ejecutó Compose en esta revisión porque Docker no estaba disponible. La disponibilidad de archivos Compose no prueba el arranque del contenedor ni su exposición HTTPS.

## 4. Verificación posterior que debe registrarse

En el entorno que el equipo elija, guardar evidencia fechada de `/health`, inicio de sesión por rol, acceso permitido/denegado, flujo de mascota/cita/atención, logs sin datos sensibles, migración aplicada y verificación de restauración. Los casos deben ejecutarse sin exponer cuentas/datos reales en capturas públicas.

## 5. Estado de cierre

El criterio D3.7 cuenta desde el 26/11/2026 con un entorno externo accesible y URL comprobada (véase la sección 2). Queda como pendiente la separación efectiva de ambientes y el envío de correo con una credencial SMTP válida. Las capturas de `EVIDENCIA_CAPTURAS_ACTUAL/` corresponden al entorno local y datos de demostración; las nuevas evidencias del despliegue se registran en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-26_DESPLIEGUE_RENDER.md`.
