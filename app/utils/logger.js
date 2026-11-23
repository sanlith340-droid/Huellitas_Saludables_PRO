// app/utils/logger.js
/** Logger único de la aplicación con política de niveles por entorno. */
import pino from 'pino';

const entorno = process.env.NODE_ENV || 'development';
const level = entorno === 'production'
  ? 'error'
  : entorno === 'development'
    ? 'debug'
    : entorno === 'test'
      ? 'warn'
      : 'error';

const logger = pino({
  level,
  base: { service: 'huellitas-api', environment: entorno },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password', 'passwd', 'pwd', 'contrasena', 'contraseña', 'clave', 'secret',
      'token', 'accessToken', 'refreshToken', 'authorization', 'cookie', 'set-cookie',
      'apiKey', 'api_key', 'hash', 'correo', 'email', 'user', 'usuario', 'req', 'request', 'body',
      'id_usuario', 'nombre', 'apellidos', 'telefono', 'direccion', 'especializacion',
      '*.password', '*.passwd', '*.pwd', '*.contrasena', '*.contraseña', '*.clave', '*.secret',
      '*.token', '*.accessToken', '*.refreshToken', '*.authorization', '*.cookie', '*.set-cookie',
      '*.apiKey', '*.api_key', '*.hash', '*.correo', '*.email', '*.user', '*.usuario', '*.id_usuario',
      '*.nombre', '*.apellidos', '*.telefono', '*.direccion', '*.especializacion',
      'req.headers.authorization', 'req.headers.cookie', 'req.body', 'request.headers.authorization',
    ],
    censor: '[REDACTADO]',
  },
});

export default logger;
