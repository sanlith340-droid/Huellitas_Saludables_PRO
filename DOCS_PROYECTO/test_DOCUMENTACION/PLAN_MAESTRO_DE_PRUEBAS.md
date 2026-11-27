# Plan Maestro de Pruebas (PMP)

## Huellitas Saludables PRO

| Control | Información |
|---|---|
| Versión | 1.3 |
| Fecha de actualización | 27 de noviembre de 2026 |
| Estado | **Borrador listo para revisión y aprobación del equipo**; no es certificación ni acta de aceptación. |
| Área | Backend y frontend |
| Prioridad / estimación | P0 / XL (clasificación recibida en la solicitud) |
| Responsables propuestos por el equipo | Sara y Jorge (backend); Santiago (frontend); equipo completo (sistema, aceptación, triage y aprobación final). |
| Proyecto | Plataforma web de gestión veterinaria con API, interfaz y PostgreSQL. |

> **Lectura del estado:** este documento planifica la verificación. La presencia de código o una cifra histórica no demuestra que cada caso de la matriz haya sido ejecutado. La matriz anexa tiene casos propuestos para ejecución futura; no reemplaza ni cierra los 140 casos manuales que fueron reportados sin IDs, pasos ni resultados individuales.

## 1. Introducción

### 1.1 Objetivos

Este PMP define el alcance, condiciones, estrategia y registro para verificar Huellitas Saludables antes de una entrega o despliegue. Sus objetivos son comprobar requisitos funcionales y no funcionales; revisar componentes por separado y sus integraciones; descubrir y clasificar defectos; estandarizar ejecución y evidencia; y establecer qué condiciones deben cumplirse antes de considerar aceptable una versión. Ninguna prueba de esta planificación se declara aprobada de antemano.

### 1.2 Documentos y fuentes de referencia

Se utilizarán como fuentes controladas:

- `../sustentacion_DOCUMENTACION/D2_ARTEFACTOS_TECNICOS/Especificacion_Requerimientos_Adaptada.docx` y PDF asociado: RF001–RF012, RF014–RF015 y RNF001–RNF015. La numeración RF013 no aparece en esta especificación; no se inventa un requisito con ese identificador.
- `../sustentacion_DOCUMENTACION/D2_ARTEFACTOS_TECNICOS/Reglas_de_Negocio_Adaptadas.docx` y PDF asociado: RN01–RN45.
- `../sustentacion_DOCUMENTACION/D4_DOCUMENTACION_Y_CALIDAD/Matriz_Trazabilidad_RTM.xlsx`: requisitos, historias, criterios y decisiones pendientes; se usa como referencia documental, no como registro de ejecución.
- `../sustentacion_DOCUMENTACION/D4_DOCUMENTACION_Y_CALIDAD/INFORME_FINAL_VERIFICACION_CALIDAD.md` y `../sustentacion_DOCUMENTACION/D4_DOCUMENTACION_Y_CALIDAD/PLAN_ASEGURAMIENTO_CALIDAD.md`.
- `EJECUCION.md`, `README.md` y `SEED_DEMO_27_NOVIEMBRE.md` en esta carpeta.
- `../../back/package.json`, `../../back/vitest.config.js`, `../../back/tests/`, `../../front/package.json`, `../../front/src/routes/AppRoutes.tsx`, `../../docker-compose.test.yml`, `../../.github/workflows/ci.yml` y `../../scripts/backup-db.sh` / `../../scripts/restore-db.sh`.
- Swagger en `/api-docs` se consultará como referencia de contrato, pero sus esquemas deben cotejarse con rutas y middleware: existe una observación documental previa de posible desalineación con autenticación Bearer.
- ISO/IEC/IEEE 29119-3:2013(E), *Software testing — Part 3: Test documentation*, cláusulas 6.2, 7.3–7.9 y 7.11–7.12; PDF metodológico adjunto. Se toman como guía de organización documental el plan, la especificación/trazabilidad de casos, requisitos y preparación de datos/ambiente, resultados, bitácora e incidencias.

La norma se usa como referencia metodológica con adaptación al tamaño y evidencia disponible del proyecto. Este documento y su matriz **no declaran conformidad, certificación ni aprobación** con ISO/IEC/IEEE 29119-3. Se emplea redacción propia y no se reproducen plantillas protegidas del estándar.

Cuando haya contradicción entre especificación, regla de negocio, código y evidencia, no se escogerá unilateralmente una interpretación para declarar aprobación. Se abrirá una decisión, se registrará el impacto y se bloqueará el caso afectado hasta obtener aprobación del equipo.

### 1.3 Principios de ejecución

1. Probar exclusivamente en una base PostgreSQL desechable e independiente; no utilizar producción ni datos personales reales.
2. Usar datos sintéticos y credenciales temporales, con secretos en variables de entorno fuera de los documentos y evidencias.
3. Validar autorización en servidor por rol **y por propiedad del recurso**; el control de rutas del frontend no sustituye la API.
4. Registrar cada resultado con versión/commit, ambiente, fecha, caso, ejecutor, evidencia y defecto relacionado. Separar `Aprobado`, `Fallido`, `Bloqueado` y `No ejecutado`.
5. Repetir los casos fallidos y la regresión afectada después de corregir; nunca sobrescribir el resultado histórico original.
6. No aceptar como veredicto de calidad una salida generada por IA sin pasos reproducibles, oráculo verificable y revisión humana.

