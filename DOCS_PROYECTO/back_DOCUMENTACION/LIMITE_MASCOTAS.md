# Límite backend de mascotas

La API limita a **cinco mascotas por usuario**. `back/app/models/mascota.model.js` define `MAXIMO_MASCOTAS_POR_USUARIO = 5`; durante la creación, cuenta las asociaciones del usuario dentro de la misma transacción y rechaza un alta que superaría el cupo. La regla se aplica en el backend, por lo que no depende solo de la interfaz.

En `POST /api/mascotas`, al alcanzar el máximo, el backend responde HTTP `409 Conflict`, código `MASCOTAS_LIMITE_ALCANZADO` y mensaje `Has alcanzado el límite de 5 mascotas por usuario.`. El propietario se obtiene de la identidad JWT autenticada, no de un ID libre enviado por el cliente. Las consultas de mascotas también se limitan por propietario: ajenas o inexistentes devuelven `404` genérico.

La regla se define en `back/app/models/mascota.model.js`, se traduce a respuesta HTTP en `back/app/services/mascota.service.js` y se verifica en `back/tests/integration/mascotas.test.js`. La evidencia general más reciente consignada por el proyecto es 410/410 pruebas en 31 archivos; esta actualización documental no ejecutó pruebas.
