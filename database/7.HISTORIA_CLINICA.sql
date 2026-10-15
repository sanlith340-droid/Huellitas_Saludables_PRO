-- =========================================================
-- CREAR HISTORIA CLINICA
-- =========================================================

INSERT INTO historia_clinica (
    id_cita,
    peso,
    diagnostico,
    tratamiento,
    observaciones
)
VALUES (
    1,
    18.50,
    'Otitis externa leve',
    'Limpieza del conducto auditivo y tratamiento con gotas óticas durante 7 días',
    'La mascota presenta inflamación leve. Se recomienda control veterinario en 10 días.'
);


-- =========================================================
-- VERIFICAR EL ESTADO DE LA CITA
-- =========================================================


SELECT
    id_cita,
    id_mascota,
    motivo,
    estado
FROM cita
WHERE id_cita = 1;


-- =========================================================
-- CONSULTAR HISOTORIA CLINICA POR ID MASCOTA
-- =========================================================

SELECT
    -- =====================================================
    -- HISTORIA CLÍNICA
    -- =====================================================
    hc.id_historia_clinica,
    hc.fecha_registro,
    hc.peso,
    hc.diagnostico,
    hc.tratamiento,
    hc.observaciones,

    -- =====================================================
    -- CITA
    -- =====================================================
    c.id_cita,
    c.motivo,
    c.estado AS estado_cita,
    d.fecha AS fecha_cita,
    d.hora AS hora_cita,

    -- =====================================================
    -- MASCOTA
    -- =====================================================
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    r.nombre AS raza,

    -- =====================================================
    -- ESPECIALISTA QUE ATENDIÓ
    -- =====================================================
    especialista.id_usuario AS id_especialista,
    especialista.nombre AS nombre_especialista,
    especialista.apellidos AS apellidos_especialista,
    especialista.especializacion,
    especialista.telefono AS telefono_especialista,
    especialista.correo AS correo_especialista

FROM historia_clinica hc

INNER JOIN cita c
    ON hc.id_cita = c.id_cita

INNER JOIN mascota m
    ON c.id_mascota = m.id_mascota

INNER JOIN raza r
    ON m.id_raza = r.id_raza

INNER JOIN disponibilidad d
    ON c.id_disponibilidad = d.id_disponibilidad

INNER JOIN usuario especialista
    ON d.id_usuario = especialista.id_usuario

WHERE m.id_mascota = 1

ORDER BY
    hc.fecha_registro DESC;