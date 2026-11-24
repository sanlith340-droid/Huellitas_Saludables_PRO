# Límite backend de mascotas

`back/app/models/mascota.model.js` define `MAXIMO_MASCOTAS_POR_USUARIO = 5`. Durante `crearConUsuario`, la cantidad de asociaciones del usuario se consulta dentro de la misma transacción antes de crear la mascota.

Cuando el cupo ya está completo, se lanza `MASCOTAS_LIMITE_ALCANZADO`. El servicio lo transforma en HTTP 409 con el mensaje `Has alcanzado el límite de 5 mascotas por usuario.`. La regla evita que una llamada directa a la API pueda superar el límite.

La prueba correspondiente está en `back/tests/integration/mascotas.test.js`.
