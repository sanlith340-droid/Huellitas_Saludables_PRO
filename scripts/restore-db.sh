#!/usr/bin/env bash
# Restaura un respaldo creado con backup-db.sh.
# Uso:   ./scripts/restore-db.sh archivo.dump [nombre_bd_destino]
# ADVERTENCIA: borra y recrea los objetos de la BD destino. Para ensayar usa una BD
# distinta (p. ej. proyectohs_restore), nunca la de producción.
set -euo pipefail

ARCHIVO="${1:?Indica el archivo .dump}"
DESTINO="${2:-${DB_NAME:-proyectohs}_restore}"
: "${DB_PASSWORD:?Define DB_PASSWORD}"
export PGPASSWORD="$DB_PASSWORD"
H="${DB_HOST:-localhost}"; P="${DB_PORT:-5432}"; U="${DB_USER:-postgres}"

[ -f "$ARCHIVO.sha256" ] && sha256sum -c "$ARCHIVO.sha256"

psql -h "$H" -p "$P" -U "$U" -d postgres -c "DROP DATABASE IF EXISTS \"$DESTINO\"" -c "CREATE DATABASE \"$DESTINO\""
pg_restore --no-owner --no-acl -h "$H" -p "$P" -U "$U" -d "$DESTINO" "$ARCHIVO"

echo "Conteos de verificación en $DESTINO:"
psql -h "$H" -p "$P" -U "$U" -d "$DESTINO" -At -c \
  "SELECT 'usuario', count(*) FROM usuario UNION ALL SELECT 'mascota', count(*) FROM mascota UNION ALL SELECT 'cita', count(*) FROM cita UNION ALL SELECT 'historia_clinica', count(*) FROM historia_clinica"
echo "OK: restauración completada en $DESTINO"
