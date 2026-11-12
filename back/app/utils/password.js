// app/utils/password.js
/**
 * utils/password.js
 * Hashing y verificación de contraseñas con bcrypt.
 *
 * - Las contraseñas nuevas se guardan SIEMPRE como hash bcrypt ($2b$<rondas>$...).
 * - El salt lo genera bcrypt (bcrypt.genSalt) con 12 rondas por defecto (mínimo 10).
 * - La verificación usa bcrypt.compare(); nunca se comparan contraseñas en texto plano.
 * - Los hashes scrypt heredados (scrypt$N$r$p$salt$hash) se siguen pudiendo
 *   verificar para que esos usuarios no pierdan el acceso; tras un login correcto
 *   el servicio de autenticación los re-hashea con bcrypt (ver necesitaRehash).
 * - Los valores heredados en texto plano YA NO se aceptan en el login: se migran
 *   con el script prisma/migrar-contrasenas-bcrypt.js.
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

// ------------------------------------------------------------
// Configuración bcrypt
// ------------------------------------------------------------
const RONDAS_MINIMAS = 10;
const RONDAS_POR_DEFECTO = 12;
const RONDAS_MAXIMAS = 15;

// bcrypt solo usa los primeros 72 bytes de la contraseña. Para que dos claves
// distintas no produzcan el mismo hash, se rechazan las que superen ese límite.
const MAXIMO_BYTES_BCRYPT = 72;

// Límite general de entrada (protege también la verificación de hashes heredados).
const MAXIMO_BYTES_CONTRASENA = 1024;
const MAXIMO_CARACTERES_GUARDADO = 255;

// $2a$ / $2b$ / $2y$ + rondas de 2 dígitos + 22 caracteres de salt + 31 de hash.
const FORMATO_BCRYPT = /^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/;

function obtenerRondasConfiguradas() {
  const valor = process.env.BCRYPT_SALT_ROUNDS;
  if (valor === undefined || valor === '') return RONDAS_POR_DEFECTO;
  const rondas = Number(valor);
  if (!Number.isInteger(rondas) || rondas < RONDAS_MINIMAS || rondas > RONDAS_MAXIMAS) {
    return RONDAS_POR_DEFECTO;
  }
  return rondas;
}

// ------------------------------------------------------------
// Validaciones de entrada
// ------------------------------------------------------------
function esContrasenaValida(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length === 0 || /\s/u.test(contrasena)) {
    return false;
  }

  const bytes = Buffer.byteLength(contrasena, 'utf8');
  return bytes > 0 && bytes <= MAXIMO_BYTES_CONTRASENA;
}

function esContrasenaValidaParaBcrypt(contrasena) {
  return esContrasenaValida(contrasena)
    && Buffer.byteLength(contrasena, 'utf8') <= MAXIMO_BYTES_BCRYPT;
}

// ------------------------------------------------------------
// Detección de formatos guardados
// ------------------------------------------------------------
/** Indica si el valor almacenado es un hash bcrypt bien formado. */
function esHashBcrypt(guardado) {
  if (typeof guardado !== 'string') return false;
  const coincidencia = guardado.match(FORMATO_BCRYPT);
  if (!coincidencia) return false;
  const rondas = Number(coincidencia[1]);
  return rondas >= 4 && rondas <= 31;
}

/**
 * Clasifica el valor de usuario.contrasena sin revelar su contenido.
 * @returns {'bcrypt'|'scrypt'|'texto_plano'|'vacio'}
 */
function clasificarContrasenaGuardada(guardado) {
  if (typeof guardado !== 'string' || guardado.length === 0) return 'vacio';
  if (esHashBcrypt(guardado)) return 'bcrypt';
  if (esHashScrypt(guardado)) return 'scrypt';
  return 'texto_plano';
}

/**
 * true si el valor guardado debe re-hashearse con bcrypt después de un login
 * correcto: no es bcrypt (p. ej. scrypt heredado) o usa menos rondas de las configuradas.
 */
function necesitaRehash(guardado) {
  if (!esHashBcrypt(guardado)) return true;
  return bcrypt.getRounds(guardado) < obtenerRondasConfiguradas();
}

// ------------------------------------------------------------
// bcrypt
// ------------------------------------------------------------
/** Genera el hash bcrypt de una contraseña (salt aleatorio, 12 rondas por defecto). */
async function hashContrasena(contrasena) {
  if (!esContrasenaValida(contrasena)) {
    throw new TypeError('La contraseña no puede contener espacios y debe ser texto no vacío.');
  }
  if (!esContrasenaValidaParaBcrypt(contrasena)) {
    throw new TypeError(`La contraseña no puede superar ${MAXIMO_BYTES_BCRYPT} bytes.`);
  }

  const salt = await bcrypt.genSalt(obtenerRondasConfiguradas());
  return bcrypt.hash(contrasena, salt);
}

