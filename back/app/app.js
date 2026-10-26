// app/app.js
/**
 * app.js
 * Configuración principal de Express.
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const apiRoutes = require('./routes');

const { identifyUser } = require('./middlewares/identifyUser');
const auditLog = require('./middlewares/auditLog');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { testConnection } = require('./config/database');
const { ok } = require('./utils/response');
const AppError = require('./utils/AppError');

const origenesPermitidos = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

const app = express();

// 1. Swagger (documentación)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2. Middlewares globales
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origenesPermitidos.includes(origin)) {
      return callback(null, true);
    }

    return callback(AppError.forbidden('Origen no autorizado por CORS'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Healthcheck (ruta pública)
app.get('/health', async (_req, res) => {
  try {
    const now = await testConnection();
    return ok(res, { db_time: now }, 'Servicio y base de datos activos');
  } catch (err) {
    const nombre = typeof err?.name === 'string' ? err.name : 'Error';
    const codigo = typeof err?.code === 'string' ? err.code : 'SIN_CODIGO';
    console.error(`[health] Base de datos no disponible (${nombre}/${codigo})`);

    return res.status(503).json({
      success: false,
      message: 'Sin conexión a la base de datos'
    });
  }
});

// 4. API (rutas) - identifyUser ANTES de apiRoutes
app.use('/api', identifyUser, auditLog, apiRoutes);

// 5. Manejo de errores (siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;