// app/models/historia.model.js
/**
 * models/historia.model.js
 * Consultas de historia clínica usando Sequelize (ORM).
 */

const { Op } = require('sequelize');
const { sequelize, HistoriaClinica, Cita, Mascota, Disponibilidad, Usuario } = require('./index');

const INCLUDE_BASE = [
  {
    model: Cita,
    as: 'Cita',
    attributes: ['id_mascota', 'motivo', 'estado'],
    include: [
      { model: Mascota, as: 'Mascota', attributes: ['nombre', 'especie', 'genero'] },
      {
        model: Disponibilidad,
        attributes: ['fecha', 'hora', 'id_usuario'],
        include: [{ model: Usuario, as: 'Especialista', attributes: ['id_usuario', 'nombre', 'apellidos', 'especializacion'] }],
      },
    ],
  },
];

function aplanar(hc) {
  const p = hc.get({ plain: true });
  const cita = p.Cita || {};
  const mascota = cita.Mascota || {};
  const disponibilidad = cita.Disponibilidad || {};
  const especialista = disponibilidad.Especialista || {};

  return {
    id_historia_clinica: p.id_historia_clinica,
    id_cita: p.id_cita,
    peso: p.peso,
    diagnostico: p.diagnostico,
    tratamiento: p.tratamiento,
    observaciones: p.observaciones,
    fecha_registro: p.fecha_registro,
    id_mascota: cita.id_mascota ?? null,
    mascota_nombre: mascota.nombre ?? null,
    mascota_especie: mascota.especie ?? null,
    mascota_genero: mascota.genero ?? null,
    cita_motivo: cita.motivo ?? null,
    cita_estado: cita.estado ?? null,
    fecha_cita: disponibilidad.fecha ?? null,
    hora_cita: disponibilidad.hora ?? null,
    especialista_id: especialista.id_usuario ?? null,
    especialista_nombre: especialista.nombre ?? null,
    especialista_apellidos: especialista.apellidos ?? null,
    especializacion: especialista.especializacion ?? null,
  };
}

async function findAll({ id_mascota, id_especialista, fecha_inicio, fecha_fin } = {}) {
  const where = {};
  if (fecha_inicio || fecha_fin) {
    where.fecha_registro = {};
    if (fecha_inicio) where.fecha_registro[Op.gte] = fecha_inicio;
    if (fecha_fin) where.fecha_registro[Op.lte] = fecha_fin;
  }

  const includeCita = { ...INCLUDE_BASE[0], include: [...INCLUDE_BASE[0].include] };
  if (id_mascota) includeCita.where = { id_mascota };
  if (id_especialista) {
    includeCita.include = includeCita.include.map((inc) => {
      if (inc.model === Disponibilidad) {
        return { ...inc, where: { id_usuario: id_especialista }, required: true };
      }
      return inc;
    });
  }
  if (id_mascota || id_especialista) includeCita.required = true;

  const historias = await HistoriaClinica.findAll({
    where,
    include: [includeCita],
    order: [['fecha_registro', 'DESC']],
  });

  return historias.map(aplanar);
}

async function findById(id_historia_clinica) {
  const historia = await HistoriaClinica.findByPk(id_historia_clinica, { include: INCLUDE_BASE });
  return historia ? aplanar(historia) : null;
}

async function findByCitaId(id_cita) {
  const historia = await HistoriaClinica.findOne({ where: { id_cita }, include: INCLUDE_BASE });
  return historia ? aplanar(historia) : null;
}

async function findByMascota(id_mascota) {
  return findAll({ id_mascota });
}

async function findByIdConTransaccion(id_historia_clinica, transaction) {
  const historia = await HistoriaClinica.findByPk(id_historia_clinica, { include: INCLUDE_BASE, transaction });
  return historia ? aplanar(historia) : null;
}

