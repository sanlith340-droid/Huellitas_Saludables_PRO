# Informe de adaptación del expediente — Huellitas Saludables

Versión 1.0 · 2026-11-20 · Corte Project 4 utilizado: 2026-11-20 09:42 COT (hora local consignada en la captura heredada).

## Alcance y fuentes

- Project 4: [https://github.com/users/joretopa7-stack/projects/4](https://github.com/users/joretopa7-stack/projects/4); repositorio: [https://github.com/joretopa7-stack/Huellitas_Saludables_PRO_](https://github.com/joretopa7-stack/Huellitas_Saludables_PRO_). Se usa la captura pública heredada con 18 tarjetas; la vista HTML consultada después no expuso las tarjetas.
- Especificación base, historias de usuario, PDF RN, matrices/acta/dossier recibidos y ZIP de código.
- El código fue inspeccionado de forma estática, en copia de solo lectura; no se modificó ni se ejecutó en esta adaptación.

## Decisiones de adaptación

- Se conservan RF001–RF020, RNF001–RNF015, US-01–US-20 y RN01–RN45.
- RF se reescriben como capacidades observables; RNF se expresan como condición de verificación o como objetivo pendiente.
- Historias usan Como/Quiero/Para y criterios Dado–Cuando–Entonces derivados de las celdas entregadas; la revisión INVEST se marca como propuesta, pendiente del equipo.
- Las reglas técnicas de autenticación, headers y contrato de respuesta se distinguen de reglas de dominio.
- Trazas débiles se marcan sin confirmar; no se borran IDs ni se fuerza vínculo a tarjeta.

## Separación de evidencia

- **Tablero:** 10 tarjetas QUE HACER, 1 HACIENDO y 7 HECHO en la captura indicada. Siete issues están abiertos pese a HECHO (#1, #5, #9, #10, #11, #14, #15). Los issues #17 y #19 están cerrados mientras sus tarjetas siguen en QUE HACER. No se encontró vínculo a PR de cierre en la consulta registrada.
- **Código:** estado por tarjeta y referencias a rutas/símbolos en `Matriz_Trazabilidad_RTM.xlsx`, hoja `Backlog_GitHub`, y `Evidencias-Pruebas/Revision_Estatica_Codigo.md`. La evidencia de archivo no equivale a prueba ejecutada.
- **Calidad:** las 140 pruebas manuales siguen no ejecutadas. La matriz fuente no incluye esos casos; contiene cinco ejemplos ajenos. Se añadieron 80 criterios reconstruidos como candidatos `PROP-US-XX-01..04`, enlazados por historia funcional en la RTM y separados de los 140 reportados; no se ejecutaron.
- **Automatización:** 336/336 en 24 archivos, build/type-check y smoke se conservan como resultados previamente reportados por el usuario. No se recibieron logs ni se reejecutaron en esta adaptación.
- **Observaciones:** 36 reportadas como estáticas/cobertura, sin detalle individual suministrado. No se presentan como 36 defectos reproducidos/resueltos.

## Decisiones abiertas prioritarias

- **DEC-01 — Acceso de dueño a historia clínica:** RF012/US-12 dicen que el dueño consulta sus historias; RN28 y rutas /api/historia limitan acceso a especialista. Estado: No resuelto. Acción: Acordar política de lectura del dueño; ajustar requisito, RN, autorización, UI y pruebas con decisión aprobada.
- **DEC-02 — Contrato de errores RN39/RN40:** Regla RN39 describe {success,message,data}; fuente previa señala diferencia respecto al manejador observado. Estado: Pendiente. Acción: Aprobar un contrato de errores/respuestas y actualizar OpenAPI, código y pruebas.
- **DEC-03 — Alcance de guardería/cuidador:** RF016–RF020 y US-16–20 documentan funciones no localizadas; Project #2 tiene descripción “POR DEFINIR”. Estado: Pendiente. Acción: Confirmar si se construye y qué entidades/roles y criterios se aceptan.
- **DEC-04 — Perfil de mascota:** RF005 cubre alta básica; tarjeta #3 suma edición/archivo/cambio de contraseña sin historias separadas. Estado: Pendiente. Acción: Descomponer en historias/requisitos y definir campos editables/roles.
- **DEC-05 — Restablecimiento de contraseña:** Tarjeta #13 solicita correo/token; no hay RF/US base identificada ni proveedor configurado en evidencia. Estado: Pendiente. Acción: Aprobar alcance, proveedor, expiración y criterios de seguridad.
- **DEC-06 — Notificaciones:** RF009 describe avisos sin fijar canal, eventos, destinatarios o proveedor. Estado: Pendiente. Acción: Definir contrato funcional y canal.
- **DEC-07 — RN no funcionales sin métrica:** RNF004/005/006/007/013/014/015 no tienen umbral operativo completo. Estado: Pendiente. Acción: Acordar métricas/condiciones y método de prueba.
- **DEC-08 — 36 observaciones:** Solo se recibió la declaración de que existen 36 observaciones estáticas/cobertura; no se entregó desglose por ítem/logs. Estado: No confirmable individualmente. Acción: Entregar y validar la lista itemizada antes de asignar estados, severidad o responsables.
- **DEC-09 — 140 casos manuales:** Se reportan 140 no ejecutados, pero matriz recibida contiene cinco ejemplos ajenos y no los 140 casos ni sus IDs/detalles. Estado: Pendiente de suministro. Acción: Entregar fuente con IDs, pasos, datos y esperados para preservar cada caso.
- **DEC-10 — Estados GitHub / issues:** Siete tarjetas en HECHO muestran issues abiertos; #17/#19 están en QUE HACER pero issues cerrados; no se encontró PR de cierre. Estado: Pendiente de conciliación. Acción: Confirmar estado de cierre en tablero y vínculo a PR en GitHub.
- **DEC-11 — Acta de aceptación:** No hay aceptación real, firmantes ni evidencias de aprobación en el ZIP recibido. Estado: Pendiente. Acción: Solo diligenciar y firmar tras revisión y aceptación auténtica.

## Material recibido que se corrigió documentalmente

- RTM y casos de prueba eran plantillas ajenas al sistema Huellitas; los cinco ejemplos recibidos quedan identificados en hoja separada y excluidos de las métricas.
- Control de incidencias incluía BUG-01/BUG-02 ajenos; se conservan como muestra excluida, no como defectos del sistema.
- Dossier recibido era 0 bytes y Evidencias-Pruebas estaba vacío. Se generan documentos e informes con límites explícitos.
- Acta original tenía placeholders y afirmación de conformidad no soportada; se sustituye por acta pendiente sin firmas.
- No se recibieron QA_artefactos.json, README_DE_ENTREGA.md ni Inventario_Evidencias.csv; se crean nuevos.

## Límites que permanecen

- Las descripciones/IDs originales de los 140 casos manuales y la lista individual de las 36 observaciones no están en los archivos recibidos. No se inventaron.
- El contenido actual de tarjetas se informa según captura pública a las 09:42 COT; fetch posterior de la página no expuso el tablero dinámico.
- No hay aceptación final ni firmas.
