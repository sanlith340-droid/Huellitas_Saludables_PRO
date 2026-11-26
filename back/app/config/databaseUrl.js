
function buildDatabaseUrl(env = process.env) {
  const configuredUrl = env.NODE_ENV === 'test' ? '' : env.DATABASE_URL?.trim();
  if (configuredUrl) return configuredUrl;

  // En producción no se aceptan credenciales de BD por defecto.
  if (env.NODE_ENV === 'production' && !env.DB_PASSWORD) {
    throw new Error('Falta DATABASE_URL o DB_PASSWORD: en producción no hay credenciales de base de datos por defecto.');
  }

  const database = env.NODE_ENV === 'test'
    ? (env.DB_NAME_TEST || `${env.DB_NAME || 'proyectohs'}_test`)
    : (env.DB_NAME || 'proyectohs');
  const user = env.DB_USER || 'postgres';
  const password = env.DB_PASSWORD || 'postgres';
  const host = env.DB_HOST || 'localhost';
  const port = Number(env.DB_PORT) || 5432;
  const hostname = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
  const credentials = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  const query = new URLSearchParams({ schema: env.DB_SCHEMA || 'public' }).toString();

  return `postgresql://${credentials}@${hostname}:${port}/${encodeURIComponent(database)}?${query}`;
}

function getTestDatabaseConfig(env = process.env) {
  return {
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT) || 5432,
    database: env.DB_NAME_TEST || `${env.DB_NAME || 'proyectohs'}_test`,
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || 'postgres',
  };
}

export { buildDatabaseUrl, getTestDatabaseConfig };
export default { buildDatabaseUrl, getTestDatabaseConfig };
