// app/models/disponibilidad.model.js
/**
 * models/disponibilidad.model.js
 * Consultas de disponibilidad usando Sequelize (ORM).
 */

const { Op, fn, col } = require('sequelize');
const { sequelize, Disponibilidad, Usuario } = require('./index');

function aplanar(d) {
  const plano = d.get ? d.get({ plain: true }) : d;
  return {
    id_disponibilidad: plano.id_disponibilidad,
    id_usuario: plano.id_usuario,
    fecha: plano.fecha,
    hora: plano.hora,
    estado: plano.estado,
    especialista_nombre: plano.Especialista ? plano.Especialista.nombre : null,
    especialista_apellidos: plano.Especialista ? plano.Especialista.apellidos : null,
    especializacion: plano.Especialista ? plano.Especialista.especializacion : null,
  };
}

const INCLUDE_ESPECIALISTA = [
  { model: Usuario, as: 'Especialista', attributes: ['nombre', 'apellidos', 'especializacion'] },
];

const ORDEN = [
  ['fecha', 'ASC'],
  ['hora', 'ASC'],
];

/**
 * Joi entrega las fechas como objetos Date (UTC 00:00). Las pasamos a
 * "YYYY-MM-DD" para comparar contra la columna DATEONLY sin que la zona
 * horaria del servidor desplace el día.
 */
function aFechaISO(fecha) {
  return fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);
}

/**
 * Arma el WHERE a partir de los filtros recibidos.
 *   - id_usuario  : ID del especialista
 *   - fecha       : día exacto (si viene, ignora el rango)
 *   - fecha_desde : desde ese día (incluido)
 *   - fecha_hasta : hasta ese día (incluido)
 *   - estado      : 'disponible' | 'ocupado'
 */
function construirWhere({ id_usuario, fecha, fecha_desde, fecha_hasta, estado } = {}) {
  const where = {};
  if (id_usuario) where.id_usuario = id_usuario;
  if (estado) where.estado = estado;

  if (fecha) {
    where.fecha = aFechaISO(fecha);
  } else if (fecha_desde || fecha_hasta) {
    where.fecha = {};
    if (fecha_desde) where.fecha[Op.gte] = aFechaISO(fecha_desde);
    if (fecha_hasta) where.fecha[Op.lte] = aFechaISO(fecha_hasta);
  }

  return where;
}

/**
 * Listado completo, SIN paginar. Es el comportamiento original y lo sigue
 * usando la pantalla de "Nueva cita".
 */
async function findAll(filtros = {}) {
  const disponibilidades = await Disponibilidad.findAll({
    where: construirWhere(filtros),
    include: INCLUDE_ESPECIALISTA,
    order: ORDEN,
  });

  return disponibilidades.map(aplanar);
}

/**
 * Cuenta las franjas por estado respetando los demás filtros, pero
 * IGNORANDO el filtro "estado". Así el front puede mostrar
 * "Disponibles (12) · Ocupadas (3)" aunque esté filtrando por uno solo.
 */
async function contarPorEstado(filtros = {}) {
  const { estado, ...sinEstado } = filtros; // eslint-disable-line no-unused-vars
  const filas = await Disponibilidad.findAll({
    attributes: ['estado', [fn('COUNT', col('id_disponibilidad')), 'total']],
    where: construirWhere(sinEstado),
    group: ['estado'],
    raw: true,
  });

  const resumen = { disponible: 0, ocupado: 0 };
  for (const fila of filas) {
    resumen[fila.estado] = Number(fila.total);
  }
  return resumen;
}

/**
 * Listado paginado. Devuelve las filas de la página pedida, el total de
 * registros que cumplen los filtros y el resumen por estado.
 */
async function findPaginado({ page, limit, ...filtros }) {
  const { rows, count } = await Disponibilidad.findAndCountAll({
    where: construirWhere(filtros),
    include: INCLUDE_ESPECIALISTA,
    order: ORDEN,
    limit,
    offset: (page - 1) * limit,
  });

  const resumen = await contarPorEstado(filtros);

  return {
    filas: rows.map(aplanar),
    total: count,
    resumen,
  };
}

async function findById(id_disponibilidad) {
  const disponibilidad = await Disponibilidad.findByPk(id_disponibilidad, {
    include: INCLUDE_ESPECIALISTA,
  });
  return disponibilidad ? aplanar(disponibilidad) : null;
}

/**
 * Busca una disponibilidad EXACTA (id_usuario + fecha + hora).
 * Se usa para detectar duplicados antes de insertar.
 *
 * IMPORTANTE: Joi convierte el campo "fecha" a un objeto Date antes
 * de que llegue al servicio. Si le pasamos un Date a PostgreSQL,
 * se interpreta como UTC y luego ::date lo convierte con la zona
 * local, lo que puede desplazar la fecha un día.
 *
 * Por eso forzamos a convertir el Date a string "YYYY-MM-DD" antes
 * de pasarlo al SQL. Así la comparación es exacta.
 */
async function findExacta({ id_usuario, fecha, hora }) {
  // Convertimos la fecha a string "YYYY-MM-DD" sin importar
  // si llega como Date o como string.
  const fechaStr = fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);

  const [rows] = await sequelize.query(
    `SELECT * FROM disponibilidad
     WHERE id_usuario = $1
       AND fecha = $2::date
       AND hora = $3::time
     LIMIT 1`,
    {
      bind: [id_usuario, fechaStr, hora],
    }
  );
  return rows[0] || null;
}

async function create({ id_usuario, fecha, hora, estado }) {
  try {
    const nueva = await Disponibilidad.create({
      id_usuario,
      fecha,
      hora,
      estado: estado || 'disponible',
    });
    return {
      id_disponibilidad: nueva.id_disponibilidad,
      id_usuario: nueva.id_usuario,
      fecha: nueva.fecha,
      hora: nueva.hora,
      estado: nueva.estado,
    };
  } catch (error) {
    // disponibilidad.service.js sigue esperando el código de pg '23505'
    // para violaciones de unicidad, igual que con SQL puro.
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.code = '23505';
    }
    throw error;
  }
}

async function update(id_disponibilidad, cambios) {
  const disponibilidad = await Disponibilidad.findByPk(id_disponibilidad);
  if (!disponibilidad) return null;

  const camposPermitidos = ['id_usuario', 'fecha', 'hora', 'estado'];
  let huboCambios = false;
  for (const campo of camposPermitidos) {
    if (cambios[campo] !== undefined) {
      disponibilidad[campo] = cambios[campo];
      huboCambios = true;
    }
  }

  if (!huboCambios) {
    return findById(id_disponibilidad);
  }

  await disponibilidad.save();
  return {
    id_disponibilidad: disponibilidad.id_disponibilidad,
    id_usuario: disponibilidad.id_usuario,
    fecha: disponibilidad.fecha,
    hora: disponibilidad.hora,
    estado: disponibilidad.estado,
  };
}

async function remove(id_disponibilidad) {
  const disponibilidad = await Disponibilidad.findByPk(id_disponibilidad);
  if (!disponibilidad) return null;
  await disponibilidad.destroy();
  return { id_disponibilidad };
}

module.exports = {
  findAll,
  findPaginado,
  contarPorEstado,
  findById,
  findExacta,
  create,
  update,
  remove,
};