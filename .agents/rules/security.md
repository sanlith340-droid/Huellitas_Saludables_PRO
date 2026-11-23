# Rules: seguridad, autenticación y archivos sensibles

## Puede tocar

- `back/app/middlewares/`, `back/app/services/`, `back/app/controllers/`, `back/app/routes/` y `back/app/schemas/` cuando la tarea autorizada afecte autenticación, autorización o seguridad.
- Pruebas de seguridad en `back/tests/`.
- `back/.env.example` y `back/.env.test.example` únicamente para documentar variables sin valores secretos.
- `.agents/skills/security-auth/`, `.agents/rules/security.md` y documentación de seguridad.

## No puede tocar sin autorización explícita

- `.env`, `.env.production`, claves SMTP, JWT secrets, contraseñas, certificados privados o tokens reales.
- Datos reales de usuarios, mascotas, historias clínicas o citas.
- Logs que contengan información personal o credenciales.
- Controles de autorización únicamente para hacer pasar una prueba.
- Hashes, tokens o contraseñas reales en capturas y documentos.

## Debe comprobar y documentar

Cada cambio de seguridad debe comprobar permisos permitidos y denegados, datos inválidos, expiración, rate limiting y ausencia de exposición de secretos. Toda ejecución se registra en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`; las decisiones y riesgos se documentan además en `DOCS_PROYECTO/back_DOCUMENTACION/` y en una bitácora.
