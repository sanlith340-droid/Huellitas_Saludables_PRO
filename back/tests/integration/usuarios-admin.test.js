// tests/integration/usuarios-admin.test.js
// Pantalla de administración de personal:
//   - GET    /api/usuarios/personal        (lista admin / especialistas / recepcionistas)
//   - POST   /api/auth/registro-admin      (alta de personal)
//   - DELETE /api/usuarios/:id             (solo especialistas y recepcionistas)

const request = require('supertest');
const app = require('../../app/app');
const { getToken } = require('../helpers/auth.helper');
const { resetDatabase } = require('../setup/dbHelper');
const { MASCOTAS } = require('../fixtures');

describe('Administración de personal', () => {
  let tokenAdmin, tokenEsp, tokenRec, tokenUsuario;

  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  const registrar = (datos, token = tokenAdmin) =>
    request(app).post('/api/auth/registro-admin').set(auth(token)).send(datos);

  const nuevoEspecialista = (n) => ({
    nombre: 'Nuevo',
    apellidos: `Especialista ${n}`,
    telefono: '3100000000',
    correo: `nuevo.esp${n}@proyectohs.com`,
    direccion: 'Calle 1 # 2-3',
    contrasena: 'clave123',
    rol: 'especialista',
    especializacion: 'Dermatología',
  });

  const nuevaRecepcionista = (n) => ({
    nombre: 'Nueva',
    apellidos: `Recepcion ${n}`,
    telefono: '3100000001',
    correo: `nueva.rec${n}@proyectohs.com`,
    direccion: 'Calle 4 # 5-6',
    contrasena: 'clave123',
    rol: 'recepcionista',
  });

  const eliminar = (id, token = tokenAdmin) =>
    request(app).delete(`/api/usuarios/${id}`).set(auth(token));

  beforeAll(async () => {
    await resetDatabase();
    tokenAdmin = await getToken('admin');
    tokenEsp = await getToken('especialista');
    tokenRec = await getToken('recepcionista');
    tokenUsuario = await getToken('usuario');
  });

  describe('GET /api/usuarios/personal', () => {
    it('el admin lista al personal sin contraseñas y solo con roles de personal', async () => {
      const res = await request(app).get('/api/usuarios/personal').set(auth(tokenAdmin));

      expect(res.status).toBe(200);
      const roles = new Set(res.body.data.map((u) => u.rol));
      expect([...roles].sort()).toEqual(['admin', 'especialista', 'recepcionista']);
      expect(res.body.data.every((u) => u.contrasena === undefined)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('citas_asociadas');
      expect(res.body.data[0]).toHaveProperty('puede_eliminar');
    });

    it('marca como no eliminables a los admin y a quienes tienen citas', async () => {
      const res = await request(app).get('/api/usuarios/personal').set(auth(tokenAdmin));
      const porId = Object.fromEntries(res.body.data.map((u) => [u.id_usuario, u]));

      expect(porId.ADM001.puede_eliminar).toBe(false);
      expect(porId.ESP001.citas_asociadas).toBeGreaterThan(0);
      expect(porId.ESP001.puede_eliminar).toBe(false);
      expect(porId.REC001.puede_eliminar).toBe(false);
    });

    it.each([
      ['especialista', () => tokenEsp],
      ['recepcionista', () => tokenRec],
      ['usuario', () => tokenUsuario],
    ])('rol %s no puede listar el personal (403)', async (_rol, getTok) => {
      const res = await request(app).get('/api/usuarios/personal').set(auth(getTok()));
      expect(res.status).toBe(403);
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).get('/api/usuarios/personal');
      expect(res.status).toBe(401);
    });
  });

  describe('Registro de personal (POST /api/auth/registro-admin)', () => {
    it('crea un especialista y aparece en la lista', async () => {
      const res = await registrar(nuevoEspecialista(1));
      expect(res.status).toBe(201);
      expect(res.body.data.usuario.rol).toBe('especialista');
      expect(res.body.data.usuario.id_usuario).toMatch(/^ESP/);

      const lista = await request(app).get('/api/usuarios/personal').set(auth(tokenAdmin));
      expect(lista.body.data.some((u) => u.correo === 'nuevo.esp1@proyectohs.com')).toBe(true);
    });

    it('crea una recepcionista (201)', async () => {
      const res = await registrar(nuevaRecepcionista(1));
      expect(res.status).toBe(201);
      expect(res.body.data.usuario.rol).toBe('recepcionista');
    });

    it('correo repetido devuelve 409', async () => {
      const res = await registrar(nuevoEspecialista(1));
      expect(res.status).toBe(409);
    });

    it('especialista sin especialización devuelve 400', async () => {
      const datos = nuevoEspecialista(2);
      delete datos.especializacion;
      const res = await registrar(datos);
      expect(res.status).toBe(400);
    });

    it('recepcionista con especialización devuelve 400', async () => {
      const res = await registrar({ ...nuevaRecepcionista(2), especializacion: 'Cirugía' });
      expect(res.status).toBe(400);
    });

    it('un especialista NO puede registrar personal (403)', async () => {
      const res = await registrar(nuevaRecepcionista(3), tokenEsp);
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('elimina un especialista sin citas y su sesión deja de ser válida', async () => {
      const creado = await registrar(nuevoEspecialista(10));
      const { id_usuario, } = creado.body.data.usuario;
      const tokenDelNuevo = creado.body.data.token;

      const res = await eliminar(id_usuario);
      expect(res.status).toBe(200);
      expect(res.body.data.id_usuario).toBe(id_usuario);

      // Ya no puede iniciar sesión...
      const login = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'nuevo.esp10@proyectohs.com', contrasena: 'clave123' });
      expect(login.status).toBe(401);

      // ...y su token anterior tampoco sirve
      const conToken = await request(app).get('/api/citas').set(auth(tokenDelNuevo));
      expect(conToken.status).toBe(401);
    });

    it('elimina una recepcionista sin citas', async () => {
      const creado = await registrar(nuevaRecepcionista(10));
      const res = await eliminar(creado.body.data.usuario.id_usuario);
      expect(res.status).toBe(200);
    });

    it('al eliminar un especialista se borran sus horarios libres', async () => {
      const creado = await registrar(nuevoEspecialista(11));
      const { id_usuario } = creado.body.data.usuario;

      const franja = await request(app)
        .post('/api/disponibilidad')
        .set(auth(tokenRec))
        .send({ id_usuario, fecha: '2026-12-01', hora: '09:00:00' });
      expect(franja.status).toBe(201);

      const res = await eliminar(id_usuario);
      expect(res.status).toBe(200);

      const franjas = await request(app)
        .get(`/api/disponibilidad?id_usuario=${id_usuario}`)
        .set(auth(tokenAdmin));
      expect(franjas.body.data).toHaveLength(0);
    });

    it('un especialista con citas NO se puede eliminar (409), aunque estén canceladas', async () => {
      const creado = await registrar(nuevoEspecialista(12));
      const { id_usuario } = creado.body.data.usuario;

      const franja = await request(app)
        .post('/api/disponibilidad')
        .set(auth(tokenRec))
        .send({ id_usuario, fecha: '2026-12-02', hora: '10:00:00' });
      const id_disponibilidad = franja.body.data.id_disponibilidad;

      const cita = await request(app)
        .post('/api/citas')
        .set(auth(tokenUsuario))
        .send({ id_mascota: MASCOTAS.MAX.id, id_disponibilidad, motivo: 'Control' });
      expect(cita.status).toBe(201);

      const abierta = await eliminar(id_usuario);
      expect(abierta.status).toBe(409);

      await request(app)
        .patch(`/api/citas/${cita.body.data.id_cita}/cancelar`)
        .set(auth(tokenUsuario));

      const cancelada = await eliminar(id_usuario);
      expect(cancelada.status).toBe(409);
    });

    it('una recepcionista que registró citas NO se puede eliminar (409)', async () => {
      const res = await eliminar('REC001');
      expect(res.status).toBe(409);
    });

    it('no se puede eliminar a un administrador (403)', async () => {
      const res = await eliminar('ADM001');
      expect(res.status).toBe(403);
    });

    it('no se puede eliminar a un usuario cliente (403)', async () => {
      const res = await eliminar('USU001');
      expect(res.status).toBe(403);
    });

    it('usuario inexistente devuelve 404', async () => {
      const res = await eliminar('ESP999');
      expect(res.status).toBe(404);
    });

    it.each([
      ['especialista', () => tokenEsp],
      ['recepcionista', () => tokenRec],
      ['usuario', () => tokenUsuario],
    ])('rol %s no puede eliminar cuentas (403)', async (_rol, getTok) => {
      const res = await eliminar('REC002', getTok());
      expect(res.status).toBe(403);
    });

    it('sin token devuelve 401', async () => {
      const res = await request(app).delete('/api/usuarios/REC002');
      expect(res.status).toBe(401);
    });
  });
});
