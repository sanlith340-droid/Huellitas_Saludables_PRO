#!/usr/bin/env bash
# Copia de seguridad lógica de PostgreSQL (pg_dump formato custom, comprimido).
# Uso:   ./scripts/backup-db.sh [directorio_destino]
# Lee DATABASE_URL, o DB_HOST/DB_PORT/DB_USER/DB_NAME/DB_PASSWORD, del entorno.
# Retención: conserva los últimos RETENCION_DIAS días (por defecto 14).
# Con Docker Compose:  docker compose exec -T db pg_dump -U "$DB_USER" -Fc "$DB_NAME" > respaldo.dump
set -euo pipefail

DESTINO="${1:-./backups}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
FECHA="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DESTINO"
ARCHIVO="$DESTINO/huellitas_${FECHA}.dump"

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump --format=custom --no-owner --no-acl --dbname="$DATABASE_URL" --file="$ARCHIVO"
else
  : "${DB_PASSWORD:?Define DB_PASSWORD}"
  PGPASSWORD="$DB_PASSWORD" pg_dump --format=custom --no-owner --no-acl \
    --host="${DB_HOST:-localhost}" --port="${DB_PORT:-5432}" \
    --username="${DB_USER:-postgres}" --dbname="${DB_NAME:-proyectohs}" --file="$ARCHIVO"
fi

# Verificación de integridad: el archivo debe poder listarse
pg_restore --list "$ARCHIVO" > /dev/null
sha256sum "$ARCHIVO" > "$ARCHIVO.sha256"

# Retención
find "$DESTINO" -name 'huellitas_*.dump*' -mtime +"$RETENCION_DIAS" -delete

echo "OK: respaldo creado y verificado -> $ARCHIVO"
