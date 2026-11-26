# Estados de interfaz: carga, vacío, error y guardado

Referencia de los componentes de retroalimentación visual presentes en `front/src/`. Las pantallas combinan estos componentes según sus propias operaciones; la existencia de un componente no implica que cada vista utilice todas las variantes.

## 1. Componentes y ubicaciones

| Componente/recurso | Archivo | Función |
|---|---|---|
| `PerritoCorriendo` | `front/src/components/feedback/PerritoCorriendo.tsx` | Ilustración animada reutilizable de carga |
| `LoadingState` | `front/src/components/feedback/LoadingState.tsx` | Estado de carga con variantes `pagina`, `panel`, `en-linea`, `esqueleto` |
| `Esqueletos` | `front/src/components/feedback/Esqueletos.tsx` | Esqueletos de filas, citas, semana, doctores, estadísticas y perfil |
| `EmptyState` | `front/src/components/feedback/EmptyState.tsx` | Estado vacío ilustrado con descripción y acción opcional |
| `ErrorState` | `front/src/components/ErrorState.tsx` | Error ilustrado, mensaje y acción contextual |
| `BotonEnvio` / `SpinnerHuella` | `front/src/components/feedback/BotonEnvio.tsx` | Indicador visual de envío/guardado |
| `BarraCargaGlobal` | `front/src/components/feedback/BarraCargaGlobal.tsx` | Indicador global de peticiones |
| `AvisoSinConexion` | `front/src/components/feedback/AvisoSinConexion.tsx` | Aviso de conexión perdida o recuperada |
| `ErrorBoundary` | `front/src/components/feedback/ErrorBoundary.tsx` | Respaldo ante error de renderizado React |
| Estado de carga | `front/src/services/loadingStore.ts` | Almacén que alimenta indicadores globales |
| Normalización de errores | `front/src/utils/erroresApi.ts` | Conversión de errores API a mensajes/variantes |
| Estilos | `front/src/styles/estados.css` | Presentación de estados y animaciones |

Ilustraciones actuales: `front/src/assets/feedback/` y `front/src/assets/errors/`. Entre los recursos observados están `vacio-mascotas.webp`, `vacio-citas.webp`, `vacio-busqueda.webp`, `vacio-horarios.webp`, `vacio-personal.webp`, `server-vet.png`, `network.png`, `timeout.png`, `access-protected.png`, `appointment-calendar.png`, `search-empty.png`, `user-confused.png` y `not-found-search.png`.

## 2. Pantallas y estados documentados

La lista de rutas completa y roles está en [la guía del frontend](front_DOCUMENTACION/README.md). Esta tabla resume vistas que tienen patrón de retroalimentación descrito; no garantiza que cada error de red haya sido ejercitado de nuevo.

| Pantalla/ruta | Estados descritos |
|---|---|
| `/login`, `/registro` | Envío/guardado, validación y error contextual |
| `/dashboard` | Carga de tarjetas, vacío de mascotas/citas y error recuperable |
| `/mascotas` | Carga, listado vacío, error y selección de mascota para consultar historia |
| `/mascotas/nueva` | Carga/error de razas; al alcanzar el límite, mensaje `Ya tienes 5 mascotas registradas` y enlace de regreso |
| `/citas/nueva` | Carga, caso sin mascotas, error y resultado de solicitud |
| `/citas/especialista`, `/citas/recepcion`, `/citas/admin` | Carga/estado vacío/error según consultas y filtros de agenda |
| `/disponibilidad` | Carga de horarios, día sin franjas y error |
| `/admin`, `/usuarios/admin` | Panel/gestión de personal y estados de carga, vacío o error según operación |
| `/perfil` | Carga y error de consulta |
| Ruta `*` | Página 404 de SPA |

Los formularios y operaciones muestran los indicadores presentes en cada pantalla; no se afirma que todos los formularios compartan exactamente el mismo componente.

## 3. Vitrina de estados: `/estados`

`front/src/routes/AppRoutes.tsx` registra esta ruta solo cuando `import.meta.env.DEV` es verdadero; no está disponible en un build de producción. La vista está implementada en `front/src/pages/EstadosDemo.tsx` y sirve como vitrina de las variantes visuales. Para abrirla en desarrollo, inicia `front` con `npm run dev` y navega a `/estados`.

## 4. Funciones visuales con límites funcionales

- **Máximo de mascotas:** el límite de cinco lo aplica el backend. La vista de `/mascotas/nueva` representa el `409`/`MASCOTAS_LIMITE_ALCANZADO` con un estado vacío e ilustración; véase [Límite de mascotas](front_DOCUMENTACION/LIMITE_MASCOTAS.md).
- **Historia clínica del propietario:** carga y vacío/error se muestran en contexto de mascota. El propietario solo lee sus registros y puede filtrar por año/mes disponibles; autorización y propiedad se validan en backend. Véase [Historia clínica del propietario](front_DOCUMENTACION/HISTORIA_CLINICA_PROPIETARIO.md).
- **Accesibilidad/movimiento:** no se documentan aquí garantías de cobertura universal; revisa el componente concreto antes de atribuirle atributos ARIA o comportamiento de movimiento reducido.

## 5. Comandos relacionados

Desde `front/` existen `npm run dev`, `npm run build`, `npm run preview`, `npm run type-check` y `npm run lint`. No existe un script frontend de pruebas E2E/componentes en `front/package.json`. El estado más reciente de build/lint está en la [auditoría del 25/11/2026](auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md); esta guía no registra una ejecución nueva.