## 2. Alcance de las pruebas

### 2.1 Módulos incluidos

El orden de la tabla es el orden recomendado de preparación/cobertura funcional; la secuencia formal está en la sección 6. La hoja `Resumen_modulos` de la matriz vincula cada grupo a casos concretos.

| Módulo | Objetivo y funcionalidades a verificar | Resultado esperado | Casos / orden | Responsable |
|---|---|---|---|---|
| Instalación y configuración | Arranque de frontend y API; conexión a PostgreSQL; variables requeridas; salud; proxy Compose/Nginx cuando se use. | Servicios listos, configuración explícita y errores de inicio diagnosticables; nunca fallback inseguro de producción. | ENV-01–ENV-04; primero. | Jorge coordina API/BD; Santiago frontend; Sara revisa controles backend. |
| Autenticación y usuarios | Autoregistro de usuario/propietario; creación de personal; login/logout; rol vigente; recuperación; rate limit; permisos. | Acceso solo a la cuenta autorizada; errores sin filtrar existencia/secretos; sesión revocada tras logout según implementación. | AUTH-01–AUTH-10; tras ambiente. | Sara: unitarias, integración, autenticación/seguridad/validación. Jorge: API y regresión. |
| Mascotas y responsables/copropietarios | Alta y consulta; validación de especie/género/datos; pertenencia; límite de cinco; relación de múltiples responsables almacenada en `UsuarioMascota`. | Cada cuenta ve solo mascotas a las que está vinculada según la regla aprobada; datos inválidos y sexta mascota son rechazados sin corrupción. | PET-01–PET-08. | Jorge API/persistencia; Sara permisos; Santiago formularios y estados UI. |
| Disponibilidad y agenda | Alta, consulta, modificación/eliminación permitida; fechas futuras; franjas duplicadas/ocupadas y transacciones. | Agenda consistente; franjas ocupadas protegidas y operación concurrente sin dobles reservas. | DISP-01–DISP-06. | Jorge: lógica, PostgreSQL, transacciones y regresión; Sara: validaciones/seguridad. |
| Citas | Solicitud, consulta por usuario/especialista/recepción/admin, modificación/cancelación, transición de estado y vencimiento automático. | No hay acceso a citas ajenas ni más de una cita activa por franja; cancelación y estados conservan integridad/auditoría definida. | CITA-01–CITA-10. | Jorge: API/persistencia/negocio; Sara: permisos; equipo: flujos completos. |
| Historias clínicas | Crear/consultar/editar por especialista asignado y lectura por propietario si la decisión de negocio lo confirma; filtros y estados vacío/error. | Historia asociada a la cita correcta, única por cita, con autorización e integridad; lectura del dueño según decisión registrada. | HC-01–HC-07. | Sara: backend/roles; Santiago: formularios/consulta; equipo valida DEC-01. |
| Especialistas y notificaciones | Agenda propia del especialista; aviso in-app persistente por eventos implementados; bandeja, lectura individual/masiva y aislamiento por destinatario. | Avisos solo para el especialista correspondiente, persistentes y con estado de lectura coherente. RF009 se prueba como notificación **in-app**. | ESP-01–ESP-02; NOT-01–NOT-06. | Jorge: eventos/persistencia; Sara: autorización; Santiago: bandeja/estados UI. |
| Administración y auditoría | Operaciones administrativas implementadas, creación/consulta de personal, límites de rol y acciones de auditoría que existan en la versión. | Solo admin realiza acciones privilegiadas; cualquier capacidad no implementada se registra `Bloqueado/No implementado`, no se simula. | ADM-01–ADM-05. | Sara/Jorge: backend; equipo: alcance y decisión RF015. |
| Interfaz y sistema integrado | Formularios, navegación, mensajes, responsive básico y flujos UI→API→BD para roles definidos; errores, vacío y recuperación. | El usuario termina flujos permitidos; mensajes son claros y no exponen datos; no hay controles que eludan backend. | UI-01–UI-08; pruebas de sistema SYS-01–SYS-03. | Santiago: GUI, formularios, usabilidad/compatibilidad; equipo completo: sistema. |
| Seguridad y no funcionales | Autorización, datos sensibles, inyección, sesiones, errores, navegador; rendimiento/carga medidos solo con perfil y umbrales aprobados. | Sin defectos críticos/altos de seguridad/integridad; métricas no funcionales acordadas antes de medir. | SEC-01–SEC-05; COMP-01–COMP-02; PERF-01–PERF-03. | Sara: seguridad backend; Jorge: rendimiento y API; Santiago: compatibilidad; equipo aprueba umbrales. |

**Nota de alcance sobre cuidadores:** el modelo documenta una relación usuario–mascota de muchos a muchos. No se presupone un rol separado llamado “cuidador” ni un panel independiente. Se probará la asociación y autorización para responsables vinculados; cualquier requisito de cuidador autónomo requiere decisión y criterios explícitos.

