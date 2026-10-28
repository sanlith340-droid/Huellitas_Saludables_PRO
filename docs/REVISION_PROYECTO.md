# Revisión del proyecto — Huellitas Saludables

**Fecha de revisión:** 15 de octubre de 2026
**Base de comparación:** presentación *Planeación Técnica: De la Visión a la Ejecución Escalar* (5 dimensiones, 5 fases, 4 entregables y matriz de trazabilidad).
**Rama revisada:** `sistema-filtraciones` (último commit: `768dfb3`).

---

## 1. Resumen ejecutivo

El proyecto está **bien construido en lo técnico** (capas claras, migraciones con restricciones reales, autorización por rol, 112 casos de prueba, Docker con *healthchecks*) pero **mal comunicado y con deuda de seguridad importante**.

- **El README no mostraba lo que el PDF considera esencial:** tecnologías, decisiones, modelo de datos, estrategia de pruebas, infraestructura y pendientes. La información existía, pero dispersa en 8 archivos, con enlaces rotos y varios documentos obsoletos. El nuevo `Readme.md` la consolida siguiendo las 5 dimensiones del PDF.
- **Hay 3 problemas que bloquean cualquier despliegue real:** contraseñas en texto plano, secretos expuestos en un archivo versionado y CORS abierto.
- **Falta el entregable "Pipeline de CI/CD configurado"** del PDF: no hay ningún flujo de integración continua.

---

## 2. Lo que está bien

| Área | Evidencia |
|---|---|
| Arquitectura por capas | `routes → middlewares → controllers → services → models` consistente en todos los dominios |
| Integridad de datos | Migraciones con `FOREIGN KEY ... RESTRICT`, `UNIQUE` y `CHECK`; *trigger* que marca la franja como `ocupado`; una cita por franja y una historia por cita garantizadas en BD |
| Autorización | Rol **re-leído desde la base de datos** en cada petición, no confiado al token |
| Validación | Esquemas Joi por dominio con middleware común |
| Pruebas | 8 archivos / 112 casos; base aislada; modo serial; opción Docker |
| Docker | Build multi-etapa del frontend, `depends_on: service_healthy`, entrypoint que espera la BD y migra |
| Documentación de decisiones | Registro DT-001…DT-012 honesto: distingue lo observado de lo inferido y declara sus propios riesgos |
| Dependencias | `npm audit --omit=dev` → **0 vulnerabilidades** en `back/` y `front/` |
| Frontend | `npm run build` (incluye `tsc -b`) compila sin errores |

---

## 3. Hallazgos

### 🔴 Críticos (resolver antes de cualquier despliegue)

| # | Hallazgo | Evidencia | Acción recomendada |
|---|---|---|---|
| C1 | **Contraseñas en texto plano.** Se comparan con `===` y se guardan tal cual; `bcrypt` ni siquiera está en las dependencias. Los *seeders* usan una contraseña trivial compartida por todas las cuentas. | `back/app/services/auth.service.js` (líneas con `NOTA: En producción usar bcrypt`) · `back/seeders/20240101000000-demo-usuarios.js` | Agregar `bcrypt`, hashear en `registro` y `registroAdmin`, comparar con `bcrypt.compare`, hashear los seeders y ajustar las pruebas |
| C2 | **Secretos con aspecto de reales en un archivo versionado.** `back/.env.example` tiene un `DB_PASSWORD` de 37 caracteres y un `JWT_SECRET` de 115 caracteres (no son placeholders). Fue incorporado al historial en el commit `b97a8dd` y existen ramas remotas. Además el archivo está **corrupto**: la línea del `JWT_SECRET` termina con un fragmento de texto suelto (`…PostgreSQL local.`) y `CORS_ORIGIN` queda fuera de lugar. *(No reproduzco los valores aquí.)* | `back/.env.example` | 1) Considerar ambos valores comprometidos y **rotarlos**. 2) Reemplazarlos por placeholders. 3) Si el repositorio es o será público, purgar el historial (`git filter-repo`) y forzar la actualización de todas las ramas |
| C3 | **CORS abierto con credenciales.** El callback acepta cualquier origen y `credentials: true`. `CORS_ORIGIN` se define en `.env` y Compose pero **nunca se lee**. | `back/app/app.js` | Leer `CORS_ORIGIN` (lista separada por comas) y rechazar el resto |
| C4 | **`JWT_SECRET` con *fallback* en el código** (`'huellitas_saludables_dev_secret_change_me'`) y `change-this-secret-in-production` en Compose. Si falta la variable, el sistema arranca firmando con un secreto público. | `back/app/utils/jwt.js` · `docker-compose.yml` | Si `NODE_ENV=production` y falta el secreto (o es el de ejemplo), **abortar el arranque** |

