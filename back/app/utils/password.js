'use strict';

const crypto = require('crypto');

const PARAMETROS = Object.freeze({
  N: 16384,
  r: 8,
  p: 1,
  saltBytes: 16,
  keylen: 64,
  maxmem: 64 * 1024 * 1024,
});

const MAXIMO_BYTES_CONTRASENA = 1024;
const MAXIMO_CARACTERES_GUARDADO = 255;
const BASE64_VALIDO = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function esContrasenaValida(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length === 0) {
    return false;
  }

  const bytes = Buffer.byteLength(contrasena, 'utf8');
  return bytes > 0 && bytes <= MAXIMO_BYTES_CONTRASENA;
}

function decodificarBase64(valor, longitudEsperada) {
  if (typeof valor !== 'string' || valor.length === 0 || !BASE64_VALIDO.test(valor)) {
    return null;
  }

  const buffer = Buffer.from(valor, 'base64');

  if (buffer.length !== longitudEsperada) {
    return null;
  }

  if (buffer.toString('base64') !== valor) {
    return null;
  }

  return buffer;
}

function parsearHash(guardado) {
  if (typeof guardado !== 'string' || guardado.length > MAXIMO_CARACTERES_GUARDADO) {
    return null;
  }

  const partes = guardado.split('$');

  if (partes.length !== 6) {
    return null;
  }

  const [algoritmo, nTexto, rTexto, pTexto, saltTexto, hashTexto] = partes;

  if (algoritmo !== 'scrypt') {
    return null;
  }

  if (!/^\d+$/.test(nTexto) || !/^\d+$/.test(rTexto) || !/^\d+$/.test(pTexto)) {
    return null;
  }

  const N = Number(nTexto);
  const r = Number(rTexto);
  const p = Number(pTexto);

  if (String(N) !== nTexto || String(r) !== rTexto || String(p) !== pTexto) {
    return null;
  }

  if (N !== PARAMETROS.N || r !== PARAMETROS.r || p !== PARAMETROS.p) {
    return null;
  }

  const salt = decodificarBase64(saltTexto, PARAMETROS.saltBytes);
  const hash = decodificarBase64(hashTexto, PARAMETROS.keylen);

  if (!salt || !hash) {
    return null;
  }

  return { N, r, p, salt, hash };
}

/**
 * Comprueba si un valor almacenado es un hash scrypt válido con los
 * parámetros soportados por esta versión.
 */
function esHashScrypt(guardado) {
  return parsearHash(guardado) !== null;
}

function derivarClave(contrasena, salt, N, r, p, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      contrasena,
      salt,
      keylen,
      { N, r, p, maxmem: PARAMETROS.maxmem },
      (error, clave) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(clave);
      }
    );
  });
}

function compararBuffers(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function compararTextoDeFormaSegura(a, b) {
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

async function hashContrasena(contrasena) {
  if (!esContrasenaValida(contrasena)) {
    throw new TypeError('La contraseña debe ser una cadena de texto no vacía y no superar 1024 bytes.');
  }

  const salt = crypto.randomBytes(PARAMETROS.saltBytes);
  const hash = await derivarClave(
    contrasena,
    salt,
    PARAMETROS.N,
    PARAMETROS.r,
    PARAMETROS.p,
    PARAMETROS.keylen
  );

  return [
    'scrypt',
    PARAMETROS.N,
    PARAMETROS.r,
    PARAMETROS.p,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join('$');
}

async function verificarContrasena(contrasena, guardado) {
  if (!esContrasenaValida(contrasena)) {
    return false;
  }

  if (typeof guardado !== 'string' || guardado.length === 0 || guardado.length > MAXIMO_CARACTERES_GUARDADO) {
    return false;
  }

  // Compatibilidad temporal con contraseñas antiguas en texto plano.
  // Retirar solo después de una migración verificable que confirme que
  // no quedan valores almacenados sin formato scrypt.
  if (!guardado.startsWith('scrypt$')) {
    return compararTextoDeFormaSegura(contrasena, guardado);
  }

  const datos = parsearHash(guardado);

  if (!datos) {
    return false;
  }

  try {
    const clave = await derivarClave(
      contrasena,
      datos.salt,
      datos.N,
      datos.r,
      datos.p,
      datos.hash.length
    );

    return compararBuffers(clave, datos.hash);
  } catch (_error) {
    return false;
  }
}

module.exports = {
  hashContrasena,
  verificarContrasena,
  esHashScrypt,
};