/**
 * Verifica una contraseña contra el valor almacenado.
 * - bcrypt  -> bcrypt.compare()
 * - scrypt  -> verificación heredada (solo para migrar a bcrypt en el login)
 * - otro    -> false (no se comparan contraseñas en texto plano)
 * Nunca lanza: cualquier error devuelve false.
 */
async function verificarContrasena(contrasena, guardado) {
  if (!esContrasenaValida(contrasena)) {
    return false;
  }

  if (typeof guardado !== 'string' || guardado.length === 0 || guardado.length > MAXIMO_CARACTERES_GUARDADO) {
    return false;
  }

  if (esHashBcrypt(guardado)) {
    if (!esContrasenaValidaParaBcrypt(contrasena)) return false;
    try {
      return await bcrypt.compare(contrasena, guardado);
    } catch (_error) {
      return false;
    }
  }

  if (guardado.startsWith('scrypt$')) {
    return verificarScryptHeredado(contrasena, guardado);
  }

  // Texto plano u otro formato desconocido: no se acepta.
  return false;
}

// Hash ficticio para igualar el tiempo de respuesta cuando el correo no existe
// (evita enumerar usuarios midiendo cuánto tarda el login).
let hashFicticio = null;
async function simularVerificacion(contrasena) {
  try {
    if (!hashFicticio) {
      hashFicticio = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), obtenerRondasConfiguradas());
    }
    const valor = typeof contrasena === 'string' ? contrasena.slice(0, MAXIMO_BYTES_BCRYPT) : '';
    await bcrypt.compare(valor, hashFicticio);
  } catch (_error) {
    // Sin efecto: solo consume tiempo.
  }
  return false;
}

// ------------------------------------------------------------
// scrypt heredado (solo verificación, nunca se generan hashes nuevos)
// ------------------------------------------------------------
const PARAMETROS_SCRYPT = Object.freeze({
  N: 16384,
  r: 8,
  p: 1,
  saltBytes: 16,
  keylen: 64,
  maxmem: 64 * 1024 * 1024,
});

const BASE64_VALIDO = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function decodificarBase64(valor, longitudEsperada) {
  if (typeof valor !== 'string' || valor.length === 0 || !BASE64_VALIDO.test(valor)) {
    return null;
  }

  const buffer = Buffer.from(valor, 'base64');

  if (buffer.length !== longitudEsperada || buffer.toString('base64') !== valor) {
    return null;
  }

  return buffer;
}

function parsearHashScrypt(guardado) {
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

  // Solo se aceptan los parámetros que usaba la versión anterior: un valor
  // manipulado no puede forzar un costo de CPU/memoria arbitrario.
  if (N !== PARAMETROS_SCRYPT.N || r !== PARAMETROS_SCRYPT.r || p !== PARAMETROS_SCRYPT.p) {
    return null;
  }

  const salt = decodificarBase64(saltTexto, PARAMETROS_SCRYPT.saltBytes);
  const hash = decodificarBase64(hashTexto, PARAMETROS_SCRYPT.keylen);

  if (!salt || !hash) {
    return null;
  }

  return { N, r, p, salt, hash };
}

/** Indica si el valor almacenado es un hash scrypt heredado válido. */
function esHashScrypt(guardado) {
  return parsearHashScrypt(guardado) !== null;
}

function derivarClaveScrypt(contrasena, salt, N, r, p, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(contrasena, salt, keylen, { N, r, p, maxmem: PARAMETROS_SCRYPT.maxmem }, (error, clave) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(clave);
    });
  });
}

async function verificarScryptHeredado(contrasena, guardado) {
  const datos = parsearHashScrypt(guardado);
  if (!datos) return false;

  try {
    const clave = await derivarClaveScrypt(contrasena, datos.salt, datos.N, datos.r, datos.p, datos.hash.length);
    return clave.length === datos.hash.length && crypto.timingSafeEqual(clave, datos.hash);
  } catch (_error) {
    return false;
  }
}

export {
  hashContrasena,
  verificarContrasena,
  simularVerificacion,
  esHashBcrypt,
  esHashScrypt,
  necesitaRehash,
  clasificarContrasenaGuardada,
  esContrasenaValidaParaBcrypt,
  MAXIMO_BYTES_BCRYPT,
  RONDAS_MINIMAS,
  RONDAS_POR_DEFECTO,
};
export default {
  hashContrasena,
  verificarContrasena,
  simularVerificacion,
  esHashBcrypt,
  esHashScrypt,
  necesitaRehash,
  clasificarContrasenaGuardada,
  esContrasenaValidaParaBcrypt,
  MAXIMO_BYTES_BCRYPT,
  RONDAS_MINIMAS,
  RONDAS_POR_DEFECTO,
};
