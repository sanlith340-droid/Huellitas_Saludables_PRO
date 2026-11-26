# Estado actual de Huellitas Saludables

**Fecha de actualización / corte:** 26 de noviembre de 2026, UTC−05.  
**Fuente más reciente de resultados:** `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-26_DESPLIEGUE_RENDER.md` (despliegue verificado en Render), complementaria a la auditoría de la prueba local del 25/11. Docker/Compose sigue sin validarse.

## Resumen vigente para continuidad

- **Backend:** 410/410 pruebas aprobadas en 31 archivos, según la auditoría del 25/11/2026.
- **Frontend:** build correcto; ESLint con 0 errores y 0 advertencias.
- **Backend ESLint:** 0 errores y 4 advertencias.
- **Dependencias:** `npm ci` reportó 8 vulnerabilidades (4 moderadas y 4 altas); quedan pendientes de resolver o justificar.
- **Migraciones:** el árbol actual contiene seis directorios de migración, incluido `0_init`. La auditoría más reciente advierte que `prisma migrate deploy` no se ejecutó en aquella validación; no afirmar que el estado actual de una base fue comprobado o que todas estén aplicadas.
- **Seguridad:** los servicios backend aplican autorización por rol y pertenencia para consultas protegidas: el propietario solo accede a sus mascotas y citas propias; un especialista solo consulta sus citas asignadas; recepción/administración tienen los alcances declarados por endpoint. Los recursos ajenos protegidos se ocultan con 404 en los flujos descritos. La interfaz no reemplaza la comprobación backend.
- **Mascotas:** límite de cinco por usuario; la sexta responde HTTP 409 con `MASCOTAS_LIMITE_ALCANZADO` y se presenta el estado visual correspondiente.
- **Historias clínicas:** el propietario consulta únicamente historias de sus mascotas y filtra por año/mes disponibles; el flujo es de solo lectura.
- **Despliegue:** acreditado desde el 26/11/2026 en Render (frontend, API y PostgreSQL 16), con verificación de `/health`, login, catálogos y recorrido completo en navegador hasta el panel de administración. Véase la sección «Despliegue en Render» más abajo.
- **No acreditado todavía:** ejecución remota de CI, pruebas E2E, una nueva ejecución de backup/restore y el envío real de correo (la credencial SMTP de Brevo es rechazada). El informe del 25/11 describe el ensayo local previo de backup/restore, pero no debe presentarse como repetido. Existe configuración de CI en el repositorio, lo cual no acredita un run remoto.

Enlaces: [auditoría de cierre 25/11](../../DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md) · [pendientes manuales](../../DOCS_PROYECTO/sustentacion_DOCUMENTACION/00_CIERRE_T4_PENDIENTES_MANUALES.md) · [README del proyecto](../../Readme.md) · [índice de documentación](../../DOCS_PROYECTO/README.md).

## Funcionalidad e interfaz ya documentadas

El flujo de historias clínicas está integrado: el especialista crea y edita una historia desde una cita atendida y el propietario selecciona una mascota para consultar únicamente sus historias. El backend valida pertenencia, roles y textos no vacíos; las mascotas ajenas responden con un `404` genérico. La interfaz del propietario permite filtrar por año y mes disponibles.

También se documentaron y validaron recuperación de contraseña con SMTP local de pruebas, notificaciones in-app y aislamiento de notificaciones por rol. Consulta las auditorías fechadas antes de extrapolar esos resultados a producción.

Las vistas del propietario `/mascotas` y de historia clínica se rediseñaron: listado en tarjetas, atributos resumidos y registros clínicos agrupados por atención. La documentación de interfaz vigente está en `DOCS_PROYECTO/front_DOCUMENTACION/` y `DOCS_PROYECTO/ESTADOS_DE_INTERFAZ.md`.

## Seed demo documentado

