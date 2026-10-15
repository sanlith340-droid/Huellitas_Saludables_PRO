-- =========================================================
-- INSERTAR RAZAS
-- =========================================================

INSERT INTO raza (nombre)
VALUES
('Labrador Retriever'),
('Golden Retriever'),
('Pastor Alemán'),
('Bulldog Francés'),
('Beagle'),
('Poodle'),
('Chihuahua'),
('Husky Siberiano'),
('Persa'),
('Siamés'),
('Maine Coon'),
('Bengalí'),
('Angora'),
('British Shorthair');


-- =========================================================
-- INSERTAR MASCOTAS
-- =========================================================

INSERT INTO mascota (
    nombre,
    fecha_nacimiento,
    especie,
    genero,
    id_raza
)
VALUES
(
    'Max',
    '2021-03-15',
    'perro',
    'macho',
    (SELECT id_raza FROM raza WHERE nombre = 'Labrador Retriever')
),
(
    'Luna',
    '2022-07-10',
    'gato',
    'hembra',
    (SELECT id_raza FROM raza WHERE nombre = 'Persa')
),
(
    'Rocky',
    '2020-11-05',
    'perro',
    'macho',
    (SELECT id_raza FROM raza WHERE nombre = 'Pastor Alemán')
),
(
    'Nala',
    '2023-01-20',
    'gato',
    'hembra',
    (SELECT id_raza FROM raza WHERE nombre = 'Siamés')
),
(
    'Bruno',
    '2019-08-12',
    'perro',
    'macho',
    (SELECT id_raza FROM raza WHERE nombre = 'Golden Retriever')
),
(
    'Mia',
    '2022-05-18',
    'gato',
    'hembra',
    (SELECT id_raza FROM raza WHERE nombre = 'Maine Coon')
),
(
    'Toby',
    '2021-09-25',
    'perro',
    'macho',
    (SELECT id_raza FROM raza WHERE nombre = 'Beagle')
),
(
    'Coco',
    '2023-04-14',
    'gato',
    'hembra',
    (SELECT id_raza FROM raza WHERE nombre = 'Bengalí')
),
(
    'Zeus',
    '2020-02-28',
    'perro',
    'macho',
    (SELECT id_raza FROM raza WHERE nombre = 'Husky Siberiano')
),
(
    'Kira',
    '2022-12-03',
    'perro',
    'hembra',
    (SELECT id_raza FROM raza WHERE nombre = 'Bulldog Francés')
);


-- =========================================================
-- ASOCIAR MASCOTAS CON USUARIOS
-- =========================================================

-- =========================================================
-- USUARIO USU001 - Pedro
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU001', id_mascota
FROM mascota
WHERE nombre IN ('Max', 'Luna');


-- =========================================================
-- USUARIO USU002 - Maria
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU002', id_mascota
FROM mascota
WHERE nombre = 'Rocky';


-- =========================================================
-- USUARIO USU003 - Andres
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU003', id_mascota
FROM mascota
WHERE nombre IN ('Nala', 'Bruno');


-- =========================================================
-- USUARIO USU004 - Diana
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU004', id_mascota
FROM mascota
WHERE nombre = 'Mia';


-- =========================================================
-- USUARIO USU005 - Felipe
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU005', id_mascota
FROM mascota
WHERE nombre IN ('Toby', 'Coco');


-- =========================================================
-- USUARIO USU006 - Natalia
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU006', id_mascota
FROM mascota
WHERE nombre = 'Zeus';


-- =========================================================
-- USUARIO USU007 - Santiago
-- =========================================================

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU007', id_mascota
FROM mascota
WHERE nombre = 'Kira';


-- =========================================================
-- ACUDIENTES
-- =========================================================

-- Camila es acudiente de Max y Rocky

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU008', id_mascota
FROM mascota
WHERE nombre IN ('Max', 'Rocky');


-- Ricardo es acudiente de Nala y Toby

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU009', id_mascota
FROM mascota
WHERE nombre IN ('Nala', 'Toby');


-- Valentina es acudiente de Luna y Zeus

INSERT INTO usuario_mascota (id_usuario, id_mascota)
SELECT 'USU010', id_mascota
FROM mascota
WHERE nombre IN ('Luna', 'Zeus');


