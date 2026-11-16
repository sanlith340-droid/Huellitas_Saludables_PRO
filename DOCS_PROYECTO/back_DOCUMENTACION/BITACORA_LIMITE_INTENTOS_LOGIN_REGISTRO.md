# Bitácora: límite de intentos en login y registro

**Proyecto:** Huellitas Saludables PRO  
**Fecha de trabajo:** domingo 15 de noviembre de 2026  
**Zona horaria de esta bitácora:** America/Bogota (UTC−05:00)  
**Alcance:** cambios realizados exclusivamente sobre el contenido de `Huellitas_Saludables_PRO.zip` proporcionado para esta tarea.

## Criterio de registro horario

Las horas se normalizan a America/Bogota usando las marcas de tiempo visibles de la sesión y de las comprobaciones ejecutadas. Se redondean al minuto; cuando varias acciones quedaron agrupadas o no existe una marca individual verificable, se usa un rango y/o la palabra **aprox.**. Los rangos representan el momento en que ocurrió una secuencia de trabajo, no una estimación de cuánto tardó cada cambio. No se atribuyen horas exactas a acciones cuya marca individual no quedó registrada.

## Objetivo

Limitar los intentos a los endpoints públicos de inicio de sesión y registro para reducir intentos automatizados de acceso. El resultado solicitado era que las primeras cinco solicitudes por IP fueran procesadas y que, al superar el límite durante una ventana de 15 minutos, el backend devolviera HTTP `429` con un mensaje claro y el tiempo restante de bloqueo.

## Decisión técnica DT-2026-11-15-01

**Estado:** adoptada e implementada el 15-nov-2026.  
**Decisión:** aplicar `express-rate-limit` en el backend, con contadores independientes por IP para `POST /api/auth/login` y `POST /api/auth/registro`, máximo predeterminado de 5 solicitudes en 15 minutos y respuesta común HTTP `429` al excederlo. El limitador va antes de Joi para contabilizar tanto solicitudes válidas como inválidas. Para una sola instancia se usa el almacén en memoria predeterminado; la identificación de IP detrás de proxy se habilita solo mediante un número explícito de saltos confiables.

### Motivo

La política de seguridad debe ejecutarse en servidor porque las validaciones del navegador pueden evitarse. Limitar por IP reduce la frecuencia de intentos automatizados sin almacenar contraseñas, correos ni datos de cuenta como clave. Mantener contadores separados impide que el tráfico de login consuma el cupo de registro y viceversa. La respuesta usa el helper `fail()` para respetar el contrato de errores existente y no revelar información de la cuenta.

### Alternativas consideradas

| Alternativa | Decisión | Razón |
|---|---|---|
| Bloquear solo con JavaScript o deshabilitar el botón en el frontend | Descartada como control de seguridad | Se puede omitir el frontend y llamar directamente a la API. El botón puede mejorar la experiencia, pero no reemplaza el control backend. |
| Un solo contador compartido para login y registro | Descartada | Una ráfaga sobre una ruta no debe agotar el límite de la otra; por eso se instancian limitadores independientes. |
| Guardar el contador en PostgreSQL | No elegido para esta entrega | Aumentaría consultas/escrituras y acoplaría el control a la base de negocio. No es necesario para el despliegue de una sola instancia que se está probando. |
| Almacén distribuido (por ejemplo, Redis) desde el primer despliegue | Diferido | Es la opción a adoptar si se ejecutan varias instancias y se necesita un límite global. El almacén en memoria no comparte conteos entre réplicas. |
| Confiar en cualquier `X-Forwarded-For` (`trust proxy: true`) | Descartada | Un cliente podría falsificar la IP y evadir el límite. Se requiere declarar exactamente los saltos de proxy confiables. |
| Usar correo/usuario como clave del contador | Descartada | Podría facilitar enumeración de cuentas, requeriría procesar PII y bloquearía a una cuenta aun cuando la IP no sea abusiva. |

### Consecuencias y trade-offs aceptados

