# Cómo está armado el proyecto

## La idea general

```text
Navegador
   │ Frontend: React + TypeScript
   │ Axios manda peticiones a /api con el JWT
   ▼
Backend: Express ── Sequelize ── PostgreSQL
```

Cuando usas Docker, Nginx muestra el frontend y también pasa las llamadas a `/api`, `/health` y `/api-docs` hacia el backend. En ese caso, `VITE_API_URL=/api`. Para desarrollar, Vite corre por separado y normalmente habla con `http://localhost:3000/api`.

## Carpetas importantes

- `front/src/`: las pantallas, componentes, rutas y conexión del frontend.
- `back/app/`: la API, sus rutas, controladores, servicios y modelos.
- `back/migrations/`: archivos que crean o cambian las tablas.
- `back/seeders/`: datos de demostración.
- `back/tests/`: pruebas automáticas.
- `database/data_jesus/`: scripts SQL antiguos/de referencia; la app actual usa Sequelize.
- `docker-compose.yml`: levanta base de datos, API y frontend.
- `docker-compose.test.yml`: corre pruebas con una base temporal.

## Cómo se relacionan los datos

Las tablas y relaciones están en `back/app/models/index.js`; las migraciones crean las tablas reales.

- Un usuario puede estar relacionado con varias mascotas, y una mascota puede tener más de un usuario asociado. La relación pasa por `UsuarioMascota`.
- Cada mascota tiene una raza.
- Un especialista puede tener varios horarios (`Disponibilidad`).
- Cada horario puede tener como máximo una cita. La cita también se relaciona con la mascota y con quien la registró en recepción.
- Una cita puede tener una historia clínica.

Si vas a cambiar estas relaciones, revisa los modelos y las migraciones juntos.

## Pantallas y rutas

Las rutas del frontend están en `front/src/routes/AppRoutes.tsx`.

| Dirección | Qué muestra | Quién puede entrar |
|---|---|---|
| `/` | Inicio | Cualquiera |
| `/login` | Iniciar sesión | Cualquiera |
| `/registro` | Crear cuenta | Cualquiera |
| `/dashboard` | Panel principal | Sesión iniciada |
| `/mascotas` | Lista de mascotas | Sesión iniciada |
| `/mascotas/nueva` | Registrar mascota | Sesión iniciada; la API revisa permisos |
| `/citas/nueva` | Pedir una cita | Sesión iniciada |
| `/disponibilidad` | Administrar horarios | `recepcionista` |
| `/citas/especialista` | Ver citas asignadas y marcarlas como atendidas o canceladas | `especialista` |
| `/admin` | Panel de administración (resumen del personal) | `admin` |
| `/usuarios/admin` | Registrar personal y eliminar especialistas y recepcionistas | `admin` |

Si alguien entra a una ruta que no existe, se muestra la página de no encontrado. Las reglas del frontend ayudan con la navegación, pero el backend también revisa los permisos antes de hacer cambios.

## Qué pasa al iniciar sesión

1. El usuario manda su correo y contraseña a `/api/auth/login`.
2. La API devuelve un token JWT.
3. El frontend lo guarda en `localStorage` y Axios lo incluye en las llamadas privadas.
4. El backend verifica el token y comprueba que el usuario todavía esté en PostgreSQL.
5. Si el token venció o no es válido, el frontend borra la sesión y vuelve a `/login`.

Los headers `x-user-id` y `x-user-role` ya no se usan para iniciar sesión.
