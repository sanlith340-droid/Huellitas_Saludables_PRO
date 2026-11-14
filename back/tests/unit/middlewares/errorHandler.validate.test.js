import Joi from 'joi';
import { errorHandler } from '../../../app/middlewares/errorHandler.js';
import validate from '../../../app/middlewares/validate.js';
import { mensajeValidacion } from '../../../app/middlewares/validate.js';

function responseMock() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe('manejo central de errores', () => {
  it('no expone el mensaje ni los valores originales de un error Joi no clasificado', () => {
    const mensaje = mensajeValidacion({
      path: ['campo'],
      type: 'custom.unknown',
      message: 'campo contiene TOKEN_PRIVADO y datos@example.invalid',
    });

    expect(mensaje).toBe('campo no es válido.');
    expect(mensaje).not.toContain('TOKEN_PRIVADO');
    expect(mensaje).not.toContain('datos@example.invalid');
  });

  it('responde los 500 con un formato estable y sin el mensaje interno', () => {
    const res = responseMock();
    const detalleInterno = 'falló con token eyJhbGciOiJub25l.eyJpZCI6InVzZXIifQ.abc y correo persona@ejemplo.com';

    errorHandler(new Error(detalleInterno), {}, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Ocurrió un error interno. Inténtalo de nuevo más tarde.',
      code: 'INTERNAL_ERROR',
      details: null,
    });
    expect(JSON.stringify(res.body)).not.toContain(detalleInterno);
    expect(JSON.stringify(res.body)).not.toContain('persona@ejemplo.com');
  });
});

describe('validación y normalización de espacios', () => {
  const schema = Joi.object({
    nombre: Joi.string().required(),
    edad: Joi.number().integer().required(),
    contrasena: Joi.string().required(),
  });

  it('recorta espacios externos en datos y conserva una contraseña sin espacios', () => {
    const req = { body: { nombre: '  Luna  ', edad: '7', contrasena: 'claveSegura123' } };
    const next = vi.fn();

    validate(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ nombre: 'Luna', edad: 7, contrasena: 'claveSegura123' });
  });

  it('devuelve un mensaje claro cuando un campo tiene tipo incorrecto', () => {
    const req = { body: { nombre: 12, edad: 'no-numérico', contrasena: 'secreto' } };
    let error;
    validate(schema)(req, {}, (nextError) => { error = nextError; });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('nombre debe ser texto.');
    expect(error.message).toContain('edad debe ser un número.');
  });

  it('indica claramente un campo vacío tras normalizar espacios', () => {
    const req = { body: { nombre: '   ', edad: 7, contrasena: 'x' } };
    let error;
    validate(schema)(req, {}, (nextError) => { error = nextError; });

    expect(error.message).toContain('nombre no puede estar vacío.');
  });

  it('usa mensajes naturales para contraseñas obligatorias o vacías', () => {
    expect(mensajeValidacion({ path: ['contrasena'], type: 'any.required' }))
      .toBe('La contraseña es obligatoria.');
    expect(mensajeValidacion({ path: ['contrasena'], type: 'string.empty' }))
      .toBe('La contraseña no puede estar vacía.');
  });

  it.each(['clave segura', ' clave', 'clave ', 'clave\tsegura', 'clave\nsegura', 'clave\u00a0segura', '    '])(
    'rechaza contraseñas con cualquier tipo de whitespace: %j',
    (contrasena) => {
      const req = { body: { nombre: 'Luna', edad: 7, contrasena } };
      let error;
      validate(schema)(req, {}, (nextError) => { error = nextError; });

      expect(error.message).toBe('La contraseña no puede contener espacios.');
    }
  );
});

describe('teléfono solo numérico y correo sin espacios', () => {
  const esquemaContacto = Joi.object({
    telefono: Joi.string().pattern(/^\d+$/u).required(),
    correo: Joi.string().pattern(/^\S+$/u).email().required(),
  });

  it('acepta un teléfono numérico y un correo sin espacios', () => {
    const req = { body: { telefono: '3001234567', correo: 'luna@huellitas.com' } };
    const next = vi.fn();

    validate(esquemaContacto)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it.each(['300-123-4567', '300 123 4567', 'abc300', '+57 3001234567', '(300)1234567'])(
    'rechaza el teléfono %j con el mensaje de solo números',
    (telefono) => {
      const req = { body: { telefono, correo: 'luna@huellitas.com' } };
      let error;
      validate(esquemaContacto)(req, {}, (nextError) => { error = nextError; });

      expect(error.message).toBe('El teléfono solo puede contener números.');
      expect(error.details.fields).toEqual(['El teléfono solo puede contener números.']);
    }
  );

  it('rechaza un correo con espacios con un único mensaje específico', () => {
    const req = { body: { telefono: '3001234567', correo: 'luna mascota@huellitas.com' } };
    let error;
    validate(esquemaContacto)(req, {}, (nextError) => { error = nextError; });

    expect(error.message).toBe('El correo electrónico no puede contener espacios.');
    expect(error.details.fields).toEqual(['El correo electrónico no puede contener espacios.']);
  });

  it('devuelve un error individual por cada campo inválido', () => {
    const req = { body: { telefono: '300 abc', correo: 'luna mascota@huellitas.com' } };
    let error;
    validate(esquemaContacto)(req, {}, (nextError) => { error = nextError; });

    expect(error.details.fields).toEqual([
      'El teléfono solo puede contener números.',
      'El correo electrónico no puede contener espacios.',
    ]);
  });
});
