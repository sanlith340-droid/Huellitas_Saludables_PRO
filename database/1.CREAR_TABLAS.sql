-- =========================================================
-- BASE DE DATOS: proyectohs
-- SISTEMA DE GESTIÓN DE VETERINARIA
-- MOTOR: PostgreSQL
-- =========================================================

-- =========================================================
-- TABLA: usuario
-- =========================================================

CREATE TABLE usuario (
    id_usuario VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    especializacion VARCHAR(100),
    tipo VARCHAR(20),
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuario_rol
        CHECK (
            rol IN (
                'admin',
                'recepcionista',
                'especialista',
                'usuario'
            )
        ),

    CONSTRAINT chk_usuario_tipo
        CHECK (
            tipo IN (
                'principal',
                'acudiente'
            )
        )
);


-- =========================================================
-- TABLA: raza
-- =========================================================

CREATE TABLE raza (
    id_raza INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nombre VARCHAR(200) NOT NULL,

    fecha_registro TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- TABLA: mascota
-- =========================================================

CREATE TABLE mascota (
    id_mascota INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    nombre VARCHAR(200) NOT NULL,

    fecha_nacimiento DATE NOT NULL,

    especie VARCHAR(50) NOT NULL,

    genero VARCHAR(20) NOT NULL,

    id_raza INTEGER NOT NULL,

    fecha_registro TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_mascota_especie
        CHECK (
            especie IN (
                'perro',
                'gato'
            )
        ),

    CONSTRAINT chk_mascota_genero
        CHECK (
            genero IN (
                'macho',
                'hembra'
            )
        ),

    CONSTRAINT fk_mascota_raza
        FOREIGN KEY (id_raza)
        REFERENCES raza(id_raza)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- TABLA INTERMEDIA: usuario_mascota
-- RELACIÓN: usuario - mascota
-- =========================================================

CREATE TABLE usuario_mascota (
    id_usuario VARCHAR(10) NOT NULL,

    id_mascota INTEGER NOT NULL,

    PRIMARY KEY (
        id_usuario,
        id_mascota
    ),

    CONSTRAINT fk_usuario_mascota_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_mascota_mascota
        FOREIGN KEY (id_mascota)
        REFERENCES mascota(id_mascota)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- TABLA: disponibilidad
-- =========================================================

CREATE TABLE disponibilidad (
    id_disponibilidad INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_usuario VARCHAR(10) NOT NULL,

    fecha DATE NOT NULL,

    hora TIME NOT NULL,

    estado VARCHAR(20) NOT NULL
        DEFAULT 'disponible',

    CONSTRAINT chk_disponibilidad_estado
        CHECK (
            estado IN (
                'disponible',
                'ocupado'
            )
        ),

    CONSTRAINT fk_disponibilidad_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_disponibilidad_usuario_fecha_hora
        UNIQUE (
            id_usuario,
            fecha,
            hora
        )
);


-- =========================================================
-- TABLA: cita
-- =========================================================

CREATE TABLE cita (
    id_cita INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_recepcionista VARCHAR(10) NOT NULL,

    id_mascota INTEGER NOT NULL,

    id_disponibilidad INTEGER NOT NULL,

    motivo VARCHAR(200) NOT NULL,

    estado VARCHAR(20) NOT NULL
        DEFAULT 'pendiente',

    CONSTRAINT chk_cita_estado
        CHECK (
            estado IN (
                'pendiente',
                'confirmado',
                'cancelado',
                'atendido'
            )
        ),

    CONSTRAINT fk_cita_recepcionista
        FOREIGN KEY (id_recepcionista)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_cita_mascota
        FOREIGN KEY (id_mascota)
        REFERENCES mascota(id_mascota)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_cita_disponibilidad
        FOREIGN KEY (id_disponibilidad)
        REFERENCES disponibilidad(id_disponibilidad)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_cita_disponibilidad
        UNIQUE (id_disponibilidad)
);


-- =========================================================
-- TABLA: historia_clinica
-- =========================================================

CREATE TABLE historia_clinica (
    id_historia_clinica INTEGER
        GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    id_cita INTEGER NOT NULL,

    peso NUMERIC(5,2),

    diagnostico VARCHAR(200) NOT NULL,

    tratamiento VARCHAR(200) NOT NULL,

    observaciones VARCHAR(500),

    fecha_registro TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_historia_peso
        CHECK (
            peso IS NULL OR peso > 0
        ),

    CONSTRAINT fk_historia_clinica_cita
        FOREIGN KEY (id_cita)
        REFERENCES cita(id_cita)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_historia_cita
        UNIQUE (id_cita)
);


-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================