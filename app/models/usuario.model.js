// app/models/usuario.model.js
/**
 * Consultas de usuarios usando Prisma.
 */

import { prisma } from '../config/prisma.js';

const ROLES_PERSONAL = ['admin', 'especialista', 'recepcionista'];

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

async function findById(id_usuario) {
  return prisma.usuario.findUnique({
    where: { id_usuario },
    select: ATTRS_PUBLICOS,
  });
}

async function findByIdAndRol(id_usuario, rol) {
  return prisma.usuario.findFirst({
    where: { id_usuario, rol },
    select: ATTRS_PUBLICOS,
  });
}

async function findByDocumento(documento) {
  return prisma.usuario.findUnique({
    where: { id_usuario: documento },
    select: ATTRS_PUBLICOS,
  });
}

async function findEspecialistas() {
  return prisma.usuario.findMany({
    where: { rol: 'especialista' },
    select: {
      id_usuario: true,
      nombre: true,
      apellidos: true,
      telefono: true,
      correo: true,
      especializacion: true,
      tipo: true,
      rol: true,
    },
    orderBy: { nombre: 'asc' },
  });
}

/** Personal de la clínica (admin, especialista, recepcionista), sin contraseña. */
async function findPersonal() {
  return prisma.usuario.findMany({
    where: { rol: { in: ROLES_PERSONAL } },
    select: ATTRS_PUBLICOS,
    orderBy: [{ rol: 'asc' }, { nombre: 'asc' }, { apellidos: 'asc' }],
  });
}

/**
 * Cuenta las citas vinculadas a cada cuenta del personal:
 * - especialista: citas sobre sus disponibilidades
 * - recepcionista: citas que registró
 * Devuelve un Map { id_usuario -> total } con ambos conteos combinados.
 */
async function contarCitasPorPersonal() {
  const citas = await prisma.cita.findMany({
    select: {
      id_recepcionista: true,
      disponibilidad: { select: { id_usuario: true } },
    },
  });

  const mapa = new Map();
  for (const cita of citas) {
    const idEspecialista = cita.disponibilidad.id_usuario;
    mapa.set(idEspecialista, (mapa.get(idEspecialista) || 0) + 1);

    const idRecepcionista = cita.id_recepcionista;
    mapa.set(idRecepcionista, (mapa.get(idRecepcionista) || 0) + 1);
  }
  return mapa;
}

async function contarCitasDe(id_usuario, rol) {
  if (rol === 'especialista') {
    return prisma.cita.count({
      where: { disponibilidad: { is: { id_usuario } } },
    });
  }
  if (rol === 'recepcionista') {
    return prisma.cita.count({ where: { id_recepcionista: id_usuario } });
  }
  return 0;
}

/** Elimina la cuenta; la base de datos impide borrarla si quedan citas. */
async function eliminar(id_usuario) {
  const result = await prisma.usuario.deleteMany({ where: { id_usuario } });
  return result.count;
}

export {
  findPersonal,
  contarCitasPorPersonal,
  contarCitasDe,
  eliminar,
  findById,
  findByIdAndRol,
  findByDocumento,
  findEspecialistas,
};
export default {
  findPersonal,
  contarCitasPorPersonal,
  contarCitasDe,
  eliminar,
  findById,
  findByIdAndRol,
  findByDocumento,
  findEspecialistas,
};
