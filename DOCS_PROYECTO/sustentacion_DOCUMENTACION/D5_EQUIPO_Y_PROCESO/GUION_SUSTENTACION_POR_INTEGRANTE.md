# Guion de sustentación por integrante

Cada integrante debe poder explicar el sistema completo. El reparto de profundidad es una sugerencia que el equipo debe ajustar a sus contribuciones reales; este guion no demuestra que el ensayo haya ocurrido.

## Recorrido común que debe dominar cada integrante

1. Problema, alcance y roles: usuario/propietario, recepción, especialista y administración; también qué funciones no están disponibles.
2. Arquitectura de código: React/TypeScript/Vite, API Express por capas, Prisma y PostgreSQL. En este pase se ejecutaron Vite/Express/PostgreSQL localmente; Docker/Nginx de despliegue no se verificaron porque Docker no estuvo disponible.
3. Flujo de cita: mascota → disponibilidad futura → cita → atención/historia clínica. Explicar que esta revisión inspeccionó pantallas pero no envió formularios ni completó ese recorrido manual.
4. Seguridad y datos clínicos: JWT, bcrypt, roles y filtros por propietario; el dueño consulta en solo lectura historias de sus mascotas, mientras el especialista registra/actualiza atenciones autorizadas. La suite incluye pruebas de acceso propio/ajeno; falta una validación manual de seguridad en ambiente publicado.
5. Notificaciones: avisos persistentes dentro de la aplicación para citas/disponibilidad. No hay correo/SMS/push configurados; la pantalla capturada usa datos sembrados y no prueba por sí sola que el evento se haya disparado durante la captura.
6. Calidad actual: 410/410 backend en 31 archivos; frontend build correcto; lint front 0/0 y back 0 errores/4 advertencias. No se midió cobertura; tampoco se ejecutaron E2E/carga ni se validó CI remoto en esta revisión. `npm ci` reportó 8 vulnerabilidades (4 moderadas, 4 altas), aún sin triage.
7. Implantación: no hay URL pública verificada. La guía, separación de ambientes y política de backups son documentación; no equivalen a despliegue, backup/restauración ni operación productiva probados.

## Profundidad sugerida (validar el reparto con el equipo)

| Integrante | Tema para profundizar | Preguntas de preparación |
|---|---|---|
| Santiago Buitrago Goyeneche | Infraestructura, migraciones y despliegue | ¿Qué está documentado y qué se desplegó realmente? ¿Qué cambia entre local/staging/producción? ¿Cómo demostraría una restauración? |
| Sara Jasmin Cruz Calderón | Calidad, trazabilidad y modelo relacional | ¿Qué prueban las 410 pruebas? ¿Qué no prueban? ¿Qué restricciones/FK y pruebas de autorización existen? ¿Qué falta medir? |
| Jorge Alejandro Torres Paez | API, autenticación, roles y citas | ¿Cómo limita consultas por propietario? ¿Cómo se revoca un token? ¿Qué pasa si una franja ya está ocupada? |

El reparto anterior debe corregirse si no coincide con el trabajo real de cada persona. Nadie debe atribuir a otro integrante tareas que no haya realizado.

## Demostración propuesta

Acordar previamente una base sintética, usuarios por rol, las acciones permitidas, la restauración de datos y un plan de limpieza. Si se hace una demostración con formularios, reservarla para el ensayo autorizado del equipo; esta revisión no ejecutó mutaciones. Presentar el sistema como local salvo que el equipo obtenga una URL externa y evidencie su disponibilidad.

## Preguntas que conviene preparar

- ¿Qué queda pendiente y por qué? Consultar D1 y los README por dimensión.
- ¿Cómo probarían backup/restore? Explicar procedimiento documentado y reconocer que no se reejecutó en este pase.
- ¿Cómo distinguen validación de UI y autorización real? La seguridad debe verificarse también en el backend.
- ¿Qué significan 410/410? Son pruebas backend aprobadas localmente, no cobertura ni aceptación del producto.
- ¿Cuál es el estado de notificaciones? Persisten in-app; no se enviaron mensajes externos.

## Registro de ensayo

Ensayo realizado: ☐ No demostrado · Fecha: __________ · Presentes/total: __________ · Observaciones: ____________________

Cada integrante debe agregar su propia preparación y completar su reflexión en `REFLEXION_FINAL_4_TRIMESTRES.md`.
