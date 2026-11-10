# BITÁCORA DE DESARROLLO
**Proyecto:** Huellitas Saludables  
**Área:** Backend – Seguridad, manejo de errores y registros del sistema  
**Fecha de inicio:** 9 de noviembre de 2026 – 4:00 p. m.  
**Fecha de finalización:** 10 de noviembre de 2026 – 1:00 p. m.  
**Tiempo de trabajo:** 21 horas.

## 1. Objetivo de la actividad

Mejorar el manejo de errores y el sistema de registros del backend, centralizando las respuestas de error, implementando un logger con niveles según el entorno de ejecución y fortaleciendo la validación y normalización de los datos recibidos por la API.

## 2. Desarrollo de la actividad

### 9 de noviembre de 2026

**4:00 p. m. – Inicio de actividades**

Se inició la revisión del manejo de errores existente en el backend, identificando la necesidad de centralizar las respuestas y establecer un formato uniforme para los errores de la API.

Se trabajó en los siguientes aspectos:

- Centralización del manejo de errores mediante un único `errorHandler`.
- Implementación de un formato estándar de respuesta con los campos `success`, `message`, `code` y `details`.
- Clasificación de errores según su tipo y código HTTP.
- Implementación de mensajes controlados para errores internos y excepciones de base de datos.

### 10 de noviembre de 2026

**Continuación de actividades**

Se implementó Pino como sistema centralizado de logging, reemplazando los registros tradicionales mediante `console.log` por un mecanismo de registro estructurado.

Se establecieron niveles de registro según el entorno:

- **Desarrollo:** nivel DEBUG, permitiendo mayor detalle para identificar y solucionar problemas.
- **Producción:** nivel ERROR, evitando registros informativos o de depuración.
- **Pruebas:** nivel WARN, reduciendo registros innecesarios durante la ejecución de pruebas.

También se incorporaron medidas de protección para evitar la exposición de información sensible, como contraseñas, tokens, credenciales y datos de usuarios.

Posteriormente, se trabajó en la validación y normalización de los datos recibidos:

- Normalización de espacios en blanco en los campos de texto.
- Conservación de los espacios internos y externos de las contraseñas.
- Rechazo de credenciales compuestas únicamente por espacios.
- Validación de tipos de datos.
- Implementación de mensajes específicos para campos obligatorios, formatos incorrectos, valores inválidos y límites de caracteres.

**1:00 p. m. – Finalización de actividades**

Se finalizó la implementación y se revisó la estructura del manejo centralizado de errores, el logger y las validaciones.

## 3. Archivos y componentes intervenidos

- `app/middlewares/errorHandler.js`: centralización del manejo de errores.
- `app/utils/logger.js`: configuración del logger Pino y niveles por entorno.
- `app/utils/AppError.js`: gestión de errores personalizados.
- `app/middlewares/validate.js`: validación de tipos y normalización de espacios.
- `app/middlewares/auditLog.js`: control de registros de auditoría.
- `app/utils/response.js`: estandarización de las respuestas de la API.
- `app/app.js`: integración de los middlewares en Express.

## 4. Pruebas y verificaciones

Se incorporaron pruebas unitarias para verificar:

- Que los errores 500 no expongan mensajes internos.
- Que las respuestas de error mantengan un formato uniforme.
- Que los espacios externos de los textos se normalicen.
- Que las contraseñas no sean modificadas por la normalización.
- Que los campos tengan mensajes claros cuando presentan tipos incorrectos.
- Que las contraseñas compuestas únicamente por espacios sean rechazadas.

Adicionalmente, se revisó el código del proyecto para comprobar la ausencia de instrucciones `console.log` en los archivos JavaScript incluidos.

## 5. Resultado obtenido

Se implementó un sistema centralizado de manejo de errores y logging, con restricciones de registros según el entorno de ejecución. Se estableció una respuesta genérica para los errores internos HTTP 500, evitando entregar al cliente información técnica o mensajes internos.

También se fortalecieron las validaciones de entrada mediante tipado, normalización de espacios y mensajes específicos para facilitar la identificación de errores.

## 6. Estado final

**Actividad finalizada:** implementación de mejoras en seguridad, trazabilidad, validación y manejo de errores del backend de Huellitas Saludables.

**Observación:** las pruebas unitarias quedaron incorporadas en el proyecto; su ejecución completa debe verificarse en el entorno de pruebas.