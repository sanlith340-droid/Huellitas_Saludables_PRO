-- =========================================================
-- CREAR CITA
-- =========================================================

INSERT INTO cita (
    id_recepcionista,
    id_mascota,
    id_disponibilidad,
    motivo,
    estado
)
SELECT
    'REC001',
    1,
    d.id_disponibilidad,
    'Consulta veterinaria general',
    'pendiente'
FROM disponibilidad d
WHERE d.id_usuario = 'ESP001'
  AND d.fecha = DATE '2026-08-19'
  AND d.hora = TIME '08:00:00'
  AND d.estado = 'disponible';