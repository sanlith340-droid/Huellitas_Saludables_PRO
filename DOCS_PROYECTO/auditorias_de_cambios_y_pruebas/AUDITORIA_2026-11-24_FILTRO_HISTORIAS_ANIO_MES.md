# Auditoría — filtro de historias clínicas por año y mes

**Fecha:** 24 de noviembre de 2026 (UTC-05)  
**Proyecto:** `Huellitas_Saludables_PRO`  
**Alcance:** consulta de historias clínicas del propietario.

## Implementación

Se actualizó `front/src/components/HistoriaClinicaMascota.tsx` para que el propietario pueda seleccionar un año y un mes a partir de los periodos con historias disponibles. La selección del año actualiza los meses disponibles y la lista muestra únicamente las historias cuya fecha de atención corresponde al periodo elegido. Se agregó un mensaje cuando el periodo no tiene resultados y estilos responsive en `front/src/styles/historia-clinica.css`.

La pantalla conserva el modo de solo lectura y la autorización backend existente. No se agregaron controles de creación o edición para el propietario.

## Validación automatizada

- `npm run build` en `front`: **compilación TypeScript/Vite exitosa**.

## Prueba viva

1. Se abrió `/mascotas` con la cuenta demo del propietario.
2. Se seleccionó la mascota **Max**.
3. El formulario mostró los selectores **Año** y **Mes**, con `2026`, `Noviembre` y `Agosto` disponibles.
4. Con `2026 / Noviembre`, la interfaz mostró solo la atención del `27/11/2026`.
5. Se cambió el mes a `Agosto` y la interfaz mostró solo la atención del `19/8/2026`.

## Resultado

**APROBADO.** El propietario puede elegir año y mes y consultar únicamente las historias del periodo seleccionado. La protección de acceso y el modo de solo lectura permanecen activos.

**Evidencia:** `/home/ubuntu/screenshots/5173-ip8bxo5ji98zpoyvfht15-b1075cec.us3.manus.computer_2026-11-24_02-35-54_2171.webp`.
