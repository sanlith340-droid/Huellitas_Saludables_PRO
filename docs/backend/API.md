# Rutas de la API

En desarrollo, la API suele estar en `http://localhost:3000`. Si levantaste el proyecto con Docker, entra por `http://localhost:8080/api`. Swagger tiene los campos y ejemplos completos en `/api-docs`; el archivo donde está configurado es `back/app/config/swagger.js`.

## Cómo mandar el token

Casi todas las rutas necesitan iniciar sesión. Primero pide un token en `POST /api/auth/login` y después inclúyelo en el encabezado:

```http
Authorization: Bearer <token>
```

El healthcheck `GET /health` y las rutas `POST /api/auth/login` y `POST /api/auth/registro` son públicas. `GET /api/auth/test` **no** es pública aunque su nombre pueda confundir: necesita JWT. Crear cuentas de personal (`/api/auth/registro-admin`) es solo para `admin`.

Los roles del sistema son `usuario`, `recepcionista`, `especialista` y `admin`. Si una ruta solo dice JWT, significa que pide una sesión válida, pero el código de esa ruta no exige un rol particular.

## Lista de rutas

| Método | Ruta | Quién puede usarla | Qué hace |
|---|---|---|---|
| `GET` | `/health` | Pública | Revisa la conexión con PostgreSQL. |
| `POST` | `/api/auth/login` | Pública | Inicia sesión y devuelve un token. |
| `POST` | `/api/auth/registro` | Pública | Registra una cuenta de usuario. |
| `POST` | `/api/auth/registro-admin` | `admin` | Crea cuentas de personal. |
| `GET` | `/api/auth/perfil` | JWT | Devuelve el perfil de la sesión. |
| `GET` | `/api/auth/test` | JWT | Prueba la ruta del módulo de autenticación. |
| `GET` | `/api/mascotas` | JWT | Muestra las mascotas. |
| `GET` | `/api/mascotas/{id}` | JWT | Busca una mascota por ID. |
| `POST` | `/api/mascotas` | `usuario`, `admin` | Registra una mascota. |
| `GET` | `/api/usuarios/especialistas` | JWT | Muestra especialistas. |
| `GET` | `/api/usuarios/{documento}` | JWT | Busca un usuario por documento/identificador. |
| `GET` | `/api/razas` | JWT | Muestra las razas. |
| `GET` | `/api/disponibilidad` | JWT | Lista horarios disponibles; acepta filtros y paginación. |
| `GET` | `/api/disponibilidad/especialista/{id_usuario}` | JWT | Busca horarios de un especialista. |
| `GET` | `/api/disponibilidad/{id}` | JWT | Busca una franja horaria. |
| `POST` | `/api/disponibilidad` | `recepcionista`, `admin` | Crea una franja. |
| `PUT` | `/api/disponibilidad/{id}` | `recepcionista`, `admin` | Cambia una franja. |
| `DELETE` | `/api/disponibilidad/{id}` | `recepcionista`, `admin` | Elimina una franja. |
| `GET` | `/api/citas` | JWT | Lista citas y acepta filtros configurados. |
| `GET` | `/api/citas/{id}` | JWT | Busca una cita. |
| `GET` | `/api/citas/especialista/{id_especialista}` | JWT | Muestra citas de un especialista. |
| `POST` | `/api/citas` | `usuario`, `recepcionista`, `admin` | Crea una cita. |
| `PUT` | `/api/citas/{id}` | `usuario`, `recepcionista`, `admin` | Edita una cita. |
| `PATCH` | `/api/citas/{id}/cancelar` | `usuario`, `recepcionista`, `admin` | Cancela una cita. |
| `GET` | `/api/historia` | `especialista` | Lista historias clínicas. |
| `GET` | `/api/historia/{id}` | `especialista` | Busca una historia clínica. |
| `GET` | `/api/historia/mascota/{id_mascota}` | `especialista` | Busca historias de una mascota. |
| `GET` | `/api/historia/cita/{id_cita}` | `especialista` | Busca la historia de una cita. |
| `POST` | `/api/historia` | `especialista` | Crea una historia clínica. |
| `PUT` | `/api/historia/{id}` | `especialista` | Actualiza una historia clínica. |

Lo que aparece entre `{llaves}` se reemplaza con el dato real; por ejemplo, `/api/mascotas/12`. Los campos exactos que pide cada ruta están en Swagger y en los validadores de `back/app/schemas/`.

## Errores típicos

- `400`: algún dato no pasó la validación.
- `401`: falta el token, no sirve, venció o la cuenta ya no existe.
- `403`: el usuario inició sesión, pero su rol no puede hacer esa acción.
- `404`: no se encontró la ruta o el dato solicitado.
- `503`: el healthcheck no pudo conectar con PostgreSQL.

Fuera de tu computador, usa HTTPS y nunca pongas contraseñas o tokens en la URL.