**Nota sobre edición:** donde la especificación solicite actualizar/eliminar mascotas o administrar perfiles, primero se confirmará la operación soportada en las rutas/UI de la versión. Una función no localizada no se calificará como aprobada: se registrará como brecha de implementación o decisión de alcance.

### 2.2 Requerimientos y pruebas excluidos de esta fase

No se excluyen del plan los módulos funcionales base listados en la sección 2.1. Las siguientes capacidades/técnicas quedan fuera de la primera certificación o dependen de definición; su exclusión no equivale a aprobación.

| ID | Requerimiento/área excluida | Descripción | Motivo | Criticidad / tratamiento |
|---|---|---|---|---|
| EX-01 | Canales externos de RF009 | Email transaccional, SMS, push o proveedor externo para avisos de citas/disponibilidad. | RF009 está implementado y solicitado como notificación persistente in-app; no hay requerimiento de proveedor/canal externo aprobado. | Media; no bloquea el alcance in-app. Reabrir si el negocio lo exige. |
| EX-02 | Módulo estructurado de vacunas | Inventario, calendario, recordatorios y esquema independiente de vacunación. | No se confirma un módulo/modelo de vacunación en el esquema; una nota clínica no equivale a dicho módulo. | Media; registrar como solicitud de alcance si se requiere. |
| EX-03 | Rol/panel independiente de cuidador | Inicio de sesión, permisos y operaciones propias de un rol de cuidador separado de `usuario`. | El modelo de responsables/copropietarios no demuestra un rol autónomo ni criterios de aceptación para este. | Media; decidir antes de diseñar casos de aceptación específicos. |
| EX-04 | Pruebas de carga/estrés en producción | Pruebas con concurrencia alta, duración prolongada o agotamiento de capacidad en entorno real. | No hay perfil de carga, umbrales ni ventana aprobados. El despliegue de Render acreditado no autoriza pruebas de carga ni uso de producción. | Alta; solo se planifica en ambiente aislado tras aprobación. |
| EX-05 | Pentest/certificación independiente | Evaluación externa formal, explotación controlada y certificación normativa. | Requiere autorización, alcance, proveedor y protocolo específicos; las pruebas unitarias no lo sustituyen. | Alta; permanece como riesgo hasta decisión/contratación. |
| EX-06 | Entrega SMTP real de recuperación | Envío desde proveedor/cuenta de correo productiva. | Esta ronda fue local y no probó SMTP real ni el consumo del enlace en un buzón. La evidencia previa de envío en Render no reemplaza esa validación de extremo a extremo. | Media; registrar por separado el envío previo y la recepción/consumo pendientes. |
| EX-07 | Navegadores y plataformas adicionales | Safari, Edge, sistemas móviles nativos y versiones no acordadas. | El alcance inicial de esta solicitud señala Chrome y Firefox; no se recibió matriz adicional de soporte. | Baja/media; documentar matriz futura; no asumir compatibilidad universal. |
| EX-08 | Certificación integral de accesibilidad | Auditoría WCAG completa con tecnologías asistivas/usuarios especializados. | No hay protocolo, nivel objetivo ni participantes aprobados. Se mantienen verificaciones básicas de teclado, etiquetas, foco y movimiento reducido. | Media; no declarar conformidad WCAG en esta entrega. |
| EX-09 | Función no implementada o requisito sin criterio verificable | Ejemplos: auditoría persistida completa (RF015), si no está disponible en el build; actualización de mascota no encontrada; otros flujos no localizados. | No se puede probar como aprobado un comportamiento que no existe o no tiene criterio acordado. | Alta si afecta privacidad/seguridad; en otros casos media. Registrar defecto o decisión, no descartar sin aprobación. |

### 2.3 Casos incluidos

La matriz de casos vinculada a este PMP cubre escenarios exitosos, fallidos, límites y permisos, con ID, módulo, función, tipo, precondición, datos sintéticos, pasos, resultado esperado, criticidad, trazabilidad, responsable y estado. Los casos nuevos se marcan **Planificado — no ejecutado**. La matriz de esta versión es un conjunto nuevo de planificación; no es la fuente original de los 140 casos manuales reportados.

Se conservarán como casos de regresión todos los flujos críticos tras un cambio de autenticación, autorización, citas, disponibilidad, historias clínicas, notificaciones, persistencia o migración.

### 2.4 Casos excluidos

Los casos EX-01 a EX-10 en la hoja `Exclusiones` de la matriz describen explícitamente: canales externos de RF009; módulo estructurado de vacunas; rol independiente de cuidador; carga/estrés en producción; pentest/certificación externa; entrega SMTP real; navegadores/plataformas adicionales; certificación completa de accesibilidad; pruebas invasivas en producción sin autorización/protocolo; y reconstrucción de los 140 casos manuales originales sin fuente. Cada exclusión indica función, razón, criticidad y condición para reabrirse.

Los 140 casos manuales reportados sin fuente identificada, IDs, pasos, datos ni resultados no se reconstruyen ni se declaran ejecutados. Se solicita al equipo fuente original para incorporarlos sin perder trazabilidad. Los casos GWT propuestos en la RTM son candidatos, no aprobaciones ni ejecuciones.

## 3. Entorno y configuración

### 3.1 Configuración prevista

