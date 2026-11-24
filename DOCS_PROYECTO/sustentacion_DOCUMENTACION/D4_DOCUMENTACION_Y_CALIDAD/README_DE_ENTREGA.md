# Entrega de calidad — Huellitas Saludables

**Carpeta:** Proyecto Final Huellitas Saludables - ADSO  
**Versión documental:** 1.2 · **Preparación:** 2026-11-20  
**Aceptación:** pendiente; acta sin nombres ni firmas.

## Estructura principal requerida

- `Evidencias-Pruebas/`: reporte de ejecución, revisión estática, proveniencia y log del build frontend.
- `Acta_Aceptacion_Final.docx` y `.pdf`: plantilla pendiente, deliberadamente sin firmas.
- `Bitacora_Aseguramiento_de_Calidad.xlsx`: registro SQA actualizado con la revisión de navegación por rol y la compilación correspondiente.
- `Control_Incidencias_y_Defectos.xlsx`: observaciones documentales/estáticas; no se inventan defectos reproducidos ni cierres.
- `Criterios_Finalizacion.xlsx`: Definition of Done con build frontend verificado y pruebas/aceptación aún pendientes.
- `Dossier_Calidad_Software.docx` y `.pdf`: dossier organizado conforme a los siete apartados del Taller 5.
- `Matriz_Casos_de_Prueba.xlsx` y `Matriz_Trazabilidad_RTM.xlsx`: matriz de casos y RTM para el alcance documentado de esta entrega.
- Anexos de apoyo: especificación y reglas adaptadas en DOCX/PDF; `Historias_de_Usuario_Adaptadas.xlsx`; `Informe_Adaptacion.md`; manifiestos de inventario/hashes.

## Navegación por rol incluida

- **Usuario:** Mi panel, Mascotas, Solicitar cita y Perfil.
- **Especialista:** Mis citas y Perfil.
- **Recepción:** Agenda y Perfil.
- **Administrador:** Panel de administración, Personal, Disponibilidad, Citas y Perfil; el panel mantiene únicamente el acceso rápido a gestión de personal.

Las pantallas de mascotas y solicitud de cita usan guardas por rol de usuario. Las rutas de disponibilidad, citas del especialista, citas administrativas, panel admin y gestión de personal mantienen sus roles declarados. La revisión fue estática y el build frontend se ejecutó; no se validaron los flujos en navegador ni las autorizaciones funcionales.

## Estados de evidencia

El build actualizado del frontend se ejecutó con `npm run build` en `front/`: TypeScript `tsc -b` y Vite 6.4.6 finalizaron con código 0 (161 módulos transformados). El log está en `Evidencias-Pruebas/Build_frontend_2026-11-20.log`. Esto confirma construcción/type-check del frontend, no la ejecución de pruebas funcionales, backend, smoke o navegador.

Los 140 casos manuales fueron reportados, pero no se recibieron con IDs/detalle y no se ejecutaron. Los 56 candidatos GWT de la matriz tampoco se ejecutaron. El resultado 336/336 en 24 archivos y smoke se conserva únicamente como reporte histórico del usuario, sin log aportado ni reejecución. El acta permanece pendiente y sin firmas.

## Aplicativo actualizado

El archivo compañero `Huellitas_Saludables_mejorada.zip` se entrega por separado de esta carpeta. SHA-256: `01dfe6a7213c33abf728d915dcbd9b6cc5ea47f710001f5d45e7da66f82a88ba`. El panel administrativo conserva el acceso rápido a gestión de personal; los accesos rápidos a Citas y Disponibilidad se retiraron, aunque esas pantallas siguen disponibles en el menú por rol. Incluye navegación diferenciada, guardas de ruta para las pantallas del usuario y el estado vacío de disponibilidad cuando no hay especialistas. No incluye `.git`, `node_modules`, `dist` ni archivos `.env` reales. Los cambios se consideran incorporados en código, no aceptación funcional. El usuario informa que actualmente no hay especialistas registrados; por ello, los flujos de disponibilidad e historia clínica requieren datos de prueba para validarse.

## Controles de integridad

`Inventario_Evidencias.csv` y `QA_artefactos.json` contienen tamaños y SHA-256 de los archivos del expediente; ambos manifiestos se excluyen mutuamente para evitar autorreferencia. Recalcular los hashes si algún archivo cambia después de esta versión.
