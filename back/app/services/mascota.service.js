// app/services/mascota.service.js
import mascotaModel from '../models/mascota.model.js';
import razaModel from '../models/raza.model.js';
import AppError from '../utils/AppError.js';

async function listar(id_usuario) {
  return mascotaModel.findAll(id_usuario ? { id_usuario } : {});
}

async function obtenerPorId(id_mascota, solicitante = null) {
  // Un dueño solo puede consultar SUS mascotas. Las ajenas responden 404
  // genérico (igual que una inexistente) para no revelar que existen.
  if (solicitante?.rol === 'usuario') {
    const esPropia = await mascotaModel.perteneceAUsuario(id_mascota, solicitante.id);
    if (!esPropia) {
      throw AppError.notFound(`No existe la mascota con id ${id_mascota}`);
    }
  }
  const mascota = await mascotaModel.findById(id_mascota);
  if (!mascota) {
    throw AppError.notFound(`No existe la mascota con id ${id_mascota}`);
  }
  return mascota;
}

async function crearConUsuario(datos, id_usuario) {
  const { nombre, fecha_nacimiento, especie, genero, id_raza, raza_nombre, foto_url } = datos;

  // Validar especie
  const especiesPermitidas = ['perro', 'gato'];
  if (!especiesPermitidas.includes(especie)) {
    throw AppError.badRequest(`La especie debe ser: ${especiesPermitidas.join(', ')}`);
  }

  // Validar género
  const generosPermitidos = ['macho', 'hembra'];
  if (!generosPermitidos.includes(genero)) {
    throw AppError.badRequest(`El género debe ser: ${generosPermitidos.join(', ')}`);
  }

  const raza = raza_nombre
    ? await razaModel.findOrCreateByName(raza_nombre)
    : await razaModel.findById(id_raza);
  if (!raza) {
    throw AppError.notFound(`No existe la raza con id ${id_raza}`);
  }

  try {
    return await mascotaModel.crearConUsuario({
      nombre,
      fecha_nacimiento,
      especie,
      genero,
      id_raza: raza.id_raza,
      foto_url: foto_url || null,
      id_usuario,
    });
  } catch (error) {
    if (error?.code === 'MASCOTAS_LIMITE_ALCANZADO') {
      throw new AppError(
        'Has alcanzado el límite de 5 mascotas por usuario.',
        409,
        'MASCOTAS_LIMITE_ALCANZADO'
      );
    }
    if (error?.code === 'P2002') {
      throw AppError.conflict('Ya existe una mascota con esos datos');
    }
    if (error?.code === 'P2003') {
      throw AppError.badRequest('La referencia de raza o usuario no es válida');
    }
    throw error;
  }
}

export { listar, obtenerPorId, crearConUsuario };
export default { listar, obtenerPorId, crearConUsuario };
