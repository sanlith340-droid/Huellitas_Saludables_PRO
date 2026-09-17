// app/controllers/raza.controller.js
/**
 * controllers/raza.controller.js
 * Controlador de razas (usado por el formulario de "nueva mascota").
 */

const razaModel = require('../models/raza.model');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');

const listar = asyncHandler(async (req, res) => {
  const razas = await razaModel.findAll();
  return ok(res, razas, 'Razas listadas correctamente');
});

module.exports = { listar };
