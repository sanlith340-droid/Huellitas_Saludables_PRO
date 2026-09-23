# Mensajes de error específicos por tipo de usuario

Se ajustó el manejo de errores de autorización para que los mensajes indiquen el tipo de cuenta que está intentando realizar la acción y qué tipo de cuenta sí puede realizarla. **No se cambiaron las reglas de permisos**; únicamente se hicieron más claros los mensajes.

## Mensajes del backend

Estos mensajes aparecen cuando una persona está autenticada, pero intenta usar un endpoint cuyo rol no está autorizado. La respuesta HTTP continúa siendo `403 FORBIDDEN`.

| Tipo de usuario | Mensaje base nuevo | Cuándo aparece |
|---|---|---|
| `usuario` | **“Tu cuenta de usuario no tiene permisos para realizar esta acción. Solo el personal autorizado puede acceder a esta función.”** | Cuando una cuenta de usuario intenta una función reservada al personal, por ejemplo crear o modificar disponibilidad, gestionar historias clínicas o registrar cuentas administrativas. |
| `especialista` | **“Tu cuenta de especialista no tiene permisos para realizar esta acción. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.”** | Cuando un especialista intenta una operación que no le corresponde, por ejemplo administrar disponibilidad, cancelar/editar citas reservadas para otros roles o crear usuarios administrativos. |
| `recepcionista` | **“Tu cuenta de recepcionista no tiene permisos para realizar esta acción. Esta función está reservada para especialistas o administradores.”** | Cuando una cuenta de recepción intenta acceder a historias clínicas u otra función reservada para especialistas o administradores. |
| `admin` | **“Tu cuenta de administrador no tiene permisos para realizar esta acción con la configuración actual. Verifica la operación solicitada.”** | Cuando una cuenta administradora intenta una operación que, según la ruta actual, está limitada a otro rol. |
| Rol desconocido | **“Tu cuenta no tiene permisos para realizar esta acción. Verifica tu tipo de usuario o solicita apoyo al administrador.”** | Como mensaje de respaldo si la base de datos contiene un rol no contemplado en el catálogo. |

Después del mensaje base, el backend agrega automáticamente los roles permitidos para esa ruta. Por ejemplo:

> “Tu cuenta de usuario no tiene permisos para realizar esta acción. Solo el personal autorizado puede acceder a esta función. Esta acción está disponible para especialista.”

Los roles permitidos se calculan directamente desde cada ruta, por lo que el mensaje se mantiene sincronizado con la autorización real. Algunos ejemplos son:

| Acción protegida | Roles permitidos | Caso que genera el mensaje |
|---|---|---|
| Crear disponibilidad | `recepcionista` o `admin` | Un `usuario` o `especialista` intenta crear una franja horaria. |
| Crear o actualizar historia clínica | `especialista` | Un `usuario`, `recepcionista` o `admin` intenta gestionar una historia clínica. |
| Crear una mascota | `usuario` o `admin` | Un `especialista` o `recepcionista` intenta registrar una mascota. |
| Crear una cuenta desde administración | `admin` | Cualquier rol distinto de `admin` intenta registrar personal o administradores. |

## Mensajes del frontend

También se modificó `RoleRoute`. Antes, cuando una persona autenticada entraba manualmente a una vista no permitida, era redirigida a `/dashboard` sin explicación. Ahora permanece en la aplicación y ve un mensaje específico para su rol:

| Tipo de usuario | Mensaje mostrado en la pantalla | Cuándo aparece |
|---|---|---|
| `usuario` | **“Tu cuenta de usuario no tiene permisos para ver esta sección. Solo el personal autorizado puede acceder.”** | Al intentar abrir directamente una pantalla protegida para personal autorizado. |
| `especialista` | **“Tu cuenta de especialista no tiene permisos para ver esta sección. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.”** | Al abrir una sección exclusiva de recepción o administración. |
| `recepcionista` | **“Tu cuenta de recepcionista no tiene permisos para ver esta sección. Esta función está reservada para especialistas o administradores.”** | Al abrir una sección exclusiva de especialistas o administradores. |
| `admin` | **“Tu cuenta de administrador no tiene permisos para ver esta sección con la configuración actual. Verifica la operación solicitada.”** | Si la configuración de rutas limita una vista a otros roles. |
| Rol desconocido | **“Tu cuenta no tiene permisos para ver esta sección. Verifica tu tipo de usuario o solicita apoyo al administrador.”** | Como respaldo para un rol no reconocido. |

## Archivos modificados

- `back/app/middlewares/identifyUser.js`: usa el mensaje específico del rol y agrega los roles permitidos por endpoint en las respuestas `403`.
- `back/app/utils/roleMessages.js`: catálogo centralizado de mensajes del backend.
- `front/src/components/RoleRoute.tsx`: reemplaza la redirección silenciosa por un mensaje visible.
- `front/src/utils/roleMessages.ts`: catálogo centralizado de mensajes del frontend.

## Validación realizada

- La sintaxis de los dos archivos JavaScript del backend fue validada con `node --check`.
- Se ejecutó TypeScript directamente con `node ./node_modules/typescript/bin/tsc -b --pretty false` y no reportó errores de tipos.
- El empaquetado de Vite no pudo completarse porque la instalación incluida en el ZIP no contiene el paquete opcional nativo `@rollup/rollup-linux-x64-gnu`; es un problema de dependencias del entorno, no del código modificado.
