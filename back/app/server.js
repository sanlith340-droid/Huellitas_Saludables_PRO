/**
 * server.js
 * ---------------------------------------------------------
 * Punto de entrada. Levanta el servidor HTTP sobre la app
 * configurada en app.js.
 * ---------------------------------------------------------
 */
import 'dotenv/config';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info({ event: 'server.started', port: PORT }, 'Huellitas Saludables API iniciada');

});