/**
 * Crea historia clínica dentro de una transacción.
 * Igual que con SQL puro: valida cita, especialista asignado y que
 * no exista ya una historia para esa cita; y además replica el
 * trigger original que pone la cita en estado 'atendido'.
 *
 * NOTA: PostgreSQL no permite "SELECT ... FOR UPDATE" combinado con
 * un LEFT OUTER JOIN (el lock no se puede aplicar al lado nulo del
 * join). Por eso primero se bloquea solo la fila de `cita`, y la
 * disponibilidad asociada (que solo se necesita para leer el
 * especialista asignado) se consulta aparte, sin lock.
 */
async function crearConTransaccion({ id_cita, peso, diagnostico, tratamiento, observaciones, especialistaId }) {
  return sequelize.transaction(async (t) => {
    const cita = await Cita.findByPk(id_cita, { transaction: t, lock: t.LOCK.UPDATE });

    if (!cita) {
      const error = new Error('CITA_NO_EXISTE');
      error.code = 'CITA_NO_EXISTE';
      throw error;
    }

    const disponibilidad = await Disponibilidad.findByPk(cita.id_disponibilidad, {
      attributes: ['id_usuario'],
      transaction: t,
    });

    const especialistaAsignado = disponibilidad ? disponibilidad.id_usuario : null;
    if (especialistaAsignado !== especialistaId) {
      const error = new Error('ESPECIALISTA_NO_ASIGNADO');
      error.code = 'ESPECIALISTA_NO_ASIGNADO';
      throw error;
    }

    const existente = await HistoriaClinica.findOne({ where: { id_cita }, transaction: t });
    if (existente) {
      const error = new Error('HISTORIA_YA_EXISTE');
      error.code = 'HISTORIA_YA_EXISTE';
      throw error;
    }

    const nuevaHistoria = await HistoriaClinica.create(
      { id_cita, peso: peso || null, diagnostico, tratamiento, observaciones: observaciones || null },
      { transaction: t }
    );

    // Replica el trigger original: crear la HC marca la cita como 'atendido'.
    cita.estado = 'atendido';
    await cita.save({ transaction: t });

    return findByIdConTransaccion(nuevaHistoria.id_historia_clinica, t);
  });
}

/**
 * Actualiza historia clínica (solo el especialista dueño de la cita).
 * Mismo cuidado que en crearConTransaccion: el lock se aplica solo
 * sobre `historia_clinica`, y los datos de cita/disponibilidad se
 * leen aparte sin lock.
 */
async function actualizar(id_historia_clinica, cambios, especialistaId) {
  return sequelize.transaction(async (t) => {
    const historia = await HistoriaClinica.findByPk(id_historia_clinica, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!historia) {
      const error = new Error('HISTORIA_NO_EXISTE');
      error.code = 'HISTORIA_NO_EXISTE';
      throw error;
    }

    const cita = await Cita.findByPk(historia.id_cita, { attributes: ['id_disponibilidad'], transaction: t });
    const disponibilidad = cita
      ? await Disponibilidad.findByPk(cita.id_disponibilidad, { attributes: ['id_usuario'], transaction: t })
      : null;
    const especialistaAsignado = disponibilidad ? disponibilidad.id_usuario : null;

    if (especialistaAsignado !== especialistaId) {
      const error = new Error('ESPECIALISTA_NO_AUTORIZADO');
      error.code = 'ESPECIALISTA_NO_AUTORIZADO';
      throw error;
    }

    const camposPermitidos = ['peso', 'diagnostico', 'tratamiento', 'observaciones'];
    let huboCambios = false;
    for (const campo of camposPermitidos) {
      if (cambios[campo] !== undefined) {
        historia[campo] = cambios[campo];
        huboCambios = true;
      }
    }

    if (huboCambios) {
      await historia.save({ transaction: t });
    }

    return findByIdConTransaccion(id_historia_clinica, t);
  });
}

module.exports = {
  findAll,
  findById,
  findByCitaId,
  findByMascota,
  crearConTransaccion,
  actualizar,
};
