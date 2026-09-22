# Vas a documentar todo lo que hagas
# INTEGRACIÓN DE ORM (SEQUELIZE) – ESTRUCTURA ACTUAL

## Manteniendo la organización existente y añadiendo migraciones y seeders

---

##  ESTRUCTURA FINAL CON ORM

```
C:.
├───back
│   ├───app
│   │   ├───config
│   │   │   ├───database.js          # MODIFICADO: ahora usa Sequelize
│   │   │   └───swagger.js
│   │   ├───controllers              # SIN CAMBIOS (se mantienen igual)
│   │   ├───middlewares              # SIN CAMBIOS
│   │   ├───models                   # MODIFICADO: ahora son modelos Sequelize
│   │   │   ├───index.js             # NUEVO: carga de modelos y relaciones
│   │   │   ├───usuario.model.js     # MODIFICADO: modelo Sequelize
│   │   │   ├───mascota.model.js     # MODIFICADO
│   │   │   ├───disponibilidad.model.js
│   │   │   ├───cita.model.js
│   │   │   ├───historia.model.js
│   │   │   └───raza.model.js
│   │   ├───routes                   # SIN CAMBIOS (siguen usando servicios)
│   │   ├───schemas                  # SIN CAMBIOS
│   │   ├───services                 # MODIFICADO: usan Sequelize en lugar de SQL puro
│   │   └───utils                    # SIN CAMBIOS
│   ├───migrations                   # NUEVO: migraciones de Sequelize
│   │   ├───20240101000000-create-usuario.js
│   │   ├───20240101000001-create-mascota.js
│   │   ├───20240101000002-create-disponibilidad.js
│   │   ├───20240101000003-create-cita.js
│   │   ├───20240101000004-create-historia.js
│   │   └───20240101000005-create-raza.js
│   ├───seeders                      # NUEVO: datos de prueba
│   │   └───20240101000000-demo-data.js
│   └───.sequelizerc                 # NUEVO: configuración de Sequelize CLI
├───database
│   └───data_jesus                   # (opcional: scripts SQL antiguos, ya no necesarios)
└───front
    └───...
```

---

##  PASOS PARA IMPLEMENTAR ORM

### 1. INSTALAR DEPENDENCIAS

```bash
cd back
npm install sequelize pg pg-hstore
npm install --save-dev sequelize-cli
```

### 2. CREAR ARCHIVO `.sequelizerc` EN LA RAÍZ DE `back/`

```javascript
// back/.sequelizerc
const path = require('path');

module.exports = {
  'config': path.resolve('app/config', 'database.js'),
  'models-path': path.resolve('app/models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

### 3. MODIFICAR `app/config/database.js`

**Antes (con pg):**
```javascript
const { Pool } = require('pg');
const pool = new Pool({ ... });
module.exports = { pool, query, getClient, testConnection };
```

**Después (con Sequelize):**
```javascript
// app/config/database.js (Sequelize)
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'proyectohs',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Función para probar conexión (compatible con el healthcheck)
async function testConnection() {
  await sequelize.authenticate();
  const result = await sequelize.query('SELECT NOW() AS now', { type: sequelize.QueryTypes.SELECT });
  return result[0].now;
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  // query se puede emular con sequelize.query
  query: (sql, params) => sequelize.query(sql, { replacements: params, type: sequelize.QueryTypes.SELECT }),
  getClient: () => sequelize, // solo para compatibilidad
};
```

### 4. CREAR `app/models/index.js`

```javascript
// app/models/index.js
const { sequelize } = require('../config/database');
const Usuario = require('./usuario.model');
const Mascota = require('./mascota.model');
const Raza = require('./raza.model');
const Disponibilidad = require('./disponibilidad.model');
const Cita = require('./cita.model');
const HistoriaClinica = require('./historia.model');

// ============================================================
// RELACIONES
// ============================================================

// Usuario ↔ Mascota (N:M a través de usuario_mascota)
Usuario.belongsToMany(Mascota, {
  through: 'usuario_mascota',
  foreignKey: 'id_usuario',
  otherKey: 'id_mascota',
  timestamps: false,
});
Mascota.belongsToMany(Usuario, {
  through: 'usuario_mascota',
  foreignKey: 'id_mascota',
  otherKey: 'id_usuario',
  timestamps: false,
});

// Mascota ↔ Raza (N:1)
Mascota.belongsTo(Raza, { foreignKey: 'id_raza' });
Raza.hasMany(Mascota, { foreignKey: 'id_raza' });

