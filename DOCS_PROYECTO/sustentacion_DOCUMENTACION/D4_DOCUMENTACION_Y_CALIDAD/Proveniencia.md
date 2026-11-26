# Procedencia de evidencias — v1.2

> Las entradas anteriores a «Actualización de procedencia» son antecedentes de un corte documental previo; no sustituyen los resultados locales del 25/11/2026 que aparecen desde esa sección.

- **Código (antecedente):** aplicativo entregado por separado como `Huellitas_Saludables_mejorada.zip`; SHA-256 `01dfe6a7213c33abf728d915dcbd9b6cc5ea47f710001f5d45e7da66f82a88ba`. Ese hash identifica únicamente el ZIP citado en el corte anterior, no la copia de trabajo ni el ZIP de entrega nuevo. En la copia revisada actualmente no se encontraron archivos `.env` ni plantillas `.env.example`; no se imprimieron ni modificaron credenciales.
- **Cambios revisados:** navegación por rol en `front/src/components/Navbar.tsx`, acceso rápido a gestión de personal en `DashboardAdmin.tsx` (se retiraron de ese panel los botones rápidos de citas y disponibilidad), estado vacío de disponibilidad y guardas `RoleRoute` para `/mascotas`, `/mascotas/nueva` y `/citas/nueva`. Los enlaces del menú se contrastaron con rutas declaradas y roles en `AppRoutes.tsx`.
- **Build:** ejecutado el 2026-11-20 desde `front/` con Node.js v22.23.4 y npm 10.9.9; `npm run build` (`tsc -b` y Vite 6.4.6) terminó con código 0 y 161 módulos transformados. El log adjunto corresponde al build posterior a retirar los accesos rápidos de citas y disponibilidad.
- **Project 4:** información usada desde un corte de captura heredado con fecha consignada 2026-11-20 09:42 COT; la consulta posterior no expuso tarjetas dinámicas. No se trata como actualización en tiempo real.
- **Documentación:** especificación, historias, reglas, matrices, bitácora, criterios, acta y dossier recibidos y adaptados. Las matrices de casos originales contenían ejemplos ajenos y no aportaban los 140 casos reportados; estos se mantienen pendientes sin inventar detalles.
- **Límites del corte previo:** la revisión de navegación fue estática; en esa actualización no se ejecutaron pruebas de navegador, manuales, autorización, API, backend, Vitest, lint, smoke o aceptación. No se recibió el desglose de 36 observaciones ni la matriz original de 140 casos con IDs/procedimientos.
- **Precondición operativa:** el usuario informa que actualmente no hay especialistas registrados. No se consultó de forma independiente la base de datos.


## Actualización de procedencia — revisión local 25/11/2026 (UTC−05:00)

- Se continuó sobre la copia de trabajo del proyecto ubicada en la raíz del paquete; no había metadatos Git disponibles, por lo que no se atribuye esta ejecución a commit/tag. El ZIP fuente original no se modificó.
- El entorno aislado usó Node.js 22.23.4, npm 10.9.9, PostgreSQL 16, frontend en `localhost:5173` y API en `localhost:3000`. Se creó la base sintética `huellitas_sust_demo_20261126`, se aplicaron seis migraciones Prisma y se cargó la semilla demo. `/health` respondió HTTP 200. Docker no estuvo disponible.
- La suite backend aprobó 410/410 pruebas en 31 archivos sobre base de prueba temporal separada, eliminada al finalizar. Se registraron logs de build frontend, lint frontend y lint backend en `EVIDENCIAS_EJECUCION_ACTUAL/`.
- Resultados de lint: frontend 0 errores/0 advertencias; backend 0 errores/4 advertencias. Build frontend correcto. `npm ci` del backend reportó ocho vulnerabilidades (4 moderadas, 4 altas); no se ejecutó `npm audit fix`.
- Se tomaron 18 capturas de la interfaz en Chromium a 1440 × 1000 px, usando cuentas/datos sintéticos. No se enviaron formularios clínicos/de alta/cita, no se cambiaron estados y no se marcaron notificaciones como leídas. Los avisos visibles proceden de la semilla y no prueban un evento generado durante la toma. Las imágenes evidencian pantallas locales, no despliegue externo ni flujo funcional completo.
- No se midió cobertura, no se ejecutaron E2E/carga, CI remoto, backup/restore en este pase ni aceptación. Los datos históricos que siguen en anexos conservan ese carácter histórico y no se presentan como resultados actuales.
- Los manuales DOCX/PDF se sincronizaron con las capturas actuales seleccionadas y con hechos verificables, incluida la lectura de historias propias en modo solo lectura. Se conservaron diagramas, logotipo y estilos; una imagen heredada de estructura con etiqueta Sequelize se marca expresamente como histórica/desactualizada.
