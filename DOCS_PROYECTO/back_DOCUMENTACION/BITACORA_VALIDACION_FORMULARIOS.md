# Bitácora — Validación de formularios (teléfono, correo, contraseña y errores en columna)

**Proyecto:** Huellitas Saludables — frontend React + TypeScript (Vite) y backend Node.js (ESM), Express, Prisma 7 y PostgreSQL.

**Fecha:** 13/11/2026

---

## 1. Nombre del cambio

Restricción de caracteres en los formularios de cuenta y visualización de errores uno por uno en forma de columna.

## 2. Descripción del problema

| Punto | Situación encontrada |
|---|---|
| Teléfono | Los formularios de **Crear cuenta** (`Registro.tsx`) y **Gestión de personal** (`GestionUsuarios.tsx`) aceptaban letras, guiones, paréntesis y espacios. |
| Correo | Se podían escribir espacios dentro del correo; el backend los rechazaba con un mensaje genérico de formato. |
| Contraseña | Los espacios se validaban solo al enviar, con un único mensaje general. |
| Errores | Cada formulario mostraba **un solo error a la vez** (`setErrorForm(problema)` devolvía en cuanto encontraba el primer fallo) o un párrafo con todos los mensajes unidos por espacios, difícil de leer. |

## 3. Objetivo

1. El teléfono solo acepta números.
2. Correo y contraseña no permiten espacios: la tecla se bloquea y, si el texto entra por pegado o autocompletado, se limpia al instante.
3. Al enviar se muestran **todos** los errores, cada uno en su propia fila de una columna vertical, apareciendo uno detrás de otro con una animación escalonada. Al corregir y reenviar, desaparecen los resueltos y quedan solo los pendientes.
4. El backend refuerza las mismas reglas, para que no dependan del navegador.

## 4. Reglas implementadas

| Campo | Regla en el frontend | Regla en el backend |
|---|---|---|
| `telefono` | Solo dígitos (`onKeyDown` bloquea teclas no numéricas y `onChange` aplica `soloDigitos`). `inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={10}`. Validación: 7 a 10 dígitos. | `Joi.string().max(20).pattern(/^\d+$/u)` → «El teléfono solo puede contener números.» |
| `correo` | Espacio bloqueado con `bloquearTeclaEspacio` y eliminado con `sinEspacios` en `onChange` (cubre pegado y autocompletado). Validación de formato. | `Joi.string().max(150).pattern(/^\S+$/u).email()` → «El correo electrónico no puede contener espacios.» |
| `contrasena` / `confirmar` | Espacio bloqueado y eliminado igual que el correo. Mínimo 4 caracteres. | `pattern(/^\S+$/u).min(4).max(72, 'utf8')` (sin cambios de límite, ya existente). |

En el backend, `validate.js` ahora genera **un mensaje por campo** (si varias reglas fallan sobre el mismo dato, como un correo con espacios y con formato inválido, se informa solo el primer problema) y devuelve la lista individual en `details.fields`, que el frontend usa directamente.

## 5. Archivos modificados

| Archivo | Cambio |
|---|---|
| `front/src/utils/inputs.ts` | **Nuevo.** `soloDigitos`, `sinEspacios`, `tieneEspacios`, `bloquearTeclaEspacio`, `bloquearTeclaNoDigito`. |
| `front/src/utils/errores.ts` | **Nuevo.** `erroresDeRespuesta()`: convierte `details.fields` (o `message`) de la API en una lista de mensajes individuales. |
| `front/src/components/ListaErrores.tsx` | **Nuevo.** Columna de errores (`role="alert"`, `aria-live="assertive"`), un `<p>` por mensaje con retardo escalonado de 160 ms. |
| `front/src/pages/Registro.tsx` | Validación completa que devuelve `ErrorCampo[]`; teléfono numérico; correo y contraseña sin espacios; `aria-invalid` por campo; pistas «Sin espacios» y «Solo números». |
| `front/src/pages/Login.tsx` | Correo y contraseña sin espacios; validación por campo; errores en columna en lugar del párrafo único. |
| `front/src/pages/GestionUsuarios.tsx` | `validar()` devuelve todos los errores; teléfono numérico; correo, contraseña y confirmación sin espacios; errores en columna; `aria-invalid`; se limpian al cambiar el tipo de cuenta. |
| `front/src/index.css` | Estilos `.lista-errores`, `.lista-errores__item`, animación `error-aparece`, borde rojo para `input[aria-invalid="true"]`, `.field__hint` y respeto a `prefers-reduced-motion`. |
| `back/app/schemas/auth.schema.js` | Constantes `TELEFONO_SOLO_DIGITOS` y `CORREO_SIN_ESPACIOS`, aplicadas a `loginSchema`, `registroSchema` y `registroAdminSchema`. |
| `back/app/middlewares/validate.js` | Mensajes específicos para correo y teléfono en `string.pattern.base`; deduplicación de errores por campo. |
| `back/tests/unit/middlewares/errorHandler.validate.test.js` | Casos de teléfono numérico, correo sin espacios y un error por campo. |
| `back/tests/integration/auth.test.js` | Registro con teléfono inválido y correo con espacios → 400. |
| `back/tests/integration/usuarios-admin.test.js` | Alta de personal con teléfono y correo inválidos → 400. |

## 6. Pruebas ejecutadas

| Prueba | Resultado |
|---|---|
| `npm run build` (frontend, `tsc -b` + Vite) | Compila sin errores. |
| `npm test` (backend, Vitest) | **23 archivos, 334 pruebas aprobadas** (PostgreSQL 16 local). |
| Registro vacío en el navegador | Aparecen 6 errores en columna, uno por fila. |
| Teléfono con `abc 300-123 45` | Queda `30012345`. |
| Correo `ana perez @ correo.com` | Queda `anaperez@correo.com`. |
| Contraseña `clave 123` | Queda `clave123`. |
| Reenvío con datos parciales | Se muestran solo los 3 errores pendientes (nombre, apellidos, dirección). |
| Registro completo | «Cuenta creada. Ya puedes iniciar sesión.» |
| Login con espacios externos y contraseña `123 456` | Inicia sesión correctamente como admin. |
| Gestión de personal vacía | 8 errores en columna (uno por campo obligatorio). |
| Gestión de personal con datos inválidos | Teléfono `3100000004`, correo y contraseñas normalizados; queda solo el error de especialización y luego se crea el usuario (ID ESP004). |
| `curl` a `/api/auth/registro` con `telefono: "300-123"` | 400 con `details.fields: ["El teléfono solo puede contener números."]`. |

## 7. Notas

- Los errores permanecen visibles hasta el siguiente envío, para que el usuario pueda leerlos; los campos afectados se marcan con borde rojo y `aria-invalid`.
- El formato de respuesta de la API no cambió: sigue siendo `{ success, message, code, details }`; `details.fields` ahora contiene mensajes individuales y sin duplicados.
- Los datos de prueba creados durante la verificación manual (usuario `anaperez@correo.com` y especialista `ESP004`) se crearon en una base local temporal y no forman parte del proyecto.