La auditoría de continuidad del 24/11 describe un seed con usuarios demo, 30 mascotas distribuidas en 10 propietarios/acudientes, datos base, disponibilidad, citas, historias, notificaciones y cancelaciones. Registra dos ejecuciones sin cambios de conteos y un conjunto reducido compatible con fixtures en `NODE_ENV=test`. Esta evidencia es histórica: no se volvió a ejecutar ni se validó de nuevo el seed en la auditoría de cierre T4 del 25/11.

## Registros históricos (no representan el corte vigente)

Las siguientes entradas se conservan para trazabilidad. Sus cantidades y resultados corresponden a sus fechas respectivas y no sustituyen el resumen vigente de este archivo.

### Validación de continuidad — 24 de noviembre de 2026

- Backend: `npm test` → **388/388 pruebas aprobadas en 29 archivos**.
- Frontend: `npm run build` → **compilación exitosa**.
- PostgreSQL local: cinco migraciones aplicadas en `proyectohs_test` durante la suite y en `proyectohs` mediante `prisma migrate deploy`.
- Idempotencia del seed: dos ejecuciones consecutivas sin duplicados.
- Auditoría: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_CONTINUIDAD_VALIDACION.md`.

### Hallazgos y límites del corte del 24 de noviembre

- La copia validada no usó Docker porque Docker no estaba instalado en ese entorno; se usó PostgreSQL 16 local temporal.
- En ese corte se anotó una discrepancia entre una nota previa del estado (20 mascotas e historias para `USU001`) y el seed recuperado (3 mascotas por cada uno de 10 usuarios). La auditoría del 25/11 no vuelve a resolver esa decisión; no inferir un cambio del seed.
- `/citas/nueva` podía mostrar disponibilidad dependiente del conjunto de datos demo.
- Se registraron 8 vulnerabilidades transitivas durante `npm ci`; no se actualizaron dependencias.

### Límite de mascotas — 24 de noviembre de 2026

Se documentó e implementó el máximo de cinco mascotas por usuario. La API rechaza la sexta con HTTP 409 y código `MASCOTAS_LIMITE_ALCANZADO`; el frontend presenta el estado visual. La auditoría específica registró 22/22 y la suite en aquel corte registró 389/389 en 29 archivos; la auditoría de cierre posterior informa 410/410 en 31 archivos. La prueba viva de navegador del 24/11 se conserva en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_PRUEBA_VIVA_LIMITE_MASCOTAS.md`.

### Filtro de historias por año/mes — 24 de noviembre de 2026

La auditoría de prueba viva documenta que el filtro año/mes muestra solo atenciones del periodo seleccionado, con ejemplos de agosto y noviembre de 2026: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_FILTRO_HISTORIAS_ANIO_MES.md`.

### Cierre de Lista de Chequeo T4 — 25 de noviembre de 2026

- Se documentó autorización por propietario para `GET /api/mascotas/:id`, `GET /api/citas` y `GET /api/citas/:id`; el propietario solo ve lo suyo y el especialista solo sus citas. Recepción/administración mantienen el alcance del endpoint.
- `docker-compose.yml` exige `DB_PASSWORD` y `JWT_SECRET`; el backend falla en producción sin credenciales y el origen CORS predeterminado es `http://localhost:8080`.
- Suite backend **410/410 en 31 archivos**; ESLint configurado en back/front; build correcto; frontend lint 0/0 y backend lint 0 errores/4 advertencias.
- La auditoría informa 8 vulnerabilidades de `npm ci` (4 moderadas/4 altas). Registra un ensayo local previo de backup/restore; el documento de pendientes aclara que no fue reejecutado en ese pase.
- No hay despliegue productivo acreditado. No consta ejecución remota de CI ni E2E en el informe más reciente.
- Fuentes: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-25_CIERRE_LISTA_CHEQUEO_T4.md` y `DOCS_PROYECTO/sustentacion_DOCUMENTACION/00_CIERRE_T4_PENDIENTES_MANUALES.md`.

## Reglas de continuidad

Leer primero `AGENTS.md`, después `.agents/README.md`, las reglas/skills aplicables y este archivo. No modificar migraciones ni `schema.prisma` sin autorización explícita. Toda nueva prueba o ejecución permitida debe registrarse en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`; separar evidencia previa de cualquier ejecución nueva.

