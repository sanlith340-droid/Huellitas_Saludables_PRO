# Huellitas Saludables

Sistema web para la gestión de una veterinaria: registro de mascotas, citas según disponibilidad, agenda de especialistas e historias clínicas con acceso diferenciado por rol.

| Área | Tecnología observada en los manifiestos/configuración |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 6, React Router y Axios |
| Backend | Node.js 22, Express 4, Prisma ORM 7 (ESM) |
| Base de datos | PostgreSQL 16 |
| API | REST; documentación Swagger/OpenAPI en `/api-docs` |
| Entorno local | Docker Compose: PostgreSQL, backend y frontend/Nginx |

El proyecto se mantiene en desarrollo. La configuración de Compose y las guías locales no equivalen a un despliegue de producción.

## Índice

1. [Funciones y roles](#funciones-y-roles)
2. [Rutas reales de la interfaz](#rutas-reales-de-la-interfaz)
3. [Seguridad y datos](#seguridad-y-datos)
4. [Arquitectura y entorno](#arquitectura-y-entorno)
5. [Scripts disponibles](#scripts-disponibles)
6. [Estado de validación documentado](#estado-de-validación-documentado)
7. [Documentación del repositorio](#documentación-del-repositorio)

## Funciones y roles

- **Propietario (`usuario`):** consulta su panel, registra hasta cinco mascotas, solicita citas y consulta la historia clínica de sus mascotas. La historia se filtra por año y mes disponibles.
- **Especialista (`especialista`):** consulta sus citas asignadas, actualiza el estado de atención, registra o edita la historia clínica de una cita atendida y consulta notificaciones in-app.
- **Recepción (`recepcionista`):** gestiona disponibilidad y agenda de citas de recepción.
- **Administración (`admin`):** administra disponibilidad, citas, usuarios/personal y su panel.
- **Público:** puede ingresar, registrarse, consultar documentos legales y solicitar/restablecer una contraseña si está configurado el correo saliente.

La API implementa además disponibilidad, razas, usuarios, citas, historias, autenticación, recuperación de contraseña y notificaciones. Revisa los contratos detallados en [API](DOCS_PROYECTO/back_DOCUMENTACION/API.md).

## Rutas reales de la interfaz

Las rutas se declaran en `front/src/routes/AppRoutes.tsx`. Las protecciones visibles del frontend mejoran la navegación; los permisos definitivos y la propiedad de recursos se vuelven a validar en el backend.

| Ruta | Pantalla/función | Acceso declarado en frontend |
|---|---|---|
| `/`, `/login`, `/registro` | Inicio, ingreso y registro | Público |
| `/legal/:documento`, `/recuperar-contrasena`, `/nueva-contrasena` | Documentos legales y recuperación de contraseña | Público |
| `/dashboard` | Panel del propietario | `usuario` |
| `/perfil` | Perfil | Cualquier sesión activa |
| `/mascotas`, `/mascotas/nueva` | Listado/consulta de historias y alta de mascota | `usuario` |
| `/citas/nueva` | Solicitud de cita | `usuario` |
| `/disponibilidad` | Administración de horarios | `recepcionista`, `admin` |
| `/citas/especialista`, `/notificaciones` | Agenda y notificaciones | `especialista` |
| `/citas/recepcion` | Agenda de recepción | `recepcionista` |
| `/citas/admin`, `/admin`, `/usuarios/admin` | Gestión de citas, panel y personal | `admin` |
| `/estados` | Vitrina de estados visuales | Solo en modo desarrollo (`import.meta.env.DEV`) |
| Cualquier otra ruta | Página no encontrada | — |

## Seguridad y datos

- El backend verifica JWT, comprueba que la cuenta exista y toma su rol vigente de la base de datos; también consulta la lista de tokens revocados.
- Las consultas de mascotas y citas aplican autorización por rol y pertenencia. Un propietario solo accede a sus mascotas y a citas de sus mascotas; un especialista solo ve sus citas asignadas. Los recursos ajenos responden como no encontrados en las consultas protegidas documentadas. Recepción y administración tienen los alcances definidos por las rutas y servicios.
- La regla de cinco mascotas se aplica en backend: el intento de registrar la sexta responde HTTP `409` con `MASCOTAS_LIMITE_ALCANZADO`; el frontend representa ese resultado, pero no es la barrera de seguridad.
- El propietario consulta historias clínicas en modo lectura; el backend valida la relación de propiedad y no confía en filtros del cliente.
- Las nuevas contraseñas se guardan con bcrypt; el código permite verificar hashes scrypt heredados para su migración progresiva y no acepta contraseñas almacenadas en texto plano.
- `docker-compose.yml` exige `DB_PASSWORD` y `JWT_SECRET`; CORS se configura por origen permitido. No publiques credenciales ni datos reales.

Para la documentación específica de seguridad y mensajes por rol, consulta [Arquitectura](DOCS_PROYECTO/back_DOCUMENTACION/ARQUITECTURA.md), [mensajes de error](DOCS_PROYECTO/back_DOCUMENTACION/MENSAJES_DE_ERROR_POR_ROL.md) y la [guía de historia clínica del propietario](DOCS_PROYECTO/front_DOCUMENTACION/HISTORIA_CLINICA_PROPIETARIO.md).

## Arquitectura y entorno

- `back/`: API, servicios, modelos, esquemas Joi, rutas, Prisma y pruebas backend.
- `front/`: SPA React/TypeScript, páginas, componentes, rutas, estilos y cliente API.
- `DOCS_PROYECTO/`: documentación técnica, de interfaz, pruebas, auditoría y sustentación.
- `.agents/`: reglas, skills y workflows de continuidad del repositorio.
- `docker-compose.yml`: `db` (PostgreSQL), `backend` y `frontend` (Nginx con proxy hacia la API). El Compose exige configurar `DB_PASSWORD` y `JWT_SECRET`; los valores locales de puerto y CORS están declarados en el propio archivo.

En desarrollo local sin Docker, Vite suele servir el frontend en `http://localhost:5173` y la API en `http://localhost:3000`; para levantarlo con Docker Compose, el frontend se publica en el puerto `APP_PORT` (por defecto `8080`). Sigue [Arranque](DOCS_PROYECTO/arranque.md) y verifica las variables requeridas antes de iniciar. Este checkout no contiene plantillas `.env.example` ni `.env.docker.example`: crea los archivos locales necesarios manualmente, no los subas a Git y usa secretos propios.

## Scripts disponibles

Ejecuta los comandos dentro de la carpeta indicada; estos nombres provienen de `back/package.json` y `front/package.json`.

| Carpeta | Comando | Función |
|---|---|---|
| `back/` | `npm run dev` / `npm start` | API en desarrollo / inicio normal |
| `back/` | `npm run migrate` / `npm run migrate:status` | Aplicar / consultar migraciones Prisma |
| `back/` | `npm run seed` | Ejecutar la semilla Prisma |
| `back/` | `npm test` / `npm run test:watch` / `npm run test:coverage` | Suite Vitest, modo observación / cobertura |
| `back/` | `npm run lint` / `npm run lint:fix` | ESLint / corrección automática de ESLint |
| `back/` | `npm run db:reset` | Restablecer la base; es destructivo y no debe usarse sobre datos que se quieran conservar |
| `front/` | `npm run dev` / `npm run preview` | Vite en desarrollo / vista previa del build |
| `front/` | `npm run build` | `tsc -b` y build Vite |
| `front/` | `npm run type-check` | Comprobación TypeScript |
| `front/` | `npm run lint` | ESLint |

No hay script de pruebas frontend ni E2E definido en `front/package.json`.

## Estado de validación documentado

El informe más reciente de cierre disponible es [la auditoría del 25/11/2026](DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md). Registra:

- Backend: **410/410 pruebas en 31 archivos**.
- Build frontend: correcto.
- ESLint: frontend **0 errores/0 advertencias**; backend **0 errores/4 advertencias**.
- `npm ci`: **8 vulnerabilidades** reportadas (4 moderadas y 4 altas), pendientes de resolución o justificación.
- En el árbol actual hay seis directorios de migración Prisma, incluido `0_init`; el informe advierte que `prisma migrate deploy` no se ejecutó en aquella validación.
- No se acreditan una ejecución remota de CI, despliegue a producción, pruebas E2E ni una nueva ejecución de backup/restore en ese informe. La auditoría describe un ensayo local previo de backup/restore; no se presenta aquí como repetido.

La configuración de CI en el repositorio y los scripts/guías operativas no demuestran que esas tareas se hayan ejecutado en un servicio remoto o en producción. Para alcance y precauciones de QA consulta [Ejecución](DOCS_PROYECTO/test_DOCUMENTACION/EJECUCION.md) y el [Plan Maestro de Pruebas](DOCS_PROYECTO/test_DOCUMENTACION/PLAN_MAESTRO_DE_PRUEBAS.md).

## Documentación del repositorio

| Documento | Contenido |
|---|---|
| [Índice de documentación](DOCS_PROYECTO/README.md) | Mapa de las guías activas en `DOCS_PROYECTO/` |
| [Arranque](DOCS_PROYECTO/arranque.md) | Puesta en marcha con Compose o en local |
| [Estados de interfaz](DOCS_PROYECTO/ESTADOS_DE_INTERFAZ.md) | Carga, vacío, error, guardado y `/estados` |
| [Documentación frontend](DOCS_PROYECTO/front_DOCUMENTACION/README.md) | Rutas, stack y comportamiento de pantallas |
| [Documentación backend](DOCS_PROYECTO/back_DOCUMENTACION/README.md) | Índice técnico, API, arquitectura y decisiones |
| [Documentación de pruebas](DOCS_PROYECTO/test_DOCUMENTACION/README.md) | Plan, ejecución y límites de QA |
| [Cierre T4: pendientes manuales](DOCS_PROYECTO/sustentacion_DOCUMENTACION/00_CIERRE_T4_PENDIENTES_MANUALES.md) | Pendientes de evidencia, despliegue y aceptación |
| [Estado para continuidad](.agents/workflows/ESTADO_ACTUAL.md) | Resumen fechado para el siguiente modelo |