### 🟠 Altos

| # | Hallazgo | Evidencia | Acción recomendada |
|---|---|---|---|
| A1 | **No existe CI/CD.** El PDF lo lista como entregable explícito ("Pipeline de CI/CD configurado"). No hay `.github/` ni equivalente. | raíz del repo | GitHub Actions: `install → lint → type-check → test (con servicio PostgreSQL) → build` en cada PR |
| A2 | **`npm run lint` falla.** El script llama a `eslint .` pero ESLint no está en `devDependencies` ni hay configuración. | `front/package.json` | Instalar ESLint + `typescript-eslint` + reglas de React, o quitar el script |
| A3 | **Logs excesivos con `console.log`** (≈40 en el backend), incluyendo el payload del token y el resultado de consultas de usuario en cada petición. Los errores `500` devuelven `error.message` al cliente. | `back/app/middlewares/identifyUser.js` y servicios | Logger con niveles (p. ej. `pino`), silenciar en producción y devolver mensaje genérico en `500` |
| A4 | **Sin protección contra fuerza bruta ni cabeceras de seguridad.** | `back/app/app.js` | `helmet` + `express-rate-limit` sobre `/api/auth/login` y `/registro` |
| A5 | **Esquema real ≠ borrador del modelo ER.** Ver sección 5. | — | Usar el ER del nuevo README como referencia única |

### 🟡 Medios

| # | Hallazgo | Evidencia | Acción recomendada |
|---|---|---|---|
| M1 | **RF09 y RF15 están a medias.** Notificaciones y auditoría solo escriben en consola; el README antiguo los presentaba como requisitos cubiertos. | `notificacion.service.js` · `auditLog.js` | Declararlos como parciales (ya hecho en el README nuevo) y planificarlos |
| M2 | **Token en `localStorage`.** Es un compromiso habitual en SPAs, pero queda expuesto ante XSS. | `front/src/services/api.ts` | Registrar la decisión como DT y evaluar cookie `HttpOnly` + `SameSite` |
| M3 | **Sin pruebas de frontend ni E2E.** La "pirámide de pruebas" del PDF queda sin cima y sin la capa del cliente. | `docs/tests/PRUEBAS.md` lo reconoce | Vitest + Testing Library; después Playwright para el flujo login → cita |
| M4 | **Decisiones documentadas solo para el backend.** Faltan frontend (React/Vite/TS, Nginx como proxy, `localStorage`) y despliegue. | `docs/backend/Decisiones…` | Añadir DT-013 en adelante |
| M5 | **Sin entorno de producción definido** (HTTPS, gestión de secretos, respaldos de la BD). | — | Definirlo como entregable de la dimensión DIM_05 |

### ⚪ Higiene del repositorio y documentación

| # | Hallazgo | Acción |
|---|---|---|
| H1 | **Enlaces rotos** en el README raíz: apuntan a `docs/DESARROLLO.md`, `docs/API.md` y `docs/ARQUITECTURA.md`, pero los archivos están en `docs/backend/`. Lo mismo en `Huellitas Saludables Backend.md` e `Implemetar_ORM.md`. | Corregidos en el README nuevo; actualizar esos dos archivos o eliminarlos |
| H2 | **Secuencia de Docker incorrecta en el README antiguo:** ejecutaba `docker compose exec … db:seed:undo:all` y `db:migrate:undo:all` *antes* de `up`, cuando aún no hay contenedores; y repite migrar/sembrar a mano aunque el *entrypoint* ya migra. Había además un bloque de código mal cerrado. | Corregido: `cp` → editar `.env` → `up -d --build` (con `DB_SEED=true` si quieres datos demo) |
| H3 | **`back/Readme.md` obsoleto:** describe "SQL puro con `pg`, sin ORM", autenticación "por headers", estructura `src/`, un nombre de repositorio de ejemplo, y mezcla una chuleta de comandos Git. | Reemplazar por un README corto que apunte al raíz, o eliminarlo |
| H4 | **`front/readme.md`** son dos líneas de `npm install …`. | Reemplazar por un README del frontend (scripts, variables, estructura) |
| H5 | **`package.json` en la raíz duplicado y desactualizado:** se llama `huellitas-saludables-front`, sin TypeScript ni `type-check`, y con otras versiones. Confunde herramientas y a quien clona. | Eliminarlo (junto con su `package-lock.json`) o convertirlo en un *workspace* real |
| H6 | **Tres configuraciones de Vite** en `front/`: `vite.config.js`, `vite.config.ts` y `vite.config.d.ts`. | Dejar solo `vite.config.ts` |
| H7 | **Imágenes duplicadas:** `front/img/` repite `front/src/assets/` (y en dos formatos). | Conservar una sola ubicación |
| H8 | **`.env.example` y `.env.docker.example` son idénticos** en la raíz. | Dejar uno y documentarlo |
| H9 | **`ARQUITECTURA.md` menciona `database/data_jesus/`**, carpeta que no existe; los scripts viven en `database/`. | Corregir la ruta |
| H10 | **Nombre del registro de decisiones:** `Decisiones Técnicas — Huellitas Saludables (Backend).md` (acentos, raya y paréntesis) se corrompe al comprimir y complica los enlaces. | Renombrar a `docs/backend/DECISIONES_TECNICAS.md` (el README nuevo ya enlaza con ese nombre) |
| H11 | **`DT-006` afirma que el servicio "registra el valor recibido sin hash"**. En el código actual los *logs* registran el correo, no la contraseña. El riesgo real (texto plano en BD) se mantiene. | Ajustar el texto |
| H12 | `Implemetar_ORM.md` (errata) y `Huellitas Saludables Backend.md` son *stubs* de redirección. | Eliminar o fusionar en `docs/` |
| H13 | `database/*.sql` es el esquema histórico (coincide con las migraciones actuales). Puede confundir sobre cuál es la fuente de verdad. | Mover a `database/legacy/` con una nota, o eliminarlo |

