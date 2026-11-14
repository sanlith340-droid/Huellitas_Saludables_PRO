# Guía del backend

La API actual usa Express, Prisma ORM 7 ESM, PostgreSQL y JWT. Las solicitudes protegidas envían el token como `Authorization: Bearer <token>`; los headers `x-user-id` y `x-user-role` no autentican.

- [Preparar el backend, migraciones y pruebas](DESARROLLO.md)
- [Rutas de la API y permisos](API.md)
- [Arquitectura y modelo de datos](ARQUITECTURA.md)
- [Prisma ORM 7 y migración segura](IMPLEMENTAR_ORM.md)
- [Swagger](http://localhost:3000/api-docs), cuando el servidor esté corriendo.
