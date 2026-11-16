import request from 'supertest';

// Este archivo verifica los limitadores con el umbral de producción,
// independientemente del valor elevado usado por el resto de las pruebas.
process.env.AUTH_RATE_LIMIT_MAX = '5';
const { default: app } = await import('../../app/app.js');

const BODY_INVALIDO = {};

async function enviarIntento(ruta) {
  return request(app)
    .post(ruta)
    .send(BODY_INVALIDO);
}

async function verificarLimite(ruta) {
  for (let intento = 1; intento <= 5; intento += 1) {
    const respuesta = await enviarIntento(ruta);
    expect(respuesta.status).toBe(400);
  }

  const sexta = await enviarIntento(ruta);
  expect(sexta.status).toBe(429);
  expect(sexta.body).toMatchObject({
    success: false,
    message: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  });
  expect(sexta.body.details.retryAfterSeconds).toBeGreaterThan(0);
  expect(Number(sexta.headers['retry-after'])).toBeGreaterThan(0);

  // El contador permanece activo durante la ventana, no solo en la sexta llamada.
  const septima = await enviarIntento(ruta);
  expect(septima.status).toBe(429);
}

describe('Rate limit de autenticación', () => {
  it('bloquea el sexto intento de login durante la ventana', async () => {
    await verificarLimite('/api/auth/login');
  });

  it('bloquea el sexto intento de registro durante la ventana', async () => {
    await verificarLimite('/api/auth/registro');
  });
});
