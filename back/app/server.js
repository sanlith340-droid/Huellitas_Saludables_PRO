/**
 * server.js
 * ---------------------------------------------------------
 * Punto de entrada. Levanta el servidor HTTP sobre la app
 * configurada en app.js.
 * ---------------------------------------------------------
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Huellitas Saludables API - modulo citas+disponibilidad`);
  console.log(`[server] Escuchando en http://localhost:${PORT}`);
  console.log(`[server] Healthcheck:   GET  http://localhost:${PORT}/health`);
  console.log(`[server] API Docs:      GET  http://localhost:${PORT}/api-docs`);

});
