import Joi from 'joi';
import { errorHandler } from '../../../app/middlewares/errorHandler.js';
import validate from '../../../app/middlewares/validate.js';

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

  it('recorta espacios externos sin modificar una contraseña', () => {
    const req = { body: { nombre: '  Luna  ', edad: '7', contrasena: '  clave segura  ' } };
    const next = vi.fn();

    validate(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ nombre: 'Luna', edad: 7, contrasena: '  clave segura  ' });
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

  it('rechaza contraseñas formadas solo por espacios sin alterar contraseñas válidas', () => {
    const req = { body: { nombre: 'Luna', edad: 7, contrasena: '    ' } };
    let error;
    validate(schema)(req, {}, (nextError) => { error = nextError; });

    expect(error.message).toContain('contrasena no puede contener solo espacios.');
  });
});