## Prueba local de arranque y suite — 25 de noviembre de 2026

En sandbox aislado sin Docker se instaló PostgreSQL 16.15 y se usaron una base de arranque vacía y una base `_test` desechable. La opción B de `DOCS_PROYECTO/arranque.md` funcionó: `npm run migrate` aplicó seis migraciones; `npm run dev` de backend inició en 3000; `/health` y `/api-docs` respondieron HTTP 200; Vite inició en 5173 y `/` respondió HTTP 200. La suite backend aprobó 410/410 pruebas en 31 archivos; frontend build y lint aprobaron; backend lint terminó con 0 errores y 4 advertencias. `npm ci` en backend reportó 8 vulnerabilidades (4 moderadas, 4 altas). Se detuvieron los servidores, se eliminaron las dos bases temporales/rol y se detuvo PostgreSQL. Docker Compose no se pudo probar porque Docker no está instalado. Véase la auditoría enlazada arriba para comandos y límites.

## Despliegue en Render — 26 de noviembre de 2026

- Rama desplegada: `SUSTENTACION4º` del repositorio `sanlith340-droid/Huellitas_Saludables_PRO`, en la región Ohio con planes Free.
- Recursos: base PostgreSQL 16 `huellitas-db` (caduca el 26/12/2026), API Docker `huellitas-api` y sitio estático `huellitas-web`.
- URLs verificadas: frontend https://huellitas-web-28qj.onrender.com · API https://huellitas-api-l0dx.onrender.com · salud `/health` · Swagger `/api-docs/`.
- Verificación: `/health` 200 con base conectada; login de administrador 200 con CORS correcto; `/api/mascotas`, `/api/razas` y `/api/disponibilidad` 200; recorrido en navegador desde `/login` hasta el panel de administración con datos reales (7 cuentas de personal, 3 especialistas, 3 recepcionistas, 1 administrador).
- Datos demo: el primer arranque se hizo con `NODE_ENV=development` y `DB_SEED=true`; después se cambió a `production` con `DB_SEED=false`.
- SMTP: Render Free bloquea la salida a los puertos 25, 465 y 587; se usa `SMTP_PORT=2525`, que sí funciona. Con la clave nueva de Brevo (`c53625001@smtp-brevo.com`) la autenticación se acepta y `POST /api/auth/forgot-password` responde 200 en unos 4 s, con el envío registrado como *Sent* en Brevo. La clave anterior de la imagen estaba revocada (535).
- Limitaciones del plan Free: la base caduca a los 30 días, el servicio se suspende tras 15 minutos sin tráfico y no hay discos persistentes.
- Fuente: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-26_DESPLIEGUE_RENDER.md` y `DOCS_PROYECTO/sustentacion_DOCUMENTACION/D3_IMPLANTACION_Y_DESPLIEGUE/GUIA_DESPLIEGUE_Y_AMBIENTES.md`.

## Siguiente paso

Atender los pendientes del documento `DOCS_PROYECTO/sustentacion_DOCUMENTACION/00_CIERRE_T4_PENDIENTES_MANUALES.md` y sustituir la credencial SMTP de Brevo para habilitar la recuperación de contraseña en el despliegue. No afirmar ejecución remota de CI, E2E, restauración reciente, aceptación formal ni resultado de un estado de migraciones sin evidencia fechada; el despliegue del 26/11 sí está acreditado con la auditoría enlazada. La decisión sobre el seed señalada en el registro histórico del 24/11 no fue reevaluada por la auditoría del 25/11.
