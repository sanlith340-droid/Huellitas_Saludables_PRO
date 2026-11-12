// app/models/auth.model.js
/**
 * Consultas de autenticación de usuarios con Prisma.
 * Mantiene las firmas y formas de retorno que consume auth.service.js.
 */

import { prisma } from '../config/prisma.js';
import { esHashBcrypt } from '../utils/password.js';

const ATTRS_PUBLICOS = {
  id_usuario: true,
  nombre: true,
  apellidos: true,
  telefono: true,
  correo: true,
  direccion: true,
  especializacion: true,
  tipo: true,
  rol: true,
  fecha_registro: true,
};

/** Busca un usuario por correo (incluye contraseña, solo para login). */
async function findByEmail(correo) {
  return prisma.usuario.findUnique({ where: { correo } });
}

/** Busca un usuario por su ID sin incluir contraseña. */
async function findById(id_usuario) {
  return prisma.usuario.findUnique({
    where: { id_usuario },
    select: ATTRS_PUBLICOS,
  });
}

/** Crea un usuario y devuelve únicamente sus datos públicos. */
async function create(usuarioData) {
  const {
    id_usuario,
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    tipo,
    rol,
  } = usuarioData;

  if (!esHashBcrypt(contrasena)) {
    throw new TypeError('La contraseña debe ser un hash bcrypt válido');
  }

  return prisma.usuario.create({
    data: {
      id_usuario,
      nombre,
      apellidos,
      telefono,
      correo,
      direccion,
      contrasena,
      especializacion: especializacion || null,
      tipo: tipo || null,
      rol: rol || 'usuario',
    },
    select: ATTRS_PUBLICOS,
  });
}

/** Verifica si un ID de usuario ya existe. */
async function existsById(id_usuario) {
  return (await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { id_usuario: true },
  })) !== null;
}

/** Verifica si un correo ya está registrado. */
async function existsByEmail(correo) {
  return (await prisma.usuario.findUnique({
    where: { correo },
    select: { id_usuario: true },
  })) !== null;
}

/** Genera el siguiente ID de usuario basado en el rol. */
async function generarIdUsuario(rol) {
  const prefixMap = {
    usuario: 'USU',
    especialista: 'ESP',
    recepcionista: 'REC',
    admin: 'ADM',
  };
  const prefix = prefixMap[rol] || 'USU';

  const ultimo = await prisma.usuario.findFirst({
    where: { id_usuario: { startsWith: prefix } },
    orderBy: { id_usuario: 'desc' },
    select: { id_usuario: true },
  });

  if (!ultimo) return `${prefix}001`;

  const num = parseInt(ultimo.id_usuario.replace(prefix, ''), 10) + 1;
  return `${prefix}${String(num).padStart(3, '0')}`;
}

/** Actualiza el tipo de usuario (principal/acudiente). */
async function updateTipo(id_usuario, tipo) {
  const result = await prisma.usuario.updateMany({
    where: { id_usuario },
    data: { tipo },
  });
  if (result.count === 0) return null;
  return findById(id_usuario);
}

/** Actualiza la especialización de un especialista. */
async function updateEspecializacion(id_usuario, especializacion) {
  const result = await prisma.usuario.updateMany({
    where: { id_usuario },
    data: { especializacion },
  });
  if (result.count === 0) return null;
  return findById(id_usuario);
}

/** Cambia la contraseña de un usuario. Solo acepta hashes bcrypt. */
async function updatePassword(id_usuario, nuevaContrasena) {
  if (!esHashBcrypt(nuevaContrasena)) {
    throw new TypeError('La contraseña debe ser un hash bcrypt válido');
  }

  const result = await prisma.usuario.updateMany({
    where: { id_usuario },
    data: { contrasena: nuevaContrasena },
  });
  if (result.count === 0) return null;
  return { id_usuario };
}

export {
  findByEmail,
  findById,
  create,
  existsById,
  existsByEmail,
  generarIdUsuario,
  updateTipo,
  updateEspecializacion,
  updatePassword,
};
export default {
  findByEmail,
  findById,
  create,
  existsById,
  existsByEmail,
  generarIdUsuario,
  updateTipo,
  updateEspecializacion,
  updatePassword,
};
