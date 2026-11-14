-- =========================================================
-- INSERTAR USUARIOS DE PRUEBA
-- Las contraseñas se guardan como hash bcrypt (12 rondas, salt
-- independiente por usuario). Contraseña de demostración: 123456
-- (solo para entornos locales; nunca usar en producción).
-- =========================================================

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
    '$2b$12$HXW9o/Tr1QT6Owzk6wq1R.hM1Aymam8p13OE3cQr1e2Q.VLXQZXG6',
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
    '$2b$12$W.8fvAwdzvbm7VXeyZhbK.bizoo.3lDUjzqxPn6fQizrTa69qrmN6',
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
    '$2b$12$KYjlTS5RlnhVsYkMFRJrSui3lu8L6YbBqhzSn.Fg6yIrKzLmP3b22',
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
    '$2b$12$3cNfktMGNHsWYZF4pP2O5OW60i3bRnkYq8yNnPpTsy3zQ8KyBhdpa',
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
    '$2b$12$wSL/XJnAcG3OvhsCtGnOSuePFeO8MzeTkVjM.iK.k4PstCLg4HvI.',
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
    '$2b$12$6QAY5S84IxYBr0DGSqxTwu9u9BXZmPw/7h5H90nE.qkcUhUmkskM.',
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
    '$2b$12$toZ3TDNcaHoWPP.p8kYyxut.Gc738CMCUP5De7kuD9QADlJCmxVJm',
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
    '$2b$12$3LzHZ2cGWvYfH1BYjRfsweKrbQx1Spl3E6z3zuWgvIwu5IZH8gHn6',
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
    '$2b$12$pszofGuKdN9Qn2Ndq8H1ZuvHoHJvuaafyWNkaqngVd02bZ0a3yNk.',
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
    '$2b$12$023QYFtX9FnOtRFfwKYozulV9XSMwkQgA5mSj7ijBoOgjVQZGL8v2',
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
    '$2b$12$Z4Xkftnuvt6l3ytcPQQ/heKIhV8EToTS1AaZyMQ4rdm28SCoJcToC',
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
    '$2b$12$1E.o3g4G5n/ze2Of8oz6seb8H5momWKT9wrzKOP66ndlXLHPseZtG',
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
    '$2b$12$Bo0Gl9AM1v2e3iLeltPnI.sfDVROwV0I2ynHHksUhuUYls3aIJz92',
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
    '$2b$12$gfSzkZa.53xZMUyvSVczeuSZgE/B.MIX3Q/sQeux0utWONbpkJz1i',
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
    '$2b$12$9e/oHmEmOvOG.LTFx3qSUu7xI13.cwDMp..EcEszq8pA2ucGL5kv2',
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
    '$2b$12$US1dBsHKZc/7gpC2mP7BHugaB8V5vJ0KrYvRysDj.kTEooMqpQqMK',
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
    '$2b$12$WTnEg9cgCsw64cIIo2MzrObHeO46.mCCmg13bj2JY3QItN7u1WlZO',
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