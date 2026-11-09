// app/models/raza.model.js
/**
 * models/raza.model.js
 * Consultas de razas usando Sequelize (ORM).
 */

import { Raza } from './index.js';

async function findById(id_raza) {
  const raza = await Raza.findByPk(id_raza);
  return raza ? raza.get({ plain: true }) : null;
}

async function findAll() {
  const razas = await Raza.findAll({ order: [['nombre', 'ASC']] });
  return razas.map((r) => r.get({ plain: true }));
}

export { findById, findAll };
export default { findById, findAll };
