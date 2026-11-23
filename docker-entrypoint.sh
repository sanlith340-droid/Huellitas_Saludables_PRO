#!/bin/sh
set -eu

log_info() {
  if [ "${NODE_ENV:-development}" != "production" ]; then
    printf '[backend] %s\n' "$1"
  fi
}

log_error() {
  printf '[backend] ERROR: %s\n' "$1" >&2
}

log_info "Comprobando conexión con PostgreSQL..."

# Esperar la conexión utilizando DATABASE_URL o las variables DB_*.
ATTEMPT=0
MAX_ATTEMPTS="${DB_CONNECT_ATTEMPTS:-30}"

until node --input-type=module - <<'NODE'
import pg from 'pg';
const { Client } = pg;

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
    log_error "No fue posible conectar con PostgreSQL; revisa la configuración de base de datos."
    exit 1
  fi

  log_info "PostgreSQL aún no está disponible. Intento $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 2
done

log_info "Conexión con PostgreSQL establecida."
log_info "Ejecutando migraciones Prisma..."
if [ "${NODE_ENV:-development}" = "production" ]; then
  if ! npm run migrate --silent >/dev/null 2>&1; then
    log_error "Falló la migración de base de datos."
    exit 1
  fi
else
  npm run migrate
fi

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" != "production" ]; then
  log_info "Comprobando si existen usuarios..."

  USER_COUNT=$(node --input-type=module - <<'NODE'
import pg from 'pg';
const { Client } = pg;

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
    const result = await client.query('SELECT COUNT(*)::int AS count FROM "usuario"');
    process.stdout.write(String(result.rows[0].count));
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(() => process.exit(1));
NODE
  )

  if [ "$USER_COUNT" = "0" ]; then
    log_info "No hay usuarios. Ejecutando la semilla Prisma..."
    npm run seed
  else
    log_info "Semilla omitida: ya existen usuarios."
  fi
fi

if [ "${DB_SEED:-false}" = "true" ] && [ "${NODE_ENV:-production}" = "production" ]; then
  log_info "Semilla omitida en producción."
fi

exec "$@"
