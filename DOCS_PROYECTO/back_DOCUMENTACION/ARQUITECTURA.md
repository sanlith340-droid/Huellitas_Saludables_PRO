# Arquitectura de Huellitas Saludables

## Vista general

```text
Navegador (React + TypeScript)
   │ Axios envía peticiones HTTP con JWT
   ▼
Express (Node.js ESM) ── Prisma ORM 7 ESM ── PostgreSQL
```

En Docker, Nginx sirve el frontend y envía `/api`, `/health` y `/api-docs` al backend. En desarrollo, Vite corre separado y consume `http://localhost:3000/api`.

## Fuente de verdad y componentes

- `back/prisma/schema.prisma`: siete modelos y relaciones.
- `back/prisma/migrations/`: migraciones Prisma versionadas, con SQL personalizado para CHECKs, índice parcial y triggers.
- `back/prisma/seed.js`: datos demo idempotentes.
- `back/app/models/`: consultas Prisma y adaptación a los objetos que consume la API.
- `back/app/services/`: reglas de negocio y transacciones.
- `back/app/controllers/` y `back/app/routes/`: transporte HTTP y rutas.
- `back/app/middlewares/`: JWT, roles, validación, auditoría y un error handler común.

## Relaciones y reglas de datos

- `Usuario` y `Mascota` se relacionan de muchos a muchos mediante `UsuarioMascota`.
- Cada mascota tiene una raza.
- Un especialista puede definir varias disponibilidades.
- Una disponibilidad puede tener citas canceladas históricas; un índice único parcial impide más de una cita activa por horario.
- Una cita puede tener una historia clínica. Un trigger marca la cita como atendida al insertar la historia; otro trigger marca el horario como ocupado al insertar la cita.
- PostgreSQL conserva además las claves foráneas y restricciones CHECK de roles, estados, especie, género y peso.

Antes de cambiar relaciones o tipos, actualiza `schema.prisma`, crea/revisa una migración y valida la migración contra una base de pruebas. No reemplaces ni borres el SQL personalizado sin verificar el comportamiento de triggers e índice parcial.

## Frontend y seguridad

Las rutas del frontend están en `front/src/routes/AppRoutes.tsx`. Las protecciones de navegación del cliente no sustituyen la autorización del backend. El backend verifica el JWT, consulta el rol vigente y deriva los errores al manejador central.
