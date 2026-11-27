# Auditoría de pruebas locales — Huellitas Saludables

## Identificación

- **Fecha y hora:** 27 de noviembre de 2026, 15:47 UTC−05 (20:47 UTC).
- **Responsable:** Manus.
- **Solicitud:** probar ampliamente el proyecto en un entorno local aislado y explicar los pasos en lenguaje sencillo.
- **Autorización:** el usuario solicitó expresamente ejecutar pruebas amplias. El selector de especie/raza había sido autorizado previamente.
- **Alcance de esta ronda:** backend, frontend, esquema Prisma y arranque local. No se hicieron cambios al código de producto, a Render ni a credenciales reales.

## Resultado en una frase

La aplicación compila y el servidor/API/frontend arrancan en el Sandbox; **416 de 417 pruebas automatizadas pasaron**. Una prueba de frontera de mascotas falló porque otros tests habían alcanzado antes el máximo de cinco mascotas del mismo usuario. La prueba de 200 caracteres pasó al ejecutarse sola con datos recién preparados. La suite completa, por tanto, **no queda aprobada** hasta corregir el aislamiento de esa prueba y volver a ejecutar el conjunto.

## Explicación sencilla

Imagina que varias personas usan la misma caja de juguetes durante una prueba. Una prueba agrega mascotas a una cuenta y otra prueba espera que todavía haya espacio. Como las pruebas no vacían esa cuenta entre intentos, la segunda recibe correctamente el aviso «límite de cinco» aunque estaba probando otra cosa (el nombre de 200 caracteres). Al probar esa segunda prueba sola, sí pasó. Esto indica que hay que separar mejor los datos de las pruebas; **no demuestra un error del formulario ni del límite de nombres**.

## Entorno y protección de datos

La ejecución ocurrió en un Sandbox de Manus aislado, no en el computador físico del usuario. El proyecto se encontraba en `Huellitas_Saludables_PRO-SUSTENTACION4-`. La copia no contiene carpeta `.git`, así que no existe un número de commit local para identificarla; se registran huellas SHA-256 de los archivos principales más abajo.

Versiones verificadas: Node.js **v22.23.4**, npm **10.9.9** y PostgreSQL **16.15**. Se instaló PostgreSQL dentro del Sandbox, se habilitó únicamente en `127.0.0.1:5432` y se usaron el rol temporal `huellitas_test_runner` y dos bases nuevas, `huellitas_manus_test` y `huellitas_smoke_test`. El host, puerto, rol y nombres se revisaron antes de iniciar la suite. El setup del proyecto puede borrar y volver a crear la base indicada por `DB_NAME_TEST`; por eso **no se usó Render ni una base compartida o de producción**.

No había `back/.env.test`. Las variables se pasaron explícitamente al proceso: `NODE_ENV=test`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_NAME=proyectohs`, `DB_NAME_TEST=huellitas_manus_test` (o `huellitas_smoke_test` en el smoke test), `DB_USER=huellitas_test_runner` y valores temporales locales para contraseña y JWT. Los valores secretos temporales se omiten deliberadamente. `DATABASE_URL` se dejó vacío; además, en modo test el constructor de URL utiliza las variables locales revisadas. `API_NINJAS_KEY` estuvo vacía y la configuración SMTP usó exclusivamente localhost, sin credenciales; no se hizo una llamada a API Ninjas ni se intentó enviar correo a un proveedor.

El seed de test puede crear registros demostrativos de prueba con credenciales conocidas en el código del proyecto. Solo se ejecutó dentro de las bases temporales aisladas, no se imprimieron ni copiaron esos datos a la auditoría y ambas bases se eliminaron. Docker no estaba disponible; no se ejecutó Docker Compose.

## Pasos realizados

### 1. Revisar que las pruebas no pudieran tocar una base real

Se leyeron `AGENTS.md`, `.agents/README.md`, las reglas internas de seguridad/pruebas/documentación, el procedimiento `DOCS_PROYECTO/test_DOCUMENTACION/EJECUCION.md`, `back/tests/setup/globalSetup.js`, `globalTeardown.js`, `testDbConfig.js`, `setupEnv.js` y `back/vitest.config.js`.

Hallazgo de seguridad importante: Vitest crea, migra, siembra y al final borra la base indicada en `DB_NAME_TEST`. La guarda del proyecto exige el sufijo `_test` y que el nombre no sea igual a `DB_NAME`, pero **no comprueba que el servidor sea local**. Por eso se confirmó manualmente la dirección `127.0.0.1:5432`, se comprobó que la base de destino todavía no existía y solo entonces se permitió la ejecución.

### 2. Revisar el alcance automático disponible

Se encontraron **32 archivos backend**: 16 de integración HTTP/servicios/base de datos y 16 unitarios. Cubren, entre otras áreas, inicio de sesión y usuarios, roles y permisos, contraseñas/JWT/sesiones, límites de intentos, mascotas/razas, citas y disponibilidad, historias clínicas, notificaciones, SQL injection, salud de API y utilidades.

En `front/` no hay un runner de pruebas de componentes ni una configuración Playwright/Cypress. Por eso build, lint y comprobación TypeScript sí son posibles, pero no sustituyen una prueba de clics y recorrido completo en navegador.

### 3. Ejecutar validaciones estáticas

Comandos ejecutados:

```bash
# Desde back/
npm run lint
npx prisma validate

