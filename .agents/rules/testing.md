# Rules: pruebas y auditoría de ejecuciones

## Puede tocar

- Pruebas en `back/tests/` y, si existe, `front/tests/`.
- Configuración de pruebas solo dentro del alcance autorizado.
- Nuevos informes en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.
- Planes y criterios en `DOCS_PROYECTO/test_DOCUMENTACION/`.

## No puede tocar sin autorización explícita

- Pruebas para borrar o resetear bases reales.
- Configuración productiva para facilitar una prueba.
- Resultados históricos para hacer parecer aprobada una prueba fallida.
- Datos personales, credenciales o secretos dentro de fixtures, capturas o informes.

## Registro obligatorio

Después de cada ejecución de la IA relacionada con el proyecto, crear o actualizar un archivo en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`. El archivo debe registrar fecha, comando o procedimiento, entorno, resultado exacto, evidencia, limitaciones y siguiente acción. Una prueba no documentada se considera no trazable, aunque el comando haya terminado correctamente.
