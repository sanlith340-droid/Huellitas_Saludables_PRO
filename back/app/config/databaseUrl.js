'use strict';

function decodificar(valor) {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl || typeof databaseUrl !== 'string') {
    return null;
  }

  const valor = databaseUrl.trim();
  if (!valor) {
    return null;
  }

  const parsed = new URL(valor);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new TypeError('DATABASE_URL debe usar postgres:// o postgresql://');
  }

  const sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
  const sslParam = (parsed.searchParams.get('ssl') || '').toLowerCase();

  let ssl;
  if (sslMode === 'disable' || sslParam === 'false' || sslParam === '0') {
    ssl = false;
  } else if (sslMode === 'no-verify') {
    ssl = { rejectUnauthorized: false };
  } else if (sslMode || sslParam === 'true' || sslParam === '1') {
    ssl = true;
  }

  return {
    username: decodificar(parsed.username),
    password: decodificar(parsed.password),
    database: decodificar(parsed.pathname.replace(/^\//, '')),
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    dialect: 'postgres',
    ...(ssl !== undefined ? { dialectOptions: { ssl } } : {}),
  };
}

module.exports = { parseDatabaseUrl };
