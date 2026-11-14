# Documentación del backend y documentos técnicos

Esta carpeta agrupa la documentación de backend y los documentos técnicos que antes estaban repartidos en distintas ubicaciones. La organización documental canónica es `docs/`, con áreas hermanas `back/`, `front/` y `test/`; la guía de arranque está en [`../arranque.md`](../arranque.md).

## Documentos principales

| Documento | Contenido |
|---|---|
| [API](API.md) | Rutas HTTP, permisos y contrato de la API. |
| [Arquitectura](ARQUITECTURA.md) | Arquitectura y relaciones principales del backend. |
| [Desarrollo](DESARROLLO.md) | Instalación, migraciones, ejecución y pruebas de backend. |
| [Docker](DOCKER.md) | Entorno local con Docker Compose. |
| [Reglas, arquitectura y decisiones técnicas](ARQUITECTURA_REGLAS_Y_DECISIONES_TECNICAS.md) | Documento maestro de arquitectura, RN01–RN50, decisiones y evolución. |
| [Tecnologías, responsabilidades y motivos](TECNOLOGIAS_RESPONSABILIDADES_Y_MOTIVOS.md) | Función, versión, responsabilidades, motivos y riesgos del stack. |
| [Mensajes de error por rol](MENSAJES_DE_ERROR_POR_ROL.md) | Mensajes de permisos del backend y frontend. |

## Bitácoras y referencias

- `BITACORA_BCRYPT.md`: evolución y verificación del hash de contraseñas.
- `BITACORA_ESM.md`: migración a módulos ESM.
- `BITACORA_MIGRACION_VITEST.md`: incorporación de Vitest.
- `BITACORA_MODERNIZACION_PRISMA_Y_CITAS.md`: Prisma, citas y cancelación/auditoría.
- `BITACORA_SQL_INJECTION.md`: consultas y prevención de inyección SQL.
- `BITACORA_VALIDACION_FORMULARIOS.md`: teléfono, correo, contraseñas y presentación de errores.
- `CANCELACION_AUTOMATICA_CITAS.md`: expiración/cancelación automática de citas.
- `DECISIONES_TECNICAS_BACKEND.md`: decisiones técnicas anteriores, conservar como referencia histórica.
- `REVISION_PROYECTO.md`: auditoría y hallazgos anteriores del proyecto.

La guía de arranque vigente está en [`../arranque.md`](../arranque.md) y el plan/ejecución de pruebas está en [`../test/README.md`](../test/README.md).
