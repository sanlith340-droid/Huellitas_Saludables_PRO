# Auditoría de prueba en vivo: notificaciones, recuperación e historias clínicas

## Identificación

- **Fecha y hora:** 23 de noviembre de 2026, 19:41 UTC-05
- **Responsable:** Manus
- **Tarea:** Validación manual integrada solicitada por el usuario
- **Entorno:** Sandbox, PostgreSQL local de pruebas `proyectohs_test`, backend Express en puerto temporal 3100 y receptor SMTP local temporal en 127.0.0.1:2525

## Preparación

Se restableció únicamente la base de pruebas mediante `NODE_ENV=test npx prisma migrate reset --force` y se ejecutó `NODE_ENV=test npm run seed`. No se utilizó una base productiva. Se levantó un receptor SMTP local temporal compatible con la configuración de Nodemailer; no se utilizaron credenciales ni proveedores externos.

## Procedimiento y resultado

Se inició sesión con las cuentas demo sembradas de usuario, especialista y recepcionista. Se crearon dos franjas futuras para evitar que el backend rechazara las franjas sembradas de agosto de 2026, ya vencidas respecto a la fecha de la prueba.

Para historias clínicas, el usuario creó una cita para Max, el especialista ESP001 creó la historia con diagnóstico, tratamiento, peso y observaciones, y el usuario consultó `GET /api/historia/mascota/1`. Resultado: la historia recién creada fue encontrada por el propietario; el diagnóstico visible fue `Diagnóstico en vivo`.

Para notificaciones, el usuario creó una cita para Luna, la modificó y la canceló. El especialista consultó sus notificaciones. Resultado: 24 avisos acumulados en la base de prueba, 24 sin leer, con los tipos `nueva_cita`, `cambio_cita`, `cambio_estado_cita` y `cambio_disponibilidad`. La consulta de notificaciones con el token de usuario respondió `403`, confirmando el aislamiento por rol.

Para recuperación, se solicitó el cambio para `pedro.gonzalez@gmail.com`, se recibió el mensaje en el SMTP local, se extrajo el token del enlace, se verificó, se consumió con una contraseña nueva y se inició sesión correctamente con esa contraseña. Resultado: correo capturado, token verificado, reset completado e inicio de sesión posterior exitoso.

## Comandos principales

```bash
NODE_ENV=test npx prisma migrate reset --force
NODE_ENV=test npm run seed
npm start                         # backend con variables temporales de prueba
node /tmp/huellitas_live_check.mjs
```

El script temporal no se incorporó al proyecto y los procesos temporales de backend y SMTP se detuvieron al finalizar.

## Incidencia observada y resolución

La primera ejecución intentó usar las franjas sembradas de agosto de 2026 y el backend respondió correctamente `400` porque ya habían pasado. Se corrigió el procedimiento creando franjas futuras en la base de prueba; no se modificó código funcional.

## Explicación sencilla

Se comprobó el sistema como si fueran personas reales: un dueño pidió una cita, el especialista escribió la historia y el dueño pudo verla; también se generaron avisos que solo recibió el especialista. Finalmente, se pidió recuperar la contraseña, se recibió el correo de prueba, se usó el enlace y la contraseña nueva permitió entrar.

## Limitaciones

La prueba de correo utilizó un receptor SMTP local, no un proveedor externo de producción. La interfaz gráfica del navegador no se operó en esta sesión; la secuencia funcional se verificó directamente contra la API HTTP. La base utilizada fue exclusivamente la de pruebas y quedó modificada por la demostración hasta el próximo reinicio.
