// app/models/index.js
/**
 * Define todas las entidades Sequelize (tablas) y sus relaciones.
 * Este archivo es el "corazón" del ORM: cualquier otro archivo de
 * modelo (usuario.model.js, mascota.model.js, etc.) importa desde
 * aquí las entidades ya asociadas entre sí.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ============================================================
// USUARIO
// ============================================================
const Usuario = sequelize.define(
  'Usuario',
  {
    id_usuario: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(150), allowNull: false },
    telefono: { type: DataTypes.STRING(20), allowNull: true },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    direccion: { type: DataTypes.STRING(150), allowNull: false },
    contrasena: { type: DataTypes.STRING(255), allowNull: false },
    especializacion: { type: DataTypes.STRING(100), allowNull: true },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: { isIn: [['principal', 'acudiente']] },
    },
    rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'usuario',
      validate: { isIn: [['admin', 'recepcionista', 'especialista', 'usuario']] },
    },
  },
  {
    tableName: 'usuario',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false,
  }
);

// ============================================================
// RAZA
// ============================================================
const Raza = sequelize.define(
  'Raza',
  {
    id_raza: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
  },
  {
    tableName: 'raza',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false,
  }
);

// ============================================================
// MASCOTA
// ============================================================
const Mascota = sequelize.define(
  'Mascota',
  {
    id_mascota: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
    especie: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [['perro', 'gato']] },
    },
    genero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [['macho', 'hembra']] },
    },
    id_raza: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'mascota',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false,
  }
);

// ============================================================
// USUARIO_MASCOTA (tabla intermedia N:M)
// ============================================================
const UsuarioMascota = sequelize.define(
  'UsuarioMascota',
  {
    id_usuario: { type: DataTypes.STRING(10), primaryKey: true },
    id_mascota: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: 'usuario_mascota',
    timestamps: false,
  }
);

// ============================================================
// DISPONIBILIDAD
// ============================================================
const Disponibilidad = sequelize.define(
  'Disponibilidad',
  {
    id_disponibilidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: { type: DataTypes.STRING(10), allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: { type: DataTypes.TIME, allowNull: false },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'disponible',
      validate: { isIn: [['disponible', 'ocupado']] },
    },
  },
  {
    tableName: 'disponibilidad',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'fecha', 'hora'],
        name: 'uq_disponibilidad_usuario_fecha_hora',
      },
    ],
  }
);

// ============================================================
// CITA
// ============================================================
const Cita = sequelize.define(
  'Cita',
  {
    id_cita: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_recepcionista: { type: DataTypes.STRING(10), allowNull: false },
    id_mascota: { type: DataTypes.INTEGER, allowNull: false },
    id_disponibilidad: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    motivo: { type: DataTypes.STRING(200), allowNull: false },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: { isIn: [['pendiente', 'confirmado', 'cancelado', 'atendido']] },
    },
  },
  {
    tableName: 'cita',
    timestamps: false,
  }
);

// ============================================================
// HISTORIA_CLINICA
// ============================================================
const HistoriaClinica = sequelize.define(
  'HistoriaClinica',
  {
    id_historia_clinica: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cita: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: { min: 0.01 },
    },
    diagnostico: { type: DataTypes.STRING(200), allowNull: false },
    tratamiento: { type: DataTypes.STRING(200), allowNull: false },
    observaciones: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'historia_clinica',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false,
  }
);

// ============================================================
// RELACIONES
// ============================================================

// Usuario <-> Mascota (N:M a través de usuario_mascota)
Usuario.belongsToMany(Mascota, {
  through: UsuarioMascota,
  foreignKey: 'id_usuario',
  otherKey: 'id_mascota',
});
Mascota.belongsToMany(Usuario, {
  through: UsuarioMascota,
  foreignKey: 'id_mascota',
  otherKey: 'id_usuario',
});

// Mascota -> Raza (N:1)
Mascota.belongsTo(Raza, { foreignKey: 'id_raza' });
Raza.hasMany(Mascota, { foreignKey: 'id_raza' });

// Usuario (especialista) -> Disponibilidad (1:N)
Usuario.hasMany(Disponibilidad, { foreignKey: 'id_usuario' });
Disponibilidad.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'Especialista' });

// Disponibilidad <-> Cita (1:1)
Disponibilidad.hasOne(Cita, { foreignKey: 'id_disponibilidad' });
Cita.belongsTo(Disponibilidad, { foreignKey: 'id_disponibilidad' });

// Mascota -> Cita (1:N)
Mascota.hasMany(Cita, { foreignKey: 'id_mascota', as: 'Citas' });
Cita.belongsTo(Mascota, { foreignKey: 'id_mascota', as: 'Mascota' });

// Usuario (recepcionista) -> Cita (1:N)
Usuario.hasMany(Cita, { foreignKey: 'id_recepcionista', as: 'CitasComoRecepcionista' });
Cita.belongsTo(Usuario, { foreignKey: 'id_recepcionista', as: 'Recepcionista' });

// Cita <-> HistoriaClinica (1:1)
Cita.hasOne(HistoriaClinica, { foreignKey: 'id_cita', as: 'HistoriaClinica' });
HistoriaClinica.belongsTo(Cita, { foreignKey: 'id_cita', as: 'Cita' });

module.exports = {
  sequelize,
  Usuario,
  Raza,
  Mascota,
  UsuarioMascota,
  Disponibilidad,
  Cita,
  HistoriaClinica,
};
