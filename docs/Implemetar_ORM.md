# Sequelize: lo que usa el proyecto ahora

Este documento reemplaza el tutorial antiguo, porque algunos nombres de archivos y pasos que aparecían ahí ya cambiaron.

El backend usa Sequelize 6 con PostgreSQL. La conexión está en `back/app/config/database.js`, la configuración del CLI está en `back/app/config/config.js` y `.sequelizerc`, y las tablas y relaciones se describen en `back/app/models/index.js`.

Las migraciones de `back/migrations/` crean usuarios, razas, mascotas, la relación entre usuarios y mascotas, disponibilidad, citas e historias clínicas. Los datos demo están en `back/seeders/`.

Desde la carpeta `back/`, el flujo básico es:

```bash
npm install
cp .env.example .env
npm run migrate
npm run seed       # si quieres cargar datos de ejemplo
```

Si vas a cambiar una tabla, crea una migración nueva y pruébala en una base aparte. Evita editar migraciones que ya se hayan usado en otros equipos. Las opciones para revertir migraciones o usar `db:reset` pueden borrar datos, así que no las corras en producción.

Más detalles en [la guía para trabajar en backend](docs/DESARROLLO.md) y [la arquitectura](docs/ARQUITECTURA.md).
