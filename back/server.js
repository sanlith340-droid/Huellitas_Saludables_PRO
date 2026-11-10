// server.js
/**
 * server.js
 * Punto de entrada del servidor.
 */

import 'dotenv/config';
import app from './app/app.js';
import logger from './app/utils/logger.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info({ event: 'server.started', port: PORT }, 'Huellitas Saludables API iniciada');
});
