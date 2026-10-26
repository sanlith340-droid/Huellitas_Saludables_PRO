-- =========================================================
-- INSERTAR USUARIOS DE PRUEBA
-- =========================================================
--
-- ADVERTENCIA: archivo histórico de demostración.
-- No debe utilizarse para inicializar producción.
-- Las contraseñas de este archivo no están hasheadas.
-- Para datos de demostración use el seeder JS, que aplica scrypt.
--

-- =========================================================
-- 3 RECEPCIONISTAS
-- =========================================================

INSERT INTO usuario (
    id_usuario,
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    tipo,
    rol
)
VALUES
(
    'REC001',
    'Laura',
    'Gomez Rodriguez',
    '3001112233',
    'laura.gomez@proyectohs.com',
    'Calle 80 # 15-20',
    '123456',
    NULL,
    NULL,
    'recepcionista'
),
(
    'REC002',
    'Andrea',
    'Martinez Lopez',
    '3012223344',
    'andrea.martinez@proyectohs.com',
    'Carrera 13 # 72-15',
    '123456',
    NULL,
    NULL,
    'recepcionista'
),
(
    'REC003',
    'Carlos',
    'Torres Perez',
    '3023334455',
    'carlos.torres@proyectohs.com',
    'Calle 100 # 18-30',
    '123456',
    NULL,
    NULL,
    'recepcionista'
);


-- =========================================================
-- 1 ADMINISTRADOR
-- =========================================================

INSERT INTO usuario (
    id_usuario,
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    tipo,
    rol
)
VALUES
(
    'ADM001',
    'Juan',
    'Rodriguez Sanchez',
    '3104445566',
    'juan.rodriguez@proyectohs.com',
    'Carrera 7 # 85-20',
    '123456',
    NULL,
    NULL,
    'admin'
);


-- =========================================================
-- 10 USUARIOS
-- =========================================================
-- USU001 - USU007: usuarios principales
-- USU008 - USU010: acudientes
-- =========================================================

INSERT INTO usuario (
    id_usuario,
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    tipo,
    rol
)
VALUES
(
    'USU001',
    'Pedro',
    'Gonzalez Ramirez',
    '3115556677',
    'pedro.gonzalez@gmail.com',
    'Calle 45 # 20-10',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU002',
    'Maria',
    'Lopez Hernandez',
    '3126667788',
    'maria.lopez@gmail.com',
    'Carrera 30 # 45-25',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU003',
    'Andres',
    'Martinez Castro',
    '3137778899',
    'andres.martinez@gmail.com',
    'Calle 60 # 25-15',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU004',
    'Diana',
    'Perez Moreno',
    '3148889900',
    'diana.perez@gmail.com',
    'Carrera 50 # 80-20',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU005',
    'Felipe',
    'Sanchez Torres',
    '3159990011',
    'felipe.sanchez@gmail.com',
    'Calle 72 # 40-18',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU006',
    'Natalia',
    'Ramirez Vargas',
    '3161112233',
    'natalia.ramirez@gmail.com',
    'Carrera 19 # 65-30',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU007',
    'Santiago',
    'Moreno Diaz',
    '3172223344',
    'santiago.moreno@gmail.com',
    'Calle 90 # 22-40',
    '123456',
    NULL,
    'principal',
    'usuario'
),
(
    'USU008',
    'Camila',
    'Vargas Ruiz',
    '3183334455',
    'camila.vargas@gmail.com',
    'Carrera 11 # 60-25',
    '123456',
    NULL,
    'acudiente',
    'usuario'
),
(
    'USU009',
    'Ricardo',
    'Diaz Herrera',
    '3194445566',
    'ricardo.diaz@gmail.com',
    'Calle 35 # 15-40',
    '123456',
    NULL,
    'acudiente',
    'usuario'
),
(
    'USU010',
    'Valentina',
    'Ruiz Molina',
    '3205556677',
    'valentina.ruiz@gmail.com',
    'Carrera 40 # 70-10',
    '123456',
    NULL,
    'acudiente',
    'usuario'
);



-- =========================================================
-- 3 ESPECIALISTAS
-- =========================================================

INSERT INTO usuario (
    id_usuario,
    nombre,
    apellidos,
    telefono,
    correo,
    direccion,
    contrasena,
    especializacion,
    tipo,
    rol
)
VALUES
(
    'ESP001',
    'Alejandro',
    'Castillo Moreno',
    '3211112233',
    'alejandro.castillo@proyectohs.com',
    'Carrera 15 # 80-25',
    '123456',
    'Medicina Veterinaria General',
    NULL,
    'especialista'
),
(
    'ESP002',
    'Carolina',
    'Mendez Torres',
    '3222223344',
    'carolina.mendez@proyectohs.com',
    'Calle 90 # 18-35',
    '123456',
    'Medicina Felina',
    NULL,
    'especialista'
),
(
    'ESP003',
    'Mauricio',
    'Rojas Hernandez',
    '3233334455',
    'mauricio.rojas@proyectohs.com',
    'Carrera 50 # 75-40',
    '123456',
    'Cirugia Veterinaria',
    NULL,
    'especialista'
);


-- =========================================================
-- AGENDA ESP001, ESP002 y ESP003
-- Genera horarios DINÁMICOS: desde mañana hasta 14 días
-- adelante, solo días hábiles (lunes a viernes), de 08:00
-- a 17:00, en franjas de 1 hora.
--
-- Reemplaza a 5.INSERTAR_DISPONILBIDAD.sql, que tenía
-- fechas fijas (19-21 de agosto de 2026) que ya pasaron.
-- =========================================================

-- (Opcional) Borra franjas de prueba viejas o mal creadas
-- antes de insertar las nuevas. Descomenta si las quieres
-- limpiar primero:
-- DELETE FROM disponibilidad WHERE estado = 'disponible';

/*
INSERT INTO disponibilidad (
    id_usuario,
    fecha,
    hora,
    estado
)
SELECT
    esp.id_usuario,
    fecha_hora::DATE,
    fecha_hora::TIME,
    'disponible'
FROM (VALUES ('ESP001'), ('ESP002'), ('ESP003')) AS esp(id_usuario)
CROSS JOIN generate_series(
    (CURRENT_DATE + INTERVAL '1 day') + TIME '08:00:00',
    (CURRENT_DATE + INTERVAL '14 days') + TIME '17:00:00',
    INTERVAL '1 hour'
) AS fecha_hora
WHERE fecha_hora::TIME BETWEEN TIME '08:00:00' AND TIME '17:00:00'
  AND EXTRACT(DOW FROM fecha_hora) NOT IN (0, 6); -- 0=domingo, 6=sábado