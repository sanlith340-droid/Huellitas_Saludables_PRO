import request from 'supertest';
import app from '../../app/app.js';
import citaService from '../../app/services/cita.service.js';
import { prisma } from '../../app/config/prisma.js';
import { getToken } from '../helpers/auth.helper.js';
import { MASCOTAS } from '../fixtures/index.js';
import { resetDatabase } from '../setup/dbHelper.js';

describe('cancelación automática de citas vencidas', () => {
  let tokenUsuario;
  let tokenEspecialista;

  beforeAll(async () => {
    await resetDatabase();
    [tokenUsuario, tokenEspecialista] = await Promise.all([
      getToken('usuario'),
      getToken('especialista'),
    ]);
  });

  it('cancela citas pasadas con auditoría de sistema y deja la franja ocupada', async () => {
    const creada = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({
        id_mascota: MASCOTAS.MAX.id,
        id_disponibilidad: 2,
        motivo: 'Prueba de vencimiento automático',
      });

    expect(creada.status).toBe(201);
    const idCita = creada.body.data.id_cita;

    // 2026-08-20T00:00Z = 19:00 del 19 de agosto en America/Bogota.
    const cantidad = await citaService.cancelarVencidasAutomaticamente({
      ahora: new Date('2026-08-20T00:00:00.000Z'),
    });
    expect(cantidad).toBe(1);

    const respuesta = await request(app)
      .get(`/api/citas/${idCita}`)
      .set('Authorization', `Bearer ${tokenUsuario}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data.estado).toBe('cancelado');
    expect(respuesta.body.data.cancelacion).toMatchObject({
      id_usuario_actor: null,
      rol_actor: 'sistema',
      origen: 'automatico',
      motivo: 'Cancelada automáticamente porque la fecha y hora de la cita ya pasaron.',
    });
    expect(respuesta.body.data.cancelacion.cancelada_en).toBeTruthy();

    const avisos = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenEspecialista}`);
    expect(avisos.status).toBe(200);
    expect(avisos.body.data.notificaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({
        tipo: 'cambio_estado_cita',
        id_cita: idCita,
        asunto: 'Cambio de estado en una cita',
      }),
    ]));

    const franja = await prisma.disponibilidad.findUnique({
      where: { id_disponibilidad: 2 },
      select: { estado: true },
    });
    expect(franja.estado).toBe('ocupado');

    const repetida = await citaService.cancelarVencidasAutomaticamente({
      ahora: new Date('2026-08-20T00:00:00.000Z'),
    });
    expect(repetida).toBe(0);
  });
});
