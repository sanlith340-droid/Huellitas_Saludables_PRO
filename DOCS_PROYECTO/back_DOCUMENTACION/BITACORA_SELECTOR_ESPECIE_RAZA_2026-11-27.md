# Bitácora — Selector de especie y razas de mascotas

**Proyecto:** Huellitas Saludables — React/TypeScript, Express, Prisma y PostgreSQL  
**Fecha:** 27/11/2026 (UTC−05)  
**Autorización:** alcance autorizado explícitamente por el usuario.

## Objetivo

Actualizar el registro de mascotas para presentar **Caninos** y **Felinos**, consultar razas por especie mediante API Ninjas desde el servidor y permitir una raza personalizada con **Otros**, manteniendo el diseño y las funciones ajenas al cambio.

## Decisiones y comportamiento implementado

La interfaz muestra Caninos/Felinos, pero los valores persistidos siguen siendo `perro`/`gato`. El backend consulta `https://api.api-ninjas.com/v1/alldogs` o `https://api.api-ninjas.com/v1/allcats` con `API_NINJAS_KEY` solo en el servidor, enviada como `X-Api-Key`. La variable es opcional; no se añadió una clave real ni se declara en el frontend. El servicio tiene timeout y caché y, si falta la clave, falla el proveedor o el catálogo no es válido, responde con razas locales.

Los catálogos eliminan duplicados sin distinguir mayúsculas o acentos y se ordenan alfabéticamente. El frontend normaliza de nuevo como protección y aplica el respaldo local si la ruta falla. **Otros** aparece después de las razas, abre el campo «Especifica la raza de tu mascota» y el envío guarda el nombre indicado. Cambiar de especie limpia la raza seleccionada y el texto personalizado. El alta acepta `raza_nombre` y mantiene compatibilidad con `id_raza`; no hubo cambios de esquema ni migraciones. Se conserva el vaciado del formulario tras un alta exitosa.

Las etiquetas se actualizaron también en las fichas y el panel. En la revisión final, Swagger se ajustó para documentar JWT Bearer en `GET/POST /api/mascotas`, eliminando parámetros obsoletos `x-user-id`/`x-user-role`; las guías de arranque y el README raíz se corrigieron para explicar la presencia de `back/.env.example` y la ubicación segura de `API_NINJAS_KEY`. No se modificó Render ni se añadieron dependencias.

## Archivos funcionales y documentales

Frontend: `front/src/components/FormularioMascota.tsx`, `front/src/utils/especies.ts`, `front/src/components/ListaMascotas.tsx` y `front/src/pages/Dashboard.tsx`.

Backend: `back/app/services/raza.service.js`, `back/app/routes/raza.routes.js`, `back/app/controllers/raza.controller.js`, `back/app/models/raza.model.js`, `back/app/schemas/mascota.schema.js`, `back/app/services/mascota.service.js` y `back/app/config/swagger.js`.

Pruebas: `back/tests/unit/services/raza.service.test.js` y `back/tests/integration/mascotas.test.js`. Configuración/documentación: `docker-compose.yml`, `back/.env.example`, `back/Readme.md`, `Readme.md`, `DOCS_PROYECTO/arranque.md`, `DOCS_PROYECTO/back_DOCUMENTACION/API.md` y `DOCS_PROYECTO/front_DOCUMENTACION/README.md`.

## Verificación y límites

La [auditoría del 27/11/2026](../auditorias_de_cambios_y_pruebas/AUDITORIA_2026-11-27_SELECTOR_ESPECIE_RAZA.md) registra los comandos y resultados completos. Build y lint frontend aprobados; lint backend con 0 errores y 4 advertencias; `prisma validate` y comprobaciones de sintaxis aprobadas; prueba unitaria aislada del servicio **5/5**. La verificación de Swagger confirmó Bearer JWT y `raza_nombre`. No se ejecutó la suite de integración porque no había PostgreSQL escuchando localmente; tampoco se llamó al proveedor en vivo porque no se entregó una clave.

No se añadió infraestructura de tests de componentes frontend: el proyecto no declara un runner frontend, por lo que el reinicio de especie, la selección **Otros**, el reintento del fallback y el borrado tras éxito quedan sin pruebas automatizadas de componente. No se añadieron dependencias para ampliar ese alcance.

## Pendiente operativo

Para consultar las listas en vivo, quien administra el backend debe configurar `API_NINJAS_KEY` como secreto del entorno servidor. No usar una variable `VITE_*` ni introducir la clave en el bundle del navegador. La aplicación puede registrar mascotas con catálogos de respaldo sin esa clave. Una futura prueba integrada debe usar y confirmar una base `_test` desechable antes de ejecutar la suite.
