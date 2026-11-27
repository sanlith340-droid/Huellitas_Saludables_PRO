// app/controllers/raza.controller.js
/**
 * controllers/raza.controller.js
 * Controlador de razas (usado por el formulario de "nueva mascota").
 */

import razaModel from '../models/raza.model.js';
import razaService from '../services/raza.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';

const ESPECIES_PERMITIDAS = ['perro', 'gato'];

const listar = asyncHandler(async (req, res) => {
  const razas = await razaModel.findAll();
  return ok(res, razas, 'Razas listadas correctamente');
});

const catalogo = asyncHandler(async (req, res) => {
  const especie = req.query.especie;
  if (typeof especie !== 'string' || !ESPECIES_PERMITIDAS.includes(especie)) {
    throw AppError.badRequest('La especie debe ser perro o gato.');
  }
  const resultado = await razaService.listarPorEspecie(especie);
  return ok(res, resultado, 'Catálogo de razas cargado correctamente');
});

export { listar, catalogo };
export default { listar, catalogo };
