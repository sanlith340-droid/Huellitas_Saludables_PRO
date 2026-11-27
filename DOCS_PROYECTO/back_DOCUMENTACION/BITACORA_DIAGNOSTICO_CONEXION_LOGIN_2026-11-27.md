# Bitácora — Diagnóstico del aviso de conexión en login

**Fecha:** 27/11/2026 (UTC−05).  
**Solicitud:** el usuario mostró la pantalla de login con el aviso «No hay conexión con la clínica» e informó que la base de datos estaba encendida.

## Revisión

Se revisó el cliente HTTP, el manejo de errores y el flujo de login. El cliente publicado usa como URL base `https://huellitas-api-l0dx.onrender.com/api`, y tiene timeout de 20 segundos. Se comprobaron públicamente el frontend, la API, el estado de salud de la base y CORS, sin usar los datos de acceso visibles en la captura.

La primera petición a `/health` excedió 35 segundos sin respuesta. Después de que el servicio comenzó a responder, una repetición de `/health` dio HTTP 200 en 2,07 segundos con el mensaje «Servicio y base de datos activos». El frontend dio HTTP 200, el bundle señaló la API esperada y el preflight del login respondió HTTP 204 con CORS permitido. La llamada no autenticada al catálogo dio el 401 esperado.

## Conclusión y acción

La evidencia actual indica que la base sí estaba conectada al momento de la segunda comprobación. La secuencia de timeout inicial y recuperación posterior es consistente con el despertar del backend de Render tras inactividad; sin acceso a sus logs, no se presenta como causa confirmada. No se cambió el código, no se editó configuración, no se tocaron bases y no se probó la cuenta.

Abrir `https://huellitas-api-l0dx.onrender.com/health`, esperar `success: true` y «Servicio y base de datos activos», regresar al login y reintentar. Para investigar una recurrencia, compartir solo el código HTTP de `POST /api/auth/login`, nunca la contraseña, el cuerpo de la petición ni tokens. Detalle de tiempos y cabeceras en la [auditoría del diagnóstico](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_DIAGNOSTICO_CONEXION_LOGIN.md).
