import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app/app.js';

describe('Healthcheck', () => {
  it('responde con el formato estándar cuando Prisma y PostgreSQL están disponibles', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Servicio y base de datos activos',
    });
    expect(response.body.data).toHaveProperty('db_time');
  });
});
