# Cierre T4 — pendientes antes de la sustentación

Esta lista distingue evidencia documental, comprobaciones locales y trabajo que aún debe realizar el equipo. No es un acta de aceptación ni una declaración de cumplimiento total.

| # | Dimensión/criterio | Estado actual | Acción pendiente para cerrar evidencia |
|--:|---|---|---|
| 1 | D1 — Backlog y retrospectiva | 🟡 Borrador con cálculo provisional de 15,5/17 = 91,2 % sobre 17 tarjetas | Confirmar tablero/denominador, justificar estados y pedir validación personal a todo el equipo |
| 2 | D1 — Implantación | 🟡 Plan prospectivo | Confirmar responsables, fechas y criterios de éxito; anexar resultados de implantación ejecutada |
| 3 | D2 — Integración | 🟡 API/BD/frontend probados localmente; `/health` 200 y suite backend 410/410 | Demostrar flujo completo en el ambiente que se presentará y revisar errores críticos |
| 4 | D2 — Errores e integridad | 🟡 Pruebas y esquema existentes, sin demostración exhaustiva | Ejecutar casos válidos/ inválidos, integridad referencial, concurrencia y registrar resultados |
| 5 | D2 — Roles/permisos | 🟡 Código con controles por rol/propietario y pruebas de integración | Validar en staging permisos de lectura/escritura, recursos ajenos y comportamiento UI/API |
| 6 | D2* — IoT/móvil | ➖ No hay evidencia | Confirmar con equipo/jurado si el criterio es formalmente no aplicable |
| 7 | D3 — Despliegue/ambientes | 🟡 Render verificado con frontend, API, PostgreSQL, CORS, `/health`, login y Swagger | Formalizar separación de ambientes, revisar retención/caducidad de la BD y conservar evidencia; no confundirlo con Docker Compose |
| 8 | D3 — Manuales | 🟡 DOCX/PDF actualizados con capturas locales | Probar instalación desde entorno limpio y confirmar la URL que recibirá el usuario final |
| 9 | D3 — Backups/migración | 🟡 Política; reporte de ensayo anterior no reejecutado en este pase | Hacer backup, validar archivo y restaurar en BD aislada; repetir o demostrar la configuración de producción |
| 10 | D4 — Plan/métricas | 🟡 Plan y lint configurados; lint ejecutado localmente | Ejecutar CI remoto, calcular cobertura actual y resolver/justificar 8 vulnerabilidades (4 moderadas, 4 altas) |
| 11 | D4 — Informe de calidad | 🟡 410/410 backend; build y lint; sin E2E/coverage actuales | Ejecutar casos manuales/E2E priorizados, registrar defectos y obtener revisión/aceptación formal |
| 12 | D5 — Equipo/reflexión | 🟡 Guion disponible; reflexiones vacías y ensayo no demostrado | Cada integrante redacta su propia reflexión y ensaya explicación completa; registrar fecha y asistentes |

## Antes de entregar

- Revisar cada README D1–D5; acordar con el jurado qué evidencias son suficientes y confirmar formalmente el ítem 6 si no aplica.
- No completar reflexiones personales, resultados de ensayos, aceptación ni ejecución de despliegue/backup sin que hayan ocurrido.
- No presentar `D2_ARTEFACTOS_TECNICOS/Proyecto Final [Nombre proyecto aqui] - ADSO.zip`, `D4_DOCUMENTACION_Y_CALIDAD/ejemplo-plan-de-pruebas.pdf` ni `D5_EQUIPO_Y_PROCESO/REVISION PENDIENTE.zip` como evidencia de Huellitas Saludables.
- El archivo `Acta_Aceptacion_Final` sigue vacío/sin firmas. La decisión y calificación del jurado permanecen pendientes.

## Reproducción de verificaciones locales

Ejecutar desde la raíz del repositorio. Estos comandos son instrucciones de reproducción, no ejecuciones de esta actualización documental:

```bash
cd back && npm test                 # Resultado documentado: 410/410 en 31 archivos
cd ../front && npm run lint          # Resultado documentado: 0 errores / 0 advertencias
cd ../back && npm run lint           # Resultado documentado: 0 errores / 4 advertencias
cd ../front && npm run build         # Resultado documentado: compilación exitosa
```

La suite requiere PostgreSQL y usa/elimina/recrea la BD que indique `DB_NAME_TEST`; debe terminar en `_test` y ser distinta de cualquier base que se quiera conservar. El build/lint y las pruebas locales no demuestran despliegue, aceptación ni seguridad completa. En la revisión vigente se registraron seis migraciones locales. El despliegue público de Render se verificó el 26/11/2026; siguen sin verificarse E2E/de carga, CI remoto, cobertura actual, backup/restore actual y aceptación.
