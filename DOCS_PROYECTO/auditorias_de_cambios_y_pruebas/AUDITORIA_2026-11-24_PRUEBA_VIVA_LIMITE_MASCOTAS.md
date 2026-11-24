# Auditoría de prueba viva — límite de mascotas

**Fecha:** 24 de noviembre de 2026 (UTC-05)  
**Proyecto:** `Huellitas_Saludables_PRO`  
**Cuenta demo:** `pedro.gonzalez@gmail.com`  
**Entorno:** PostgreSQL 16 local, backend Express en `3000`, frontend Vite en `5173`.

## Objetivo

Comprobar en ejecución real que un usuario con cinco mascotas no puede registrar una sexta y que el frontend presenta simultáneamente el mensaje de límite y una imagen relacionada.

## Procedimiento ejecutado

1. Se levantó PostgreSQL y se verificó el endpoint de salud del backend (`200 OK`).
2. Se inició sesión mediante la interfaz web con la cuenta demo.
3. Se verificó el panel con cinco mascotas: Max, Luna, Canela, Prueba Live 4 y Prueba Live 5.
4. Se abrió `/mascotas/nueva` desde el frontend.
5. Se diligenció el formulario de una sexta mascota y se pulsó `Registrar mascota`.
6. El backend respondió `HTTP 409` con el código `MASCOTAS_LIMITE_ALCANZADO`.

## Resultado visual observado

La vista permaneció en `/mascotas/nueva` y mostró:

- Imagen `vacio-mascotas.webp`, con el texto alternativo `Perrito junto a un plato de comida vacío y un collar esperando a su mascota`.
- Título visible: **`Ya tienes 5 mascotas registradas`**.
- Descripción: `Alcanzaste el límite de mascotas por usuario. Puedes consultar y administrar tus fichas actuales desde el listado.`
- Recomendaciones de administración.
- Enlace visible **`Ver mis mascotas`** hacia `/mascotas`.

## Evidencia técnica

- Respuesta API observada: `{"success":false,"message":"Has alcanzado el límite de 5 mascotas por usuario.","code":"MASCOTAS_LIMITE_ALCANZADO"}`.
- DOM del frontend observado: imagen `/src/assets/feedback/vacio-mascotas.webp`, título y enlace esperados.
- Captura generada durante la comprobación: `/home/ubuntu/screenshots/5173-ip8bxo5ji98zpoy_2026-11-24_02-24-33_8937.webp`.

## Conclusión

**APROBADO.** El límite funciona en backend y la vista de límite aparece correctamente en el frontend con el mensaje requerido, la imagen relacionada y el enlace de navegación.
