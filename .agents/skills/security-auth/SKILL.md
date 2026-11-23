---
name: security-auth
description: Trabajar en autenticación, autorización, contraseñas, JWT, recuperación de contraseña, rate limiting y protección de datos en Huellitas Saludables. Usar ante cualquier cambio relacionado con seguridad o identidad.
---

# Skill: seguridad y autenticación

Leer primero `AGENTS.md`, `.agents/rules/security.md` y la bitácora relacionada.

## Reglas de implementación

- Mantener el hash de contraseñas con bcrypt.
- No guardar ni registrar contraseñas, JWT o tokens de recuperación en texto plano.
- Mantener expiración y un solo uso de tokens de recuperación.
- Evitar enumerar cuentas en recuperación de contraseña.
- Verificar permisos y pertenencia de recursos en backend.
- Aplicar rate limiting a operaciones sensibles.
- Crear pruebas de acceso autorizado, no autorizado, datos inválidos y abuso de límites.
- Documentar cualquier cambio de seguridad, configuración o riesgo pendiente.

## Validación

Ejecutar las pruebas de autenticación aplicables, revisar variables de entorno y registrar en la bitácora qué se verificó y qué depende de configuración externa, como SMTP de producción.
