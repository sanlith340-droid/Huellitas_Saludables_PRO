# Evidencia de capturas actuales

## Procedencia y alcance

Capturas tomadas el **25 de noviembre de 2026 (UTC−05:00)** —26/11 UTC— directamente de la versión de trabajo ejecutada en el sandbox local. Se usó Chromium/Playwright a **1440 × 1000 px**, sin elementos de navegador superpuestos. La carpeta de trabajo no contiene metadatos Git suficientes para atribuir las capturas a un commit.

Entorno: frontend Vite en `http://localhost:5173`, API Express en `http://localhost:3000`, PostgreSQL 16 y base temporal de demostración con datos sintéticos cargados por `back/prisma/seed.js`. Las comprobaciones HTTP de API y frontend respondieron 200. Se usaron sesiones sintéticas por rol. No se enviaron formularios de alta de cuenta/mascota/cita ni formularios clínicos; no se reservaron ni cancelaron citas, no se cambiaron estados, no se editaron historias o franjas y no se marcaron notificaciones como leídas.

## Inventario

| Archivo | Pantalla / rol | Ruta o alcance |
|---|---|---|
| `01_inicio_publico.png` | Inicio público | `/` |
| `02_inicio_sesion.png` | Inicio de sesión | `/login` |
| `03_crear_cuenta.png` | Formulario de creación de cuenta (no enviado) | `/registro` |
| `04_panel_cliente.png` | Panel del propietario | `/dashboard` |
| `05_perfil_cliente.png` | Perfil del cliente, consulta | `/perfil` |
| `06_mis_mascotas.png` | Mascotas vinculadas a la cuenta | `/mascotas` |
| `07_registrar_mascota.png` | Formulario de mascota (no enviado) | `/mascotas/nueva` |
| `08_solicitar_cita_con_horario.png` | Solicitud con franja seleccionada (no enviada) | `/citas/nueva` |
| `09_mis_citas_y_estados.png` | Citas del cliente y estados visibles | `/citas/nueva` (pantalla con listado visible) |
| `10_historia_clinica_cliente.png` | Historia de mascota propia, solo lectura | `/mascotas` |
| `11_citas_especialista.png` | Citas asignadas al especialista | `/citas/especialista` |
| `12_formulario_historia_especialista.png` | Formulario clínico (sin guardar) | `/citas/especialista` |
| `13_notificaciones_especialista.png` | Notificaciones del especialista | `/notificaciones`; avisos sembrados |
| `14_agenda_recepcion.png` | Agenda de recepción | `/citas/recepcion` |
| `15_disponibilidad_recepcion.png` | Disponibilidad, recepción | `/disponibilidad` |
| `16_panel_admin.png` | Panel de administración | `/admin` |
| `17_gestion_personal_admin.png` | Gestión de personal | `/usuarios/admin` |
| `18_citas_admin.png` | Citas de administración | `/citas/admin` |

Las sumas SHA-256 de los 18 PNG se encuentran en `SHA256SUMS.txt`. Si se vuelve a guardar o recodificar una imagen, regenerar el manifiesto.

## Uso y límites

Son capturas reales de pantallas visibles durante una ejecución **local y aislada** con datos de demostración. Prueban la presentación de las pantallas por rol, no un despliegue externo, la persistencia de operaciones, la ejecución completa de flujos, la atención de pacientes reales, notificaciones salientes, backup/restore ni aceptación del jurado. Los avisos de la pantalla de notificaciones proceden de datos sembrados: no prueban que un evento se haya generado durante la captura. No afirmar cumplimiento total de D3 a partir de esta carpeta.
