// app/models/usuario.model.js
/**
 * models/usuario.model.js
 * Consultas de usuarios usando Sequelize (ORM).
 */

const { Usuario } = require('./index');

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

module.exports = {
  findById,
  findByIdAndRol,
  findByDocumento,
  findEspecialistas,
};
