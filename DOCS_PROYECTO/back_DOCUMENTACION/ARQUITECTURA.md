# Arquitectura de Huellitas Saludables

## Vista general

```text
Navegador (React + TypeScript)
   │ HTTP/JSON con JWT Bearer
   ▼
Express (Node.js, JavaScript ESM) ── Prisma ORM 7 ESM + adapter-pg ── PostgreSQL
```

En Docker, Nginx sirve el frontend y proxyfica `/api`, `/health` y `/api-docs`; en desarrollo, Vite corre por separado y consume la API local. El backend se organiza en rutas, middlewares, controladores, servicios y modelos/adaptadores.

## Fuentes de verdad y componentes

- `back/package.json` y `back/package-lock.json`: tipo ESM, dependencias, versiones resueltas y scripts.
- `back/prisma/schema.prisma`: **11 modelos Prisma** y sus relaciones.
- `back/prisma/migrations/`: **seis migraciones** SQL versionadas; la carpeta `0_init` es el baseline original, no el conteo total ni el esquema completo vigente.
- `back/app/generated/prisma/`: cliente Prisma generado como ESM (`provider = "prisma-client"`, `moduleFormat = "esm"`).
- `back/app/config/prisma.js`: singleton Prisma y `@prisma/adapter-pg`.
- `back/app/models/`: consultas Prisma y adaptación de resultados al contrato HTTP.
- `back/app/services/`: reglas de negocio, comprobaciones de permisos y transacciones.
- `back/app/controllers/` y `back/app/routes/`: transporte HTTP y rutas por dominio.
- `back/app/middlewares/`: identificación JWT, roles, validación, auditoría y errores comunes.

Los 11 modelos son `Usuario`, `PasswordResetToken`, `Raza`, `Mascota`, `UsuarioMascota`, `Disponibilidad`, `Cita`, `CitaCancelacion`, `HistoriaClinica`, `TokenRevocado` y `Notificacion`.

## Relaciones e integridad de datos

- `Usuario`–`Mascota` es muchos-a-muchos mediante `UsuarioMascota`.
- Cada mascota referencia una raza; una mascota puede asociarse a varios usuarios.
- Un especialista tiene disponibilidades; las citas relacionan mascota, disponibilidad y recepcionista.
- Una cita tiene cero o una historia clínica y cero o una fila de auditoría de cancelación.
- `PasswordResetToken` y `TokenRevocado` persisten recuperación de contraseña y revocación de sesiones; `Notificacion` persiste avisos in-app vinculados al usuario y, opcionalmente, cita/disponibilidad.
- PostgreSQL aplica claves foráneas, restricciones `CHECK`, índices y SQL específico. Entre otras defensas, las citas usan un índice único parcial para evitar más de una cita activa por franja; las operaciones de reserva bloquean filas y ejecutan transacciones.
- Los triggers y restricciones se deben leer en las migraciones. No se debe inferir que el schema Prisma expresa por sí solo todos los detalles SQL.

La secuencia actual del historial consta de seis directorios: `0_init`, `20261110190000_cita_cancelacion_audit`, `20261119200000_token_revocado`, `20261123150000_password_reset_token`, `20261123190000_notificacion_in_app` y `20261124220000_consentimiento_y_foto_mascota`. Antes de cambiar datos o relaciones, crear migración nueva, conservar el SQL personalizado y validar en el entorno de base de datos autorizado.

## Autorización y datos personales

Las rutas privadas validan JWT Bearer y toman el rol vigente desde PostgreSQL. El backend también comprueba pertenencia por recurso: un propietario solo lista y consulta sus mascotas, historias de sus mascotas y citas vinculadas a sus mascotas; un especialista solo ve/gestiona historias y citas de su ámbito. Cuando corresponde, el recurso ajeno responde `404` genérico para no revelar que existe. Recepción y administración tienen los alcances definidos por endpoint. Las protecciones de navegación frontend no sustituyen estos controles.

El alta de mascotas establece máximo cinco mascotas por usuario en la lógica backend; una sexta se rechaza con HTTP `409` y código `MASCOTAS_LIMITE_ALCANZADO`. La ruta de historias clínicas por mascota permite lectura limitada al propietario verificado; las escrituras y consultas clínicas restantes corresponden al especialista autorizado.

## Identidad, recuperación y notificaciones

Las nuevas contraseñas se almacenan con bcrypt (12 rondas por defecto). Se pueden verificar hashes scrypt legados y, después de un login correcto, rehasharlos a bcrypt; el login no acepta contraseñas guardadas en texto plano. Los tokens JWT de logout se revocan mediante `TokenRevocado`.

La recuperación usa tokens aleatorios de un solo uso con hash persistido; requiere configuración SMTP y `FRONTEND_URL`. Sin esa configuración, la solicitud devuelve `503` sin exponer si existe el correo. Las notificaciones son persistentes e in-app para especialistas; no implican canales de correo, SMS o push.

## Vigencia de calidad

La evidencia técnica más reciente consignada en el estado del proyecto es **410/410 pruebas backend aprobadas en 31 archivos**. El mismo registro consigna **seis migraciones** y que `npm ci` reportó ocho vulnerabilidades (cuatro moderadas y cuatro altas). Esta actualización documental no volvió a ejecutar pruebas ni `npm ci`, ni modificó/fijó dependencias.