| Componente | Base de prueba | Herramienta / versión de referencia | Condición |
|---|---|---|---|
| API | Node.js 22, Express 4, backend del commit a probar (`../../back/`) | Vitest, Supertest, ESLint; Jest no es el runner vigente | Confirmar dependencias con lockfile y guardar commit. |
| Frontend | React 18, TypeScript, Vite (`../../front/`) | Chrome y Firefox; Playwright solo si se incorpora/configura para E2E | No hay script de test frontend ni configuración Playwright/Cypress en el paquete revisado. |
| Base de datos | PostgreSQL 16; base exclusiva de prueba | Prisma 7 / migraciones del proyecto | Verificar host, puerto, nombre y usuario antes de ejecutar setup/teardown. |
| Integración por contenedores | `../../docker-compose.test.yml`, cuando Docker esté disponible | Docker Compose; PostgreSQL test con `tmpfs` según configuración | Es opción recomendada para aislamiento reproducible; no se verificó Docker disponible en el pase actual. |
| API exploratoria | API local de test | Postman y Swagger `/api-docs` | Usar datos ficticios y cotejar contrato Swagger con rutas actuales. |
| Evidencias | Carpeta de auditorías/resultados del proyecto | Capturas sanitizadas, logs de test/lint/build y reporte | Sin tokens, claves, contraseñas ni datos personales. |

El informe del 25/11 reporta PostgreSQL 16 local para la suite. No demuestra el funcionamiento de Docker, navegador cruzado, despliegue, correo real ni pruebas de carga.

### 3.2 Base de datos, fixture y limpieza

La base debe ser independiente de cualquier base compartida o real. Preferir `docker-compose.test.yml` con almacenamiento temporal. La guía de ejecución documenta `DB_NAME_TEST=proyectohs_test` y operaciones de creación/eliminación por el setup global. Antes de usar la opción local se comprobarán explícitamente host, puerto, nombre, usuario y destino efectivos. El sufijo `_test` por sí solo **no** garantiza aislamiento. Si hay cualquier duda, detener la ejecución.

El fixture empleará cuentas sintéticas con alias, no nombres/correos reales: `OWNER_A`, `OWNER_B`, `OWNER_NO_LINK`, `SPECIALIST_A`, `SPECIALIST_B`, `RECEPTION`, `ADMIN`; mascotas `PET_A`, `PET_SHARED`, `PET_B`; y disponibilidades `SLOT_FUTURE_FREE`, `SLOT_OCCUPIED`, `SLOT_DUPLICATE`. IDs concretos se generarán/leerán del fixture de test, no se fijan en este plan. Para reglas de tiempo se usarán fechas relativas (`hoy`, `hoy - 1`, `hoy + 7`) con reloj controlado y zona `America/Bogota`.

Los procedimientos de preparación/restauración serán: confirmar variables y DB aislada; ejecutar el setup/seeds de test; verificar conteos/relaciones mínimas; crear datos únicos por caso; registrar identificadores anonimizados; y al terminar limpiar mediante el mecanismo de test/Compose. No usar `down -v` sin confirmar el proyecto Compose/contexto, pues elimina volúmenes asociados.

### 3.3 Criterios de inicio

No iniciar una ronda formal hasta comprobar:

1. El equipo revisó y aprobó el alcance, la versión del PMP y la matriz, incluidos los umbrales de aceptación pendientes.
2. Se fija commit, build, migraciones y configuración del artefacto a probar.
3. Backend, frontend, herramientas y navegador están instalados y declarados para la ronda.
4. PostgreSQL responde y la conexión apunta a una base desechable, con host/puerto/nombre/usuario revisados.
5. Datos sintéticos existen para todos los roles y relaciones necesarios; no se usan PII ni claves productivas.
6. Las pruebas críticas tienen pasos, datos, resultado esperado y ejecutor asignado.
7. Las decisiones abiertas que bloquean casos están resueltas o los casos afectados fueron formalmente marcados fuera de la ronda.
8. Hay carpeta de evidencias y registro de defectos disponible.

### 3.4 Criterios de cierre de ronda

Cada caso debe quedar en un estado final registrado (`Aprobado`, `Fallido`, `Bloqueado` o `No ejecutado`). Para declarar una ronda aprobada se requiere, como mínimo: ejecutar todos los casos incluidos en la ronda; aprobar el 100% de los casos críticos; no dejar defectos críticos o altos abiertos en flujos cubiertos; documentar y aceptar formalmente defectos medios/bajos; volver a ejecutar fallos corregidos y su regresión; guardar evidencia reproducible; y obtener aprobación del equipo/representante funcional cuando corresponda.

**Porcentaje global mínimo:** pendiente de acuerdo explícito y acta del equipo antes de la certificación, según la instrucción de la tarea. Como propuesta para discusión (no aprobada): 100% de los casos críticos aprobados, 0 defectos críticos/altos abiertos y al menos 95% de los casos obligatorios aprobados. Los casos bloqueados, excluidos y no ejecutados se informan separadamente; nunca cuentan como aprobados.

