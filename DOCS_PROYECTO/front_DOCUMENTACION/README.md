# Frontend — Huellitas Saludables PRO

**Ubicación del código:** `front/`  
**Documentación canónica del frontend:** `docs/front/`  
**Fecha de revisión:** 13 de noviembre de 2026

## 1. Responsabilidad

El frontend es una SPA para navegar y ejecutar los flujos de usuario: autenticarse, administrar mascotas, consultar/solicitar citas, gestionar disponibilidad y presentar vistas según el rol. La autorización definitiva corresponde al backend; ocultar rutas o botones en el navegador no protege endpoints.

## 2. Tecnologías observadas

- **React 18:** componentes, páginas y estado interactivo.
- **TypeScript:** tipado y comprobación en build; no convierte el backend JavaScript a TypeScript.
- **Vite 6 en `front/`:** servidor de desarrollo y empaquetado.
- **React Router DOM:** navegación SPA y composición de rutas.
- **Axios:** cliente API común en `src/services/api.ts`.
- **CSS propio:** estilos globales/responsivos en `src/index.css`.
- **React Icons:** iconos puntuales en algunas páginas.

Para versiones, responsabilidades, motivos y discrepancias con el resto del repositorio, consultar [`TECNOLOGIAS_RESPONSABILIDADES_Y_MOTIVOS.md`](../back/TECNOLOGIAS_RESPONSABILIDADES_Y_MOTIVOS.md).

## 3. Mapa de carpetas

```text
front/src/
├── components/   # Navbar, rutas protegidas, listas, formularios y mensajes
├── context/      # estado de autenticación
├── layouts/      # estructura común de páginas
├── pages/        # login, registro, paneles, citas, mascotas, disponibilidad
├── routes/       # tabla de rutas SPA
├── services/     # cliente HTTP/API
├── utils/        # validación de entradas y errores
└── index.css     # estilos globales
```

Los archivos presentes pueden no estar todos expuestos por el router: para saber qué vista es accesible, verificar `src/routes/AppRoutes.tsx`.

## 4. Flujo de comunicación

1. `src/main.tsx` monta React y los proveedores globales.
2. `src/routes/AppRoutes.tsx` relaciona URL y página; `PrivateRoute`/`RoleRoute` controlan navegación en cliente.
3. Las páginas y componentes llaman al cliente central de `src/services/api.ts`.
4. Axios usa `VITE_API_URL` y agrega el token Bearer local cuando está disponible.
5. En Docker, Nginx entrega los archivos compilados y hace proxy de `/api`, `/health` y `/api-docs` hacia el backend.

El token guardado en el navegador no debe considerarse una autorización suficiente. Toda operación y permiso debe volver a verificarse en la API.

## 5. Desarrollo y comandos

Desde la raíz:

```bash
cd front
npm ci
npm run dev
```

Comprobaciones/build:

```bash
npm run type-check
npm run build
npm run preview
```

El script `npm run lint` invoca `eslint .`, pero ESLint no aparece declarado como dependencia del frontend en el `package.json` revisado. Verificar/instalar y configurar ese binario antes de depender de lint.

La API local por defecto es `http://localhost:3000/api`. Para cambiarla, usar una variable de build como `VITE_API_URL=http://localhost:3000/api` en el entorno del frontend. Dentro de Docker se usa normalmente el proxy de Nginx (`/api`). Ver [`../arranque.md`](../arranque.md) para levantar la aplicación completa.

## 6. Validaciones y experiencia de formulario

- En registro y gestión de personal, el teléfono se restringe a dígitos.
- Correo y contraseñas bloquean/eliminan espacios en los formularios correspondientes.
- Los mensajes de validación se presentan individualmente en columna; el backend repite la validación para no depender del navegador.
- El componente `ListaErrores` aplica semántica de alerta y los campos inválidos se marcan visualmente.

La evidencia de cambios y pruebas manuales anteriores está en [`BITACORA_VALIDACION_FORMULARIOS.md`](../back/BITACORA_VALIDACION_FORMULARIOS.md).

## 7. Estado de pruebas del frontend

En la revisión del proyecto no se encontró una suite de pruebas automatizadas de componentes/frontend ni E2E de navegador. `npm run type-check` y `npm run build` verifican tipos/compilación, no sustituyen pruebas funcionales, de usabilidad, compatibilidad o aceptación.

El [Plan Maestro de Pruebas](../test/PLAN_MAESTRO_DE_PRUEBAS.md) registra la brecha y propone casos para formularios, rutas por rol, proxy y flujos completos. No se presenta una herramienta futura como ya seleccionada.

## 8. Documentos relacionados

- [Guía de arranque](../arranque.md).
- [Índice y guía de pruebas](../test/README.md).
- [Catálogo general de tecnologías](../back/TECNOLOGIAS_RESPONSABILIDADES_Y_MOTIVOS.md).
- [Documento maestro de reglas y arquitectura](../back/ARQUITECTURA_REGLAS_Y_DECISIONES_TECNICAS.md).
