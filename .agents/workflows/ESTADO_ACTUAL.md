# Estado actual de Huellitas Saludables

**Fecha de actualización:** 24 de noviembre de 2026, UTC-05.

## Funcionalidad completada

El flujo de historias clínicas está integrado: el especialista crea y edita una historia desde una cita atendida y el propietario selecciona una mascota para consultar únicamente sus historias. El backend valida pertenencia, roles y textos no vacíos; las mascotas ajenas responden con un `404` genérico.

También se validaron recuperación de contraseña con SMTP local de pruebas, notificaciones in-app y aislamiento de notificaciones por rol.

## Mejora visual completada

Se rediseñaron las vistas del propietario `/mascotas` y de historia clínica. Las mascotas ahora se muestran como tarjetas con resumen, especie, género, raza y acción de consulta. La historia clínica presenta un encabezado de consulta protegida, tarjetas por atención y bloques diferenciados para diagnóstico, tratamiento, peso, especialista, motivo y observaciones. Se conservaron seguridad, roles, permisos, endpoints y lógica backend.

## Seed demo validado

El `back/prisma/seed.js` recuperado contiene usuarios demo, 30 mascotas distribuidas en 10 propietarios/acudientes —3 por usuario—, datos base, franjas demo, citas, historias, notificaciones y cancelaciones. Se ejecutó dos veces sobre PostgreSQL local y mantuvo conteos estables: 17 usuarios, 30 mascotas, 134 disponibilidades, 36 citas, 30 historias, 9 notificaciones y 3 cancelaciones.

En `NODE_ENV=test` carga únicamente el conjunto base compatible con fixtures. La demo se activa con una ejecución normal o explícitamente con `SEED_DEMO=true`.

## Validación de continuidad — 24 de noviembre de 2026

- Backend: `npm test` → **388/388 pruebas aprobadas en 29 archivos**.
- Frontend: `npm run build` → **compilación exitosa**.
- PostgreSQL local: cinco migraciones aplicadas en `proyectohs_test` durante la suite y en `proyectohs` mediante `prisma migrate deploy`.
- Idempotencia del seed: dos ejecuciones consecutivas sin duplicados.
- Auditoría: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_CONTINUIDAD_VALIDACION.md`.

## Hallazgos y limitaciones

- La copia validada no usa Docker porque Docker no está instalado en este entorno; se usó PostgreSQL 16 local temporal.
- Hay una discrepancia entre una nota previa del estado —20 mascotas y 20 historias para `USU001`— y el `seed.js` recuperado, que implementa 3 mascotas y 3 historias por cada uno de 10 usuarios. No se debe afirmar la ampliación a 20 para `USU001` hasta confirmar cuál requisito prevalece.
- `/citas/nueva` puede mostrar disponibilidad dependiente del conjunto de datos demo. No se agregaron franjas fuera del seed validado.
- El backend reportó 8 vulnerabilidades transitivas durante `npm ci`; no se actualizaron dependencias.

## Reglas de continuidad

Leer primero `AGENTS.md`, después `.agents/README.md`, las reglas/skills aplicables y este archivo. No modificar migraciones ni `schema.prisma` sin autorización explícita. Toda nueva ejecución debe quedar registrada en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.

## Siguiente paso

Confirmar con el usuario si debe conservarse el seed validado de 3 mascotas por usuario o aplicar la ampliación descrita en la nota previa a 20 mascotas y 20 historias para `USU001`. Si se elige la ampliación, solicitar/aplicar el cambio de seed y repetir la suite, migraciones y validación de idempotencia.


## Límite de mascotas — 24 de noviembre de 2026

Se implementó y validó un máximo de cinco mascotas por usuario. La API rechaza la sexta con HTTP 409 y código `MASCOTAS_LIMITE_ALCANZADO`. El frontend muestra el mensaje `Ya tienes 5 mascotas registradas` junto con la ilustración existente `vacio-mascotas.webp`, recomendaciones y enlace al listado.

La prueba específica quedó en 22/22 y la suite completa en 389/389 pruebas aprobadas en 29 archivos. El frontend compiló correctamente. La auditoría está en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_LIMITE_MASCOTAS.md`.

La prueba viva del 24 de noviembre de 2026 quedó aprobada: desde el navegador se inició sesión, se abrió `/mascotas/nueva`, se intentó registrar una sexta mascota y se confirmó en el DOM la imagen `vacio-mascotas.webp`, el título `Ya tienes 5 mascotas registradas`, la descripción, recomendaciones y el enlace `Ver mis mascotas`. La auditoría está en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_PRUEBA_VIVA_LIMITE_MASCOTAS.md`.

Se implementó el filtro de historias clínicas por año y mes en `HistoriaClinicaMascota`. La prueba viva confirmó que Max muestra únicamente la atención del periodo elegido: noviembre de 2026 mostró la atención del 27/11/2026 y agosto de 2026 mostró la atención del 19/08/2026. La auditoría está en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-24_FILTRO_HISTORIAS_ANIO_MES.md`.
