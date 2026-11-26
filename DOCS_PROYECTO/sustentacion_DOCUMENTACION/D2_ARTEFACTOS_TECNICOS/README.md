# D2 — Artefactos técnicos

**Criterios asociados:** 3, 4, 5 y 6. **Estado global:** 🟡 Parcial; la ejecución fue local y con datos sintéticos.

## Evidencia organizada

La carpeta conserva especificación, reglas de negocio, diagramas y acta. El código ejecutable está en `back/` y `front/` en la raíz de esta copia del proyecto; no dentro de esta carpeta documental. La raíz documental real es `DOCS_PROYECTO/`: las fuentes documentales están en [back_DOCUMENTACION](../../back_DOCUMENTACION/README.md), [front_DOCUMENTACION](../../front_DOCUMENTACION/README.md) y [test_DOCUMENTACION](../../test_DOCUMENTACION/README.md).

En la revisión local se aplicaron seis migraciones Prisma a PostgreSQL 16 aislado, la API respondió HTTP 200 en `/health`, el frontend compiló y Vitest aprobó 410/410 pruebas en 31 archivos. El lint del frontend terminó con 0 errores/0 advertencias; el del backend, con 0 errores/4 advertencias. Hay pruebas de integración de acceso por propietario: cada usuario solo consulta sus mascotas/citas e historias clínicas de sus propias mascotas en modo lectura; el especialista registra/actualiza atenciones autorizadas. Esto respalda la existencia de componentes integrados y controles, pero no es una prueba end-to-end completa ni aceptación en un ambiente externo.

## Qué falta para el cumplimiento total

- **Criterio 3:** ejecutar y registrar un flujo funcional de punta a punta con roles/datos autorizados en el ambiente que se presentará; completar la revisión de errores críticos y aceptación técnica.
- **Criterio 4:** demostrar en forma separada los errores de validación y las restricciones de integridad, con casos positivos/negativos y resultados; la suite general no prueba por sí sola “integridad completa en todos los niveles”.
- **Criterio 5:** validar la matriz de permisos por rol en backend y frontend con casos de acceso permitido/denegado, incluidos recursos de otro propietario e historias de mascotas propias/ajenas; la consulta del cliente es solo lectura y la edición corresponde al especialista autorizado. Obtener revisión del equipo y repetir la validación en staging.
- **Criterio 6:** confirmar con el equipo y el jurado si IoT/móvil es no aplicable al alcance. La carpeta no contiene evidencia funcional de esas integraciones.
- Completar el acta de aceptación únicamente con las personas autorizadas; hoy está sin nombres ni firmas.

## No presentar como evidencia válida

- `Proyecto Final [Nombre proyecto aqui] - ADSO.zip` tiene nombre de plantilla ajena al proyecto. Se conserva sin borrarlo, pero **no presentarlo** como fuente ni como entrega de Huellitas Saludables.
- `Acta_Aceptacion_Final.docx/.pdf` es un formato sin completar; no demuestra aceptación.

El ZIP `Proyecto Final [Nombre proyecto aqui] - ADSO.zip` se conserva con su nombre de plantilla y no se presenta como fuente ni como entrega del proyecto. Esta copia contiene el código ejecutable en `back/` y `front/`; la documentación fuente se encuentra bajo `DOCS_PROYECTO/` en las carpetas indicadas arriba.
