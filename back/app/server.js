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
import { disconnect } from './config/prisma.js';
import { iniciarCancelacionAutomatica } from './services/citaCancellationScheduler.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info({ event: 'server.started', port: PORT }, 'Huellitas Saludables API iniciada');
});

const detenerCancelacionAutomatica = iniciarCancelacionAutomatica();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    detenerCancelacionAutomatica();
    server.close(async () => {
      await disconnect();
    });
  });
}
