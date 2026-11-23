# Rules: documentación, auditoría y bitácoras

## Ubicación obligatoria de las pruebas de la IA

Toda prueba, ejecución o verificación que la IA realice al levantar, correr, compilar, migrar, consultar o probar el proyecto debe quedar registrada en:

```text
DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/
```

Esto incluye, entre otros casos:

- `npm test`.
- `npm run build`.
- `npm start`, `npm run dev` o `docker compose up`.
- Pruebas manuales con navegador o API.
- Verificación de endpoints.
- Aplicación o comprobación de migraciones.
- Comprobación de Docker, PostgreSQL, SMTP o integraciones.
- Comparación de archivos o validación de estructura cuando se use para aceptar un cambio.

La auditoría debe indicar fecha, responsable o modelo, objetivo, comando o procedimiento, entorno, resultado, evidencia, limitaciones y archivos modificados. Nunca debe incluir secretos, tokens, contraseñas ni datos personales.

## Qué puede modificar un modelo

Puede modificar `AGENTS.md`, `.agents/`, `DOCS_PROYECTO/` y los archivos funcionales incluidos expresamente en una solicitud autorizada. Puede crear una nueva auditoría en `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/` después de ejecutar una prueba.

## Qué no puede modificar sin autorización

No puede alterar bitácoras históricas para ocultar resultados, borrar auditorías, eliminar evidencias, cambiar resultados ya registrados ni reemplazar documentación técnica por afirmaciones no verificadas. Las correcciones de errores documentales deben conservar la trazabilidad y registrarse.

## Ubicación según el tipo de documentación

- Arquitectura, API y decisiones backend: `DOCS_PROYECTO/back_DOCUMENTACION/`.
- Pantallas y navegación: `DOCS_PROYECTO/front_DOCUMENTACION/`.
- Planes y resultados generales de QA: `DOCS_PROYECTO/test_DOCUMENTACION/`.
- Auditoría de toda ejecución realizada por IA: `DOCS_PROYECTO/auditorias_de_cambios_y_pruebas/`.
- Cambios históricos: una `BITACORA_*.md` en la carpeta adecuada.
- Reglas para agentes: `.agents/` y una bitácora de decisión.

La auditoría de ejecución es obligatoria aunque también se actualice la documentación funcional o la bitácora.
