const ORIGENES_LOCALES_DESARROLLO = Object.freeze([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

/**
 * Devuelve la lista CORS exacta para el entorno actual.
 * En producción solo acepta CORS_ORIGIN; fuera de producción agrega los orígenes
 * locales usados por Vite y Docker Compose para que el login funcione sin configuración oculta.
 */
function obtenerOrigenesCorsPermitidos({
  nodeEnv = process.env.NODE_ENV,
  corsOrigin = process.env.CORS_ORIGIN,
} = {}) {
  const configurados = typeof corsOrigin === 'string'
    ? corsOrigin.split(',').map((origen) => origen.trim()).filter(Boolean)
    : [];
  const locales = nodeEnv === 'production' ? [] : ORIGENES_LOCALES_DESARROLLO;
  return [...new Set([...configurados, ...locales])];
}

export { obtenerOrigenesCorsPermitidos };
export default { obtenerOrigenesCorsPermitidos };
