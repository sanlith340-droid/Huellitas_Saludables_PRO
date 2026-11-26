# D3 — Implantación y despliegue

**Criterios asociados:** 7, 8 y 9. **Estado global:** 🔴/🟡 Parcial; el criterio 7 no está demostrado.

## Evidencia organizada

- `MANUAL_TECNICO_HS_actualizado.docx/.pdf` y `MANUAL_USUARIO_HS_actualizado.docx/.pdf`: manuales revisados; se actualizaron capturas de interfaz con la versión local actual y se corrigieron afirmaciones verificables sobre pruebas, permisos, notificaciones, lint y dependencias. Se conservaron plantilla, logotipo, diagramas y estilo.
- `EVIDENCIA_CAPTURAS_ACTUAL/`: 18 capturas de pantallas por rol, con procedencia documentada y `SHA256SUMS.txt`. Se usaron cuentas y datos sintéticos de la semilla; no se enviaron formularios ni se cambiaron estados.
- `GUIA_DESPLIEGUE_Y_AMBIENTES.md`: instrucciones y alternativas de despliegue; son una guía, no un despliegue efectuado.
- `ESTRATEGIA_BACKUPS_Y_MIGRACION.md`: política y procedimiento documentados. El ensayo local citado allí pertenece a un reporte anterior y **no se reejecutó en esta revisión**.

## Qué falta para el cumplimiento total

1. **Criterio 7:** desplegar en un ambiente externo accesible; aportar URL comprobada, configuración separada por ambiente, variables/secretos reales y verificación de salud/flujo. No hay URL pública verificada. Docker no estuvo disponible en este pase.
2. **Criterio 8:** ejecutar la instalación desde un entorno limpio siguiendo el manual técnico, confirmar versiones/variables y revisar cada paso con el responsable. Las capturas acreditan pantallas locales, no instalación productiva.
3. **Criterio 9:** ejecutar un backup y una restauración en una base aislada y conservar salida, conteos y hash; después repetir o demostrar el mecanismo configurado para el entorno desplegado. No se verificó una programación activa de respaldos.

## Alcance y límites

Las capturas son reales de la interfaz local visible, pero el entorno fue local, temporal y con datos sintéticos. No acreditan despliegue, correo/SMS/push, operación productiva, respaldo/restauración ni aceptación. El diagrama/árbol de código heredado con la etiqueta «Sequelize» en el manual técnico queda señalado como histórico y no como descripción del stack actual.