// Usuario ↔ Disponibilidad (1:N, especialista)
Usuario.hasMany(Disponibilidad, { foreignKey: 'id_usuario' });
Disponibilidad.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Disponibilidad ↔ Cita (1:1)
Disponibilidad.hasOne(Cita, { foreignKey: 'id_disponibilidad' });
Cita.belongsTo(Disponibilidad, { foreignKey: 'id_disponibilidad' });

// Mascota ↔ Cita (1:N)
Mascota.hasMany(Cita, { foreignKey: 'id_mascota' });
Cita.belongsTo(Mascota, { foreignKey: 'id_mascota' });

// Usuario ↔ Cita (recepcionista)
Usuario.hasMany(Cita, { foreignKey: 'id_recepcionista', as: 'CitasComoRecepcionista' });
Cita.belongsTo(Usuario, { foreignKey: 'id_recepcionista', as: 'Recepcionista' });

// Cita ↔ HistoriaClinica (1:1)
Cita.hasOne(HistoriaClinica, { foreignKey: 'id_cita' });
HistoriaClinica.belongsTo(Cita, { foreignKey: 'id_cita' });

module.exports = {
  sequelize,
  Usuario,
  Mascota,
  Raza,
  Disponibilidad,
  Cita,
  HistoriaClinica,
};
```

### 5. CONVERTIR `app/models/usuario.model.js` A SEQUELIZE

**Antes (SQL puro):**
```javascript
// models/usuario.model.js (SQL puro)
const { query } = require('../config/database');
async function findById(id) { ... }
module.exports = { findById, ... };
```

**Después (Sequelize):**
```javascript
// app/models/usuario.model.js (Sequelize)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  direccion: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  especializacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  rol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'usuario',
  },
}, {
  tableName: 'usuario',
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: false,
});

module.exports = Usuario;
```

### 6. CREAR MIGRACIONES (ejemplo `migrations/20240101000000-create-usuario.js`)

```javascript
// migrations/20240101000000-create-usuario.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuario', {
      id_usuario: {
        type: Sequelize.STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      correo: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      direccion: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      especializacion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      rol: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'usuario',
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('usuario');
  }
};
```

### 7. CREAR SEEDERS (ejemplo `seeders/20240101000000-demo-data.js`)

```javascript
// seeders/20240101000000-demo-data.js
'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('usuario', [
      {
        id_usuario: 'USU001',
        nombre: 'Juan',
        apellidos: 'Perez',
        telefono: '3001234567',
        correo: 'juan@email.com',
        direccion: 'Calle 123',
        contrasena: '123456', // En producción usar hash
        rol: 'usuario',
        tipo: 'principal',
      },
      {
        id_usuario: 'ESP001',
        nombre: 'Alejandro',
        apellidos: 'Castillo',
        telefono: '3004444444',
        correo: 'alejandro@huellitas.com',
        direccion: 'Calle 4',
        contrasena: '123456',
        especializacion: 'Medicina General',
        rol: 'especialista',
      },
      // ... más usuarios
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('usuario', null, {});
  }
};
```

### 8. ADAPTAR `app/services` PARA USAR SEQUELIZE

**Ejemplo de `auth.service.js` (fragmento):**

```javascript
// app/services/auth.service.js (con Sequelize)
const { Usuario } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash.util'); // implementar después
const AppError = require('../utils/AppError');

async function login({ correo, contrasena }) {
  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) throw AppError.unauthorized('Credenciales inválidas');
  
  const match = await comparePassword(contrasena, usuario.contrasena);
  if (!match) throw AppError.unauthorized('Credenciales inválidas');
  
  // ... generar JWT y devolver
}
```

### 9. ACTUALIZAR `package.json` SCRIPTS

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "migrate": "npx sequelize-cli db:migrate",
  "seed": "npx sequelize-cli db:seed:all",
  "migrate:undo": "npx sequelize-cli db:migrate:undo"
}
```

### 10. EJECUTAR MIGRACIONES

```bash
# Crear la base de datos si no existe (ya debería existir)
npx sequelize-cli db:migrate
# Cargar datos de prueba
npx sequelize-cli db:seed:all
```

---

##  ARCHIVOS QUE SE MANTIENEN SIN CAMBIOS

- `app/controllers/*`
- `app/middlewares/*`
- `app/routes/*`
- `app/schemas/*`
- `app/utils/*`
- `front/*` (no afectado)

##  ARCHIVOS QUE SE MODIFICAN

| Archivo | Cambio |
|---------|--------|
| `app/config/database.js` | Ahora exporta `sequelize` en lugar de `pool` |
| `app/models/*.model.js` | Cada modelo se convierte en definición de Sequelize |
| `app/services/*.service.js` | Usan los modelos Sequelize (`Usuario.findByPk`, etc.) |

