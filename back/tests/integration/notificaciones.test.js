// tests/integration/notificaciones.test.js
// Ejecutar únicamente contra la base efímera y exclusiva configurada para pruebas.
import request from 'supertest';
import app from '../../app/app.js';
import { getToken } from '../helpers/auth.helper.js';
import { resetDatabase } from '../setup/dbHelper.js';
import { MASCOTAS, USUARIOS } from '../fixtures/index.js';

describe('Notificaciones in-app - /api/notificaciones (RF09)', () => {
  let tokenUsuario;
  let tokenEspecialista;
  let tokenEspecialista2;
  let tokenRecepcionista;

  beforeAll(async () => {
    await resetDatabase();
    [tokenUsuario, tokenEspecialista, tokenEspecialista2, tokenRecepcionista] = await Promise.all([
      getToken('usuario'),
      getToken('especialista'),
      getToken('especialista2'),
      getToken('recepcionista'),
    ]);
  });

  it('crea avisos por cita y disponibilidad, los conserva y limita lectura al especialista destinatario', async () => {
    const citaCreada = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ id_mascota: MASCOTAS.MAX.id, id_disponibilidad: 2, motivo: 'Consulta de prueba RF09' });

    expect(citaCreada.status).toBe(201);
    const idCita = citaCreada.body.data.id_cita;

    const citaEditada = await request(app)
      .put(`/api/citas/${idCita}`)
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ motivo: 'Control de prueba RF09' });
    expect(citaEditada.status).toBe(200);

    const citaCancelada = await request(app)
      .patch(`/api/citas/${idCita}/cancelar`)
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(citaCancelada.status).toBe(200);
    expect(citaCancelada.body.data.estado).toBe('cancelado');

    const franjaCreada = await request(app)
      .post('/api/disponibilidad')
      .set('Authorization', `Bearer ${tokenRecepcionista}`)
      .send({
        id_usuario: USUARIOS.ESP001.id,
        fecha: '2026-08-21',
        hora: '18:30:00',
        estado: 'disponible',
      });
    expect(franjaCreada.status).toBe(201);
    const idDisponibilidad = franjaCreada.body.data.id_disponibilidad;

    const franjaActualizada = await request(app)
      .put(`/api/disponibilidad/${idDisponibilidad}`)
      .set('Authorization', `Bearer ${tokenRecepcionista}`)
      .send({ estado: 'ocupado' });
    expect(franjaActualizada.status).toBe(200);

    // Regresa al estado disponible para poder retirarla; ambos cambios deben avisarse.
    const franjaLiberada = await request(app)
      .put(`/api/disponibilidad/${idDisponibilidad}`)
      .set('Authorization', `Bearer ${tokenRecepcionista}`)
      .send({ estado: 'disponible' });
    expect(franjaLiberada.status).toBe(200);

    const franjaEliminada = await request(app)
      .delete(`/api/disponibilidad/${idDisponibilidad}`)
      .set('Authorization', `Bearer ${tokenRecepcionista}`);
    expect(franjaEliminada.status).toBe(200);

    const lista = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenEspecialista}`);

    expect(lista.status).toBe(200);
    expect(lista.body.data.no_leidas).toBeGreaterThanOrEqual(6);
    const avisos = lista.body.data.notificaciones;
    expect(avisos.map((aviso) => aviso.tipo)).toEqual(expect.arrayContaining([
      'nueva_cita',
      'cambio_cita',
      'cambio_estado_cita',
      'cambio_disponibilidad',
    ]));
    expect(avisos.find((aviso) => aviso.tipo === 'nueva_cita')).toMatchObject({
      id_usuario: USUARIOS.ESP001.id,
      id_cita: idCita,
      leida: false,
    });
    expect(avisos.some((aviso) => aviso.id_disponibilidad === null
      && aviso.mensaje.includes('retirada de tu agenda'))).toBe(true);

    const listaOtroEspecialista = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenEspecialista2}`);
    expect(listaOtroEspecialista.status).toBe(200);
    expect(listaOtroEspecialista.body.data.notificaciones).toHaveLength(0);
    expect(listaOtroEspecialista.body.data.no_leidas).toBe(0);

    const notificacionAjena = avisos[0];
    const intentoAjeno = await request(app)
      .patch(`/api/notificaciones/${notificacionAjena.id_notificacion}/leida`)
      .set('Authorization', `Bearer ${tokenEspecialista2}`);
    expect(intentoAjeno.status).toBe(404);

    const marcarUna = await request(app)
      .patch(`/api/notificaciones/${notificacionAjena.id_notificacion}/leida`)
      .set('Authorization', `Bearer ${tokenEspecialista}`);
    expect(marcarUna.status).toBe(200);
    expect(marcarUna.body.data.leida).toBe(true);
    expect(marcarUna.body.data.leida_en).toBeTruthy();

    const marcarTodas = await request(app)
      .patch('/api/notificaciones/leer-todas')
      .set('Authorization', `Bearer ${tokenEspecialista}`);
    expect(marcarTodas.status).toBe(200);
    expect(marcarTodas.body.data.actualizadas).toBeGreaterThan(0);

    const listaFinal = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenEspecialista}`);
    expect(listaFinal.body.data.no_leidas).toBe(0);
    expect(listaFinal.body.data.notificaciones.every((aviso) => aviso.leida)).toBe(true);
  });

  it('rechaza acceso sin token y bloquea los demás roles', async () => {
    const sinToken = await request(app).get('/api/notificaciones');
    expect(sinToken.status).toBe(401);

    const otroRol = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(otroRol.status).toBe(403);
  });
});
