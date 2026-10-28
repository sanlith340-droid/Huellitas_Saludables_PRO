// app/models/usuario.model.js
/**
 * models/usuario.model.js
 * Consultas de usuarios usando Sequelize (ORM).
 */

const { Op } = require('sequelize');
const { sequelize, Usuario, Cita, Disponibilidad } = require('./index');

const ROLES_PERSONAL = ['admin', 'especialista', 'recepcionista'];

const ATTRS_PUBLICOS = [
  'id_usuario',
  'nombre',
  'apellidos',
  'telefono',
  'correo',
  'direccion',
  'especializacion',
  'tipo',
  'rol',
  'fecha_registro',
];

async function findById(id_usuario) {
  const usuario = await Usuario.findByPk(id_usuario, { attributes: ATTRS_PUBLICOS });
  return usuario ? usuario.get({ plain: true }) : null;
}

async function findByIdAndRol(id_usuario, rol) {
  const usuario = await Usuario.findOne({
    where: { id_usuario, rol },
    attributes: ATTRS_PUBLICOS,
  });
  return usuario ? usuario.get({ plain: true }) : null;
}

async function findByDocumento(documento) {
  const usuario = await Usuario.findByPk(documento, { attributes: ATTRS_PUBLICOS });
  return usuario ? usuario.get({ plain: true }) : null;
}

async function findEspecialistas() {
  const especialistas = await Usuario.findAll({
    where: { rol: 'especialista' },
    attributes: ['id_usuario', 'nombre', 'apellidos', 'telefono', 'correo', 'especializacion', 'tipo', 'rol'],
    order: [['nombre', 'ASC']],
  });
  return especialistas.map((u) => u.get({ plain: true }));
}

/**
 * Personal de la clínica (admin, especialista, recepcionista), sin contraseña.
 */
async function findPersonal() {
  const personal = await Usuario.findAll({
    where: { rol: { [Op.in]: ROLES_PERSONAL } },
    attributes: ATTRS_PUBLICOS,
    order: [
      ['rol', 'ASC'],
      ['nombre', 'ASC'],
      ['apellidos', 'ASC'],
    ],
  });
  return personal.map((u) => u.get({ plain: true }));
}

/**
 * Cantidad de citas asociadas a cada cuenta del personal:
 *  - especialista  : citas sobre sus horarios
 *  - recepcionista : citas que registró
 * Devuelve un Map { id_usuario -> total }.
 */
async function contarCitasPorPersonal() {
  const [porEspecialista] = await sequelize.query(`
    SELECT d.id_usuario AS id, COUNT(c.id_cita)::int AS total
    FROM disponibilidad d
    JOIN cita c ON c.id_disponibilidad = d.id_disponibilidad
    GROUP BY d.id_usuario
  `);
  const [porRecepcionista] = await sequelize.query(`
    SELECT id_recepcionista AS id, COUNT(*)::int AS total
    FROM cita
    GROUP BY id_recepcionista
  `);

  const mapa = new Map();
  [...porEspecialista, ...porRecepcionista].forEach((fila) => {
    mapa.set(fila.id, (mapa.get(fila.id) || 0) + Number(fila.total));
  });
  return mapa;
}

async function contarCitasDe(id_usuario, rol) {
  if (rol === 'especialista') {
    return Cita.count({
      include: [{ model: Disponibilidad, where: { id_usuario }, required: true, attributes: [] }],
    });
  }
  if (rol === 'recepcionista') {
    return Cita.count({ where: { id_recepcionista: id_usuario } });
  }
  return 0;
}

/**
 * Elimina la cuenta. Los horarios (disponibilidad) del especialista se
 * borran en cascada por la FK de la base de datos. Si aún existen citas,
 * la base de datos lo impide (RESTRICT) y se lanza un error de FK.
 */
async function eliminar(id_usuario) {
  return Usuario.destroy({ where: { id_usuario } });
}

module.exports = {
  findPersonal,
  contarCitasPorPersonal,
  contarCitasDe,
  eliminar,
  findById,
  findByIdAndRol,
  findByDocumento,
  findEspecialistas,
};