Para suspender una ejecución: detener si existe duda sobre la base destino, exposición de secretos/datos reales, indisponibilidad que invalide resultados, defecto crítico que haga insegura la continuidad o decisión de negocio que cambie el oráculo. El responsable de la ronda registra hora, alcance afectado, motivo e impacto; solo el responsable de ambiente junto con el equipo puede autorizar reanudación tras restablecer ambiente/datos y revisar qué casos deben repetirse.

### 3.5 Clasificación de defectos

| Severidad | Definición / ejemplos | Decisión de salida |
|---|---|---|
| Crítica | Exposición o pérdida de datos, acceso no autorizado a información clínica, autenticación comprometida, reserva doble/inconsistente o caída de un flujo esencial sin alternativa. | Bloquea entrega/certificación; corregir, repetir y ejecutar regresión relacionada. |
| Alta | Permisos incorrectos, operaciones centrales bloqueadas, historia/cita guardada mal, corrupción parcial o fallo de recuperación que compromete cuenta. | Bloquea el alcance afectado y la aprobación hasta resolver o excluir con aprobación formal. |
| Media | Función secundaria incorrecta, inconsistencia recuperable, validación/mensaje que induce a error o rendimiento no crítico fuera del objetivo acordado. | Registrar responsable, impacto y fecha; equipo decide si bloquea la ronda. |
| Baja | Texto, detalles visuales o defecto menor sin efecto material en seguridad, datos o tarea principal. | Registrar y priorizar; aceptación/reparación documentada. |

## 4. Estrategia de pruebas

La clasificación puede cruzarse: una prueba automatizada de integración puede ser caja negra respecto a la API y caja gris respecto a la base. No se consideran categorías excluyentes.

| Tipo | Aplicación en Huellitas | Estado/limitación actual |
|---|---|---|
| Instalación/configuración | Arranque, health, entorno, migraciones, proxy y conexión PostgreSQL. | Algunas verificaciones de salud/build documentadas; no hay Docker verificado en el cierre. |
| GUI | Formularios, botones, enlaces, roles, mensajes, vacío/error, navegación, desktop/tablet/móvil y scroll. | Hay recorridos visuales previos; esta matriz planifica ampliación y evidencia. |
| Funcional/operación | Flujos completos para roles, mascotas, agenda, citas, historias, notificaciones y administración. | Parte automatizada en API; la aprobación manual/end-to-end queda pendiente. |
| Unitaria | Validadores, utilidades, middleware y servicios aislados. | Vitest en backend; conteos históricos se citan en sección 8. No se encontró suite frontend equivalente. |
| Integración | HTTP → middleware → lógica → PostgreSQL, transacciones, aislamiento, respuestas y persistencia. | Vitest/Supertest en backend; asegurar DB temporal. |
| Seguridad | JWT, autorización rol/propiedad, acceso cruzado, injection, rate limit, datos/errores, secretos, reset/logout. | Cobertura automatizada focalizada; no es pentest ni auditoría integral. |
| Regresión | Repetir casos de rutas afectadas por cambios y la suite pertinente. | La suite backend puede servir; guardar commit, comando y resultados por ronda. |
| Sistema/E2E | Interfaz → proxy/API → PostgreSQL en flujos de propietario y personal. | Pendiente como suite formal; ejecutar manualmente hasta que E2E esté implementado. |
| Rendimiento/carga/estrés | Latencia, percentiles, concurrencia, errores, CPU/memoria y recuperación. | Planificado pero bloqueado hasta aprobar perfil, ambiente, herramienta y umbrales. No correr en producción. |
| Compatibilidad | Chrome y Firefox, desktop/tablet/móvil responsive. | Pendiente de registrar matriz/versiones y evidencias; otros navegadores excluidos inicialmente. |
| Usabilidad | Tareas representativas con observación, tasa de finalización, errores y feedback. | Exploración visual anterior; falta protocolo formal/participantes. |
| Aceptación | Escenarios acordados, resultado de negocio y aprobación firmada. | Pendiente; el acta de aceptación no está completada. |
| Apoyo de IA | Proponer datos/casos o resumir logs no sensibles; toda conclusión verificable por humanos. | No es una etapa autónoma de aprobación ni un sistema de test establecido. |

### 4.1 Enfoque por módulo

- **Autenticación:** éxito, datos inválidos, duplicidad, rol, token ausente/expirado/revocado, rate limit y flujo de recuperación con proveedor de test.
- **Mascotas/responsables:** alta, consulta propia, acceso ajeno, asociación múltiple, límite de cinco, validaciones y roles. No aceptar un ID de propietario enviado por el cliente sin validarlo en backend.
- **Agenda/citas:** fecha futura/pasada, disponibilidad libre/ocupada, conflicto y concurrencia, filtros/roles, cancelación, auditoría, transición de estado y vencimiento automático. Mantener reglas temporales en `America/Bogota`.
- **Historias clínicas:** asignación del especialista, cita atendida, datos requeridos, unicidad por cita, lectura/filtrado por dueño según DEC-01 y prohibición de acceso ajeno.
- **RF009:** creación y lectura de aviso persistente in-app ante eventos implementados; destinatario correcto; lectura individual/masiva. No probar ni prometer correo/SMS/push externo.
- **Administración/auditoría:** acceso solo por admin, consulta/gestión disponible, y capacidad RF015 únicamente si existe en el commit objeto de prueba. Si no existe, registrar brecha; no inventar un resultado.
- **GUI/sistema:** Chrome/Firefox, formularios, roles, estados de carga/vacío/error, navegación, filtros, reservación si hay una franja libre y captura de avisos en bandeja.

