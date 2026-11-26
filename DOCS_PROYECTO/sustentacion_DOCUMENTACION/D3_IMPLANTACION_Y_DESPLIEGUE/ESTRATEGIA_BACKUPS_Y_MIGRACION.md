# Estrategia de copias de seguridad y migración de datos

**Versión:** 1.1 · 25/11/2026 (UTC−05:00) · **Responsables propuestos:** confirmar con el equipo; los nombres indicados en versiones anteriores no equivalen a aceptación formal.

## 1. Alcance

La estrategia propone respaldar la base PostgreSQL del sistema: usuarios, mascotas, citas, disponibilidad, historias clínicas, notificaciones y tokens. El código fuente se conserva por el mecanismo de control de versiones que el equipo confirme. Los respaldos pueden contener datos personales y requieren acceso restringido.

## 2. Política propuesta (no se comprobó una programación activa)

| Aspecto | Propuesta |
|---|---|
| Tipo | `pg_dump --format=custom`, restaurable con `pg_restore` |
| Frecuencia | Diario y antes de cada migración/despliegue |
| Retención | 14 días locales y copia semanal externa durante cuatro semanas |
| Ubicación | Directorio fuera del contenedor y copia en almacenamiento separado de la BD |
| Integridad | `pg_restore --list` y SHA-256 por artefacto |
| Objetivos | RPO ≤ 24 h y RTO ≤ 2 h; son objetivos propuestos, no medidos |
| Protección | Cifrado, acceso restringido y gestión de credenciales fuera de los archivos entregables |
| Prueba de restauración | Mensual y tras cambio de esquema en una BD distinta `*_restore` |

## 3. Procedimiento documentado

Los comandos siguientes se plantean desde la raíz del repositorio, donde están `scripts/`, `back/` y `front/`; describen un procedimiento, no una ejecución actual:

```bash
./scripts/backup-db.sh ./backups
./scripts/restore-db.sh ./backups/huellitas_YYYYMMDD_HHMMSS.dump
```

Antes de una restauración real, detener escrituras, usar el respaldo correcto, comprobar migraciones, validar `/health` y login, registrar responsables/tiempos y conservar evidencia. En producción, la política debe alinearse con el proveedor y la normativa de datos aplicable.

## 4. Antecedente de ensayo local y límites actuales

Una versión documental anterior reportó backup/restore local con PostgreSQL 16 y conteos: `usuario` 17/17, `mascota` 30/30, `cita` 36/36 e `historia_clinica` 30/30. **Ese ensayo no se reejecutó ni se inspeccionó como parte de la verificación actual** y no demuestra respaldos programados ni restauración del ambiente desplegado. Para la sustentación, presentarlo solo como antecedente documentado y no como resultado actual; repetirlo y adjuntar logs si se necesita acreditarlo.

## 5. Migración

El código actual versiona migraciones en `back/prisma/migrations/`. En la revisión local del 25/11 se aplicaron seis migraciones a la base demo sintética. Esto no prueba su aplicación en producción ni el rollback. Las migraciones deben aplicarse con respaldo previo; para revertir, la propuesta es restaurar el respaldo anterior, ya que no se verificó una migración `down`.

## 6. Pendientes para completar D3.9

Ejecutar backup, verificar formato/sha256, restaurar en una base separada, comparar conteos y guardar salida; definir responsable/retención/ubicación cifrada; confirmar una programación real; repetir la prueba en el entorno desplegado cuando exista. Hasta entonces, esta carpeta contiene una estrategia y un reporte antecedente, no una operación de continuidad demostrada.
