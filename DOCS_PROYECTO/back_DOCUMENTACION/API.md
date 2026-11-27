# Rutas de la API

En desarrollo, la API suele estar en `http://localhost:3000`; con Docker Compose se publica a través de `http://localhost:8080`. Swagger se monta en `/api-docs` y el healthcheck en `/health`. Esta guía resume las rutas reales de `back/app/routes/`; los esquemas de entrada están en `back/app/schemas/`.

## Autenticación y roles

Las rutas protegidas usan `Authorization: Bearer <token>`. El backend vuelve a cargar el usuario y su rol vigente desde PostgreSQL; los encabezados `x-user-id` y `x-user-role` no sustituyen al JWT. Los roles son `usuario`, `recepcionista`, `especialista` y `admin`.

Públicas: `GET /health`, `POST /api/auth/login`, `POST /api/auth/registro`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-reset-token` y `POST /api/auth/reset-password`. `GET /api/auth/test` exige JWT. Crear personal mediante `POST /api/auth/registro-admin` requiere `admin`.

## Endpoints

| Método | Ruta | Acceso | Comportamiento y alcance |
|---|---|---|---|
| `GET` | `/health` | Público | Comprueba conexión a PostgreSQL. |
| `POST` | `/api/auth/login` | Público | Inicia sesión y devuelve JWT. |
| `POST` | `/api/auth/registro` | Público | Registra un usuario propietario. |
| `POST` | `/api/auth/registro-admin` | `admin` | Crea cuentas de personal. |
| `GET` | `/api/auth/perfil` | JWT | Devuelve el perfil de la identidad autenticada. |
| `POST` | `/api/auth/logout` | JWT | Revoca en servidor el JWT de la petición mediante su `jti`. |
| `POST` | `/api/auth/forgot-password` | Público | Solicita enlace de un solo uso; la respuesta no revela si existe el correo. Sin SMTP o `FRONTEND_URL` responde `503`. |
| `POST` | `/api/auth/verify-reset-token` | Público | Verifica vigencia y uso del token; inválido/expirado devuelve `400`. |
| `POST` | `/api/auth/reset-password` | Público | Cambia contraseña y consume el token; invalida tokens de recuperación anteriores de la cuenta. |
| `GET` | `/api/auth/test` | JWT | Endpoint de diagnóstico del módulo auth. |
| `GET` | `/api/mascotas` | JWT | Lista mascotas. El rol `usuario` solo recibe mascotas asociadas a su cuenta; en ese resultado no se devuelven otros propietarios. |
| `GET` | `/api/mascotas/{id}` | JWT | Busca por ID. Para `usuario`, solo su mascota; una ajena o inexistente responde `404` genérico. Otros roles autenticados no tienen un filtro adicional en esta ruta. |
| `POST` | `/api/mascotas` | `usuario`, `admin` | Registra una mascota asociada al usuario autenticado; acepta exactamente uno de `id_raza` (compatibilidad) o `raza_nombre` (catálogo dinámico/personalizado); aplica máximo de cinco mascotas por usuario y devuelve `409` con `MASCOTAS_LIMITE_ALCANZADO` al excederlo. |
| `GET` | `/api/usuarios/especialistas` | JWT | Lista especialistas. |
| `GET` | `/api/usuarios/personal` | `admin` | Lista personal sin contraseñas, con `citas_asociadas` y `puede_eliminar`. |
| `GET` | `/api/usuarios/{documento}` | JWT | Busca usuario por identificador. La ruta no tiene un filtro de acceso por propietario; aplicar minimización de datos al definir su uso. |
| `DELETE` | `/api/usuarios/{id}` | `admin` | Elimina solo cuentas de especialista o recepcionista; `403` para otros roles de cuenta, `404` si no existe y `409` si tiene citas asociadas. Al eliminar un especialista se eliminan sus horarios; los JWT de la cuenta eliminada dejan de autenticar. |
| `GET` | `/api/razas` | JWT | Lista razas. |
| `GET` | `/api/razas/catalogo?especie=perro\|gato` | JWT | Devuelve las razas de una especie, ordenadas y sin duplicados. El backend consulta API Ninjas con `API_NINJAS_KEY` fuera del frontend y usa un catálogo local si no hay clave o el proveedor falla. La respuesta incluye `origen: "api"` o `"respaldo"`. |
| `GET` | `/api/disponibilidad` | JWT | Lista horarios con filtros y paginación según el esquema de consulta. |
| `GET` | `/api/disponibilidad/especialista/{id_usuario}` | JWT | Lista horarios del especialista; admite filtros. |
| `GET` | `/api/disponibilidad/{id}` | JWT | Busca una franja. |
| `POST` | `/api/disponibilidad` | `recepcionista`, `admin` | Crea una franja. |
| `PUT` | `/api/disponibilidad/{id}` | `recepcionista`, `admin` | Actualiza una franja. |
| `DELETE` | `/api/disponibilidad/{id}` | `recepcionista`, `admin` | Elimina una franja si las reglas de integridad lo permiten. |
| `GET` | `/api/citas` | JWT | Lista citas. `usuario` solo ve citas de mascotas propias; `especialista` solo las asignadas a sí mismo; `recepcionista` y `admin` consultan la agenda completa. |
| `GET` | `/api/citas/{id}` | JWT | `usuario` solo ve cita de su mascota y `especialista` solo la suya; los recursos ajenos responden `404` genérico. `recepcionista` y `admin` no tienen ese filtro. |
| `GET` | `/api/citas/especialista/{id_especialista}` | `especialista` (solo sus citas), `recepcionista`, `admin` | Lista citas del especialista. Filtros opcionales: `estado`, `fecha`, `fecha_desde`, `fecha_hasta` (`YYYY-MM-DD`). |
| `POST` | `/api/citas` | `usuario`, `recepcionista`, `admin` | Crea cita. El propietario solo agenda para mascota propia; recepción queda como responsable si crea, y para otros roles permitidos se selecciona un recepcionista existente. |
| `PUT` | `/api/citas/{id}` | `usuario`, `recepcionista`, `admin` | Actualiza cita; para el propietario se comprueba pertenencia antes de permitir la modificación. |
| `PATCH` | `/api/citas/{id}/cancelar` | `usuario`, `recepcionista`, `admin` | Cancela cita; el propietario solo puede actuar sobre cita propia. |
| `PATCH` | `/api/citas/{id}/estado` | `especialista` (solo sus citas), `admin` | Cambia estado a `atendido` o `cancelado`. Body: `{ "estado": "atendido" | "cancelado", "liberar_horario": true }`; al cancelar, liberar horario es `true` por defecto. Citas terminales no se vuelven a modificar (`409`). |
| `GET` | `/api/notificaciones` | `especialista` | Lista hasta 50 notificaciones in-app persistentes del especialista autenticado e incluye no leídas. No envía correo, SMS ni push. |
| `PATCH` | `/api/notificaciones/leer-todas` | `especialista` | Marca como leídas todas las notificaciones propias pendientes. |
| `PATCH` | `/api/notificaciones/{id}/leida` | `especialista` | Marca una notificación propia como leída; inexistente o ajena responde `404`. |
| `GET` | `/api/historia` | `especialista` | Lista historias limitadas al especialista autenticado. |
| `GET` | `/api/historia/{id}` | `especialista` | Obtiene historia propia del especialista; otra asignación no se autoriza. |
| `GET` | `/api/historia/mascota/{id_mascota}` | `especialista`, propietario (`usuario`) | El especialista consulta historias vinculadas a sus citas; el propietario solo las de mascota asociada a su cuenta. Mascota ajena devuelve `404` genérico. |
| `GET` | `/api/historia/cita/{id_cita}` | `especialista` | Consulta la historia de una cita únicamente si está asignada a ese especialista. |
| `POST` | `/api/historia` | `especialista` | Crea historia para cita a la que está asignado; no admite más de una por cita ni cita cancelada. |
| `PUT` | `/api/historia/{id}` | `especialista` | Actualiza historia solo si pertenece al especialista autenticado. |

Los valores entre llaves se reemplazan por el dato real, por ejemplo `/api/mascotas/12`. En particular, la autenticación JWT no equivale a permiso sobre todos los recursos: las reglas por propietario y especialista se vuelven a verificar en el backend.

El contrato conserva `especie: "perro" | "gato"` para compatibilidad de datos; la interfaz presenta esas especies como **Caninos** y **Felinos**. La nueva alta puede enviar `raza_nombre` con el nombre mostrado o escrito en «Otros»; el backend reutiliza un nombre existente o lo incorpora al catálogo `Raza`. Los clientes anteriores pueden seguir enviando `id_raza`.

## Errores y límites

- `400`: entrada inválida, token de recuperación inválido/expirado u otra precondición de solicitud.
- `401`: falta el JWT, es inválido/expiró, el usuario ya no existe o el token fue revocado con logout.
- `403`: la identidad autenticada no tiene rol o permiso de operación requerido.
- `404`: recurso no encontrado; se usa también para ocultar existencia de mascotas, citas o notificaciones ajenas en los alcances indicados.
- `409`: conflicto de estado/regla de negocio, incluida la sexta mascota (`MASCOTAS_LIMITE_ALCANZADO`).
- `429`: se superó el límite por IP de cinco solicitudes durante 15 minutos en login, registro o rutas de recuperación protegidas por rate limit; se incluye `Retry-After`.
- `503`: no hay PostgreSQL, falla la verificación de revocación o falta configuración SMTP/URL de frontend para enviar recuperación.

Los limitadores en memoria cuentan por instancia. Si se despliega más de una instancia, hace falta un almacén compartido compatible para un límite global. Tras proxy inverso, configura `TRUST_PROXY` con los saltos confiables exactos. Fuera del equipo local, usa HTTPS y nunca pongas contraseñas ni tokens en una URL.
