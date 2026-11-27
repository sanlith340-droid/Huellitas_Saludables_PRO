// app/models/raza.model.js
/**
 * Consultas de razas con Prisma.
 */

import { prisma } from '../config/prisma.js';

async function findById(id_raza) {
  return prisma.raza.findUnique({ where: { id_raza: Number(id_raza) } });
}

async function findByName(nombre) {
  return prisma.raza.findFirst({
    where: { nombre: { equals: nombre.trim(), mode: 'insensitive' } },
    orderBy: { id_raza: 'asc' },
  });
}

async function findOrCreateByName(nombre) {
  const nombreLimpio = nombre.trim();
  const existente = await findByName(nombreLimpio);
  if (existente) return existente;
  return prisma.raza.create({ data: { nombre: nombreLimpio } });
}

async function findAll() {
  return prisma.raza.findMany({ orderBy: { nombre: 'asc' } });
}

export { findById, findByName, findOrCreateByName, findAll };
export default { findById, findByName, findOrCreateByName, findAll };