# Desde front/
npm run lint
npm run type-check
npm run build
```

Resultados: lint backend terminó con **0 errores y 4 advertencias**; Prisma validó el esquema; lint frontend, comprobación de tipos y build frontend terminaron correctamente. Las advertencias de backend están en `auth.controller.js`, `disponibilidad.model.js`, `tests/integration/citas.test.js` y `tests/integration/disponibilidad.test.js`; se registran, no se ocultaron ni se corrigieron en esta tarea.

### 4. Ejecutar la suite backend completa

Desde `back/`, con las variables locales y de test indicadas arriba, se ejecutó:

```bash
npm run test:coverage
```

Vitest ejecutó los archivos en serie, como está configurado porque comparten base de datos. El setup aplicó migraciones y seed sobre `huellitas_manus_test`.

**Resultado exacto:** 32 archivos; 31 archivos pasaron y 1 archivo tuvo un fallo. En total, **416 pruebas pasaron y 1 falló**, duración informada por Vitest: **152.73 segundos**. El archivo con el fallo fue `back/tests/integration/mascotas.test.js`; el caso fue `nombre de exactamente 200 caracteres se acepta`: esperaba HTTP 201 y recibió HTTP 409.

### 5. Aislar el único caso fallido

Se revisó el orden del archivo de prueba, el seed, el modelo y el servicio:

- El setup del archivo hace `resetDatabase()` una sola vez en `beforeAll`, no antes de cada caso.
- El seed deja tres mascotas vinculadas al usuario de prueba que realiza el alta.
- Dos pruebas anteriores agregan una mascota cada una para ese mismo usuario.
- El modelo aplica el máximo de cinco mascotas y el servicio traduce ese límite a HTTP 409.
- El esquema y la columna permiten nombres de hasta 200 caracteres.

Se ejecutó únicamente el caso fallido en una base recién creada:

```bash
npm test -- tests/integration/mascotas.test.js -t 'nombre de exactamente 200 caracteres se acepta'
```

**Resultado:** 1 prueba pasó y 23 se omitieron; duración 12.18 segundos. Esto confirma que el nombre de 200 caracteres se acepta cuando el usuario aún tiene espacio. En la corrida completa el mismo usuario ya había llegado al límite por los casos anteriores. La causa confirmada es contaminación/orden de datos dentro del test, no un límite incorrecto del campo. La corrección futura debería dar datos independientes a cada caso o reinicializar la base/usuario entre casos; no se cambió el test en esta ronda.

### 6. Arrancar y comprobar backend y frontend locales

Se creó una segunda base desechable `huellitas_smoke_test`; se aplicaron migraciones (`npx prisma migrate deploy`) y seed en modo test. Se inició el backend en el puerto local 3137 y Vite en el puerto local 5174, con URL de API configurada hacia el backend local.

Comprobaciones realizadas:

| Comprobación local | Resultado esperado | Resultado |
|---|---:|---:|
| `GET /health` del backend | 200 y base conectada | **200**, `success: true`, servicio y base activos |
| `GET /api-docs/` | 200 | **200** |
| Catálogo de razas sin token | 401 (ruta protegida) | **401** |
| Preflight CORS desde el frontend local | 204 | **204** |
| Página raíz de Vite `/` | 200 | **200** |
| Ruta del frontend `/login` | 200 | **200** |
| Módulo transformado `FormularioMascota.tsx` | 200 | **200**; el código servido contiene “Caninos” y “Especifica la raza de tu mascota” |

La última comprobación lee el módulo entregado por Vite; **no equivale a abrir la pantalla y hacer clic en los controles**. No se inició sesión ni se usaron cuentas reales.

### 7. Limpiar los recursos temporales

El teardown de Vitest eliminó `huellitas_manus_test`. Al terminar el smoke test se detuvieron los procesos API y Vite y se eliminó `huellitas_smoke_test`. Se borró el rol PostgreSQL temporal y se detuvo el clúster; la verificación final encontró solo la base administrativa `postgres` y ningún listener en los puertos 5432, 3137 o 5174. El paquete PostgreSQL permanece instalado en el Sandbox, pero el servicio quedó detenido. No se modificó Render.

## Resumen de resultados

| Área | Resultado | Qué significa |
|---|---|---|
| Backend, suite completa | **416/417** | Un caso quedó fallido por datos compartidos entre pruebas; no declarar la suite verde. |
| Caso de 200 caracteres aislado | **1/1 aprobado** | El límite de 200 funciona cuando se prueba con datos limpios. |
| Backend lint | **0 errores, 4 advertencias** | No hay errores de ESLint; quedan advertencias ya identificadas. |
| Prisma | **Validado** | El esquema es válido; las migraciones se aplicaron únicamente a bases locales temporales. |
| Frontend lint | **Aprobado** | Sin errores reportados. |
| Frontend type-check | **Aprobado** | TypeScript no reportó errores. |
| Frontend build | **Aprobado** | Vite compiló la aplicación. El build regeneró `front/dist/`. |
| Smoke de servidores/API | **Aprobado** | Backend, Swagger, CORS y páginas servidas respondieron como se esperaba. |
| Porcentaje de cobertura | **No obtenido** | Se pidió cobertura, pero la corrida terminó con un test fallido y no generó `back/coverage/index.html` ni `lcov.info`; no se informa un porcentaje. |

## Archivos y evidencia

No se editó lógica de aplicación, pruebas, esquema/migraciones, configuración productiva ni despliegue. El comando de build regeneró artefactos bajo `front/dist/`. Se crearon esta auditoría, su bitácora QA y las actualizaciones de continuidad/documentación descritas al final.

La copia no incluye `.git`, por lo que no se pudo registrar un commit. Huellas de archivos en el momento de la validación:

- `back/app/services/raza.service.js`: `5274b4b4ddef47213679c3848332d0fde72ce8fc573da21918775825cf372d40`
- `front/src/components/FormularioMascota.tsx`: `e881c0a9aed57136745cb6809e3ea8a7b259b63912764b052f56a9e0162b80f4`
- `back/tests/integration/mascotas.test.js`: `d8a1abc80aa81c44c2e8f21adc32ae45c756dd1d320600c5e329f08c3d038a37`

Los logs brutos quedaron temporalmente en `/tmp` dentro del Sandbox; esta auditoría conserva los resultados sanitizados. Las pruebas revisadas están en `back/tests/`; la configuración de seguridad está en `back/tests/setup/`.

## Limitaciones y riesgos pendientes

1. **No declarar aprobada la suite** hasta solucionar el aislamiento del test del nombre de 200 caracteres y repetir la suite completa. La ejecución actual es 416/417.
2. No se hicieron pruebas de clics ni E2E del frontend; el build y los HTTP 200 no prueban todos los flujos visuales o de usuario.
3. No se consultó API Ninjas en vivo porque no había clave; se probaron el servicio y los respaldos automatizados con mocks/configuración sin clave.
4. No se probó envío real de correo SMTP.
5. Docker Compose, compatibilidad entre navegadores, rendimiento/carga, pentest independiente, backup/restore y aceptación formal no forman parte de esta ejecución.
6. El lint backend mantiene 4 advertencias. La revisión automatizada identifica además brechas de E2E y de integración completa de recuperación por correo; se describen en la cobertura de tests existente.
7. La última instalación de dependencias no se repitió. Las 8 vulnerabilidades del `npm ci` reportadas en auditorías previas siguen siendo un antecedente pendiente, no un resultado nuevo de esta ronda.

## Próxima acción recomendada

Corregir **solo el aislamiento del test** de `mascotas.test.js` (por ejemplo, usar un usuario dedicado o reiniciar su fixture antes de cada prueba de alta), con el cambio revisado por el responsable del proyecto; luego volver a correr `npm run test:coverage` contra una nueva base local `_test`, registrar el nuevo resultado y confirmar si se genera reporte. Después, incorporar una prueba E2E de la interfaz si se autoriza instalar/configurar un runner. Si se necesita probar API Ninjas en vivo, configurar la clave exclusivamente como secreto backend y nunca en el frontend ni en esta auditoría.
