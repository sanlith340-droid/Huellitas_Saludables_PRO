# Bitácora — actualización documental backend

**Fecha:** 25 de noviembre de 2026 (UTC-05).  
**Objetivo:** alinear guías backend dentro del alcance autorizado con `back/app/`, `back/prisma/schema.prisma`, las seis carpetas de `back/prisma/migrations/` y `back/package.json`, y reparar referencias a la antigua ruta `docs/`.  
**Tipo de trabajo:** revisión estática y edición documental; no se modificó código, esquema, migraciones, dependencias ni configuración.

## Cambios documentales

Se actualizaron el README del backend, las guías de API, arquitectura, desarrollo, Docker y límite de mascotas, el índice documental `DOCS_PROYECTO/back_DOCUMENTACION/README.md` y `database_original/0.CREAR_DATABASE.MD`. Se registran rutas reales bajo `DOCS_PROYECTO/` y como rutas canónicas desde la raíz.

Las guías actuales describen Prisma 7.10.1 ESM, Node.js 22, PostgreSQL 16 en Compose, 11 modelos Prisma y seis migraciones; bcrypt para nuevos hashes y scrypt solo como compatibilidad de lectura/migración; límite de cinco mascotas; recuperación con SMTP requerido y tokens de un solo uso; notificaciones persistentes in-app para especialistas; y controles de acceso por propietario/especialista.

## Evidencia y límites

- La cifra más reciente consignada por el proyecto es **410/410 pruebas en 31 archivos**; se conserva como resultado previo, no como resultado de esta sesión.
- El último `npm ci` documentado reportó **8 vulnerabilidades: 4 moderadas y 4 altas**. No se intentó resolverlas.
- No se ejecutaron `npm ci`, pruebas, builds, migraciones, Docker, SMTP ni llamadas de API. No se afirma resultado nuevo.
- No se editó `.agents/workflows/ESTADO_ACTUAL.md` porque queda fuera de las rutas autorizadas para esta tarea; ese documento conserva el resumen vigente disponible.

## Discrepancias encontradas y tratamiento

1. Varios README y guías apuntaban a `docs/` o a `docs/back/`, carpeta inexistente en esta copia; ahora las rutas vigentes apuntan a `DOCS_PROYECTO/back_DOCUMENTACION/` y `DOCS_PROYECTO/test_DOCUMENTACION/` cuando corresponde.
2. Las guías contenían inventarios de siete u ocho modelos y referían el baseline `0_init` como si fuera todo el esquema. Se actualizó a los 11 modelos del schema y seis migraciones existentes.
3. Había instrucciones de desarrollo que describían scrypt como algoritmo actual o recuperación y notificaciones como pendientes. Se documentaron bcrypt actual, compatibilidad scrypt legada, recuperación SMTP implementada y notificaciones in-app implementadas.
4. Algunas guías no explicitaban el control por propietario para mascotas, citas e historias ni el tope de cinco mascotas; ahora el alcance coincide con servicios/rutas inspeccionados.

Las bitácoras históricas mantienen hechos, fechas y resultados; cualquier anotación de vigencia añadida es complementaria y remite a la fuente actual.

## Siguiente paso

La persona responsable puede revisar enlaces de las bitácoras históricas y registrar esta actualización en el estado de continuidad cuando la autorización de alcance permita modificar `.agents/`.
