// app/models/cita.model.js
/**
 * models/cita.model.js
 * Consultas de citas usando Sequelize (ORM).
 *
 * NOTA IMPORTANTE sobre el trigger de la BD original
 * (trg_actualizar_disponibilidad_cita): con SQL puro, ese trigger
 * era el que ponía la disponibilidad en estado 'ocupado' al crear
 * una cita. Con el ORM ese trigger se recrea también en la migración
 * (ver migrations/*-create-cita.js), pero además se replica aquí de
 * forma explícita dentro de la transacción, para que la lógica de
 * negocio no dependa silenciosamente de algo que vive solo en la BD.
 */

const { sequelize, Cita, Mascota, Disponibilidad, Usuario, UsuarioMascota } = require('./index');

const INCLUDE_BASE = [
  { model: Mascota, as: 'Mascota', attributes: ['nombre', 'especie', 'genero'] },
  {
    model: Disponibilidad,
    attributes: ['fecha', 'hora', 'estado', 'id_usuario'],
    include: [{ model: Usuario, as: 'Especialista', attributes: ['nombre', 'apellidos', 'especializacion'] }],
  },
  { model: Usuario, as: 'Recepcionista', attributes: ['nombre', 'apellidos'] },
];

function aplanar(c) {
  const p = c.get({ plain: true });
  const disponibilidad = p.Disponibilidad || {};
  const especialista = disponibilidad.Especialista || {};

  return {
    id_cita: p.id_cita,
    id_recepcionista: p.id_recepcionista,
    id_mascota: p.id_mascota,
    id_disponibilidad: p.id_disponibilidad,
    motivo: p.motivo,
    estado: p.estado,
    mascota_nombre: p.Mascota ? p.Mascota.nombre : null,
    mascota_especie: p.Mascota ? p.Mascota.especie : null,
    mascota_genero: p.Mascota ? p.Mascota.genero : null,
    fecha_cita: disponibilidad.fecha ?? null,
    hora_cita: disponibilidad.hora ?? null,
    disponibilidad_estado: disponibilidad.estado ?? null,
    id_especialista: disponibilidad.id_usuario ?? null,
    especialista_nombre: especialista.nombre ?? null,
    especialista_apellidos: especialista.apellidos ?? null,
    especializacion: especialista.especializacion ?? null,
    recepcionista_nombre: p.Recepcionista ? p.Recepcionista.nombre : null,
    recepcionista_apellidos: p.Recepcionista ? p.Recepcionista.apellidos : null,
  };
}

async function findAll({ id_mascota, estado, fecha, id_especialista } = {}) {
  const where = {};
  if (id_mascota) where.id_mascota = id_mascota;
  if (estado) where.estado = estado;

  const includeDisponibilidad = { ...INCLUDE_BASE[1] };
  if (fecha || id_especialista) {
    includeDisponibilidad.where = {};
    if (fecha) includeDisponibilidad.where.fecha = fecha;
    if (id_especialista) includeDisponibilidad.where.id_usuario = id_especialista;
    includeDisponibilidad.required = true;
  }

  const citas = await Cita.findAll({
    where,
    include: [INCLUDE_BASE[0], includeDisponibilidad, INCLUDE_BASE[2]],
    order: [
      [Disponibilidad, 'fecha', 'DESC'],
      [Disponibilidad, 'hora', 'DESC'],
    ],
  });

  return citas.map(aplanar);
}

async function findById(id_cita, { transaction } = {}) {
  const cita = await Cita.findByPk(id_cita, { include: INCLUDE_BASE, transaction });
  return cita ? aplanar(cita) : null;
}

async function findByEspecialista(id_especialista) {
  return findAll({ id_especialista });
}

async function obtenerPrimerRecepcionista() {
  const recepcionista = await Usuario.findOne({
    where: { rol: 'recepcionista' },
    order: [['id_usuario', 'ASC']],
  });
  return recepcionista ? recepcionista.id_usuario : null;
}

