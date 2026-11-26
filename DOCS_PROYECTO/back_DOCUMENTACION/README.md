# Documentación del backend y referencias técnicas

La carpeta documental vigente es `DOCS_PROYECTO/`; este subdirectorio contiene arquitectura, API, guías operativas y bitácoras backend. No existe una carpeta raíz `docs/` en esta copia.

## Guías de referencia vigentes

| Documento | Contenido |
|---|---|
| [API](./API.md) | Rutas, roles, permisos por propietario/especialista, errores y límites actuales. |
| [Arquitectura](./ARQUITECTURA.md) | Capas, 11 modelos Prisma, relaciones, migraciones y controles de acceso. |
| [Desarrollo](./DESARROLLO.md) | Instalación, entorno, scripts, migraciones y pruebas. |
| [Docker](./DOCKER.md) | Compose local, arranque y cuidado de datos. |
| [Límite de mascotas](./LIMITE_MASCOTAS.md) | Máximo de cinco mascotas por usuario y respuesta de la API. |
| [Arquitectura, reglas y decisiones técnicas](./ARQUITECTURA_REGLAS_Y_DECISIONES_TECNICAS.md) | Reglas de negocio y contraste técnico actualizado. |
| [Tecnologías, responsabilidades y motivos](./TECNOLOGIAS_RESPONSABILIDADES_Y_MOTIVOS.md) | Stack, versiones, scripts, límites y riesgos. |
| [Mensajes de error por rol](./MENSAJES_DE_ERROR_POR_ROL.md) | Catálogo de mensajes de permisos. |

Para credenciales de backend y comandos breves, consulta [`back/Readme.md`](../../back/Readme.md). La ejecución backend más reciente documentada está enlazada desde [`DOCS_PROYECTO/test_DOCUMENTACION/EJECUCION.md`](../test_DOCUMENTACION/EJECUCION.md); las pruebas no se volvieron a ejecutar al actualizar esta documentación.

## Bitácoras y material histórico

Las bitácoras fechadas conservan sus hechos, fechas y resultados originales; sus cifras no representan automáticamente el estado actual. Para el estado vigente, prevalecen `API.md`, `ARQUITECTURA.md`, `DESARROLLO.md` y el estado de continuidad en `.agents/workflows/ESTADO_ACTUAL.md`.

- [Bcrypt y compatibilidad scrypt](./BITACORA_BCRYPT.md)
- [Cierre de sesión e invalidación de tokens](./BITACORA_CIERRE_SESION_INVALIDACION_TOKENS.md)
- [Migración ESM](./BITACORA_ESM.md)
- [Fusión RF09 y recuperación](./BITACORA_FUSION_RF09_Y_RECUPERACION.md)
- [Historias clínicas del propietario](./BITACORA_HISTORIA_CLINICA_PROPIETARIO.md)
- [Límite de intentos de login/registro](./BITACORA_LIMITE_INTENTOS_LOGIN_REGISTRO.md)
- [Migración a Vitest](./BITACORA_MIGRACION_VITEST.md)
- [Modernización Prisma y citas](./BITACORA_MODERNIZACION_PRISMA_Y_CITAS.md)
- [Prevención de SQL injection](./BITACORA_SQL_INJECTION.md)
- [Validación de formularios](./BITACORA_VALIDACION_FORMULARIOS.md)
- [Auditoría de esta actualización documental](./BITACORA_ACTUALIZACION_DOCUMENTACION_BACKEND_2026-11-25.md)

`DECISIONES_TECNICAS_BACKEND.md`, `REVISION_PROYECTO.md` y `GUIA_BACKEND_ANTERIOR.md` son material histórico/auxiliar; no prevalecen sobre las guías vigentes enlazadas arriba.
