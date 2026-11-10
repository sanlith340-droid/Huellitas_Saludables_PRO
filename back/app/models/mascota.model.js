// app/models/mascota.model.js
/**
 * Consultas de mascotas con Prisma, conservando las formas de respuesta
 * que consume la API.
 */

import { prisma } from '../config/prisma.js';

const camposUsuario = {
  id_usuario: true,
  nombre: true,
  apellidos: true,
  telefono: true,
  correo: true,
};

function fechaComoDia(value) {
  if (value == null) return value;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function fechaParaPrisma(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return value;
}

async function findAll() {
  const mascotas = await prisma.mascota.findMany({
    include: {
      raza: { select: { id_raza: true, nombre: true } },
      propietarios: {
        select: {
          usuario: { select: camposUsuario },
        },
      },
    },
    orderBy: { id_mascota: 'asc' },
  });

  // Una fila por mascota-propietario, o una fila con propietario nulo.
  const filas = [];
  for (const m of mascotas) {
    const propietarios = m.propietarios.length > 0
      ? m.propietarios.map((asociacion) => asociacion.usuario)
      : [null];

    for (const u of propietarios) {
      filas.push({
        id_mascota: m.id_mascota,
        mascota: m.nombre,
        fecha_nacimiento: fechaComoDia(m.fecha_nacimiento),
        especie: m.especie,
        genero: m.genero,
        id_raza: m.raza ? m.raza.id_raza : null,
        raza: m.raza ? m.raza.nombre : null,
        propietario_id: u ? u.id_usuario : null,
        propietario_nombre: u ? u.nombre : null,
        propietario_apellidos: u ? u.apellidos : null,
        propietario_telefono: u ? u.telefono : null,
        propietario_correo: u ? u.correo : null,
      });
    }
  }
  return filas;
}

async function findById(id_mascota, { transaction } = {}) {
  const client = transaction || prisma;
  const m = await client.mascota.findUnique({
    where: { id_mascota: Number(id_mascota) },
    include: {
      raza: { select: { id_raza: true, nombre: true } },
      propietarios: {
        select: {
          usuario: { select: camposUsuario },
        },
      },
    },
  });

  if (!m) return null;

  return {
    id_mascota: m.id_mascota,
    mascota: m.nombre,
    fecha_nacimiento: fechaComoDia(m.fecha_nacimiento),
    especie: m.especie,
    genero: m.genero,
    raza: {
      id_raza: m.raza ? m.raza.id_raza : null,
      nombre: m.raza ? m.raza.nombre : null,
    },
    propietarios: m.propietarios.map(({ usuario }) => ({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      correo: usuario.correo,
    })),
  };
}

async function perteneceAUsuario(id_mascota, id_usuario) {
  const asociacion = await prisma.usuarioMascota.findFirst({
    where: { id_mascota: Number(id_mascota), id_usuario },
    select: { id_mascota: true },
  });
  return Boolean(asociacion);
}

async function crearConUsuario({ nombre, fecha_nacimiento, especie, genero, id_raza, id_usuario }) {
  return prisma.$transaction(async (transaction) => {
    const nuevaMascota = await transaction.mascota.create({
      data: {
        nombre,
        fecha_nacimiento: fechaParaPrisma(fecha_nacimiento),
        especie,
        genero,
        id_raza: Number(id_raza),
      },
      select: { id_mascota: true },
    });

    await transaction.usuarioMascota.create({
      data: { id_usuario, id_mascota: nuevaMascota.id_mascota },
    });

    return findById(nuevaMascota.id_mascota, { transaction });
  });
}

export { findAll, findById, perteneceAUsuario, crearConUsuario };
export default { findAll, findById, perteneceAUsuario, crearConUsuario };
