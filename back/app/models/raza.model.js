// app/models/raza.model.js
/**
 * models/raza.model.js
 * Consultas de razas usando Sequelize (ORM).
 */

const { Raza } = require('./index');

async function findById(id_raza) {
  const raza = await Raza.findByPk(id_raza);
  return raza ? raza.get({ plain: true }) : null;
}

async function findAll() {
  const razas = await Raza.findAll({ order: [['nombre', 'ASC']] });
  return razas.map((r) => r.get({ plain: true }));
}

module.exports = {
  findById,
  findAll,
};
