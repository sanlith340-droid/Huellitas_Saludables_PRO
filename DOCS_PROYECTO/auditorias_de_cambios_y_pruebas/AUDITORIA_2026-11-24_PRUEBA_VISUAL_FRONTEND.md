# Auditoría de prueba visual del frontend en vivo

## Identificación

- **Fecha:** 24 de noviembre de 2026, UTC-05.
- **Responsable:** Manus.
- **Objetivo:** recorrer visualmente el frontend con datos demo sembrados y comprobar las vistas principales por rol.
- **Entorno:** Sandbox, PostgreSQL local `proyectohs_test`, backend Express en puerto 3000 y frontend Vite en puerto 5173.
- **Modo:** servicios residentes mantenidos para prueba manual posterior del usuario.

## Datos y acceso

Se recreó únicamente `proyectohs_test`, se aplicaron las cinco migraciones y se ejecutó `NODE_ENV=test SEED_DEMO=true npm run seed`. No se modificaron migraciones, esquema ni código funcional durante el recorrido.

El frontend quedó configurado solo en el proceso de ejecución para consumir el backend reenviado por el entorno. Se dejó activa la URL externa:

`https://5173-i2835iwau5e1i2cn3tacy-46963fca.us3.manus.computer/`

## Vistas comprobadas

### Público y autenticación

- Inicio (`/`): carga visual correcta, navegación a registro e inicio de sesión.
- Login de propietario: acceso exitoso con la cuenta demo.
- Cierre de sesión: mensaje visible de confirmación.

### Propietario

- `/dashboard`: muestra mascotas, citas pendientes, canceladas y atendidas del 27/11/2026.
- `/mascotas`: muestra Max y Luna; permite abrir la historia.
- Historia clínica de Max: consulta protegida en solo lectura; se visualizaron dos atenciones, diagnóstico, tratamiento, peso, especialista, motivo y observaciones.
- `/citas/nueva`: carga el formulario, selector de mascota y listado de citas existentes.
- Perfil y registro de mascota quedaron disponibles por navegación del panel, aunque no se modificaron datos durante esta pasada para conservar la demo estable.

### Especialista

- `/citas/especialista`: muestra filtros, contadores y las citas históricas y demo del 27/11/2026.
- Historia clínica desde cita atendida: abrió el formulario de edición y guardó correctamente, mostrando `Historia clínica guardada.`
- `/notificaciones`: mostró las cinco notificaciones demo sin leer.
- `/disponibilidad`: mostró correctamente la pantalla de acceso protegido para un especialista sin permisos de gestión de horarios.

## Hallazgo funcional

En `/citas/nueva`, el frontend muestra `No hay horarios disponibles` aunque existen nueve franjas del 27/11/2026 en la base. Las tres franjas de cada especialista fueron usadas por las citas demo atendida, cancelada y pendiente; la franja cancelada aparece vinculada a una cita y el endpoint de disponibilidad no la ofrece como nueva reserva. Por eso el recorrido demuestra correctamente citas e historias, pero no permite crear una cita nueva desde el formulario con la demo actual.

**Severidad:** media para demostración de reserva; no afecta la consulta de citas existentes, historias clínicas, notificaciones ni permisos.

**Siguiente acción propuesta:** agregar franjas demo libres adicionales, separadas de las tres franjas usadas por las citas, o modificar el seed para dejar al menos una franja disponible no vinculada por especialista. Requiere autorización antes de modificar el seed.

## Problemas de entorno resueltos durante la prueba

- La primera ejecución del seed falló con `P1003` porque `proyectohs_test` había sido eliminada por el reinicio de la suite. Se recreó la base de pruebas y se migró correctamente.
- El frontend inicialmente no conectaba desde el navegador aislado porque la URL de API apuntaba a `localhost`. Se reinició el proceso con una URL reenviada del backend.
- El proxy externo rechazó primero el host de Vite; se reinició con un archivo temporal de configuración que habilita el host externo. No se modificó el repositorio.

## Estado al cierre

- Backend residente activo con `NODE_ENV=test`, puerto 3000 y datos demo.
- Frontend residente activo en puerto 5173 y disponible por la URL externa indicada.
- La base demo queda intencionalmente disponible para prueba manual y puede ser reiniciada por una futura ejecución de tests.
- No se guardaron tokens, contraseñas reales ni credenciales externas en el proyecto.
