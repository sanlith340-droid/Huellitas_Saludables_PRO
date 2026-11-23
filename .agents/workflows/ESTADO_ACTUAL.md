# Estado actual del proyecto

**Última actualización:** 23 de noviembre de 2026
**Rama de referencia:** `PRO_HUELLITAS_SALUDABLES`
**Propósito:** permitir que otro modelo continúe sin depender de la conversación anterior.

## Entrega fusionada

- Código de trabajo: `back/` y `front/`.
- Entrega ZIP: `/home/ubuntu/work/entrega/Huellitas_Saludables_PRO_FUSION_2026-11-23.zip`.
- Informe: `/home/ubuntu/work/entrega/INFORME_FUSION.md`.
- Bitácora principal: `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_FUSION_RF09_Y_RECUPERACION.md`.

## Funcionalidades verificadas

- Recuperación de contraseña con token hash SHA-256, TTL predeterminado de 30 minutos, un solo uso e invalidación de tokens anteriores.
- Notificaciones in-app persistentes para especialistas.
- Frontend para solicitar recuperación, definir contraseña nueva y consultar notificaciones.
- 383 pruebas aprobadas en 29 archivos durante la verificación de la fusión.
- Cinco migraciones aplicadas correctamente sobre una base vacía.
- Build del frontend exitoso.
- Flujo de recuperación probado con SMTP local; no se probó un proveedor SMTP externo real.

## Pendientes conocidos

- Configurar y probar credenciales SMTP reales para producción.
- Revisar el filtro de pertenencia por propietario en algunas consultas GET.
- Actualizar manuales DOCX/PDF con recuperación y notificaciones.
- Resolver o documentar el estado de ESLint del frontend.
- Auditoría persistida RF15 permanece pendiente.

## Cómo continuar

1. Leer `/AGENTS.md`.
2. Leer `.agents/README.md` y esta hoja de estado.
3. Leer la bitácora relacionada antes de modificar código.
4. Seleccionar la Rule, Skill y Workflow aplicables.
5. Ejecutar una verificación inicial antes de cambiar archivos.
6. Documentar cada cambio y actualizar esta hoja al finalizar.

## Formato para actualizar este documento

Al terminar una sesión, agregar o actualizar:

- fecha y modelo o responsable;
- objetivo trabajado;
- archivos modificados;
- pruebas ejecutadas y resultado;
- decisiones tomadas;
- pendientes y riesgos;
- siguiente paso recomendado.

## Cambio más reciente: estructura de agentes

Se creó `AGENTS.md` como lectura obligatoria, junto con `.agents/README.md`, Rules, Skills, Workflows, perfil de coordinación y procedimiento de transferencia entre modelos. La decisión está registrada en `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_AGENTS_Y_CONTINUIDAD.md`.

La próxima sesión debe comenzar leyendo `AGENTS.md`, después `.agents/README.md`, este archivo y la bitácora anterior.

## Política más reciente: autorización previa

Antes de aplicar cambios importantes, se debe presentar una solicitud con rutas exactas, explicación técnica, explicación sencilla, impacto, riesgos, pruebas y reversión. La autorización explícita es obligatoria antes de editar. Las plantillas están en `.agents/templates/` y el procedimiento en `.agents/workflows/autorizacion-cambio-importante.md`.

## Política más reciente: alcance por Rule y auditoría obligatoria

Cada Rule ahora especifica archivos que el modelo puede tocar, archivos protegidos que no puede tocar sin autorización y la ubicación documental del cambio. Toda prueba o ejecución de la IA relacionada con levantar, correr, compilar, migrar, consultar o probar el proyecto debe registrarse en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.

La plantilla está en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/PLANTILLA_AUDITORIA_IA.md` y la decisión está registrada en `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_AUDITORIAS_IA.md`.
