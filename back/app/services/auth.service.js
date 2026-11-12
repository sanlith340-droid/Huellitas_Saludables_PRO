// app/services/auth.service.js
/**
 * services/auth.service.js
 * Lógica de negocio para autenticación.
 */

import authModel from '../models/auth.model.js';
import AppError from '../utils/AppError.js';
import { generarToken } from '../utils/jwt.js';
import {
  hashContrasena,
  verificarContrasena,
  simularVerificacion,
  necesitaRehash,
  clasificarContrasenaGuardada,
} from '../utils/password.js';
import logger from '../utils/logger.js';

async function login({ correo, contrasena }) {
  const usuario = await authModel.findByEmail(correo);

  if (!usuario) {
    // Mismo costo que una verificación real para no revelar si el correo existe.
    await simularVerificacion(contrasena);
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  // bcrypt.compare() (o verificación scrypt heredada); nunca texto plano.
  const passwordMatch = await verificarContrasena(contrasena, usuario.contrasena);

  if (!passwordMatch) {
    if (clasificarContrasenaGuardada(usuario.contrasena) === 'texto_plano') {
      // Registro sin datos sensibles: indica que falta ejecutar la migración a bcrypt.
      logger.error(
        { event: 'auth.password_plaintext_pending_migration' },
        'Contraseña almacenada sin hash: ejecutar npm run passwords:migrate'
      );
    }
    throw AppError.unauthorized('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  // Migración best-effort a bcrypt (hash scrypt heredado o rondas insuficientes).
  // Un fallo no debe bloquear un login ya verificado.
  if (necesitaRehash(usuario.contrasena)) {
    try {
      const nuevoHash = await hashContrasena(contrasena);
      const actualizado = await authModel.updatePassword(usuario.id_usuario, nuevoHash);

      if (!actualizado) {
        logger.error({ event: 'auth.password_hash_migration_failed' }, 'No se pudo migrar el hash de contraseña');
      }
    } catch {
      logger.error({ event: 'auth.password_hash_migration_failed' }, 'No se pudo migrar el hash de contraseña');
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

export { login, registro, registroAdmin };
export default { login, registro, registroAdmin };
