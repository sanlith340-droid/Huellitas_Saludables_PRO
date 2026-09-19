// app/services/mascota.service.js
const mascotaModel = require('../models/mascota.model');
const razaModel = require('../models/raza.model');
const AppError = require('../utils/AppError');

async function listar() {
  return mascotaModel.findAll();
}

async function obtenerPorId(id_mascota) {
  const mascota = await mascotaModel.findById(id_mascota);
  if (!mascota) {
    throw AppError.notFound(`No existe la mascota con id ${id_mascota}`);
  }
  return mascota;
}

async function crearConUsuario(datos, id_usuario) {
  const { nombre, fecha_nacimiento, especie, genero, id_raza } = datos;

  // Validar raza
  const raza = await razaModel.findById(id_raza);
  if (!raza) {
    throw AppError.notFound(`No existe la raza con id ${id_raza}`);
  }

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

  try {
    return await mascotaModel.crearConUsuario({
      nombre,
      fecha_nacimiento,
      especie,
      genero,
      id_raza,
      id_usuario
    });
  } catch (error) {
    if (error.code === '23505') {
      throw AppError.conflict('Ya existe una mascota con esos datos');
    }
    throw error;
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crearConUsuario,
};