Comandos sugeridos para la parte mecánica:

```bash
git mv "docs/backend/Decisiones Técnicas — Huellitas Saludables (Backend).md" docs/backend/DECISIONES_TECNICAS.md
git rm package.json package-lock.json front/vite.config.js front/vite.config.d.ts
git rm "Huellitas Saludables Backend.md" Implemetar_ORM.md
cp /ruta/al/nuevo/Readme.md Readme.md
```

---

## 4. Alineación con el PDF de planeación técnica

### Las 5 dimensiones

| Dimensión (PDF) | Qué pide | Estado en el proyecto | Dónde queda ahora |
|---|---|---|---|
| **DIM_01 Arquitectura de software** | Patrón y distribución de componentes | ✅ En capas + SPA con proxy Nginx; estaba explicado solo en `docs/` | README §3 con diagramas |
| **DIM_02 Stack tecnológico** | Elección justificada según requisitos no funcionales | ✅ Justificado para backend; ❌ no para frontend; no estaba en el README | README §2 y §8 |
| **DIM_03 Modelado de datos e interfaces** | Esquemas y contratos (SQL, OpenAPI) | ✅ Migraciones + Swagger; ❌ no había ER visible y el borrador difería del código | README §4 (ER en Mermaid) |
| **DIM_04 Estrategia de pruebas** | Pirámide: unitarias, integración, E2E | 🟡 Unitarias e integración sí; frontend y E2E no | README §5 |
| **DIM_05 Infraestructura y DevOps** | Entornos, contenedores, CI/CD, orquestación | 🟡 Docker y entornos sí; **CI/CD no**; producción sin definir | README §6 |

### Las 5 fases del proceso

| Fase | Entregable esperado | Situación |
|---|---|---|
| 1. Análisis de RNF | Rendimiento, seguridad, concurrencia, cumplimiento | ❌ No documentado. La seguridad se tocó en los DT, pero no hay RNF explícitos (latencia esperada, usuarios concurrentes, política de datos clínicos) |
| 2. Factibilidad y riesgos | Matriz probabilidad × impacto | 🟡 Riesgos listados en DT-006/010/012; sin priorizar. Ahora están en README §9 |
| 3. Diseño de alto nivel (HLD) | Arquitectura y flujos principales | ✅ Cubierto en README §3 |
| 4. Diseño de bajo nivel (LLD) | Módulos, contratos, esquemas | ✅ Swagger + modelos + migraciones |
| 5. Estimación y desglose (WBS) | Backlog técnico por prioridad | ❌ No existía. Propuesta inicial en README §10 |

### Los 4 entregables

| Entregable | Estado |
|---|---|
| Documento de arquitectura (SAD / ADR) | ✅ Existe el registro DT-001…DT-012 (equivale a ADR); falta un SAD que lo reúna — el README nuevo cumple ese papel de resumen |
| Modelo de datos (DER) | ✅ Ahora visible en el README. El `.drawio` anterior debe actualizarse (ver §5) |
| Pipeline de CI/CD | ❌ Pendiente (A1) |
| Backlog técnico estructurado | 🟡 Propuesto en README §10; conviene pasarlo a Issues/Project |

