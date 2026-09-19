// app/models/mascota.model.js
/**
 * models/mascota.model.js
 * Consultas de mascotas usando Sequelize (ORM).
 * Se mantiene exactamente la misma forma de los objetos que
 * devolvía la versión con SQL puro para no romper mascota.service.js.
 */

const { sequelize, Mascota, Raza, Usuario, UsuarioMascota } = require('./index');

async function findAll() {
  const mascotas = await Mascota.findAll({
    include: [
      { model: Raza, attributes: ['id_raza', 'nombre'] },
      {
        model: Usuario,
        attributes: ['id_usuario', 'nombre', 'apellidos', 'telefono', 'correo'],
        through: { attributes: [] },
        required: false,
      },
    ],
    order: [['id_mascota', 'ASC']],
  });

  // Aplanar: una fila por (mascota, propietario), igual que el JOIN original.
  const filas = [];
  for (const m of mascotas) {
    const plano = m.get({ plain: true });
    const propietarios = plano.Usuarios && plano.Usuarios.length > 0 ? plano.Usuarios : [null];

    for (const u of propietarios) {
      filas.push({
        id_mascota: plano.id_mascota,
        mascota: plano.nombre,
        fecha_nacimiento: plano.fecha_nacimiento,
        especie: plano.especie,
        genero: plano.genero,
        id_raza: plano.Raza ? plano.Raza.id_raza : null,
        raza: plano.Raza ? plano.Raza.nombre : null,
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
  const mascota = await Mascota.findByPk(id_mascota, {
    include: [
      { model: Raza, attributes: ['id_raza', 'nombre'] },
      {
        model: Usuario,
        attributes: ['id_usuario', 'nombre', 'apellidos', 'telefono', 'correo'],
        through: { attributes: [] },
        required: false,
      },
    ],
    transaction,
  });

  if (!mascota) return null;

  const plano = mascota.get({ plain: true });

  return {
    id_mascota: plano.id_mascota,
    mascota: plano.nombre,
    fecha_nacimiento: plano.fecha_nacimiento,
    especie: plano.especie,
    genero: plano.genero,
    raza: {
      id_raza: plano.Raza ? plano.Raza.id_raza : null,
      nombre: plano.Raza ? plano.Raza.nombre : null,
    },
    propietarios: (plano.Usuarios || []).map((u) => ({
      id_usuario: u.id_usuario,
      nombre: u.nombre,
      apellidos: u.apellidos,
      telefono: u.telefono,
      correo: u.correo,
    })),
  };
}

async function perteneceAUsuario(id_mascota, id_usuario) {
  const count = await UsuarioMascota.count({ where: { id_mascota, id_usuario } });
  return count > 0;
}

// ============================================================
// Crear mascota + asociarla al usuario dueño (transacción)
// ============================================================
async function crearConUsuario({ nombre, fecha_nacimiento, especie, genero, id_raza, id_usuario }) {
  return sequelize.transaction(async (t) => {
    const nuevaMascota = await Mascota.create(
      { nombre, fecha_nacimiento, especie, genero, id_raza },
      { transaction: t }
    );

    await UsuarioMascota.create(
      { id_usuario, id_mascota: nuevaMascota.id_mascota },
      { transaction: t }
    );

    return findById(nuevaMascota.id_mascota, { transaction: t });
  });
}

module.exports = {
  findAll,
  findById,
  perteneceAUsuario,
  crearConUsuario,
};