### 4.2 Casos de borde y permisos obligatorios

Priorizar entradas vacías, espacios, formatos no válidos, valores de límite, fecha pasada/futura, recurso inexistente, recurso ajeno, estado incompatible, cita duplicada/concurrente, token nulo/inválido/expirado/revocado, rate limit, API desconectada y base no disponible. En todos los endpoints protegidos, incluir matriz de rol × acción × propiedad del recurso; las respuestas `403/404` deben seguir el contrato aprobado sin filtrar existencia cuando la regla exige ocultarla.

## 5. Evidencias y registro

Por cada ronda se guardarán: identificador de ronda; responsable; commit/tag y hash de artefacto; fecha/zona horaria; sistema operativo; versiones Node/npm/PostgreSQL/navegador; perfil/configuración sanitizada; base de prueba y seed version sin credenciales; comando/herramienta; ID de caso y datos sintéticos; resultado esperado/obtenido; estado; screenshot/log anonimizado; defecto relacionado y retest. Las evidencias irán en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/` o subcarpeta fechada de resultados, con registro no destructivo.

**Plantilla mínima del resultado:** `ID ronda | ID caso | commit | ejecutor | fecha | ambiente | resultado | evidencia | defecto | retest | observación`. Prohibido adjuntar credenciales, tokens, correos personales, datos clínicos reales o dumps de producción.

### 5.1 Preparación y estado de datos/ambiente

Antes de cada ronda se registrará por cada requisito de datos y de ambiente: identificador estable, descripción/versiones, responsable de disponibilidad, periodo requerido, estado de preparación, desviación frente a lo esperado, evidencia y acción de restablecimiento o disposición final. La base permanecerá aislada y los datos sintéticos se reinicializarán entre casos cuando la precondición o repetibilidad lo exija. Los campos vacíos del registro indican pendiente, no conformidad ni evidencia implícita.

### 5.2 Resultado real, bitácora e incidentes

Por cada intento se conserva por separado: (a) resultado observado, incluidos valores/códigos relevantes; (b) veredicto (`Aprobado`, `Fallido`, `Bloqueado` o `No ejecutado`) al compararlo con el oráculo aprobado; y (c) evidencia y defectos vinculados. Un evento que interrumpa la ronda se anota cronológicamente con ID, fecha/hora y zona, descripción, caso/procedimiento afectado e impacto en confiabilidad o continuidad.

Cada incidente único recibe ID, caso/build/ambiente, pasos para reproducir, esperado y observado, severidad/prioridad, impacto, evidencia sanitizada, responsable, estado, corrección/versionado y resultado del retest. No se reemplaza la observación original tras una corrección; se agrega el retest y su aprobación. La matriz incluye columnas de estado y evidencia y una hoja de registro editable para completar en una ronda real.

## 6. Orden de ejecución

1. Revisión/aprobación del PMP, alcance, decisiones y umbral de aceptación.
2. Fijar commit/artefacto y preparar herramientas, navegador, variables y permisos mínimos.
3. Preparar la base temporal, aplicar migraciones/seed de prueba y validar relaciones/datos sintéticos.
4. Ejecutar pruebas unitarias backend; registrar cobertura como métrica, no como sustituto de pruebas funcionales.
5. Ejecutar integración API/PostgreSQL: autenticación, validación, roles, propiedad, citas, historias y avisos.
6. Verificar instalación/configuración: salud, frontend/API, entorno, DB y proxy/Compose cuando Docker esté disponible.
7. Ejecutar smoke sobre el build candidato: portada, login, endpoint protegido y ruta crítica por rol.
8. Ejecutar GUI y flujos funcionales/sistema en Chrome y Firefox; comprobar tamaños acordados y registrar evidencia.
9. Ejecutar seguridad focalizada: permisos, tokens, rate limit, SQL injection, errores y datos sensibles.
10. Ejecutar regresión dirigida y suite automatizada completa en la base aislada.
11. Ejecutar usabilidad/compatibilidad acordadas; solo después, rendimiento/carga/estrés en ambiente aprobado y con umbrales previos.
12. Triage de defectos, correcciones, retests, regresión final y evaluación de criterios.
13. Revisión y aprobación del equipo/representante; completar informe y acta auténtica. Si falta aprobación, el estado queda “pendiente”, no “certificado”.

No se avanzará a aceptación si hay fallos críticos/altos en seguridad, integridad de citas o flujos obligatorios. Los casos bloqueados por decisiones se resolverán o se excluirán con aprobación documentada.

### 6.1 Hitos, dependencias y estimación preliminar

No hay fechas calendario aprobadas ni disponibilidad individual confirmada. Para estimar sin crear un compromiso ficticio, se usan hitos relativos al inicio autorizado; las duraciones son una **propuesta de esfuerzo del equipo**, a revisar al fijar build, tamaño de cambios y disponibilidad. El trabajo no inicia hasta cumplir criterios de entrada.

| Hito | Actividad y dependencia | Estimación inicial | Salida verificable / responsable líder |
|---|---|---:|---|
| H0 | Revisar PMP, alcance, decisiones y umbral; habilita los demás hitos. | 0,5 día-equipo | Aprobación/observaciones y decisiones asignadas; equipo completo. |
| H1 | Fijar commit, herramientas y ambiente aislado; depende de H0. | 0,5 día-equipo | Registro de build y chequeo de preparación; Jorge + Sara + Santiago. |
| H2 | Preparar/resetear fixtures y comprobar requisitos de datos; depende de H1. | 0,5 día-equipo | Datos/ambiente marcados listos o desviaciones bloqueantes; Jorge. |
| H3 | Suite unitaria y de integración API/DB; depende de H2. | 1–2 días-equipo | Resultados y cobertura de la corrida; Sara + Jorge. |
| H4 | Instalación, smoke, GUI y flujos de sistema; depende de H1/H2 y de H3 sin bloqueo crítico. | 1–2 días-equipo | Recorridos reproducibles, capturas sanitizadas y hallazgos; Santiago + equipo. |
| H5 | Seguridad focalizada y regresión; depende de H3/H4 y de contrato aprobado. | 1 día-equipo | Resultados rol×recurso y regresión, defectos priorizados; Sara + Jorge. |
| H6 | Compatibilidad y rendimiento solo con matriz/umbrales aprobados; dependiente del ambiente estable. | 0,5–1 día-equipo | Resultados comparables o bloqueo explícito; Santiago/Jorge. |
| H7 | Retest, cierre de incidentes, evaluación de salida y acta; depende de H3–H6. | 0,5–1 día-equipo, más correcciones | Informe/acta genuina; equipo completo. |

Las estimaciones no incluyen tiempo de corrección, espera de decisiones, aprovisionamiento ni contratación de pentest. El calendario, responsables por caso y fechas se acuerdan y registran antes de la ejecución; una actividad bloqueada no se contabiliza como terminada.

## 7. Equipo y responsabilidades

| Responsable | Área | Responsabilidades |
|---|---|---|
| Sara | Backend | Unitarias e integración; autenticación y seguridad; validadores, roles y pruebas de acceso; registrar fallos y retest técnico. |
| Jorge | Backend | Pruebas de API y PostgreSQL; lógica de citas/disponibilidad; integridad, concurrencia, persistencia; regresión y rendimiento cuando se apruebe perfil. |
| Santiago | Frontend | GUI, formularios, navegación, mensajes/estados, responsive, usabilidad y compatibilidad Chrome/Firefox; capturas sanitizadas. |
| Equipo completo | Sistema y aceptación | Flujos punta a punta, revisión de defectos, acuerdo de umbral/decisiones y aprobación final. |
| Equipo completo, con un responsable designado por ronda | QA/ambiente | Mantener matriz y registro; confirmar commit, variables y DB aislada; preparar datos, asegurar limpieza y publicar resultados. |

La asignación individual de un caso debe quedar en la columna `Responsable` de la matriz/registro antes de comenzar. El equipo puede reasignar por acuerdo, conservando la fecha y responsable real de ejecución.

## 8. Estado de calidad y limitaciones conocidas

La última ejecución local, fechada **27/11/2026**, ejecutó `npm run test:coverage` en 32 archivos: **416/417 pruebas aprobadas y 1 fallida**. El fallo está en `mascotas.test.js`: una prueba posterior recibe HTTP 409 al alcanzar el máximo de cinco mascotas tras altas anteriores; el caso de nombre de exactamente 200 caracteres pasó cuando se ejecutó aislado con una base recién sembrada. Se considera pendiente de corregir el aislamiento de los datos del test; no declarar la suite aprobada ni atribuir el fallo al formulario. La corrida no generó `coverage/index.html` ni `lcov.info`, por lo que no se informa porcentaje.

En el mismo corte pasaron lint, type-check y build frontend, `npx prisma validate` y smoke HTTP local; backend lint terminó con 0 errores y 4 advertencias. Las migraciones y el seed se aplicaron exclusivamente a bases de prueba locales temporales, luego eliminadas. La [auditoría integral del 27/11](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_PRUEBA_INTEGRAL_LOCAL.md) contiene el paso a paso. El resultado anterior de **410/410 del 25/11** y las **8 vulnerabilidades (4 moderadas y 4 altas)** notificadas por `npm ci` son antecedentes históricos; estas últimas siguen pendientes de triage. No se ejecutaron E2E, carga, CI remoto, backup/restore ni aceptación formal.

Limitaciones/decisiones que condicionan la ronda:

- El despliegue en Render está acreditado en la auditoría del 26/11; esta ronda fue local y aislada y no accedió ni modificó la base productiva.
- En el cierre se reportó Docker no disponible; no afirmar Compose validado en esa ronda.
- No se encontró suite automatizada frontend/E2E ni matriz formal de compatibilidad.
- La entrega reporta 140 casos manuales pendientes, pero los IDs/detalles originales no fueron suministrados. Esta matriz nueva es planificación complementaria, no reemplazo de esos casos.
- **DEC-01:** RF012/US-12 permite al dueño consultar su historial, mientras RN28 dice acceso exclusivo del especialista; alinear con aprobación y actualizar código/documentos/casos antes de certificar ese alcance.
- **DEC-02:** RN39/RN40 y la forma de error/respuesta observada requieren decisión; no fijar asserts del contrato en contradicción.
- **DEC-03:** requisitos operativos para cuidador separado, edición de mascota y auditoría completa RF015 requieren confirmación frente a capacidades del build.
- **DEC-04:** revisar las vulnerabilidades transitivas reportadas y acordar priorización; este PMP no las da por corregidas.
- Cifras de pruebas de fechas anteriores (334, 336, 388, 389 y 410) corresponden a cortes diferentes; el pase actual documentado es 416/417 en 32 archivos el 27/11. No mezclarlas ni sumarlas. Los resultados de cobertura anteriores y la verificación anterior de backup/restore tampoco sustituyen las pendientes del pase actual.

### 8.1 Riesgos de la ronda y tratamiento

| ID | Riesgo y efecto posible | Probabilidad / impacto | Tratamiento y señal de seguimiento | Responsable |
|---|---|---|---|---|
| R-01 | Setup o teardown apunta a una base no desechable; pérdida de datos. | Media / Crítico | Verificar host, puerto, DB y usuario efectivos; detener ante duda; preferir Compose temporal. | Jorge |
| R-02 | RF012/US-12 y RN28 discrepan sobre lectura clínica; oráculo inválido o privacidad comprometida. | Alta / Crítico | Mantener HC-04/SYS-02 bloqueados hasta decisión firmada y controles backend cotejados. | Equipo completo |
| R-03 | Contrato RN39/RN40 difiere de rutas/Swagger; asserts falsos o errores mal interpretados. | Media / Alta | Acordar esquema/status/body y versionar la decisión antes de fijar expectativas. | Sara + Jorge |
| R-04 | 140 casos manuales originales no disponibles; riesgo de perder trazabilidad al reconstruirlos. | Alta / Media | Solicitar fuente original; preservar historial y no sustituirla con los casos planificados nuevos. | Equipo completo |
| R-05 | Sin E2E frontend ni Docker verificado; la evidencia integrada de esta ronda local es limitada aunque Render se haya verificado en una ronda separada. | Alta / Alta | Etiquetar verificaciones pendientes/bloqueadas; no inferirlas desde build o backend. | Santiago + Jorge |
| R-06 | Perfil y umbrales de carga no aprobados; resultado no comparable o impacto en datos/servicio. | Alta / Alta | Mantener PERF-01/02 bloqueados y ejecutar solo en ambiente aislado con límites/paro aprobados. | Jorge |
| R-07 | Requisito de cuidador, edición de mascota o auditoría RF015 no coincide con capacidad del build. | Media / Alta | Inspección de rutas/UI y decisión de alcance; registrar brecha, no declarar aprobado. | Equipo completo |
| R-08 | La suite actual tiene 1 fallo por dependencia de orden/datos en `mascotas.test.js`; puede confundirse con un defecto de producto o declararse verde por error. | Media / Alta | Mantener 416/417 como resultado; corregir el aislamiento del test con autorización y volver a correr la suite; no afirmar cobertura ni certificación. | Sara + Jorge |

## 9. Entregables y criterio de finalización de esta tarea

La tarea documental de preparar el PMP queda completa cuando existen: este plan revisable; una matriz de casos identificados y trazables; alcance/exclusiones; criterios de inicio/cierre; configuración prevista y seguridad de base; estrategia y orden; responsables; y registro de límites y decisiones. **La finalización documental no significa que el equipo lo haya aprobado ni que se haya certificado el sistema.**

La versión final del PMP para certificar requiere revisión/aprobación del equipo, definición del porcentaje mínimo, resolución o aceptación formal de decisiones que bloquean casos, ejecución planificada y evidencia, triage/retest y aprobación auténtica del representante funcional. La firma no se presume ni se rellena en este borrador.

### Control de cambios

| Versión | Fecha | Cambio | Estado |
|---|---|---|---|
| 1.0 | 13/11/2026 | Borrador inicial de la estrategia de pruebas; cifras históricas y brechas. | Reemplazada por esta revisión. |
| 1.1 | 25/11/2026 | Alinea alcance y responsables con la tarea T4; actualiza baseline documental al informe de 410 pruebas de 410 del 25/11; incorpora matriz trazable, configuración/seguridad de datos, exclusiones, criterios, orden, conflictos y advertencia explícita de que no hay aprobación/ejecución nueva. | Reemplazada. |
| 1.2 | 25/11/2026 | Incorpora adaptación metodológica a ISO/IEC/IEEE 29119-3:2013(E), preparación de datos/ambiente, resultados/bitácora/incidentes, suspensión/reanudación, estimación relativa y registro de riesgos. | Reemplazada. |
| 1.3 | 27/11/2026 | Registra la corrida local 416/417 y su causa probable por aislamiento/orden, el pase aislado del caso de 200 caracteres, los checks frontend/Prisma/smoke y las brechas vigentes; actualiza el estado de Render previamente acreditado. | **Borrador para revisión/aprobación; sin conformidad declarada.** |
