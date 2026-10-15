-- =========================================================
-- AGENDA ESPECIALISTA ESP001
-- 19, 20 Y 21 DE AGOSTO DE 2026
-- HORARIO: 08:00 A 17:00
-- =========================================================

INSERT INTO disponibilidad (
    id_usuario,
    fecha,
    hora,
    estado
)
SELECT
    'ESP001',
    fecha_hora::DATE,
    fecha_hora::TIME,
    'disponible'
FROM generate_series(
    TIMESTAMP '2026-08-19 08:00:00',
    TIMESTAMP '2026-08-21 17:00:00',
    INTERVAL '1 hour'
) AS fecha_hora
WHERE fecha_hora::TIME BETWEEN TIME '08:00:00' AND TIME '17:00:00';


-- =========================================================
-- AGENDA ESPECIALISTA ESP002
-- 19, 20 Y 21 DE AGOSTO DE 2026
-- HORARIO: 08:00 A 17:00
-- =========================================================

INSERT INTO disponibilidad (
    id_usuario,
    fecha,
    hora,
    estado
)
SELECT
    'ESP002',
    fecha_hora::DATE,
    fecha_hora::TIME,
    'disponible'
FROM generate_series(
    TIMESTAMP '2026-08-19 08:00:00',
    TIMESTAMP '2026-08-21 17:00:00',
    INTERVAL '1 hour'
) AS fecha_hora
WHERE fecha_hora::TIME BETWEEN TIME '08:00:00' AND TIME '17:00:00';


-- =========================================================
-- AGENDA ESPECIALISTA ESP003
-- 19, 20 Y 21 DE AGOSTO DE 2026
-- HORARIO: 08:00 A 17:00
-- =========================================================

INSERT INTO disponibilidad (
    id_usuario,
    fecha,
    hora,
    estado
)
SELECT
    'ESP003',
    fecha_hora::DATE,
    fecha_hora::TIME,
    'disponible'
FROM generate_series(
    TIMESTAMP '2026-08-19 08:00:00',
    TIMESTAMP '2026-08-21 17:00:00',
    INTERVAL '1 hour'
) AS fecha_hora
WHERE fecha_hora::TIME BETWEEN TIME '08:00:00' AND TIME '17:00:00';