- Al alcanzar seis solicitudes dentro de la ventana se responde `429`; `Retry-After` y `details.retryAfterSeconds` indican el tiempo que falta para reintentar.
- El contador predeterminado es volátil: reiniciar el proceso lo reinicia. Cada réplica mantiene su propio contador. Para una garantía global y persistente se debe configurar un store compartido antes de escalar horizontalmente.
- En redes compartidas (por ejemplo, una oficina o una salida NAT) varias personas pueden compartir IP y, por tanto, el mismo cupo. Esto es consecuencia de la política solicitada por IP.
- El formulario muestra el error del servidor y vuelve a habilitar el botón al concluir la petición. No se depende de que el cliente respete un temporizador; el backend mantiene el bloqueo hasta que venza la ventana.
- La decisión cubre el login y el registro público. El alta de personal (`/api/auth/registro-admin`) permanece protegida por autenticación y rol de administrador, pero no tiene este rate limit en esta entrega.

## Estado antes del cambio

- `POST /api/auth/login` y `POST /api/auth/registro` ejecutaban validación y controlador, pero no tenían un limitador de solicitudes por IP.
- Las respuestas de validación o autenticación ya usaban el formato de error del proyecto, pero no existía una respuesta `429` específica para exceso de intentos.
- No había una dependencia `express-rate-limit` en el backend ni pruebas dedicadas para el sexto intento.
- Express no configuraba explícitamente los saltos de proxy confiables; por ello no debía confiar indiscriminadamente en `X-Forwarded-For`.
- El formulario de login ya recogía los errores de la API y los mostraba en pantalla. El botón se deshabilitaba solo mientras la petición estaba en curso; no había una regla de interfaz que bloqueara el botón durante 15 minutos.

## Registro cronológico de cambios

| Fecha y hora (Bogotá) | Antes | Cambio realizado | Dónde y por qué |
|---|---|---|---|
| 15-nov-2026, aprox. 19:35 | El backend no tenía una dependencia para controlar la frecuencia de solicitudes. | Se agregó `express-rate-limit` (`^7.5.1`) a las dependencias y al lockfile. | `back/package.json` y `back/package-lock.json`. Se utiliza para contar solicitudes por IP y ventana de tiempo en Express. |
| 15-nov-2026, 19:35–19:36 | No existía middleware específico ni respuesta uniforme de exceso de intentos. | Se creó un limitador independiente para login y otro para registro. Cada uno permite 5 solicitudes por IP en una ventana fija de 15 minutos. La solicitud que excede el máximo recibe HTTP `429`, código `RATE_LIMIT_EXCEEDED`, `Retry-After` y `details.retryAfterSeconds`. | `back/app/middlewares/authRateLimit.js`. El middleware usa `fail()` para conservar el formato común de errores y no incorpora IP, correo, contraseña ni token en la respuesta. Si `AUTH_RATE_LIMIT_MAX` está ausente o no es un entero positivo, se usa 5 como valor seguro. |
| 15-nov-2026, 19:35 | Las rutas públicas pasaban directamente a validación y controlador. | Se colocó el limitador antes del validador Joi en ambas rutas públicas. | `back/app/routes/auth.routes.js`. Así se cuentan también las solicitudes que fallan por datos vacíos o inválidos y el sexto intento no puede evitar el límite enviando un formulario mal formado. Los limitadores de login y registro son independientes. |
| 15-nov-2026, 19:35–19:36 | No se declaraba la confianza en proxies; aceptar cualquier cabecera reenviada podría permitir falsificar la IP. | Se añadió `TRUST_PROXY` como número entero positivo de saltos confiables. No se habilita `trust proxy: true`. | `back/app/app.js`. La API solo usa la IP reenviada si el despliegue declara explícitamente su proxy confiable. |
| 15-nov-2026, 19:35–19:37 | Docker no informaba cuántos proxies separarían al cliente del backend. | Se configuró `TRUST_PROXY: ${TRUST_PROXY:-1}` en el servicio backend. | `docker-compose.yml`. El valor predeterminado corresponde al único Nginx frontend descrito en este Compose; otros despliegues deben ajustar el número a su topología real. |
| 15-nov-2026, 19:35–19:36 | No había variables de ejemplo para el nuevo control. | Se documentaron `AUTH_RATE_LIMIT_MAX=5` y el uso opcional de `TRUST_PROXY`. | `back/.env.example`. Facilita configurar el límite y evitar confiar en proxies no verificados. |
| 15-nov-2026, 19:35–19:36 | Las pruebas no comprobaban el bloqueo al sexto intento. | Se creó una prueba de integración para login y otra para registro: cinco solicitudes alcanzan validación y devuelven `400`; la sexta devuelve `429`; una séptima sigue bloqueada. | `back/tests/integration/authRateLimit.test.js`. Se comprueban también el código, el mensaje, `Retry-After` y el tiempo restante. |
| 15-nov-2026, 19:36 | Las pruebas existentes podían compartir la IP y alcanzar el límite accidentalmente. | El setup general de pruebas fija un umbral alto solo para los casos no dedicados; el test nuevo vuelve a configurar el límite real en 5 antes de importar la aplicación. | `back/tests/setup/setupEnv.js` y `back/tests/integration/authRateLimit.test.js`. Esto evita falsos bloqueos entre pruebas y mantiene una regresión precisa del límite real. |
| 15-nov-2026, 19:35–19:37 | La documentación API no describía el estado 429, la cabecera ni la limitación del contador local. | Se agregó la respuesta 429, su forma común, la independencia entre login y registro y la nota sobre instancias múltiples. | `DOCS_PROYECTO/back_DOCUMENTACION/API.md`. También se explicó que un contador en memoria es por instancia y que una instalación con varias instancias necesita almacenamiento compartido para un límite global. |
| 15-nov-2026, 19:55–19:59 aprox. | No había una bitácora que consolidara el antes/después, la decisión técnica y la evidencia de prueba. | Se redactó la bitácora, se incorporó la decisión técnica DT-2026-11-15-01 y se aclaró el criterio de precisión horaria solicitado. | `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_LIMITE_INTENTOS_LOGIN_REGISTRO.md`. Se registraron rangos cuando las acciones no podían asociarse a una marca individual y se regeneró el ZIP después de cada revisión. |

