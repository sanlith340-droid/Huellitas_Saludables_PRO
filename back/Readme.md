# 🐾 Huellitas Saludables — Backend (Módulo Citas + Disponibilidad)

Backend en **Node.js + Express**, conectado directamente a **PostgreSQL** (sin ORM, SQL puro con el driver `pg`), implementando el módulo de **Citas + Disponibilidad** según el modelo entidad-relación real del proyecto.

> ⚠️ **Importante**: El sistema está diseñado para **PostgreSQL**. No es compatible con MySQL.

---

## 📋 Tabla de Contenidos

- [Requisitos Funcionales](#-requisitos-funcionales)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Autenticación](#-autenticación)
- [Endpoints de la API](#-endpoints-de-la-api)
  - [Healthcheck](#-healthcheck)
  - [Disponibilidad](#-disponibilidad)
  - [Citas](#-citas)
  - [Usuarios](#-usuarios)
  - [Mascotas](#-mascotas)
- [Modelo de Datos](#-modelo-de-datos)
- [Flujo de Trabajo](#-flujo-de-trabajo)
- [Pruebas Manuales](#-pruebas-manuales)
- [Pendientes para Siguientes Fases](#-pendientes-para-siguientes-fases)
- [Licencia](#-licencia)

---

## ✅ Requisitos Funcionales

| RF | Requisito | Implementación |
|----|-----------|----------------|
| **RF07** | El dueño podrá solicitar citas veterinarias según disponibilidad del sistema. | `POST /api/citas` → `services/cita.service.js#crear` |
| **RF08** | El agendador podrá gestionar la disponibilidad y organizar la agenda de los veterinarios. | `routes/disponibilidad.routes.js` (CRUD completo) |
| **RF09** | El agendador podrá notificar a los veterinarios sobre sus citas, cambios y disponibilidad horaria. | `services/notificacion.service.js` (stub con logs) |
| **RF10** | El veterinario podrá consultar las citas que tiene asignadas. | `GET /api/citas/especialista/:id_especialista` |
| **RF15** | Registro de acciones de administradores/agendadores para auditoría. | `middlewares/auditLog.js` (log estructurado) |

---

## 🛠 Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | v16+ | Entorno de ejecución |
| **Express.js** | v4.18+ | Framework web |
| **PostgreSQL** | v12+ | Base de datos relacional |
| **pg** | v8.10+ | Driver nativo de PostgreSQL |
| **Joi** | v17.9+ | Validación de datos |
| **Swagger** | v6.2+ | Documentación de API |
| **Nodemon** | v2.0+ | Recarga automática en desarrollo |

---

## 📁 Estructura del Proyecto

'''
backend-huellitas/
├── .env # Variables de entorno
├── .env.example # Ejemplo de variables de entorno
├── package.json # Dependencias del proyecto
├── server.js # Punto de entrada del servidor
├── README.md # Documentación del proyecto
│
└── src/
├── app.js # Configuración principal de Express
│
├── config/
│ ├── database.js # Pool de conexiones a PostgreSQL
│ └── swagger.js # Configuración de Swagger
│
├── controllers/ # Controladores (HTTP ↔ Service)
│ ├── cita.controller.js
│ ├── disponibilidad.controller.js
│ ├── mascota.controller.js
│ └── usuario.controller.js
│
├── services/ # Servicios (Lógica de negocio)
│ ├── cita.service.js
│ ├── disponibilidad.service.js
│ ├── mascota.service.js
│ ├── usuario.service.js
│ └── notificacion.service.js
│
├── models/ # Modelos (SQL puro)
│ ├── cita.model.js
│ ├── disponibilidad.model.js
│ ├── mascota.model.js
│ └── usuario.model.js
│
├── routes/ # Rutas (Endpoints)
│ ├── index.js # Registro central de rutas
│ ├── cita.routes.js
│ ├── disponibilidad.routes.js
│ ├── mascota.routes.js
│ └── usuario.routes.js
│
├── middlewares/ # Middlewares
│ ├── identifyUser.js # Autenticación por headers
│ ├── auditLog.js # Registro de auditoría
│ ├── errorHandler.js # Manejo central de errores
│ └── validate.js # Validación con Joi
│
├── schemas/ # Esquemas de validación Joi
│ ├── cita.schema.js
│ └── disponibilidad.schema.js
│
└── utils/ # Utilidades
├── AppError.js # Errores personalizados
├── asyncHandler.js # Manejador de async/await
└── response.js # Respuestas estandarizadas
'''

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/huellitas-saludables-api.git
cd huellitas-saludables-api

npm install

cp .env.example .env

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=*

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyectohs
DB_USER=postgres
DB_PASSWORD=tu_contraseña


# 1. Crear base de datos
psql -U postgres -f database/0.CREAR_DATABASE.sql

# 2. Crear tablas
psql -U postgres -d proyectohs -f database/1.CREAR_TABLAS.sql

# 3. Crear funciones y triggers
psql -U postgres -d proyectohs -f database/2.FUNCIONES_DISPARADORES.sql

# 4. Insertar datos de prueba
psql -U postgres -d proyectohs -f database/3.INSERTAR_USUARIOS.sql
psql -U postgres -d proyectohs -f database/4.INSERTAR_MASCOTAS.sql
psql -U postgres -d proyectohs -f database/5.INSERTAR_DISPONILBIDAD.sql


# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start

```

##  ramas navegacion 
////// 

git branch -r : ver ramas remotas git

git fetch --all : actuliza el remoto

git branch commonjs origin/commonjs

git add .

git commit -m "lista"

///

git checkout main

git branch

git checkout "commit"

git checkout -b "" // crear rama

git branch : ver ramas

//