# Informe de adaptación del expediente — Huellitas Saludables

**Versión:** 1.2 · **Fecha:** 2026-11-20 · **Aceptación:** pendiente, sin firmas.

## Alcance y fuentes

- Especificación, historias de usuario, reglas de negocio, matrices, bitácora, criterios y acta recibidos previamente.
- Código actualizado en `Huellitas_Saludables_mejorada.zip` (SHA-256: `d4588b5d25bc50b668b353d9c800f45b920e452da0d6c5f95b6f8a827a477456`) y build de frontend ejecutado sobre la copia de trabajo.
- Alcance documental consolidado: RF001–RF012 y RF014–RF015, RNF001–RNF015, 14 historias y RN01–RN45. Los identificadores fuente se conservan cuando aplican.

## Cambios de esta revisión

- Se actualizó el dossier y el acta para ajustarlos a los apartados del Taller 5 y al estado de la versión actual del aplicativo.
- Se actualizaron RTM, historias, criterios candidatos, control de observaciones, bitácora, DoD, README e informes de evidencia.
- Se diferenciaron los accesos del menú por rol: usuario, especialista, recepción y administrador. El panel administrativo conserva el acceso rápido a gestión de personal; los botones rápidos de disponibilidad y citas se retiraron del panel y esas pantallas permanecen en el menú del administrador.
- La revisión estática detectó y se corrigió en código el acceso no diferenciado a pantallas de mascotas y solicitud de citas cuando se abrían directamente por URL; `/mascotas`, `/mascotas/nueva` y `/citas/nueva` ahora usan `RoleRoute` para `usuario`.
- En disponibilidad, se deshabilitó la creación de franjas sin especialistas y se añadió el acceso administrativo para registrar al primero. El usuario informa que actualmente no hay especialistas registrados; no se consultó independientemente la base de datos y no se validó ese flujo funcionalmente.
- La revisión estática confirmó que los enlaces principales apuntan a rutas declaradas y guardadas por rol. No se ejecutó navegador ni prueba de autorización.
- Se ejecutó `npm run build` en `front/`: `tsc -b` y Vite 6.4.6 finalizaron con código 0 y 161 módulos transformados. El log posterior a los cambios está en `Evidencias-Pruebas/Build_frontend_2026-11-20.log`.
- El contenido de fuentes que no forma parte del alcance de esta entrega se excluyó de las matrices; no se implementó ni se atribuye funcionalidad no presente.

## Separación de evidencia

- **Código:** revisión estática de archivos concretos del archivo actualizado; no equivale a ejecución de endpoints, flujos o autorización.
- **Build:** frontend ejecutado y reproducible según el log; no es prueba funcional. No se reejecutó Vitest, pruebas backend, casos manuales, lint o smoke.
- **Pruebas manuales:** se reportan 140 casos sin detalle fuente/IDs; no se inventan y siguen no ejecutados. Los 56 candidatos GWT incluidos también están sin ejecutar.
- **Automatización histórica:** 336/336 en 24 archivos y smoke se conservan como información reportada previamente por el usuario; no se recibió log ni se reprodujo en esta entrega.
- **Observaciones:** 36 estáticas/cobertura reportadas, sin desglose individual; no se reclasifican como defectos reproducidos o resueltos. El hallazgo de navegación se mantiene identificado aparte como corregido en código con validación manual pendiente.

## Decisiones abiertas prioritarias

- **DEC-01 — Acceso de dueño a historia clínica:** RF012/US-12 y RN28 difieren; requiere política de acceso aprobada.
- **DEC-02 — Contrato de errores RN39/RN40:** definir un contrato único y validar código/pruebas.
- **DEC-03 — Perfil de mascota:** definir campos/roles y alcance de edición.
- **DEC-04 — Restablecimiento de contraseña:** aprobar alcance, proveedor y controles.
- **DEC-05 — Notificaciones:** determinar eventos, destinatarios y canal.
- **DEC-06 — RNF:** completar umbrales y métodos de verificación.
- **DEC-07 — Observaciones reportadas:** recibir detalle de los 36 elementos antes del triage.
- **DEC-08 — Casos manuales:** aportar fuente de los 140 casos e historial de ejecución.
- **DEC-09 — Project / issues:** conciliar los estados heredados; el corte previo no se presenta como consulta dinámica actual.
- **DEC-10 — Aceptación:** obtener decisión auténtica de responsables autorizados; el acta permanece en blanco.

## Límites que permanecen

No se generaron firmas, nombres, aprobaciones, resultados de pruebas ni estados de defectos no respaldados. El build actual cubre solo el frontend; el usuario informa que no hay especialistas registrados. Se requieren datos de prueba y pruebas funcionales, backend, seguridad, smoke y aceptación humana para cierre.
