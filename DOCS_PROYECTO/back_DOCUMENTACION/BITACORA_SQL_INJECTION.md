# Bitácora — Seguridad SQL INJECTION

**Proyecto:** Huellitas Saludables — backend Node.js (ESM), Express, Prisma ORM 7 y PostgreSQL.

**Fecha:** 10/11/2026

**Responsable:** Sara Jasmin Cruz Calderon

---

## 1. Nombre del cambio

Protección de consultas SQL contra ataques de SQL Injection.

## 2. Descripción del problema

Se debía comprobar si existían consultas SQL crudas que pudieran incorporar datos del usuario mediante concatenaciones, permitiendo modificar la estructura de las consultas, y eliminar cualquier construcción insegura.

## 3. Objetivo

Garantizar que todas las consultas utilicen parámetros seguros, que filtros y ordenamientos dinámicos estén restringidos por listas blancas y que entradas como `' OR 1=1 --` se traten únicamente como datos, sin cambiar la lógica ni los resultados legítimos.

## 4. Archivos revisados

| Grupo | Archivos |
|---|---|
| Modelos (acceso a datos) | `back/app/models/auth.model.js`, `cita.model.js`, `disponibilidad.model.js`, `historia.model.js`, `mascota.model.js`, `raza.model.js`, `usuario.model.js` |
| Servicios | `back/app/services/*.service.js`, `citaCancellationScheduler.js` |
| Controladores y rutas | `back/app/controllers/*.controller.js`, `back/app/routes/*.routes.js` |
| Validación de entrada | `back/app/middlewares/validate.js`, `back/app/schemas/*.schema.js` |
| Configuración | `back/app/config/prisma.js`, `back/app/config/databaseUrl.js` |
| Scripts con `pg` | `back/prisma/baseline-if-existing.js`, `back/prisma/seed.js`, `back/docker-entrypoint.sh`, `back/tests/setup/globalSetup.js`, `back/tests/setup/testDbConfig.js` |
| SQL de base de datos | `database/1.CREAR_TABLAS.sql` … `database/9.VARIAS.sql` (incluye funciones y disparadores) |

## 5. Vulnerabilidades encontradas

**No se encontró ninguna consulta vulnerable a SQL Injection explotable.** En el análisis se encontró:

| # | Ubicación | Hallazgo | Riesgo |
|---|---|---|---|
| 1 | `disponibilidad.model.js` | No contiene SQL crudo: usa solo la API de Prisma (`findMany`, `groupBy`, `count`, `create`, `update`, `deleteMany`), que siempre parametriza. Ordenamiento fijo (`ORDEN`) y campos actualizables en lista blanca (`camposPermitidos`). | Ninguno |
| 2 | `cita.model.js` (4 consultas) y `historia.model.js` (2) y `config/prisma.js` (1) | 7 consultas `$queryRaw` escritas como **plantilla etiquetada** (`$queryRaw\`... ${valor} ...\``): Prisma envía cada `${valor}` como parámetro enlazado. No hay `$queryRawUnsafe`, `$executeRawUnsafe` ni `Prisma.raw`. | Ninguno (parametrizadas) |
| 3 | `cita.model.js` → `bloquearDisponibilidad`, `bloquearDisponibilidades`, `bloquearCita` | Los IDs se convertían con `Number(id)` sin validar: un valor como `"1 OR 1=1"` llegaba a la consulta como `NaN`. No altera el SQL, pero no se rechazaba antes de la base. | Bajo (robustez) |
| 4 | `cita.model.js` → `cancelarVencidasAutomaticamente` | `LIMIT ${limite}` y `${ahora}::timestamptz` parametrizados pero sin validación de tipo. | Bajo (robustez) |
| 5 | `historia.model.js` → `crearConTransaccion`, `actualizar` | IDs de las consultas `FOR UPDATE` convertidos con `Number()` sin validar. | Bajo (robustez) |
| 6 | Rutas `GET /api/historia/mascota/:id_mascota`, `GET /api/historia/cita/:id_cita`, `GET /api/usuarios/:documento` | Eran las únicas rutas con parámetros sin esquema Joi. | Bajo (validación) |
| 7 | Inyección de operadores (`?id_usuario[not]=x`) | Express convierte esa query en un objeto. Todas las rutas que leen `req.query` ya validan con Joi (`Joi.string()`, `.valid(...)`) y `stripUnknown`, que rechaza objetos. Se confirmó con pruebas. | Ninguno |
| 8 | `tests/setup/*.js` (`CREATE/DROP DATABASE "${nombre}"`) | Los identificadores no admiten parámetros en PostgreSQL; el nombre ya se valida con la lista blanca `/^[a-zA-Z0-9_]+$/` y sufijo `_test`. Las demás consultas `pg` (`baseline-if-existing.js`) usan `$1`, `$2`. | Ninguno |
| 9 | `database/2.FUNCIONES_DISPARADORES.sql` | Las funciones PL/pgSQL no usan `EXECUTE` dinámico ni `format()`. | Ninguno |
| 10 | Filtros y ordenamientos dinámicos | La API no acepta nombres de columna ni ordenamientos desde la petición. Los filtros de enumeración usan listas blancas Joi (`estado`, `especie`, `genero`, `rol`, `tipo`) y las actualizaciones usan `camposPermitidos`. | Ninguno |

## 6. Cambios realizados

