# Backlog final y retrospectiva — Huellitas Saludables

**Corte documental:** 25/11/2026 (hora local). **Base de cálculo:** 17 tarjetas identificadas en el corte de tablero/RTM disponible. **Estado:** borrador para validación del equipo; no es consenso ni una calificación de la Lista de Chequeo T4.

> El equipo debe revisar las tarjetas, confirmar el denominador, completar justificaciones con su experiencia y validar la retrospectiva. La estimación siguiente **no representa el porcentaje total de terminación del proyecto ni el cumplimiento de D1–D5**.

## 1. Backlog revisado (17 tarjetas del corte disponible)

Convención de trabajo provisional: ✅ = 1 punto; 🟡 = 0,5; 🔴 = 0. El criterio para clasificar estados debe validarlo el equipo.

| # | Tarjeta | Estado provisional | Evidencia/observación |
|--:|---|:-:|---|
| 1 | Backend en ESM | ✅ | `type: module`; bitácora técnica |
| 3 | Personalizar perfil de usuario y mascota | 🟡 | Perfil de consulta; falta edición de perfil/mascota |
| 4 | Historias clínicas desde vista especialista | ✅ | `historia.*`, `HistoriaClinicaCita.tsx` y pruebas |
| 5 | Contraseñas con bcrypt | ✅ | `utils/password.js` y pruebas de seguridad |
| 6 | Retirar valores inseguros por defecto de JWT/BD | ✅ | Configuración exige valores; verificar secretos reales al desplegar |
| 7 | CORS por orígenes configurados | ✅ | Lista de orígenes; la configuración remota sigue pendiente |
| 9 | Evitar SQL injection | ✅ | Consultas parametrizadas/utilidades y pruebas |
| 10 | Manejo de errores, logs y contrato | 🟡 | `errorHandler.js`; falta alinear RN39 y documentar retención durable |
| 11 | Limitar intentos de login | ✅ | `authRateLimit.js` y pruebas |
| 12 | Cierre de sesión con revocación de token | ✅ | `cierre-sesion.test.js` |
| 13 | Recuperar contraseña por correo | ✅ | Flujo de token de un solo uso; el envío requiere configuración externa |
| 14 | Migrar a Vitest | ✅ | 410/410 aprobadas en 31 archivos en la ejecución local actual |
| 15 | Migrar a Prisma | ✅ | `schema.prisma`; seis migraciones aplicadas a la base demo local |
| 16 | Dockerfile backend multi-etapa y no-root | 🟡 | No se verificó con Docker, no disponible en este pase |
| 17 | Navegación por rol y estados de error | ✅ | `Navbar.tsx`, guardas de rutas y estados UI |
| 18 | Maquetado header/contenido/footer | ✅ | `MainLayout.tsx` y `SiteFooter.tsx` |
| 19 | Pantallas de carga | ✅ | Componentes de carga y botones de envío |

**Cálculo provisional: 14 ✅ + 3 🟡 = 15,5 / 17 = 91,2 %.** Denominador limitado a estas 17 tarjetas; no incluye necesariamente todo el backlog del proyecto ni todos los criterios de la checklist. No equivale a aprobación.

Además de las tarjetas, el código actual incluye límite de mascotas, filtros de historias clínicas, notificaciones persistentes in-app y autorización por propietario en consultas de mascotas/citas. La suite actual pasó; la validación manual de seguridad en un entorno desplegado sigue pendiente. Las notificaciones no incluyen correo/SMS/push.

## 2. Pendientes conocidos y justificación que debe validar el equipo

| Pendiente | Motivo/alcance conocido | Evidencia que falta |
|---|---|---|
| Edición de perfil y mascota | Función no incluida en el alcance implementado revisado | Decidir si queda fuera de alcance o planificarla |
| Dockerfile de backend multi-etapa/no-root | No se pudo verificar contenedorización en este pase (Docker no disponible) | Probar construcción y ejecución segura con Docker antes de afirmar cierre |
| Contrato de error RN39 | Requisito y contrato de respuesta necesitan alineación | Decisión del equipo y actualización consistente de código/documentación |
| Vacunas en historia clínica | No se verificó un modelo/campo específico | Confirmar si el requisito sigue vigente y registrar aceptación o pendiente |
| Auditoría persistente | Los eventos se registran en logs; no hay evidencia de bitácora durable | Definir almacenamiento, retención y acceso si se requiere |
| Canales externos de notificación | La versión revisada persiste notificaciones dentro de la aplicación; no hay proveedor de email/SMS/push configurado | Definir proveedor/credenciales y probar si el requisito exige canal externo |
| Pruebas frontend/E2E/carga | No se ejecutaron en este pase | Diseñar/ejecutar y adjuntar evidencia |
| Despliegue externo/operación | No hay URL pública verificada ni ambiente productivo validado | Desplegar y obtener evidencias de salud, seguridad, backup/restore |
| Dependencias | `npm ci` reportó 8 vulnerabilidades (4 moderadas, 4 altas) | Revisar `npm audit` y priorizar actualización segura; no aplicar `npm audit fix` a ciegas |

## 3. Retrospectiva de T1–T4 (síntesis documental, no reflexión personal)

El resumen parte de artefactos del repositorio y requiere confirmación de quienes participaron.

| Trimestre | Foco que sugieren los artefactos | Observaciones para validar con el equipo |
|---|---|---|
| T1 | Análisis, requisitos, historias y modelo de datos | Hubo versiones de requisitos; confirmar cómo se resolvió el alcance |
| T2 | Base de datos y API | Evolución desde SQL manual hacia API por capas/ORM; precisar aprendizajes reales |
| T3 | Frontend, roles y calidad | Se trabajó navegación por rol y cambios de infraestructura; validar reparto y dificultades |
| T4 | Seguridad, implantación y calidad | Se añadieron controles y suite local de 410 pruebas; cobertura no medida en este pase y despliegue externo pendiente |

**Reflexión del equipo a completar en voz propia:** ¿qué repetirían, qué cambiarían, qué quedó sin alcanzar y cómo se preparan para la etapa productiva? Cada integrante debe escribir su reflexión en `D5_EQUIPO_Y_PROCESO/REFLEXION_FINAL_4_TRIMESTRES.md`.