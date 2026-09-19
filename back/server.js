// server.js
/**
 * server.js
 * Punto de entrada del servidor.
 */

require('dotenv').config();
const app = require('./app/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Huellitas Saludables API`);
  console.log(`[server] Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`[server] Healthcheck: http://localhost:${PORT}/health`);
  console.log(`[server] API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`[server] Auth test: http://localhost:${PORT}/api/auth/test`);
});