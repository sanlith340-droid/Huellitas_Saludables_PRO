// app/app.js
/**
 * app.js
 * Configuración principal de Express.
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './config/swagger.js';
import apiRoutes from './routes/index.js';

import { identifyUser } from './middlewares/identifyUser.js';
import auditLog from './middlewares/auditLog.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { testConnection } from './config/prisma.js';
import { ok } from './utils/response.js';
import AppError from './utils/AppError.js';
import asyncHandler from './utils/asyncHandler.js';

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
app.get('/health', asyncHandler(async (_req, res) => {
  try {
    const now = await testConnection();
    return ok(res, { db_time: now }, 'Servicio y base de datos activos');
  } catch {
    throw AppError.serviceUnavailable('La base de datos no está disponible temporalmente.');
  }
}));

// 4. API (rutas) - identifyUser ANTES de apiRoutes
app.use('/api', identifyUser, auditLog, apiRoutes);

// 5. Manejo de errores (siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
