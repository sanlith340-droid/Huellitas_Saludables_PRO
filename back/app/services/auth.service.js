// app/services/auth.service.js
/**
 * services/auth.service.js
 * Lógica de negocio para autenticación.
 */

const authModel = require('../models/auth.model');
const AppError = require('../utils/AppError');
const { generarToken } = require('../utils/jwt');

async function login({ correo, contrasena }) {
  console.log('[auth.service] Login para:', correo);

  const usuario = await authModel.findByEmail(correo);
  
  if (!usuario) {
    console.log('[auth.service] ❌ Usuario no encontrado');
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  console.log('[auth.service] ✅ Usuario encontrado:', usuario.id_usuario);

  // NOTA: En producción usar bcrypt.compare()
  const passwordMatch = contrasena === usuario.contrasena;
  
  if (!passwordMatch) {
    console.log('[auth.service] ❌ Contraseña incorrecta');
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  console.log('[auth.service] ✅ Contraseña correcta');

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

  console.log('[auth.service] Registro usuario:', correo);

  const emailExists = await authModel.existsByEmail(correo);
  if (emailExists) {
    throw AppError.conflict('El correo electrónico ya está registrado');
  }

  const id_usuario = await authModel.generarIdUsuario('usuario');

  // NOTA: En producción usar bcrypt.hash()
  const hashedPassword = contrasena;

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

  console.log('[auth.service] ✅ Usuario creado:', id_usuario);

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

  console.log('[auth.service] RegistroAdmin - Admin ID:', adminId);
  console.log('[auth.service] RegistroAdmin - Datos:', { nombre, correo, rol });

  // 1. Validar que el administrador tenga permisos
  const admin = await authModel.findById(adminId);
  if (!admin || admin.rol !== 'admin') {
    console.log('[auth.service] ❌ Admin no encontrado o no es admin');
    throw AppError.forbidden('Solo los administradores pueden crear cuentas de otros roles');
  }

  console.log('[auth.service] ✅ Admin verificado:', adminId);

  // 2. Validar que el correo no esté registrado
  const emailExists = await authModel.existsByEmail(correo);
  if (emailExists) {
    console.log('[auth.service] ❌ Email ya registrado');
    throw AppError.conflict('El correo electrónico ya está registrado');
  }

  // 3. Generar ID automático
  const id_usuario = await authModel.generarIdUsuario(rol);
  console.log('[auth.service] 📝 ID generado:', id_usuario);

  // 4. En producción: Hashear contraseña
  const hashedPassword = contrasena;

  // 5. Determinar especialización y tipo SEGÚN EL ROL
  let especializacionFinal = null;
  let tipoFinal = null;

  if (rol === 'especialista') {
    especializacionFinal = especializacion;
    console.log('[auth.service] 📝 Especialización:', especializacionFinal);
  }

  console.log('[auth.service] 📝 tipoFinal:', tipoFinal);

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

  console.log('[auth.service] ✅ Usuario creado:', id_usuario);

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