# Pantalla de historia clínica del propietario

## Flujo

1. El propietario entra a `/mascotas`.
2. La API devuelve exclusivamente sus mascotas; el frontend ya no hace un filtro de seguridad local.
3. El propietario selecciona una mascota.
4. `HistoriaClinicaMascota` consulta `GET /api/historia/mascota/:id_mascota`.
5. El propietario selecciona el año y el mes disponibles.
6. La pantalla muestra únicamente las historias cuya fecha de atención corresponde al periodo seleccionado, en modo solo lectura y sin botones de crear, editar o eliminar.

## Estados de interfaz

- **Carga:** esqueleto y mensaje de consulta.
- **Error:** mensaje seguro, variante contextual y botón de reintento.
- **Vacío:** informa que la mascota aún no tiene historias.
- **Éxito:** registros ordenados por la API con diagnóstico, tratamiento, peso, especialista, motivo y observaciones.
- **Selección:** la mascota activa queda resaltada y puede cerrarse la consulta.
- **Filtro temporal:** los selectores de año y mes se construyen con los periodos que tienen historias; al cambiar el año se actualizan los meses disponibles y se muestra el número de historias del periodo.
- **Periodo sin resultados:** mensaje para seleccionar otro año o mes.

## Seguridad

La pantalla no decide quién puede consultar. El backend valida el JWT, comprueba la relación `usuarioMascota` y responde `404` genérico para una mascota ajena. Esto evita depender de filtros visuales o de datos manipulables en el navegador.

## Archivos

- `front/src/components/ListaMascotas.tsx`
- `front/src/components/HistoriaClinicaMascota.tsx`
- `front/src/styles/historia-clinica.css`
- `back/app/routes/historia.routes.js`
- `back/app/services/historia.service.js`
