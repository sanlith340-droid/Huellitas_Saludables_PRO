import { afterAll } from 'vitest';
import { disconnect } from '../../app/config/prisma.js';

afterAll(async () => {
  await disconnect();
});
