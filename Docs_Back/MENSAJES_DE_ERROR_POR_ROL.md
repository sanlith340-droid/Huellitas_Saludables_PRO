# Mensajes cuando una cuenta no tiene permiso

Esta guía explica qué ve una persona cuando intenta abrir una sección o usar una función que no corresponde a su rol. Solo cambia la explicación del error: **no cambia quién puede hacer cada acción**. Cuando el token sirve, pero el rol no tiene permiso, la API responde `403 FORBIDDEN`.

## Lo que responde el backend

El mensaje depende del rol actual. Después, la API agrega qué roles sí pueden hacer esa acción.

| Rol | Mensaje que usa el backend | Un ejemplo de cuándo sale |
|---|---|---|
| `usuario` | “Tu cuenta de usuario no tiene permisos para realizar esta acción. Solo el personal autorizado puede acceder a esta función.” | Intenta administrar horarios o historias clínicas. |
| `especialista` | “Tu cuenta de especialista no tiene permisos para realizar esta acción. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.” | Intenta administrar disponibilidad o hacer una tarea de recepción. |
| `recepcionista` | “Tu cuenta de recepcionista no tiene permisos para realizar esta acción. Esta función está reservada para especialistas o administradores.” | Intenta abrir una historia clínica. |
| `admin` | “Tu cuenta de administrador no tiene permisos para realizar esta acción con la configuración actual. Verifica la operación solicitada.” | La ruta permite solo otro rol. |
| Rol que no está en la lista | “Tu cuenta no tiene permisos para realizar esta acción. Verifica tu tipo de usuario o solicita apoyo al administrador.” | La base tiene un rol no reconocido por la app. |

Por ejemplo, una respuesta puede decir que una cuenta de usuario no tiene permiso y agregar que esa acción está disponible para especialistas. Los roles permitidos salen de la configuración de cada ruta.

| Acción | Roles permitidos en la ruta |
|---|---|
| Crear disponibilidad | `recepcionista`, `admin` |
| Crear o actualizar una historia clínica | `especialista` |
| Crear una mascota | `usuario`, `admin` |
| Crear una cuenta desde administración | `admin` |

## Lo que muestra el frontend

Si alguien escribe directamente una dirección de pantalla que no puede usar, `RoleRoute` muestra un aviso. La persona se queda en la app y entiende qué pasó, en vez de ser enviada al panel sin explicación.

| Rol | Mensaje que aparece en pantalla |
|---|---|
| `usuario` | “Tu cuenta de usuario no tiene permisos para ver esta sección. Solo el personal autorizado puede acceder.” |
| `especialista` | “Tu cuenta de especialista no tiene permisos para ver esta sección. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.” |
| `recepcionista` | “Tu cuenta de recepcionista no tiene permisos para ver esta sección. Esta función está reservada para especialistas o administradores.” |
| `admin` | “Tu cuenta de administrador no tiene permisos para ver esta sección con la configuración actual. Verifica la operación solicitada.” |
| Rol que no está en la lista | “Tu cuenta no tiene permisos para ver esta sección. Verifica tu tipo de usuario o solicita apoyo al administrador.” |

## Archivos relacionados

- `back/app/middlewares/identifyUser.js`: revisa el rol y arma la respuesta `403`.
- `back/app/utils/roleMessages.js`: mensajes del backend.
- `front/src/components/RoleRoute.tsx`: protección de pantallas.
- `front/src/utils/roleMessages.ts`: mensajes del frontend.

## Revisarlo

Desde `back/`, `npm test` corre las pruebas del backend. Desde `front/`, `npm run type-check` revisa los tipos de TypeScript. El servidor es quien debe bloquear las operaciones; ocultar una pantalla en el frontend no reemplaza esa verificación.
