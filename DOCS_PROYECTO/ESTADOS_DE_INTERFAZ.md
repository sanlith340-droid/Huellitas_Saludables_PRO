# Estados de interfaz: carga, vacío, error y guardado

Documento de referencia del sistema de retroalimentación visual del frontend.
La regla que se cumple en toda la aplicación es simple:

> **Ninguna pantalla se queda en blanco.** Mientras carga hay una escena o un esqueleto;
> si no hay datos hay una ilustración con una acción; si la API falla hay un mensaje
> explicado, con un botón para reintentar.

---

## 1. Piezas del sistema

| Pieza | Archivo | Para qué sirve |
|---|---|---|
| `PerritoCorriendo` | `front/src/components/feedback/PerritoCorriendo.tsx` | Sprite pixel-art del perrito corriendo sobre una pista de huellas. Se usa en las escenas de carga. |
| `LoadingState` | `front/src/components/feedback/LoadingState.tsx` | Escena de carga con el perrito, título, mensajes rotativos y barra de progreso. Variantes: `pagina`, `panel`, `en-linea`, `esqueleto`. |
| `Esqueletos` | `front/src/components/feedback/Esqueletos.tsx` | Primitivas de esqueleto (`EsqueletoTexto`, `EsqueletoFilas`, `EsqueletoCitas`, `EsqueletoSemana`, `EsqueletoDoctores`, `EsqueletoEstadisticas`, `EsqueletoPerfil`). |
| `EmptyState` | `front/src/components/feedback/EmptyState.tsx` | Estado vacío ilustrado, con título, descripción, sugerencias y acción. Variantes: `tarjeta`, `panel`, `en-linea`. |
| `ErrorState` | `front/src/components/ErrorState.tsx` | Estado de error ilustrado con reintento. Variantes: `server`, `network`, `timeout`, `denied`, `appointment`, `search`, `user`, `notfound`. |
| `BotonEnvio` | `front/src/components/feedback/BotonEnvio.tsx` | Botón de envío: muestra "Guardando...", una huella girando y queda deshabilitado para evitar dobles envíos. Exporta también `SpinnerHuella`. |
| `BarraCargaGlobal` | `front/src/components/feedback/BarraCargaGlobal.tsx` | Barra superior con huellas y el perrito, visible mientras exista alguna petición en curso. |
| `AvisoSinConexion` | `front/src/components/feedback/AvisoSinConexion.tsx` | Aviso flotante cuando el navegador pierde la conexión y confirmación al recuperarla. |
| `ErrorBoundary` | `front/src/components/feedback/ErrorBoundary.tsx` | Red de seguridad ante un error inesperado de React: muestra una pantalla completa con opciones de recarga. |
| `loadingStore` | `front/src/services/loadingStore.ts` | Contador global de peticiones; alimenta la barra superior y la pista "en línea". |
| `erroresApi` | `front/src/utils/erroresApi.ts` | Traduce cualquier error a un mensaje entendible y decide la variante visual. |
| Estilos | `front/src/styles/estados.css` | Todo el CSS de estos estados (animaciones, esqueletos, escenas). |

Las ilustraciones viven en `front/src/assets/feedback/` y `front/src/assets/errors/`:
`vacio-mascotas`, `vacio-citas`, `vacio-busqueda`, `vacio-horarios`, `vacio-personal`,
más las de error (`server-vet`, `network`, `timeout`, `access-protected`, `appointment-calendar`, `search-empty`, `user-confused`, `not-found-search`).

---

## 2. Cómo se comporta cada pantalla

| Pantalla | Cargando | Sin datos | Si falla la API |
|---|---|---|---|
| Inicio (`/`) | Contenido estático: no hay espera | — | — |
| Iniciar sesión / Registro | Botón "Entrando…" / "Guardando…" con huella girando y campos deshabilitados | — | Tarjeta de error con la ilustración del veterinario y el motivo |
| Panel del tutor (`/dashboard`) | Esqueletos en cada tarjeta + barra global | "Aún no hay mascotas" / "No tienes citas agendadas" con acción | Tarjeta de error con reintento |
| Mis mascotas (`/mascotas`) | Escena del perrito + esqueletos de fichas | Ilustración + "Registrar mi primera mascota" | Tarjeta de error con reintento |
| Registrar mascota | Selector de razas deshabilitado + aviso "Cargando razas…" | — | Error de razas con reintento; el botón queda deshabilitado |
| Agendar cita (`/citas/nueva`) | Escena de página + esqueletos de especialistas | Sin mascotas: invitación a registrarla. Sin citas: vacío en línea | Error con reintento |
| Mis citas (especialista / admin) | Escena de panel + grupos de esqueletos | "La agenda está libre" / filtros sin coincidencias | Error con reintento |
| Disponibilidad | Esqueleto de semana + esqueleto de especialistas | "Este día no tiene franjas" con acción | Error con reintento |
| Gestión de personal | Esqueleto de filas (el formulario sigue usable) | "Todavía no hay cuentas de personal" | Error con reintento |
| Perfil | Escena + esqueleto del carné | — | Error según el código (403 / 404 / red) |
| Ruta inexistente | — | Página 404 ilustrada | — |

Todas las acciones que escriben en la base (crear mascota, crear cita, crear franja,
crear usuario, cancelar o marcar una cita, eliminar una cuenta) usan `BotonEnvio`
o `SpinnerHuella`: el botón se deshabilita, cambia el texto a "Guardando..." y gira
una huella.

---

## 3. Cómo probarlo sin backend

1. Levanta el frontend: `cd front && npm run dev`.
2. Entra a **`/estados`** (solo existe en modo desarrollo). Es una vitrina con cuatro
   pestañas: *Cargando*, *Sin datos*, *Errores* y *Guardando...*.
3. Para ver los estados reales, apaga el backend y navega: verás la tarjeta de error
   con el botón **Reintentar**; vuelve a encenderlo y el reintento recupera la pantalla.
4. Para ver la carga real, añade latencia artificial en el backend o usa las
   herramientas de red del navegador (Slow 3G).

---

## 4. Decisiones de diseño

- **Un mismo lenguaje visual.** El perrito pixel-art es el hilo conductor: corre en la
  barra superior, en las escenas de carga y en los botones (como huella girando).
- **Mensajes que acompañan.** La escena de carga rota mensajes cada 2,6 s con el
  contexto de la pantalla ("Revisando la agenda de la clínica..."), para que la espera
  se sienta parte de la experiencia.
- **Esqueleto antes que vacío.** Los esqueletos respetan la forma del contenido final,
  así la pantalla no "salta" cuando llegan los datos.
- **Errores accionables.** Todo error dice qué pasó y ofrece una salida: reintentar,
  volver al inicio, iniciar sesión o limpiar filtros.
- **Accesibilidad.** `role="status"` y `aria-live` en cargas y avisos, `aria-busy` en
  los botones que guardan, `aria-invalid` en los campos con error y respeto por
  `prefers-reduced-motion` (las animaciones se detienen).
- **Sin dependencias nuevas.** Todo se resolvió con React, CSS y los recursos ya
  presentes en el proyecto.