Como las consultas ya eran parametrizadas, los cambios son de **defensa en profundidad**; no cambia la lógica, relaciones, filtros, condiciones ni resultados.

| Archivo | Cambio |
|---|---|
| `back/app/utils/sqlSeguro.js` (nuevo) | `aIdEntero()` (entero positivo o 400), `aLimiteEntero()` (rango cerrado), `aMarcaTiempoOpcional()` (null, `Date` o ISO 8601 válido). Documenta las reglas: no `*Unsafe`, no `Prisma.raw` con datos externos, no concatenar SQL, columnas/orden dinámicos solo por lista blanca. |
| `back/app/models/cita.model.js` | Las 4 consultas `$queryRaw` validan sus valores con `sqlSeguro` antes de ejecutarse (`id_disponibilidad`, `id_cita`, `ahora`, `limite` entre 1 y 1000). Siguen siendo plantillas parametrizadas. |
| `back/app/models/historia.model.js` | `crearConTransaccion` y `actualizar` validan `id_cita` / `id_historia_clinica` con `aIdEntero` antes de la consulta `FOR UPDATE`. |
| `back/app/schemas/historia.schema.js` | Nuevos `idMascotaParamSchema` e `idCitaParamSchema` (entero positivo). |
| `back/app/routes/historia.routes.js` | `validate(...)` en `/mascota/:id_mascota` y `/cita/:id_cita`. |
| `back/app/schemas/usuario.schema.js` | Nuevo `documentoParamSchema` (texto, máx. 10, igual que `usuario.id_usuario VARCHAR(10)`). |
| `back/app/routes/usuario.routes.js` | `validate(documentoParamSchema, 'params')` en `GET /:documento`. |
| `back/tests/unit/security/consultas-sql.test.js` (nuevo) | Revisión automática del código de `app/`: falla si aparece `$queryRawUnsafe`, `$executeRawUnsafe`, `Prisma.raw(`, `$queryRaw(` como función o `.query()` con SQL concatenado. |

Compatibilidad: no cambian rutas, nombres de campos ni estructuras de respuesta. Las únicas diferencias visibles son que un ID no numérico en `/historia/mascota/:id` o `/historia/cita/:id`, o un documento de más de 10 caracteres en `/usuarios/:documento`, ahora responde `400 BAD_REQUEST` con el formato de error estándar del proyecto.

## 7. Pruebas realizadas

Cargas utilizadas: `' OR 1=1 --`, `' OR '1'='1`, `admin' --`, y variantes sin espacios de hasta 10 caracteres (`'OR'1'='1`, `'OR/**/1=1`, `admin'--`) para que pasen la validación de formato y lleguen a la consulta real. También `1 OR 1=1`, `1; DROP TABLE cita` y `?id_usuario[not]=x`.

| Archivo | Pruebas | Qué verifica |
|---|---|---|
| `tests/integration/seguridad-sql-injection.test.js` | 39 | **Login:** correos y contraseñas maliciosos no obtienen token (400/401), incluido `correo-real'--`. **Disponibilidad:** el filtro legítimo `id_usuario=ESP001` sigue devolviendo solo ESP001; `id_usuario='OR'1'='1` y `admin' --` devuelven lista vacía (se comparan como texto); cargas largas → 400; `estado` malicioso → 400 (lista blanca); `?id_usuario[not]=x` → 400; especialista malicioso → 404; `/disponibilidad/1 OR 1=1` → 400. **Otros módulos:** `/citas/:id`, `/usuarios/:documento`, `/historia/mascota/:id`, `/historia/cita/:id`. **Consultas crudas:** crear/cancelar cita e historia con IDs maliciosos → 400 antes de consultar; `LIMIT` y `ahora` maliciosos → rechazados; una plantilla `$queryRaw` con `' OR 1=1 --` devuelve 0 filas. **Integridad:** los conteos de `usuario` y `disponibilidad` no cambian tras todos los intentos. |
| `tests/unit/utils/sqlSeguro.test.js` | 6 | Validadores aceptan valores legítimos y rechazan todas las cargas. |
| `tests/unit/security/consultas-sql.test.js` | 5 | Revisión estática de `app/` y demostración de que `Prisma.sql` genera `WHERE correo = ?` con la carga en `values`, no en el SQL. |
| Suites existentes de disponibilidad, citas, historia, usuarios y mascotas | — | Funcionamiento normal de los módulos. |

## 8. Resultados

| Ejecución | Resultado |
|---|---|
| Línea base antes del cambio | 249/249 pruebas correctas |
| Suite completa después del cambio (`npm test`) | **320/320** pruebas correctas (23 archivos) |
| `' OR 1=1 --` y demás cargas | Interpretadas solo como datos: no omiten la autenticación, no amplían filtros, no devuelven registros no autorizados y no modifican la base. |
| Módulo de disponibilidad | Todas sus pruebas existentes siguen pasando; filtros, paginación y resumen sin cambios. |

## 9. Estado final

**Implementado.**

Observaciones:

1. La protección principal ya existía (Prisma parametriza siempre); este cambio añade validación por tipo, cierra las 3 rutas sin esquema y deja una prueba automática que impide introducir SQL concatenado en el futuro.
2. La revisión estática detecta los patrones prohibidos más comunes, no todos los posibles; las revisiones de código siguen siendo necesarias.
