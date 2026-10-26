// app/services/auth.service.js
/**
 * services/auth.service.js
 * Lógica de negocio para autenticación.
 */

const authModel = require('../models/auth.model');
const AppError = require('../utils/AppError');
const { generarToken } = require('../utils/jwt');
const { hashContrasena, verificarContrasena, esHashScrypt } = require('../utils/password');

async function login({ correo, contrasena }) {
  const usuario = await authModel.findByEmail(correo);

  if (!usuario) {
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  const passwordMatch = await verificarContrasena(contrasena, usuario.contrasena);

  if (!passwordMatch) {
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  // Migración best-effort: un fallo no debe bloquear un login ya verificado.
  if (!esHashScrypt(usuario.contrasena)) {
    try {
      const nuevoHash = await hashContrasena(contrasena);
      const actualizado = await authModel.updatePassword(usuario.id_usuario, nuevoHash);

      if (!actualizado) {
        console.error('[auth.service] No se pudo migrar la contraseña a hash');
      }
    } catch {
      console.error('[auth.service] No se pudo migrar la contraseña a hash');
    }
  }

  const { contrasena: _, ...usuarioSinPassword } = usuario;

  return {
    usuario: usuarioSinPassword,
    token: generarToken(usuario)
  };
}

async function registro(datosUsuario) {
  const {
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    tipo
  } = datosUsuario;

  const emailExists = await authModel.existsByEmail(correo);
  if (emailExists) {
    throw AppError.conflict('El correo electrónico ya está registrado');
  }

  const id_usuario = await authModel.generarIdUsuario('usuario');

  const hashedPassword = await hashContrasena(contrasena);

  const nuevoUsuario = await authModel.create({
    id_usuario,
    nombre,
    apellidos,
    telefono,
    direccion,
    correo,
    contrasena: hashedPassword,
    especializacion: null,
    tipo: tipo || 'principal',
    rol: 'usuario'
  });

  const { contrasena: _, ...usuarioSinPassword } = nuevoUsuario;

  return {
    usuario: usuarioSinPassword,
    token: generarToken(nuevoUsuario)
  };
}

async function registroAdmin(datosUsuario, adminId) {
  const {
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    rol
  } = datosUsuario;

  // 1. Validar que el administrador tenga permisos
  const admin = await authModel.findById(adminId);
  if (!admin || admin.rol !== 'admin') {
    throw AppError.forbidden('Solo los administradores pueden crear cuentas de otros roles');
  }

  // 2. Validar que el correo no esté registrado
  const emailExists = await authModel.existsByEmail(correo);
  if (emailExists) {
    throw AppError.conflict('El correo electrónico ya está registrado');
  }

  // 3. Generar ID automático
  const id_usuario = await authModel.generarIdUsuario(rol);

  const hashedPassword = await hashContrasena(contrasena);

  // 5. Determinar especialización y tipo SEGÚN EL ROL
  let especializacionFinal = null;
  let tipoFinal = null;

  if (rol === 'especialista') {
    especializacionFinal = especializacion;
  }

  // 6. Crear usuario
  const nuevoUsuario = await authModel.create({
    id_usuario,
    nombre,
    apellidos,
    telefono,
    direccion,
    correo,
    contrasena: hashedPassword,
    especializacion: especializacionFinal,
    tipo: tipoFinal,
    rol
  });

  // 7. Eliminar contraseña del objeto de respuesta
  const { contrasena: _, ...usuarioSinPassword } = nuevoUsuario;

  return {
    usuario: usuarioSinPassword,
    token: generarToken(nuevoUsuario)
  };
}

module.exports = {
  login,
  registro,
  registroAdmin
};