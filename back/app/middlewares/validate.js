// app/middlewares/validate.js
/**
 * middlewares/validate.js
 * Validación Joi, tipado y normalización segura de datos.
 */
import AppError from '../utils/AppError.js';

const CAMPOS_NO_NORMALIZABLES = /^(password|passwd|pwd|contrasena|contraseña|clave|token|authorization)$/i;
const CAMPOS_CREDENCIAL = /^(password|passwd|pwd|contrasena|contraseña)$/i;

function normalizarEspacios(valor, clave = '') {
  if (typeof valor === 'string') {
    return CAMPOS_NO_NORMALIZABLES.test(clave) ? valor : valor.trim();
  }
  if (Array.isArray(valor)) return valor.map((elemento) => normalizarEspacios(elemento));
  if (valor && typeof valor === 'object' && !(valor instanceof Date)) {
    return Object.fromEntries(Object.entries(valor).map(([nombre, dato]) => [nombre, normalizarEspacios(dato, nombre)]));
  }
  return valor;
}

function encontrarCredencialesSoloEspacios(valor, ruta = []) {
  if (!valor || typeof valor !== 'object') return [];
  if (Array.isArray(valor)) {
    return valor.flatMap((elemento, indice) => encontrarCredencialesSoloEspacios(elemento, [...ruta, String(indice)]));
  }
  return Object.entries(valor).flatMap(([clave, dato]) => {
    const campo = [...ruta, clave];
    if (CAMPOS_CREDENCIAL.test(clave) && typeof dato === 'string' && dato.length > 0 && !/\S/.test(dato)) {
      return [`${campo.join('.')} no puede contener solo espacios.`];
    }
    return encontrarCredencialesSoloEspacios(dato, campo);
  });
}

function mensajeValidacion(detalle) {
  const campo = Array.isArray(detalle.path) && detalle.path.length ? detalle.path.join('.') : 'Este campo';
  const limite = detalle.context?.limit;
  switch (detalle.type) {
    case 'any.required': return `${campo} es obligatorio.`;
    case 'string.empty': return `${campo} no puede estar vacío.`;
    case 'string.base': return `${campo} debe ser texto.`;
    case 'string.email': return `${campo} debe tener un correo electrónico válido.`;
    case 'string.min': return `${campo} debe tener al menos ${limite} caracteres.`;
    case 'string.max': return `${campo} no puede exceder ${limite} caracteres.`;
    case 'number.base': return `${campo} debe ser un número.`;
    case 'number.integer': return `${campo} debe ser un número entero.`;
    case 'number.positive': return `${campo} debe ser un número positivo.`;
    case 'boolean.base': return `${campo} debe ser verdadero o falso.`;
    case 'date.base': return `${campo} debe ser una fecha válida.`;
    case 'any.only': return `${campo} tiene un valor no permitido.`;
    case 'string.pattern.base': return `${campo} tiene un formato inválido.`;
    default: return typeof detalle.message === 'string' ? detalle.message.replaceAll('"', '') : `${campo} no es válido.`;
  }
}

function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const datos = normalizarEspacios(req[property]);
    const credencialesVacias = encontrarCredencialesSoloEspacios(datos);
    if (credencialesVacias.length) {
      return next(AppError.badRequest(credencialesVacias.join(' '), { fields: credencialesVacias }));
    }
    const { error, value } = schema.validate(datos, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const mensajes = error.details.map(mensajeValidacion);
      return next(AppError.badRequest(mensajes.join(' '), { fields: mensajes }));
    }

    req[property] = value;
    return next();
  };
}

export { normalizarEspacios, mensajeValidacion };
export default validate;
