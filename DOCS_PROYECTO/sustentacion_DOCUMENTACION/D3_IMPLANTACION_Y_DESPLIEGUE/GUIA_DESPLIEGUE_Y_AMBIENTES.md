# Guía de despliegue y configuración por ambiente

Esta guía describe opciones y controles esperados. **No acredita un despliegue realizado.** A la fecha de revisión no se verificó una URL pública; Docker no estuvo disponible en el entorno local de esta revisión.

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

**Estado actual:** no se importó el Blueprint ni se verificó una URL. No entregar un enlace inventado ni presentar la configuración como un servicio activo.

## 3. Opción documentada: Docker Compose

Los archivos Compose describen el servicio de base, backend y frontend/Nginx. La guía prevé completar `.env` local y ejecutar `docker compose up -d --build`. Debe probarse primero en un entorno descartable, con contraseñas/secretos propios y una base aislada.

**Estado actual:** no se ejecutó Compose en esta revisión porque Docker no estaba disponible. La disponibilidad de archivos Compose no prueba el arranque del contenedor ni su exposición HTTPS.

## 4. Verificación posterior que debe registrarse

En el entorno que el equipo elija, guardar evidencia fechada de `/health`, inicio de sesión por rol, acceso permitido/denegado, flujo de mascota/cita/atención, logs sin datos sensibles, migración aplicada y verificación de restauración. Los casos deben ejecutarse sin exponer cuentas/datos reales en capturas públicas.

## 5. Estado de cierre

El criterio D3.7 queda pendiente hasta tener un entorno externo accesible, URL comprobada, separación efectiva de ambientes y evidencia de una verificación funcional. Las capturas de `EVIDENCIA_CAPTURAS_ACTUAL/` corresponden al entorno local y datos de demostración; no sustituyen esas evidencias.
