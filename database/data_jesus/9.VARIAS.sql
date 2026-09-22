
-- =========================================================
-- VER TODAS LA MASCOTAS 
-- =========================================================

SELECT
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    r.nombre AS raza,
    m.fecha_registro
FROM mascota m
INNER JOIN raza r
    ON m.id_raza = r.id_raza
ORDER BY m.id_mascota;

-- =========================================================
-- VER MASCOTA POR GENERO
-- =========================================================

SELECT
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    r.nombre AS raza
FROM mascota m
INNER JOIN raza r
    ON m.id_raza = r.id_raza
WHERE m.especie = 'perro'
ORDER BY m.nombre;

-- =========================================================
-- 
-- =========================================================

SELECT
    m.especie,
    COUNT(*) AS cantidad
FROM mascota m
GROUP BY m.especie
ORDER BY m.especie;

-- =========================================================
-- 
-- =========================================================

SELECT
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    r.nombre AS raza,
    u.id_usuario,
    u.nombre,
    u.apellidos,
    u.tipo
FROM mascota m
INNER JOIN raza r
    ON m.id_raza = r.id_raza
INNER JOIN usuario_mascota um
    ON m.id_mascota = um.id_mascota
INNER JOIN usuario u
    ON um.id_usuario = u.id_usuario
ORDER BY
    m.id_mascota,
    u.tipo,
    u.nombre;




SELECT
    -- =====================================================
    -- DATOS DEL USUARIO
    -- =====================================================
    u.id_usuario,
    u.nombre AS nombre_usuario,
    u.apellidos AS apellidos_usuario,
    u.tipo AS tipo_usuario,
    u.telefono AS telefono_usuario,
    u.correo AS correo_usuario,
    u.direccion AS direccion_usuario,

    -- =====================================================
    -- DATOS DE LA MASCOTA
    -- =====================================================
    m.id_mascota,
    m.nombre AS nombre_mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    m.fecha_registro,

    -- =====================================================
    -- DATOS DE LA RAZA
    -- =====================================================
    r.id_raza,
    r.nombre AS raza

FROM usuario u

INNER JOIN usuario_mascota um
    ON u.id_usuario = um.id_usuario

INNER JOIN mascota m
    ON um.id_mascota = m.id_mascota

INNER JOIN raza r
    ON m.id_raza = r.id_raza

WHERE u.id_usuario = 'USU008'

ORDER BY
    m.nombre;



SELECT
    m.id_mascota,
    m.nombre AS mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    r.id_raza,
    r.nombre AS raza,
    m.fecha_registro,
    u.tipo AS relacion_usuario
FROM usuario_mascota um

INNER JOIN usuario u
    ON um.id_usuario = u.id_usuario

INNER JOIN mascota m
    ON um.id_mascota = m.id_mascota

INNER JOIN raza r
    ON m.id_raza = r.id_raza

WHERE um.id_usuario = 'USU008'

ORDER BY m.id_mascota;




SELECT
    -- =====================================================
    -- DATOS DE LA MASCOTA
    -- =====================================================
    m.id_mascota,
    m.nombre AS nombre_mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    m.fecha_registro,

    -- =====================================================
    -- DATOS DE LA RAZA
    -- =====================================================
    r.id_raza,
    r.nombre AS raza,

    -- =====================================================
    -- PROPIETARIO PRINCIPAL
    -- =====================================================
    propietario.id_usuario AS id_propietario,
    propietario.nombre AS nombre_propietario,
    propietario.apellidos AS apellidos_propietario,
    propietario.telefono AS telefono_propietario,
    propietario.correo AS correo_propietario,
    propietario.direccion AS direccion_propietario,

    -- =====================================================
    -- ACUDIENTES
    -- =====================================================
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id_usuario', acudiente.id_usuario,
                'nombre', acudiente.nombre,
                'apellidos', acudiente.apellidos,
                'telefono', acudiente.telefono,
                'correo', acudiente.correo,
                'direccion', acudiente.direccion
            )
        ) FILTER (
            WHERE acudiente.id_usuario IS NOT NULL
        ),
        '[]'::json
    ) AS acudientes

FROM mascota m

INNER JOIN raza r
    ON m.id_raza = r.id_raza

-- =========================================================
-- RELACIÓN MASCOTA - USUARIOS
-- =========================================================
LEFT JOIN usuario_mascota um_propietario
    ON m.id_mascota = um_propietario.id_mascota

LEFT JOIN usuario propietario
    ON um_propietario.id_usuario = propietario.id_usuario
    AND propietario.tipo = 'principal'

LEFT JOIN usuario_mascota um_acudiente
    ON m.id_mascota = um_acudiente.id_mascota

LEFT JOIN usuario acudiente
    ON um_acudiente.id_usuario = acudiente.id_usuario
    AND acudiente.tipo = 'acudiente'

WHERE m.id_mascota = 1

GROUP BY
    m.id_mascota,
    m.nombre,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    m.fecha_registro,
    r.id_raza,
    r.nombre,
    propietario.id_usuario,
    propietario.nombre,
    propietario.apellidos,
    propietario.telefono,
    propietario.correo,
    propietario.direccion;




SELECT
    -- =====================================================
    -- DATOS DE LA MASCOTA
    -- =====================================================
    m.id_mascota,
    m.nombre AS nombre_mascota,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    m.fecha_registro,

    -- =====================================================
    -- DATOS DE LA RAZA
    -- =====================================================
    r.id_raza,
    r.nombre AS raza,

    -- =====================================================
    -- PROPIETARIO
    -- =====================================================
    propietario.id_usuario AS id_propietario,
    propietario.nombre AS nombre_propietario,
    propietario.apellidos AS apellidos_propietario,
    propietario.telefono AS telefono_propietario,
    propietario.correo AS correo_propietario,
    propietario.direccion AS direccion_propietario,

    -- =====================================================
    -- LISTA DE ACUDIENTES
    -- =====================================================
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'id_usuario', acudiente.id_usuario,
                'nombre', acudiente.nombre,
                'apellidos', acudiente.apellidos,
                'telefono', acudiente.telefono,
                'correo', acudiente.correo,
                'direccion', acudiente.direccion
            )
        ) FILTER (
            WHERE acudiente.id_usuario IS NOT NULL
        ),
        '[]'::jsonb
    ) AS acudientes

FROM mascota m

INNER JOIN raza r
    ON m.id_raza = r.id_raza

-- =========================================================
-- PROPIETARIO PRINCIPAL
-- =========================================================
LEFT JOIN usuario_mascota um_propietario
    ON m.id_mascota = um_propietario.id_mascota

LEFT JOIN usuario propietario
    ON um_propietario.id_usuario = propietario.id_usuario
    AND propietario.tipo = 'principal'

-- =========================================================
-- ACUDIENTES
-- =========================================================
LEFT JOIN usuario_mascota um_acudiente
    ON m.id_mascota = um_acudiente.id_mascota

LEFT JOIN usuario acudiente
    ON um_acudiente.id_usuario = acudiente.id_usuario
    AND acudiente.tipo = 'acudiente'

-- =========================================================
-- MASCOTA A CONSULTAR
-- =========================================================
WHERE m.id_mascota = 1

GROUP BY
    m.id_mascota,
    m.nombre,
    m.especie,
    m.genero,
    m.fecha_nacimiento,
    m.fecha_registro,
    r.id_raza,
    r.nombre,
    propietario.id_usuario,
    propietario.nombre,
    propietario.apellidos,
    propietario.telefono,
    propietario.correo,
    propietario.direccion;