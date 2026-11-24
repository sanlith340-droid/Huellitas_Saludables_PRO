# Plan y resultado de pruebas: historia clínica especialista-propietario

## Casos cubiertos

- Especialista asignado crea una historia desde una cita y el trigger conserva el estado atendido.
- Especialista asignado actualiza una historia.
- Otro especialista no puede modificar ni consultar historias fuera de su ámbito.
- Usuario propietario consulta historias de su mascota.
- Usuario propietario recibe `404` genérico al consultar una mascota ajena.
- Admin y otros roles no acceden a la consulta de propietario.
- Usuario no puede crear ni editar historias.
- Diagnóstico/tratamiento solo con espacios son rechazados.
- Se conservan límites de diagnóstico 200, tratamiento 200, observaciones 500 y peso positivo hasta 999.99.
- `GET /api/mascotas` no expone mascotas ajenas ni asociaciones de copropietarios al usuario autenticado.
- La compilación frontend valida tipos, imports, componentes y estilos.

## Ejecución realizada

```bash
cd back && npm test
cd front && npm run build
```

Resultado: 388 pruebas aprobadas en 29 archivos; build frontend exitoso.

## Pendientes

No se ejecutó una prueba visual mediante navegador real en esta sesión. Se recomienda durante la sustentación validar manualmente el flujo con dos cuentas: propietario de Max y propietario de Rocky, confirmando que cada una solo observa sus propias mascotas e historias.
