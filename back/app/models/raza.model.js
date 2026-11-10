// app/models/raza.model.js
/**
 * Consultas de razas con Prisma.
 */

import { prisma } from '../config/prisma.js';

async function findById(id_raza) {
  return prisma.raza.findUnique({ where: { id_raza: Number(id_raza) } });
}

async function findAll() {
  return prisma.raza.findMany({ orderBy: { nombre: 'asc' } });
}

export { findById, findAll };
export default { findById, findAll };
