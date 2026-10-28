# Guía del backend

Este archivo se llamaba así desde antes, por eso lo dejamos en el proyecto. La versión anterior ya no servía mucho: hablaba de una estructura vieja y tenía claves de ejemplo que no hay que usar.

Las guías nuevas están aquí:

- [Preparar el backend, migraciones y pruebas](docs/DESARROLLO.md)
- [Rutas de la API y permisos](docs/API.md)
- [Arquitectura y modelo de datos](docs/ARQUITECTURA.md)
- [Swagger](http://localhost:3000/api-docs), cuando el servidor esté corriendo.

El código actual usa Express, Sequelize, PostgreSQL y JWT. El token se manda en `Authorization: Bearer <token>`; los headers `x-user-id` y `x-user-role` ya no son el método de autenticación.
