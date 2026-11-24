# Reporte de ejecución y revisión — v1.2

**Fecha de ejecución del build:** 2026-11-20  
**Código:** `Huellitas_Saludables_mejorada.zip` (SHA-256 `d4588b5d25bc50b668b353d9c800f45b920e452da0d6c5f95b6f8a827a477456`).

## Verificación actual ejecutada

| Verificación | Resultado | Evidencia / límite |
|---|---|---|
| Frontend `npm run build` | Finalizó con código 0. | `tsc -b` y Vite 6.4.6; 161 módulos transformados. Log adjunto. |
| Type-check frontend | Incluido en el comando `tsc -b` anterior. | Verificación de compilación, no test funcional. |
| Revisión estática de navegación | Enlaces del menú coinciden con rutas existentes y guardas por rol; se reforzaron tres rutas de usuario. | Revisión de código, sin abrir la aplicación ni probar accesos en navegador. |
| Vitest / backend | No ejecutado en esta actualización. | No atribuir resultado del reporte histórico. |
| Pruebas manuales / UI / navegador | No ejecutadas. | 140 casos fuente reportados no recibidos; 56 candidatos GWT siguen sin ejecutar. |
| Lint / smoke / base de datos | No ejecutados en esta actualización. | La información anterior del usuario se mantiene como reporte histórico sin log adjunto. |
| Aceptación | No emitida. | Acta sin nombres ni firmas. |

## Resultados previos reportados por el usuario

Se conserva como dato histórico no reproducido aquí: Vitest 336/336 en 24 archivos; build/type-check y smoke previos reportados; lint no ejecutable en esa ejecución por ausencia de ESLint. No se afirma que esos resultados se repitieran en esta entrega ni se presentan logs que no fueron recibidos.

## Revisión estática de cambios

- `Navbar.tsx` presenta accesos diferenciados: usuario (Mi panel, Mascotas, Solicitar cita, Perfil); especialista (Mis citas, Perfil); recepción (Agenda, Perfil); administrador (Panel de administración, Personal, Disponibilidad, Citas, Perfil). El logo también lleva al panel principal del rol autenticado.
- `DashboardAdmin.tsx` conserva el acceso rápido a Personal (`/usuarios/admin`); se retiraron del panel los accesos rápidos a Disponibilidad y Citas. Ambas pantallas siguen en el menú del administrador, y sus rutas continúan protegidas para `admin` en `AppRoutes.tsx`.
- La revisión estática detectó que pantallas privadas genéricas de mascotas y solicitud de cita no limitaban el rol al abrir la URL directamente. Se añadieron guardas `RoleRoute roles={['usuario']}` en `/mascotas`, `/mascotas/nueva` y `/citas/nueva`; no se cambió el alcance de los roles para agenda, citas de especialista ni administración.
- `Disponibilidad.tsx` deshabilita “Nueva franja” si no hay especialistas y ofrece al administrador un acceso a registrar el primero. Para recepción muestra que debe solicitar el alta al administrador. El usuario informa que actualmente no hay especialistas registrados; la base de datos no se consultó independientemente.
- Las rutas del menú se contrastaron estáticamente con `AppRoutes.tsx`. No se verificó el comportamiento visual, responsive, navegación con teclado ni autorización en ejecución. Las guardas de interfaz no sustituyen la autorización del backend.
- El componente `HistoriaClinicaCita.tsx` está importado por `PanelCitas.tsx` y permite cargar/crear/actualizar historia para una cita. Su autorización y recorrido UI/API no se probaron y faltan datos para validar el flujo real.
- Logout y revocación JWT se localizaron en las rutas/servicios/middleware de backend y en `AuthContext.tsx`. No se ejecutó prueba de cierre y reutilización de token.

## Casos manuales y observaciones

Se reportan 140 casos manuales no ejecutados, sin IDs/procedimientos/resultados fuente recibidos. La matriz registra esa limitación y no fabrica sus detalles. Los 56 candidatos GWT derivados de las historias incluidas tampoco se ejecutaron. Se reportan 36 observaciones estáticas/de cobertura sin detalle individual; no se clasifican como defectos reproducidos, corregidos o cerrados. La observación de navegación se registra separadamente como hallazgo estático corregido en código, pendiente de validación manual.

## Precondición reportada por el usuario

El usuario indica que actualmente no hay especialistas registrados. Se consigna como limitación reportada, no como consulta independiente de la base de datos. Antes de validar agenda, citas o historia clínica se requieren cuentas de especialista y citas/datos de prueba apropiados.
