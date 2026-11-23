---
name: testing-quality
description: Planificar, ejecutar y documentar pruebas unitarias, integración, migraciones y build del proyecto Huellitas Saludables. Usar antes de entregar cualquier cambio.
---

# Skill: pruebas y calidad

## Comprobaciones mínimas

- Backend: `cd back && npm test`.
- Migraciones: `cd back && npm run migrate:status` y prueba en una base adecuada.
- Frontend: `cd front && npm run build`.
- Flujo afectado: prueba manual o automatizada con datos de prueba.

Registrar comando, entorno, cantidad de pruebas, resultado y limitaciones. No usar `prisma migrate reset` contra una base de producción. Actualizar `DOCS_PROYECTO/test_DOCUMENTACION/` y la bitácora correspondiente.
