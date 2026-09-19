// app/models/auth.model.js
/**
 * models/auth.model.js
 * Consultas de autenticación de usuarios, ahora usando Sequelize (ORM)
 * en lugar de SQL puro. Mantiene la misma firma y forma de retorno
 * que la versión anterior para no romper auth.service.js.
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

/**
 * Busca un usuario por su correo electrónico (incluye contraseña,
 * se usa solo para el login).
 */
async function findByEmail(correo) {
  const usuario = await Usuario.findOne({ where: { correo } });
  return usuario ? usuario.get({ plain: true }) : null;
}

/**
 * Busca un usuario por su ID (sin contraseña)
 */
async function findById(id_usuario) {
  const usuario = await Usuario.findByPk(id_usuario, { attributes: ATTRS_PUBLICOS });
  return usuario ? usuario.get({ plain: true }) : null;
}

/**
 * Crea un nuevo usuario
 */
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

  const nuevo = await Usuario.create({
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
  });

  const plano = nuevo.get({ plain: true });
  const { contrasena: _omit, ...sinPassword } = plano;
  return sinPassword;
}

/**
 * Verifica si un ID de usuario ya existe
 */
async function existsById(id_usuario) {
  const count = await Usuario.count({ where: { id_usuario } });
  return count > 0;
}

/**
 * Verifica si un correo ya está registrado
 */
async function existsByEmail(correo) {
  const count = await Usuario.count({ where: { correo } });
  return count > 0;
}

/**
 * Genera el siguiente ID de usuario basado en el rol
 */
async function generarIdUsuario(rol) {
  const prefixMap = {
    usuario: 'USU',
    especialista: 'ESP',
    recepcionista: 'REC',
    admin: 'ADM',
  };

  const prefix = prefixMap[rol] || 'USU';

  const { Op } = require('sequelize');
  const ultimo = await Usuario.findOne({
    where: { id_usuario: { [Op.like]: `${prefix}%` } },
    order: [['id_usuario', 'DESC']],
  });

  if (!ultimo) {
    return `${prefix}001`;
  }

  const num = parseInt(ultimo.id_usuario.replace(prefix, ''), 10) + 1;
  return `${prefix}${String(num).padStart(3, '0')}`;
}

/**
 * Actualiza el tipo de usuario (principal/acudiente)
 */
async function updateTipo(id_usuario, tipo) {
  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) return null;
  usuario.tipo = tipo;
  await usuario.save();
  const plano = usuario.get({ plain: true });
  const { contrasena: _omit, ...sinPassword } = plano;
  return sinPassword;
}

/**
 * Actualiza la especialización de un especialista
 */
async function updateEspecializacion(id_usuario, especializacion) {
  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) return null;
  usuario.especializacion = especializacion;
  await usuario.save();
  const plano = usuario.get({ plain: true });
  const { contrasena: _omit, ...sinPassword } = plano;
  return sinPassword;
}

/**
 * Cambia la contraseña de un usuario
 */
async function updatePassword(id_usuario, nuevaContrasena) {
  const usuario = await Usuario.findByPk(id_usuario);
  if (!usuario) return null;
  usuario.contrasena = nuevaContrasena;
  await usuario.save();
  return { id_usuario: usuario.id_usuario };
}

module.exports = {
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
