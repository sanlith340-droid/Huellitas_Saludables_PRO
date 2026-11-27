# Frontend — Huellitas Saludables

**Código:** `front/`  
**Rutas:** `front/src/routes/AppRoutes.tsx`  
**Stack observado:** React 18, TypeScript 5, Vite 6, React Router DOM 7, Axios.

## Responsabilidad y arquitectura

La SPA implementa inicio de sesión y registro, paneles por rol, mascotas, solicitud y gestión de citas, disponibilidad, historias clínicas, notificaciones, perfil, páginas legales y recuperación de contraseña. El arranque está en `front/src/main.tsx`; `AppRoutes.tsx` declara la navegación; `MainLayout` comparte estructura; `front/src/services/api.ts` concentra el cliente HTTP.

Mapa principal de carpetas:

```text
front/src/
├── components/  # navegación, formularios, protecciones de ruta y estados visuales
├── context/     # contexto de autenticación
├── layouts/     # composición común
├── pages/       # pantallas cargadas por ruta
├── routes/      # tabla de rutas
├── services/    # API y estado de carga
├── styles/      # hojas de estilo
└── utils/       # mensajes/normalización de errores y entradas
```

La tabla siguiente refleja `AppRoutes.tsx` (no una propuesta de navegación):

| Ruta | Pantalla | Acceso en frontend |
|---|---|---|
| `/`, `/login`, `/registro` | Inicio, ingreso, registro | Público |
| `/legal/:documento`, `/recuperar-contrasena`, `/nueva-contrasena` | Documentos y recuperación de contraseña | Público |
| `/dashboard` | Panel del propietario | `usuario` |
| `/perfil` | Perfil | Cualquier sesión autenticada |
| `/mascotas`, `/mascotas/nueva` | Mascotas y alta | `usuario` |
| `/citas/nueva` | Solicitud de cita | `usuario` |
| `/disponibilidad` | Disponibilidad | `recepcionista`, `admin` |
| `/citas/especialista`, `/notificaciones` | Agenda y notificaciones | `especialista` |
| `/citas/recepcion` | Agenda de recepción | `recepcionista` |
| `/citas/admin`, `/admin`, `/usuarios/admin` | Agenda, panel y personal | `admin` |
| `/estados` | Vitrina de estados visuales | Solo desarrollo (`import.meta.env.DEV`) |
| `*` | Página no encontrada | — |

`PrivateRoute` y `RoleRoute` controlan el acceso visual/navegación. No sustituyen la autorización de la API: el backend valida roles y pertenencia de los datos.

## Funcionalidades de interfaz documentadas

- **Registro de mascotas:** el selector muestra **Caninos** y **Felinos** y carga razas dinámicas ordenadas por especie. Si el proveedor no está disponible, ofrece el catálogo local y permite continuar; **Otros** abre el campo «Especifica la raza de tu mascota». Cambiar de especie limpia la raza anterior. El formulario guarda el nombre de raza recibido o personalizado y mantiene el reinicio de campos que ya ocurre tras un alta exitosa.
- **Límite de mascotas:** hasta cinco por usuario; la sexta se rechaza en backend con `409` y `MASCOTAS_LIMITE_ALCANZADO`. El frontend presenta el estado ilustrado descrito en [Límite de mascotas](LIMITE_MASCOTAS.md).
- **Historias del propietario:** `HistoriaClinicaMascota` ofrece consulta de solo lectura por mascota y filtro por año/mes disponibles. El backend comprueba propiedad y devuelve un 404 genérico para mascotas ajenas. Detalle en [Historia clínica del propietario](HISTORIA_CLINICA_PROPIETARIO.md).
- **Retroalimentación visual:** escenas/esqueletos de carga, vacíos con acción, errores con reintento y guardado; el mapa vigente está en [Estados de interfaz](../ESTADOS_DE_INTERFAZ.md).
- **Navegación y errores:** los destinos por rol, la barra de navegación y los errores tratados se resumen en [Navegación y estados de error](NAVEGACION_Y_ESTADOS_DE_ERROR.md).

## API y autenticación

En desarrollo local el cliente utiliza por defecto `http://localhost:3000/api`; en Docker Compose el frontend usa `/api` a través del proxy Nginx. El cliente Axios adjunta Bearer token cuando existe. El backend verifica la sesión y los permisos; no consideres el almacenamiento del token o los filtros del navegador una barrera de autorización.

## Comandos del paquete frontend

Desde `front/`:

```bash
npm ci
npm run dev
```

Scripts declarados en `front/package.json`:

| Script | Comando | Función |
|---|---|---|
| `dev` | `vite` | Servidor de desarrollo |
| `build` | `tsc -b && vite build` | Comprobación TypeScript y build |
| `preview` | `vite preview` | Vista previa del build |
| `lint` | `eslint .` | Análisis estático ESLint |
| `type-check` | `tsc --noEmit --project tsconfig.json` | Comprobación TypeScript |

No hay script de test automatizado de frontend ni E2E declarado en ese manifiesto. La última auditoría disponible (25/11/2026) registra build correcto, lint frontend 0 errores/0 advertencias y 8 vulnerabilidades de npm ci en el proyecto (4 moderadas/4 altas); consulta [el informe](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md) y la [lista de pendientes manuales](../sustentacion_DOCUMENTACION/00_CIERRE_T4_PENDIENTES_MANUALES.md). No se ejecutó nada nuevo para esta guía.

## Enlaces del proyecto

- [Arranque](../arranque.md)
- [Índice de documentación](../README.md)
- [API backend](../back_DOCUMENTACION/API.md)
- [Arquitectura backend](../back_DOCUMENTACION/ARQUITECTURA.md)
- [Ejecución de pruebas](../test_DOCUMENTACION/EJECUCION.md)
- [Estado de continuidad](../../.agents/workflows/ESTADO_ACTUAL.md)
