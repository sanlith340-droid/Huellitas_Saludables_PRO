#!/bin/sh
set -eu

echo "[backend] Comprobando conexión con PostgreSQL..."

# Esperar la conexión utilizando DATABASE_URL o las variables DB_*.
ATTEMPT=0
MAX_ATTEMPTS="${DB_CONNECT_ATTEMPTS:-30}"

until node - <<'NODE'
const { Client } = require('pg');

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'proyectohs',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const client = new Client({
  ...config,
  connectionTimeoutMillis: 2000,
});

client.connect()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch(async () => {
    try {
      await client.end();
    } catch (_) {}
    process.exit(1);
  });
NODE
do
  ATTEMPT=$((ATTEMPT + 1))

  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "[backend] ERROR: No fue posible conectar con PostgreSQL."
    echo "[backend] Verifica la configuración de la base de datos."
    exit 1
  fi

  echo "[backend] PostgreSQL aún no está disponible. Intento $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 2
done

echo "[backend] Conexión con PostgreSQL establecida."
echo "[backend] Ejecutando migraciones..."
npx sequelize-cli db:migrate

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" != "production" ]; then
  echo "[backend] Comprobando si existen usuarios..."

  USER_COUNT=$(node - <<'NODE'
const { Client } = require('pg');

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'proyectohs',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const client = new Client(config);

async function main() {
  try {
    await client.connect();
    const result = await client.query(
      'SELECT COUNT(*)::int AS count FROM "usuario"'
    );
    process.stdout.write(String(result.rows[0].count));
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(() => process.exit(1));
NODE
  )

  if [ "$USER_COUNT" = "0" ]; then
    echo "[backend] No hay usuarios. Ejecutando seeders..."
    npx sequelize-cli db:seed:all
  else
    echo "[backend] Seeders omitidos: ya existen usuarios."
  fi
fi

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" = "production" ]; then
  echo "[backend] Seeders omitidos en producción."
fi

exec "$@"