async function crearConTransaccion({ id_mascota, id_disponibilidad, id_recepcionista, motivo }) {
  return sequelize.transaction(async (t) => {
    const disponibilidad = await Disponibilidad.findByPk(id_disponibilidad, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!disponibilidad) {
      const error = new Error('DISPONIBILIDAD_NO_EXISTE');
      error.code = 'DISPONIBILIDAD_NO_EXISTE';
      throw error;
    }
    if (disponibilidad.estado !== 'disponible') {
      const error = new Error('DISPONIBILIDAD_NO_LIBRE');
      error.code = 'DISPONIBILIDAD_NO_LIBRE';
      throw error;
    }

    const nuevaCita = await Cita.create(
      { id_recepcionista, id_mascota, id_disponibilidad, motivo, estado: 'pendiente' },
      { transaction: t }
    );

    // Replica el trigger original: al crear la cita, la disponibilidad
    // usada queda 'ocupado'.
    disponibilidad.estado = 'ocupado';
    await disponibilidad.save({ transaction: t });

    return findById(nuevaCita.id_cita, { transaction: t });
  });
}

async function cancelarConTransaccion(id_cita) {
  return sequelize.transaction(async (t) => {
    const cita = await Cita.findByPk(id_cita, { transaction: t, lock: t.LOCK.UPDATE });
    if (!cita) {
      const error = new Error('CITA_NO_EXISTE');
      error.code = 'CITA_NO_EXISTE';
      throw error;
    }

    cita.estado = 'cancelado';
    await cita.save({ transaction: t });

    await Disponibilidad.update(
      { estado: 'disponible' },
      { where: { id_disponibilidad: cita.id_disponibilidad }, transaction: t }
    );

    return findById(id_cita, { transaction: t });
  });
}

async function editarConTransaccion(id_cita, cambios) {
  return sequelize.transaction(async (t) => {
    const cita = await Cita.findByPk(id_cita, { transaction: t, lock: t.LOCK.UPDATE });
    if (!cita) {
      const error = new Error('CITA_NO_EXISTE');
      error.code = 'CITA_NO_EXISTE';
      throw error;
    }

    if (cambios.id_disponibilidad && cambios.id_disponibilidad !== cita.id_disponibilidad) {
      const nueva = await Disponibilidad.findByPk(cambios.id_disponibilidad, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!nueva) {
        throw new Error('NUEVA_DISPONIBILIDAD_NO_EXISTE');
      }
      if (nueva.estado !== 'disponible') {
        throw new Error('NUEVA_DISPONIBILIDAD_NO_LIBRE');
      }

      await Disponibilidad.update(
        { estado: 'disponible' },
        { where: { id_disponibilidad: cita.id_disponibilidad }, transaction: t }
      );
      nueva.estado = 'ocupado';
      await nueva.save({ transaction: t });
    }

    const camposPermitidos = ['id_mascota', 'id_disponibilidad', 'motivo'];
    let huboCambios = false;
    for (const campo of camposPermitidos) {
      if (cambios[campo] !== undefined) {
        cita[campo] = cambios[campo];
        huboCambios = true;
      }
    }
    if (huboCambios) {
      await cita.save({ transaction: t });
    }

    return findById(id_cita, { transaction: t });
  });
}

// ============================================================
// Verifica si una cita pertenece (a través de su mascota) a un usuario
// ============================================================
async function perteneceAUsuario(id_cita, id_usuario) {
  const cita = await Cita.findByPk(id_cita, { attributes: ['id_mascota'] });
  if (!cita) return false;

  const count = await UsuarioMascota.count({
    where: { id_mascota: cita.id_mascota, id_usuario },
  });
  return count > 0;
}

module.exports = {
  findAll,
  findById,
  findByEspecialista,
  obtenerPrimerRecepcionista,
  crearConTransaccion,
  editarConTransaccion,
  cancelarConTransaccion,
  perteneceAUsuario,
};
