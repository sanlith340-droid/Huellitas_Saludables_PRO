// app/controllers/raza.controller.js
/**
 * controllers/raza.controller.js
 * Controlador de razas (usado por el formulario de "nueva mascota").
 */

import razaModel from '../models/raza.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

const listar = asyncHandler(async (req, res) => {
  const razas = await razaModel.findAll();
  return ok(res, razas, 'Razas listadas correctamente');
});

export { listar };
export default { listar };