### Matriz de trazabilidad (adaptada)

| Dimensión | RNF | Riesgos | HLD | LLD | WBS/Backlog |
|---|---|---|---|---|---|
| Arquitectura | ❌ | ✅ | ✅ | ✅ | ✅ |
| Stack | ❌ | 🟡 | ✅ | — | ✅ |
| Datos | ❌ | — | ✅ | ✅ | — |
| QA | ❌ | ✅ | — | ✅ | ✅ |
| Infra | ❌ | ✅ | ✅ | — | ✅ |

La columna **RNF** es la más débil: sin requisitos no funcionales escritos, las decisiones técnicas no tienen contra qué medirse. Es el primer documento que conviene añadir.

---

## 5. El modelo ER anterior frente al código real

El diagrama ER que preparamos antes partía de tu borrador `.drawio`. El código implementado difiere en estos puntos, y **conviene tomar el código como verdad**:

| Elemento | Borrador / ER previo | Código real |
|---|---|---|
| `disponibilidad` | `hora_inicio` y `hora_fin` | Una sola columna `hora` |
| `disponibilidad.estado` | `p / c / cdo` | `disponible` / `ocupado` |
| `cita.motivos` | `motivos` (TXT) | `motivo` (`VARCHAR(200)`) |
| `cita.estado` | `p / c / cdo` | `pendiente` / `confirmado` / `cancelado` / `atendido` |
| `cita.fecha_registro` | Sí | No existe |
| `cita` ↔ `disponibilidad` | 1 : N | **1 : 1** (`id_disponibilidad` único) |
| `cita` ↔ `historia_clinica` | 1 : N | **1 : 1** (`id_cita` único) |
| `usuario.apellido` | `apellido` | `apellidos` |
| `usuario.rol` | `rec`, `vet` | `recepcionista`, `especialista` |
| `usuario.id_usuario` | nº de documento | `VARCHAR(10)` generado por prefijo de rol (`USU001`, `REC001`, …) |
| `historia_clinica` | `diagnostico`, `tratamiento` | además `peso` y `observaciones` |

El ER actualizado (en Mermaid) está en el README, sección 4. Si lo necesitas de nuevo en formato Chen `.drawio`, puedo regenerarlo con estos datos.

---

## 6. Plan de acción sugerido

**Fase 1 — Seguridad (1–2 días)**
1. Rotar secretos expuestos; sanear `back/.env.example`. (C2)
2. `bcrypt` en registro, login y *seeders*; ajustar pruebas. (C1)
3. Fallar al arrancar en producción sin `JWT_SECRET` válido. (C4)
4. Aplicar `CORS_ORIGIN`. (C3)

**Fase 2 — Calidad y automatización (2–3 días)**
5. ESLint funcional en el frontend. (A2)
6. GitHub Actions con PostgreSQL de servicio. (A1)
7. Logger con niveles y errores `500` genéricos. (A3)
8. `helmet` y límite de intentos de login. (A4)

**Fase 3 — Documentación (medio día)**
9. Reemplazar `Readme.md`; renombrar el registro de decisiones; eliminar archivos duplicados u obsoletos. (H1–H13)
10. Redactar el documento de RNF.

**Fase 4 — Evolución**
11. Notificaciones y auditoría reales (RF09, RF15).
12. Pruebas de frontend y E2E.
13. Definir despliegue de producción.

---

## 7. Qué verifiqué y qué no

**Verificado ejecutando o leyendo el código:**
- Estructura completa del ZIP (162 archivos), historial Git y ramas.
- Lectura de modelos, migraciones, middlewares, servicios de autenticación, rutas, Docker, Nginx y documentación.
- `npm ci` + `npm audit` en `back/` y `front/` (0 vulnerabilidades).
- `npm run build` del frontend (compila) y `npm run lint` (falla por falta de ESLint).
- Revisión de sintaxis (`node --check`) de todos los archivos del backend.
- Conteo de pruebas: 112 `it()` en 8 archivos, coincidiendo con `PRUEBAS.md`.

**No verificado:**
- **La ejecución de las pruebas del backend** ni el arranque con Docker: el entorno de revisión no tiene PostgreSQL ni Docker. Conviene correr `docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests` y confirmar que pasan.
- Comportamiento en navegador del frontend (solo compilación).
- Si el repositorio remoto es público (determina la urgencia de purgar el historial).
