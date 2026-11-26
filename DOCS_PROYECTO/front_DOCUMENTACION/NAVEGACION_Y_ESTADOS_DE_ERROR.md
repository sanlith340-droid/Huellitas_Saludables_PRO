# Navegación por secciones y estados de error

La SPA React/TypeScript usa Axios en `front/src/services/api.ts` y define rutas en `front/src/routes/AppRoutes.tsx`. La tabla corresponde a las rutas y protecciones declaradas en el checkout actual; ocultar o mostrar un enlace nunca sustituye la autorización del backend.

## Rutas y criterios de acceso

| Función | Ruta(s) | Criterio de rol en `AppRoutes.tsx` |
|---|---|---|
| Inicio, ingreso y registro | `/`, `/login`, `/registro` | Público |
| Documentos legales y recuperación | `/legal/:documento`, `/recuperar-contrasena`, `/nueva-contrasena` | Público |
| Panel del propietario | `/dashboard` | `usuario` |
| Perfil | `/perfil` | Sesión autenticada (`PrivateRoute`) |
| Mascotas | `/mascotas`, `/mascotas/nueva` | `usuario` |
| Solicitar cita | `/citas/nueva` | `usuario` |
| Disponibilidad | `/disponibilidad` | `recepcionista`, `admin` |
| Agenda del especialista y notificaciones | `/citas/especialista`, `/notificaciones` | `especialista` |
| Agenda de recepción | `/citas/recepcion` | `recepcionista` |
| Agenda y panel de administración | `/citas/admin`, `/admin` | `admin` |
| Gestión de usuarios/personal | `/usuarios/admin` | `admin` |
| Vitrina de estados | `/estados` | Solo modo desarrollo (`import.meta.env.DEV`) |
| Ruta no definida | `*` | Página 404 |

`RoleRoute` redirige a `/login` si no hay sesión y representa una vista de acceso protegido si el rol no coincide. El backend vuelve a validar permisos y propiedad en cada operación protegida.

## Estados ilustrados de error

`front/src/components/ErrorState.tsx` centraliza variantes para errores de interfaz. Los recursos PNG están en `front/src/assets/errors/`.

| Contexto | Variante visual | Recuperación |
|---|---|---|
| Credenciales incorrectas en login | Error contextual del formulario | Revisar los datos y volver a intentar |
| Ruta SPA inexistente | Vista de `NotFound` | Volver al inicio |
| Rol sin acceso a una ruta | Acceso protegido (`denied`) | Ir al inicio disponible para el rol |
| Fallo interno/no disponibilidad | Error de servidor | Reintentar cuando esté disponible |
| Conflicto de cita/disponibilidad | Error de cita | Elegir otra franja/actualizar disponibilidad |
| Búsqueda sin coincidencias | Estado de búsqueda vacía | Ajustar consulta o filtros |

Los mensajes de permisos y códigos HTTP deben permanecer alineados con [API](../back_DOCUMENTACION/API.md) y [Mensajes de error por rol](../back_DOCUMENTACION/MENSAJES_DE_ERROR_POR_ROL.md). Un `404` de un recurso API no es lo mismo que una ruta SPA inexistente. La respuesta `401` por sesión inválida se procesa mediante el cliente/interceptor de Axios.

## Navegación y accesibilidad

La navegación se implementa en `front/src/components/Navbar.tsx`. La documentación previa registra etiquetas e iconos, control móvil con atributos ARIA y cierre con Escape; verifica su estado en el componente antes de tomar esta nota como especificación de diseño. La ruta Perfil es una vista, no una promesa de que el frontend pueda editar todos los datos de cuenta.

## Archivos de implementación relacionados

- Rutas: `front/src/routes/AppRoutes.tsx`.
- Guardas: `front/src/components/PrivateRoute.tsx` y `front/src/components/RoleRoute.tsx`.
- Navegación: `front/src/components/Navbar.tsx`.
- Errores: `front/src/components/ErrorState.tsx`, `front/src/pages/NotFound.tsx` y `front/src/utils/erroresApi.ts`.
- Mensajes por rol: `front/src/utils/roleMessages.ts`.
