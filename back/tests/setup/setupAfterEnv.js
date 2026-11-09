// Cierra el pool de Sequelize al terminar cada archivo de pruebas.
import { afterAll } from 'vitest';
import { sequelize } from '../../app/models/index.js';

afterAll(async () => {
  await sequelize.close();
});
