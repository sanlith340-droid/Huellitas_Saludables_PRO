// app/utils/sqlSeguro.js
/**
 * utils/sqlSeguro.js
 * Validación de valores que se envían como parámetros a consultas SQL crudas
 * (prisma.$queryRaw con plantilla etiquetada).
 *
 * Las plantillas $queryRaw`...${valor}...` ya envían cada ${valor} como
 * parámetro enlazado ($1, $2, ...), nunca concatenado. Estas funciones añaden
 * una segunda barrera: solo dejan pasar valores del tipo esperado, de modo que
 * entradas como "1 OR 1=1" o "' OR '1'='1" se rechazan antes de llegar a la BD.
 *
 * Reglas del proyecto:
 * - No usar $queryRawUnsafe, $executeRawUnsafe ni Prisma.raw con datos externos.
 * - No construir SQL concatenando texto (`... ${x} ...` dentro de un string normal).
 * - Columnas, ordenamientos o direcciones dinámicas: elegirlas de una lista blanca
 *   (hoy el proyecto no acepta columnas ni ordenamientos desde la petición; los
 *   filtros usan listas blancas Joi .valid(...) y `camposPermitidos` en los modelos).
 */

import AppError from './AppError.js';

/** Convierte un identificador a entero positivo seguro o lanza 400. */
function aIdEntero(valor, campo = 'id') {
  const numero = typeof valor === 'number'
    ? valor
    : typeof valor === 'string' && /^\d{1,15}$/.test(valor.trim())
      ? Number(valor.trim())
      : Number.NaN;

  if (!Number.isSafeInteger(numero) || numero <= 0) {
    throw AppError.badRequest(`${campo} debe ser un número entero positivo.`);
  }
  return numero;
}

/** Valida un límite numérico (LIMIT) dentro de un rango cerrado. */
function aLimiteEntero(valor, { minimo = 1, maximo = 1000, campo = 'limite' } = {}) {
  if (!Number.isSafeInteger(valor) || valor < minimo || valor > maximo) {
    throw new TypeError(`${campo} debe ser un entero entre ${minimo} y ${maximo}.`);
  }
  return valor;
}

/** Acepta null, una fecha válida o un texto ISO 8601 válido para ::timestamptz. */
function aMarcaTiempoOpcional(valor, campo = 'ahora') {
  if (valor === null || valor === undefined) return null;
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) throw new TypeError(`${campo} no es una fecha válida.`);
    return valor;
  }
  if (typeof valor === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/.test(valor)
    && !Number.isNaN(Date.parse(valor))) {
    return valor;
  }
  throw new TypeError(`${campo} no es una fecha válida.`);
}

export { aIdEntero, aLimiteEntero, aMarcaTiempoOpcional };
export default { aIdEntero, aLimiteEntero, aMarcaTiempoOpcional };
