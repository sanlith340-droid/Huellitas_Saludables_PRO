-- =========================================================
-- VERIFICAR LOS USUARIOS INSERTADOS
-- =========================================================

SELECT
    id_usuario,
    nombre,
    apellidos,
    correo,
    tipo,
    rol,
    fecha_registro
FROM usuario
ORDER BY id_usuario;


-- =========================================================
-- CONSULTA DE VERIFICACIÓN
-- =========================================================

SELECT
    u.id_usuario,
    u.nombre AS usuario,
    u.apellidos,
    u.tipo,
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    r.nombre AS raza
FROM usuario u
INNER JOIN usuario_mascota um
    ON u.id_usuario = um.id_usuario
INNER JOIN mascota m
    ON um.id_mascota = m.id_mascota
INNER JOIN raza r
    ON m.id_raza = r.id_raza
ORDER BY
    u.id_usuario,
    m.id_mascota;


-- =========================================================
-- VERIFICAR AGENDA
-- =========================================================

SELECT
    id_disponibilidad,
    id_usuario,
    fecha,
    hora,
    estado
FROM disponibilidad
WHERE id_usuario IN ('ESP001', 'ESP002', 'ESP003')
ORDER BY
    id_usuario,
    fecha,
    hora;

-- =========================================================
-- VERIFICAR AGENDA UN SOLO ESPECILAISTA
-- =========================================================

SELECT
    d.id_disponibilidad,
    d.id_usuario AS id_especialista,
    u.nombre,
    u.apellidos,
    u.especializacion,
    d.fecha,
    d.hora,
    d.estado
FROM disponibilidad d
INNER JOIN usuario u
    ON d.id_usuario = u.id_usuario
WHERE d.id_usuario = 'ESP001'
  AND d.fecha = DATE '2026-08-19'
ORDER BY d.hora;

-- =========================================================
-- VERIFICAR DISPONIBLIDAD
-- =========================================================

SELECT
    id_disponibilidad,
    id_usuario,
    fecha,
    hora,
    estado
FROM disponibilidad
WHERE id_usuario = 'ESP001'
  AND fecha = DATE '2026-08-19'
ORDER BY hora;


-- =========================================================
-- VERIFICAR CITA
-- =========================================================

SELECT
    c.id_cita,

    -- CITA
    c.motivo,
    c.estado AS estado_cita,
    d.fecha,
    d.hora,

    -- MASCOTA
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    r.nombre AS raza,

    -- PROPIETARIO PRINCIPAL
    propietario.id_usuario AS id_propietario,
    propietario.nombre AS nombre_propietario,
    propietario.apellidos AS apellidos_propietario,
    propietario.telefono AS telefono_propietario,
    propietario.correo AS correo_propietario,
    propietario.direccion AS direccion_propietario,

    -- RECEPCIONISTA
    recepcionista.id_usuario AS id_recepcionista,
    recepcionista.nombre AS nombre_recepcionista,
    recepcionista.apellidos AS apellidos_recepcionista,

    -- ESPECIALISTA
    especialista.id_usuario AS id_especialista,
    especialista.nombre AS nombre_especialista,
    especialista.apellidos AS apellidos_especialista,
    especialista.especializacion

FROM cita c

INNER JOIN mascota m
    ON c.id_mascota = m.id_mascota

INNER JOIN raza r
    ON m.id_raza = r.id_raza

INNER JOIN disponibilidad d
    ON c.id_disponibilidad = d.id_disponibilidad

INNER JOIN usuario recepcionista
    ON c.id_recepcionista = recepcionista.id_usuario

INNER JOIN usuario especialista
    ON d.id_usuario = especialista.id_usuario

INNER JOIN usuario_mascota um
    ON m.id_mascota = um.id_mascota

INNER JOIN usuario propietario
    ON um.id_usuario = propietario.id_usuario

WHERE c.id_mascota = 1
  AND propietario.tipo = 'principal'

ORDER BY
    d.fecha DESC,
    d.hora DESC;
-- =========================================================
-- TRUNCATE
-- =========================================================
TRUNCATE TABLE disponibilidad
RESTART IDENTITY CASCADE;