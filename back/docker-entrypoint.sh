#!/bin/sh
set -eu

echo "[backend] Esperando a PostgreSQL en ${DB_HOST:-db}:${DB_PORT:-5432}..."
until node - <<'NODE'
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'proyectohs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 2000,
});
client.connect().then(() => client.end()).then(() => process.exit(0)).catch(() => process.exit(1));
NODE
do
  sleep 2
done

echo "[backend] Ejecutando migraciones..."
npx sequelize-cli db:migrate

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" != "production" ]; then
  USER_COUNT=$(node - <<'NODE'
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'proyectohs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
client.connect()
  .then(() => client.query('SELECT COUNT(*)::int AS count FROM "usuario"'))
  .then(result => process.stdout.write(String(result.rows[0].count)))
  .then(() => client.end())
  .catch(() => process.stdout.write('1'))
  .finally(() => process.exit(0));
NODE
)
  if [ "$USER_COUNT" = "0" ]; then
    echo "[backend] Ejecutando seeders..."
    npx sequelize-cli db:seed:all
  else
    echo "[backend] Seeders omitidos: ya existen usuarios."
  fi
fi

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" = "production" ]; then
  echo "[backend] Seeders omitidos: DB_SEED no está permitido en producción."
fi

exec "$@"