## Cambios en el frontend

No fue necesario cambiar `front/src/pages/Login.tsx`: el formulario ya convierte los errores de la API mediante `erroresDeRespuesta()` y los muestra con `ListaErrores`. En particular, recibió y presentó el texto de bloqueo enviado por el backend. El botón vuelve a estar habilitado al finalizar la respuesta porque su atributo `disabled` depende solo del estado de carga (`cargando`); durante la ventana puede volver a pulsarse, pero el backend seguirá respondiendo `429`. Se mantuvo esa conducta porque el control de seguridad vive en el servidor y no depende de JavaScript ni del navegador.

## Contrato de respuesta al superar el límite

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
```

El cuerpo usa el formato común del proyecto e incluye:

```json
{
  "success": false,
  "message": "Demasiados intentos. Inténtalo de nuevo en 15 minutos.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfterSeconds": 900
  }
}
```

El número exacto de segundos se calcula con el tiempo restante de la ventana. Cuando vence la ventana, la IP puede volver a intentarlo; al superar otra vez el máximo empieza un nuevo bloqueo. Los intentos exitosos también cuentan, ya que el límite es por solicitudes al endpoint.

## Pruebas y comprobación en vivo

### Pruebas automatizadas y verificaciones de código

- **15-nov-2026, 19:37:** pasaron los 2 tests de `authRateLimit.test.js` (uno de login y otro de registro).
- Los tests comprueban que el bloqueo persiste después del sexto intento durante la misma ventana.
- `node --check` pasó para el middleware, rutas y configuración Express.
- `git diff --check` no reportó errores de espacios.
- **15-nov-2026, 20:01 aprox.:** la primera ejecución de la suite completa alcanzó 70 tests aprobados, pero 15 suites no pudieron cargar porque faltaba `JWT_SECRET` en el entorno de prueba. No se interpretó esa ejecución como aprobada.
- **15-nov-2026, 20:02–20:04 aprox.:** se repitió la suite con un `JWT_SECRET` temporal solo para tests. Resultado final: **24 archivos aprobados y 336 tests aprobados**, duración reportada de 93.75 segundos.
- Tras Vitest, se confirmó que `huellitas_zip_live_20261115_test` fue eliminada, que el rol de prueba quedó sin permiso `CREATEDB` y que la base demo `huellitas_zip_live_20261115` permaneció intacta. Frontend y backend siguieron respondiendo `200`.

### API levantada desde la copia del ZIP

- **15-nov-2026, 19:41–19:42:** se usó una base demo nueva y aislada, `huellitas_zip_live_20261115`, y se le aplicaron las migraciones y el seed del ZIP. No se modificaron las bases preexistentes del entorno.
- El puerto `3000` ya estaba ocupado por otro proceso y se dejó intacto. La API del ZIP se levantó en `3001` y el frontend Vite en `5173`.
- `GET /health` respondió `200`, el frontend respondió `200`, y la solicitud CORS previa del frontend respondió `204`.
- **15-nov-2026, 19:44–19:45:** contra el endpoint real `POST /api/auth/login`, usando cinco contraseñas incorrectas y una IP local nueva: intentos 1–5 devolvieron `401 UNAUTHORIZED`; intento 6 devolvió `429 RATE_LIMIT_EXCEEDED` y `Retry-After: 900`.
- Una ejecución inicial usó una IP que ya tenía solicitudes contadas, por lo que el bloqueo apareció antes del sexto intento de esa medición. Se repitió con una IP de origen aislada para verificar correctamente la secuencia completa.

### Demostración desde el navegador

- **15-nov-2026, 19:47–19:50:** se abrió el formulario de login del frontend en el preview y se enviaron credenciales de prueba incorrectas a través del formulario React.
- Los fallos mostraron **“Credenciales inválidas. Verifica tu correo y contraseña.”**. Al alcanzar el sexto intento de la misma IP, el frontend mostró **“Demasiados intentos. Inténtalo de nuevo en 15 minutos.”**.
- Durante esa ventana el botón no queda permanentemente desactivado: se habilita al terminar cada petición, pero los nuevos envíos continúan recibiendo `429`. Al expirar la ventana, podrá volver a intentarse.
- Una navegación accidental al enlace “Regístrate aquí” durante la automatización no envió el formulario de registro ni creó una cuenta; se regresó al login antes de continuar.

## Archivos modificados o agregados

- `back/package.json`
- `back/package-lock.json`
- `back/app/middlewares/authRateLimit.js` *(nuevo)*
- `back/app/routes/auth.routes.js`
- `back/app/app.js`
- `back/.env.example`
- `back/tests/setup/setupEnv.js`
- `back/tests/integration/authRateLimit.test.js` *(nuevo)*
- `docker-compose.yml`
- `DOCS_PROYECTO/back_DOCUMENTACION/API.md`
- `DOCS_PROYECTO/back_DOCUMENTACION/BITACORA_RATE_LIMIT_LOGIN_REGISTRO.md` *(esta bitácora)*

## Observaciones operativas

- El middleware predeterminado mantiene los contadores en memoria: al reiniciar una instancia, sus contadores se reinician; con múltiples réplicas, cada instancia tendría su propio contador si no se configura un almacén compartido.
- El control se aplica a `POST /api/auth/login` y al registro público `POST /api/auth/registro`. La ruta administrativa `POST /api/auth/registro-admin` sigue protegida por rol de administrador y no está incluida en este límite.
- `AUTH_RATE_LIMIT_MAX` cambia el máximo de solicitudes, pero la ventana de esta implementación permanece en 15 minutos.
- Para despliegues detrás de proxy, `TRUST_PROXY` debe coincidir con los saltos realmente confiables. No debe configurarse a ciegas.
- Las pruebas y datos demo de esta bitácora pertenecen al entorno temporal de Manus. No representan una instalación en la computadora física del usuario ni sustituyen la configuración de producción.
