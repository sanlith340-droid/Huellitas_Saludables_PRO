# Navegación por secciones y estados de error

Esta mejora mantiene la SPA React/TypeScript, el cliente Axios de `front/src/services/api.ts` y las rutas declaradas en `front/src/routes/AppRoutes.tsx`. La navegación usa enlaces de React Router y conserva las protecciones existentes; ocultar o mostrar un enlace nunca sustituye la autorización del backend.

## Secciones principales

| Sección | Destino | Criterio de rol |
|---|---|---|
| Inicio | Usuario: `/dashboard`; personal (`especialista`, `recepcionista`, `admin`) y visitante: `/` | Los tutores conservan su resumen de cuenta; el personal mantiene un Inicio distinto de su módulo de trabajo. |
| Mascotas | `/mascotas` | Requiere sesión; las operaciones siguen sujetas a la API. |
| Citas | Usuario: `/citas/nueva`; especialista: `/citas/especialista`; recepción: `/disponibilidad`; administración: `/admin` | La navegación conserva los destinos ya protegidos/implementados por rol. |
| Perfil | `/perfil` | Requiere sesión y consulta `GET /api/auth/perfil`. |

La barra destaca el destino actual, tiene etiquetas e iconos visibles, el control móvil expone `aria-expanded`/`aria-controls`, puede cerrarse con Escape y se adapta al ancho sin ocultar las páginas debajo de un panel flotante. La ruta del Perfil no modifica datos; muestra los campos públicos devueltos por el backend.

## Estados ilustrados

`src/components/ErrorState.tsx` centraliza el patrón de imagen, título, descripción y acción; sus imágenes PNG transparentes viven en `src/assets/errors/`.

| Contexto | Ilustración | Uso / recuperación |
|---|---|---|
| Credenciales de usuario no válidas (`401` del login) | Perrito confundido | Revisar los datos y volver a intentar en el formulario. |
| Ruta SPA inexistente (`404`) | Mascota buscando algo perdido | Enlace para regresar al inicio. |
| Acceso por rol no permitido (`403`) | Mascota junto a un escudo | Conserva el mensaje que corresponde al rol y ofrece ir al inicio disponible. |
| Error interno/no disponibilidad (`500`/`503`) | Perrito veterinario preocupado | Reintentar la carga; se presenta el mensaje seguro del backend. |
| Horario agotado o conflicto de cita (`409`) | Mascota frente a un calendario | Actualizar horarios y elegir otra franja. |
| Búsqueda sin coincidencias | Perrito buscando con lupa | Ajustar el texto o los filtros; no interrumpe la navegación. |

La tabla sigue `DOCS_PROYECTO/back_DOCUMENTACION/API.md` y `MENSAJES_DE_ERROR_POR_ROL.md`: las respuestas fallidas del backend llevan `success: false`, `message`, `code` y `details`; los códigos HTTP conservan su significado. Un `404` de un recurso API no se transforma automáticamente en 404 de ruta SPA, y el `401` de sesión vencida sigue limpiando la sesión/redirigiendo a inicio de sesión según el interceptor Axios.

## Archivos de implementación

- Navegación: `front/src/components/Navbar.tsx` y estilos en `front/src/index.css`.
- Perfil/API: `front/src/pages/Perfil.tsx`, `front/src/routes/AppRoutes.tsx`, `GET /api/auth/perfil`.
- Estados: `front/src/components/ErrorState.tsx`, `front/src/pages/NotFound.tsx`, `front/src/components/RoleRoute.tsx`, `front/src/pages/Login.tsx`, `front/src/pages/NuevaCita.tsx` y `front/src/pages/Dashboard.tsx`.
