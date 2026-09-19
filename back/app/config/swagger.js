// app/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Huellitas Saludables API',
      version: '1.0.0',
      description: 'API para gestión de mascotas, usuarios, citas y disponibilidad veterinaria',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'ID del usuario autenticado (ej: USU001, ESP001, REC001)'
        },
        apiKeyRole: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-role',
          description: 'Rol del usuario (usuario, recepcionista, especialista, admin)'
        }
      },
      parameters: {
        UserId: {
          name: 'x-user-id',
          in: 'header',
          required: true,
          description: 'ID del usuario autenticado (ej: USU001, ESP001, REC001)',
          schema: { type: 'string' },
          example: 'USU001',
        },
        UserRole: {
          name: 'x-user-role',
          in: 'header',
          required: true,
          description: 'Rol del usuario',
          schema: {
            type: 'string',
            enum: ['usuario', 'recepcionista', 'especialista', 'admin'],
          },
          example: 'usuario',
        },
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id_usuario: { type: 'string', example: 'USU001' },
            nombre: { type: 'string', example: 'Juan' },
            apellidos: { type: 'string', example: 'Perez' },
            telefono: { type: 'string', example: '3001234567' },
            correo: { type: 'string', example: 'juan@email.com' },
            direccion: { type: 'string', example: 'Calle 123' },
            especializacion: { type: 'string', example: 'Medicina Veterinaria' },
            tipo: { type: 'string', enum: ['principal', 'acudiente'], example: 'principal' },
            rol: { type: 'string', enum: ['usuario', 'recepcionista', 'especialista', 'admin'] },
            fecha_registro: { type: 'string', format: 'date-time' }
          }
        },
        Mascota: {
          type: 'object',
          properties: {
            id_mascota: { type: 'integer', example: 1 },
            mascota: { type: 'string', example: 'Firulais' },
            fecha_nacimiento: { type: 'string', format: 'date', example: '2023-05-15' },
            especie: { type: 'string', example: 'perro' },
            genero: { type: 'string', example: 'macho' },
            raza: {
              type: 'object',
              properties: {
                id_raza: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Labrador' }
              }
            },
            propietarios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id_usuario: { type: 'string', example: 'USU001' },
                  nombre: { type: 'string', example: 'Juan' },
                  apellidos: { type: 'string', example: 'Perez' },
                  telefono: { type: 'string', example: '3001234567' },
                  correo: { type: 'string', example: 'juan@email.com' }
                }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['correo', 'contrasena'],
          properties: {
            correo: { type: 'string', example: 'juan@email.com' },
            contrasena: { type: 'string', example: '123456' },
          },
        },
        RegistroRequest: {
          type: 'object',
          required: ['nombre', 'apellidos', 'telefono', 'correo', 'direccion', 'contrasena'],
          properties: {
            nombre: { type: 'string', example: 'Juan' },
            apellidos: { type: 'string', example: 'Perez' },
            telefono: { type: 'string', example: '3001234567' },
            correo: { type: 'string', example: 'juan@email.com' },
            direccion: { type: 'string', example: 'Calle 123' },
            contrasena: { type: 'string', example: '123456' },
            tipo: { type: 'string', enum: ['principal', 'acudiente'], default: 'principal' },
          },
        },
        RegistroAdminRequest: {
          type: 'object',
          required: ['nombre', 'apellidos', 'telefono', 'correo', 'direccion', 'contrasena', 'rol'],
          properties: {
            nombre: { type: 'string', example: 'Carlos' },
            apellidos: { type: 'string', example: 'Gomez' },
            telefono: { type: 'string', example: '3001234567' },
            correo: { type: 'string', example: 'carlos@huellitas.com' },
            direccion: { type: 'string', example: 'Calle 123' },
            contrasena: { type: 'string', example: '123456' },
            especializacion: { type: 'string', example: 'Medicina Felina' },
            tipo: { type: 'string', enum: ['principal', 'acudiente'] },
            rol: { type: 'string', enum: ['admin', 'especialista', 'recepcionista'] },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login exitoso' },
            data: {
              type: 'object',
              properties: {
                usuario: { $ref: '#/components/schemas/Usuario' },
                token: { type: 'string', example: 'mock-token-USU001-...' }
              }
            }
          }
        },
        Disponibilidad: {
          type: 'object',
          properties: {
            id_disponibilidad: { type: 'integer', example: 1 },
            id_usuario: { type: 'string', example: 'ESP001' },
            fecha: { type: 'string', format: 'date', example: '2026-08-22' },
            hora: { type: 'string', example: '10:00:00' },
            estado: { type: 'string', enum: ['disponible', 'ocupado'], example: 'disponible' },
            especialista_nombre: { type: 'string', example: 'Alejandro' },
            especialista_apellidos: { type: 'string', example: 'Castillo' },
            especializacion: { type: 'string', example: 'Medicina Veterinaria General' },
          },
        },
        CrearDisponibilidadRequest: {
          type: 'object',
          required: ['id_usuario', 'fecha', 'hora'],
          properties: {
            id_usuario: { type: 'string', example: 'ESP001' },
            fecha: { type: 'string', format: 'date', example: '2026-08-22' },
            hora: { type: 'string', example: '10:00:00' },
            estado: { type: 'string', enum: ['disponible', 'ocupado'], default: 'disponible' },
          },
        },
        ActualizarDisponibilidadRequest: {
          type: 'object',
          properties: {
            id_usuario: { type: 'string', example: 'ESP001' },
            fecha: { type: 'string', format: 'date', example: '2026-08-22' },
            hora: { type: 'string', example: '10:00:00' },
            estado: { type: 'string', enum: ['disponible', 'ocupado'] }
          }
        },
        CrearCitaRequest: {
          type: 'object',
          required: ['id_mascota', 'id_disponibilidad'],
          properties: {
            id_mascota: { type: 'integer', example: 1 },
            id_disponibilidad: { type: 'integer', example: 1 },
            motivo: { type: 'string', maxLength: 200, example: 'Consulta de control' },
          },
        },
        Cita: {
          type: 'object',
          properties: {
            id_cita: { type: 'integer', example: 1 },
            id_recepcionista: { type: 'string', example: 'REC001' },
            id_mascota: { type: 'integer', example: 1 },
            id_disponibilidad: { type: 'integer', example: 1 },
            motivo: { type: 'string', example: 'Consulta de control' },
            estado: { type: 'string', enum: ['pendiente', 'confirmado', 'cancelado', 'atendido'] },
            mascota_nombre: { type: 'string', example: 'Max' },
            fecha_cita: { type: 'string', format: 'date' },
            hora_cita: { type: 'string' },
            especialista_nombre: { type: 'string' },
            especialista_apellidos: { type: 'string' },
          },
        },
        HistoriaClinica: {
          type: 'object',
          properties: {
            id_historia_clinica: { type: 'integer', example: 1 },
            id_cita: { type: 'integer', example: 1 },
            peso: { type: 'number', example: 18.5 },
            diagnostico: { type: 'string', example: 'Otitis externa leve' },
            tratamiento: { type: 'string', example: 'Limpieza del conducto auditivo' },
            observaciones: { type: 'string', example: 'Se recomienda control en 10 días' },
            fecha_registro: { type: 'string', format: 'date-time' },
            mascota_nombre: { type: 'string', example: 'Max' },
            mascota_especie: { type: 'string', example: 'perro' },
            especialista_id: { type: 'string', example: 'ESP001' },
            especialista_nombre: { type: 'string', example: 'Alejandro' },
            especialista_apellidos: { type: 'string', example: 'Castillo' },
          },
        },
        CrearHistoriaRequest: {
          type: 'object',
          required: ['id_cita', 'diagnostico', 'tratamiento'],
          properties: {
            id_cita: { type: 'integer', example: 1 },
            peso: { type: 'number', example: 18.5 },
            diagnostico: { type: 'string', example: 'Otitis externa leve' },
            tratamiento: { type: 'string', example: 'Limpieza del conducto auditivo' },
            observaciones: { type: 'string', example: 'Se recomienda control en 10 días' },
          },
        },
        ActualizarHistoriaRequest: {
          type: 'object',
          properties: {
            peso: { type: 'number', example: 19.0 },
            diagnostico: { type: 'string', example: 'Otitis externa moderada' },
            tratamiento: { type: 'string', example: 'Limpieza profunda y antibióticos' },
            observaciones: { type: 'string', example: 'Control en 7 días' },
          },
        },
      },
    },
    paths: {
      // ============================================================
      // AUTH
      // ============================================================
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Login exitoso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            401: { description: 'Credenciales inválidas' },
            400: { description: 'Datos inválidos' },
          },
        },
      },
      '/api/auth/registro': {
        post: {
          summary: 'Registrar nuevo usuario',
          tags: ['Auth'],
          description: 'Registro público para usuarios normales (rol "usuario" por defecto)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Usuario registrado exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            409: { description: 'El correo ya está registrado' },
            400: { description: 'Datos inválidos' },
          },
        },
      },
      '/api/auth/registro-admin': {
        post: {
          summary: 'Registrar usuario por administrador',
          tags: ['Auth'],
          description: 'Solo administradores pueden crear cuentas de admin, especialista o recepcionista',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistroAdminRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Usuario creado exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            403: { description: 'Solo administradores pueden crear cuentas' },
            409: { description: 'El correo ya está registrado' },
          },
        },
      },
      '/api/auth/perfil': {
        get: {
          summary: 'Obtener perfil del usuario autenticado',
          tags: ['Auth'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          responses: {
            200: {
              description: 'Perfil obtenido correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Usuario' },
                    },
                  },
                },
              },
            },
            401: { description: 'No autenticado' },
          },
        },
      },
      '/api/auth/test': {
        get: {
          summary: 'Endpoint de prueba de autenticación',
          tags: ['Auth'],
          responses: {
            200: {
              description: 'Rutas de autenticación funcionando',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Auth routes working!' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ============================================================
      // DISPONIBILIDAD
      // ============================================================
      '/api/disponibilidad': {
        get: {
          summary: 'Listar disponibilidades',
          tags: ['Disponibilidad'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id_usuario',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtrar por ID del especialista',
            },
            {
              name: 'fecha',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filtrar por fecha',
            },
            {
              name: 'estado',
              in: 'query',
              schema: { type: 'string', enum: ['disponible', 'ocupado'] },
              description: 'Filtrar por estado',
            },
          ],
          responses: {
            200: {
              description: 'Disponibilidades listadas correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Disponibilidad' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Crear disponibilidad',
          tags: ['Disponibilidad'],
          description: 'Solo recepcionistas y administradores',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CrearDisponibilidadRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Disponibilidad creada correctamente' },
            403: { description: 'No tiene permisos' },
            409: { description: 'Conflicto - ya existe' },
          },
        },
      },
      '/api/disponibilidad/{id}': {
        get: {
          summary: 'Obtener disponibilidad por ID',
          tags: ['Disponibilidad'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la disponibilidad'
            }
          ],
          responses: {
            200: {
              description: 'Disponibilidad encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Disponibilidad' }
                    }
                  }
                }
              }
            },
            404: { description: 'Disponibilidad no encontrada' }
          }
        },
        put: {
          summary: 'Actualizar disponibilidad',
          tags: ['Disponibilidad'],
          description: 'Solo recepcionistas y administradores',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActualizarDisponibilidadRequest' }
              }
            }
          },
          responses: {
            200: { description: 'Disponibilidad actualizada correctamente' },
            403: { description: 'No tiene permisos' },
            404: { description: 'Disponibilidad no encontrada' },
            409: { description: 'Conflicto - no se puede modificar una disponibilidad ocupada' }
          }
        },
        delete: {
          summary: 'Eliminar disponibilidad',
          tags: ['Disponibilidad'],
          description: 'Solo recepcionistas y administradores. No se puede eliminar si está ocupada.',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Disponibilidad eliminada correctamente' },
            403: { description: 'No tiene permisos' },
            404: { description: 'Disponibilidad no encontrada' },
            409: { description: 'No se puede eliminar una disponibilidad ocupada' }
          }
        }
      },
      // ============================================================
      // CITAS
      // ============================================================
      '/api/citas': {
        get: {
          summary: 'Listar citas',
          tags: ['Citas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'estado',
              in: 'query',
              schema: { type: 'string', enum: ['pendiente', 'confirmado', 'cancelado', 'atendido'] },
            },
            {
              name: 'fecha',
              in: 'query',
              schema: { type: 'string', format: 'date' },
            },
            {
              name: 'id_mascota',
              in: 'query',
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: {
              description: 'Citas listadas correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Cita' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Crear cita',
          tags: ['Citas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CrearCitaRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Cita creada correctamente' },
            403: { description: 'La mascota no pertenece al usuario' },
            404: { description: 'Disponibilidad no encontrada' },
            409: { description: 'Conflicto - disponibilidad ocupada' },
          },
        },
      },
      '/api/citas/{id}': {
        get: {
          summary: 'Obtener cita por ID',
          tags: ['Citas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: {
              description: 'Cita encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Cita' },
                    },
                  },
                },
              },
            },
            404: { description: 'Cita no encontrada' },
          },
        },
        put: {
          summary: 'Editar cita',
          tags: ['Citas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id_mascota: { type: 'integer', example: 2 },
                    id_disponibilidad: { type: 'integer', example: 5 },
                    motivo: { type: 'string', example: 'Consulta de urgencia' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Cita editada correctamente' },
            403: { description: 'No tienes permiso para modificar esta cita porque no te pertenece' },
            404: { description: 'Cita no encontrada' },
            409: { description: 'Conflicto' },
          },
        },
      },
      '/api/citas/{id}/cancelar': {
        patch: {
          summary: 'Cancelar cita',
          tags: ['Citas'],
          description: 'Cancela una cita y libera la disponibilidad',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'Cita cancelada correctamente' },
            403: { description: 'No tienes permiso para cancelar esta cita porque no te pertenece' },
            404: { description: 'Cita no encontrada' },
            409: { description: 'Conflicto - cita ya cancelada' },
          },
        },
      },
      '/api/citas/especialista/{id_especialista}': {
        get: {
          summary: 'Listar citas de un especialista',
          tags: ['Citas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id_especialista',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Citas del especialista listadas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Cita' },
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Especialista no encontrado' },
          },
        },
      },
      // ============================================================
      // USUARIOS
      // ============================================================
      '/api/usuarios/especialistas': {
        get: {
          summary: 'Listar especialistas',
          tags: ['Usuarios'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          responses: {
            200: {
              description: 'Especialistas listados correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Usuario' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/usuarios/{documento}': {
        get: {
          summary: 'Buscar usuario por documento',
          tags: ['Usuarios'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'documento',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID del usuario (ej: USU001)',
            },
          ],
          responses: {
            200: {
              description: 'Usuario encontrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Usuario' },
                    },
                  },
                },
              },
            },
            404: { description: 'Usuario no encontrado' },
          },
        },
      },
      // ============================================================
      // MASCOTAS
      // ============================================================
      '/api/mascotas': {
        get: {
          summary: 'Listar todas las mascotas',
          tags: ['Mascotas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          responses: {
            200: {
              description: 'Mascotas listadas correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Mascota' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Registrar una nueva mascota',
          tags: ['Mascotas'],
          description: 'Crea una mascota y la asigna automáticamente al usuario autenticado (rol usuario o admin)',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'fecha_nacimiento', 'especie', 'genero', 'id_raza'],
                  properties: {
                    nombre: { type: 'string', example: 'Firulais' },
                    fecha_nacimiento: { type: 'string', format: 'date', example: '2023-05-15' },
                    especie: { type: 'string', enum: ['perro', 'gato'], example: 'perro' },
                    genero: { type: 'string', enum: ['macho', 'hembra'], example: 'macho' },
                    id_raza: { type: 'integer', example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Mascota registrada exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Mascota registrada exitosamente' },
                      data: { $ref: '#/components/schemas/Mascota' }
                    }
                  }
                }
              }
            },
            400: { description: 'Datos inválidos' },
            401: { description: 'Faltan headers de autenticación' },
            403: { description: 'Solo usuarios pueden registrar mascotas' },
            404: { description: 'Raza no encontrada' },
            409: { description: 'Conflicto (mascota duplicada)' }
          }
        }
      },
      '/api/mascotas/{id}': {
        get: {
          summary: 'Obtener mascota por ID',
          tags: ['Mascotas'],
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: {
              description: 'Mascota encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Mascota' },
                    },
                  },
                },
              },
            },
            404: { description: 'Mascota no encontrada' },
          },
        },
      },
      // ============================================================
      // HISTORIA CLÍNICA - SOLO ESPECIALISTAS
      // ============================================================
      '/api/historia': {
        get: {
          summary: 'Listar historias clínicas',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS - Lista historias con filtros',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id_mascota',
              in: 'query',
              schema: { type: 'integer' },
              description: 'Filtrar por ID de mascota',
            },
            {
              name: 'id_especialista',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtrar por ID del especialista',
            },
            {
              name: 'fecha_inicio',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Fecha de inicio (YYYY-MM-DD)',
            },
            {
              name: 'fecha_fin',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Fecha de fin (YYYY-MM-DD)',
            },
          ],
          responses: {
            200: {
              description: 'Historias clínicas listadas correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/HistoriaClinica' },
                      },
                    },
                  },
                },
              },
            },
            403: { description: 'Solo especialistas pueden listar historias' },
          },
        },
        post: {
          summary: 'Crear historia clínica',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS - Crea una nueva historia clínica',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CrearHistoriaRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Historia clínica creada correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/HistoriaClinica' },
                    },
                  },
                },
              },
            },
            403: { description: 'Solo especialistas pueden crear historias' },
            404: { description: 'Cita no encontrada' },
            409: { description: 'La cita ya tiene una historia clínica' },
          },
        },
      },
      '/api/historia/{id}': {
        get: {
          summary: 'Obtener historia clínica por ID',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la historia clínica',
            },
          ],
          responses: {
            200: {
              description: 'Historia clínica encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/HistoriaClinica' },
                    },
                  },
                },
              },
            },
            404: { description: 'Historia clínica no encontrada' },
          },
        },
        put: {
          summary: 'Actualizar historia clínica',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS - Solo el especialista dueño puede actualizar',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la historia clínica',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActualizarHistoriaRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Historia clínica actualizada correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/HistoriaClinica' },
                    },
                  },
                },
              },
            },
            403: { description: 'No tiene permisos para modificar esta historia' },
            404: { description: 'Historia clínica no encontrada' },
          },
        },
      },
      '/api/historia/mascota/{id_mascota}': {
        get: {
          summary: 'Obtener historias por mascota',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id_mascota',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la mascota',
            },
          ],
          responses: {
            200: {
              description: 'Historias de la mascota listadas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/HistoriaClinica' },
                      },
                    },
                  },
                },
              },
            },
            403: { description: 'Solo especialistas pueden ver historias' },
          },
        },
      },
      '/api/historia/cita/{id_cita}': {
        get: {
          summary: 'Obtener historia por cita',
          tags: ['Historia Clínica'],
          description: 'SOLO ESPECIALISTAS',
          security: [{ apiKey: [] }],
          parameters: [
            { $ref: '#/components/parameters/UserId' },
            { $ref: '#/components/parameters/UserRole' },
            {
              name: 'id_cita',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la cita',
            },
          ],
          responses: {
            200: {
              description: 'Historia de la cita encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/HistoriaClinica' },
                    },
                  },
                },
              },
            },
            404: { description: 'No hay historia para esta cita' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;