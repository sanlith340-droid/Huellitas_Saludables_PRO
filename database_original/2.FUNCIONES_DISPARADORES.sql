-- =========================================================
-- FUNCIÓN: CAMBIAR DISPONIBILIDAD AL CREAR UNA CITA
-- =========================================================

CREATE OR REPLACE FUNCTION actualizar_disponibilidad_cita()
RETURNS TRIGGER
AS $$
BEGIN

    UPDATE disponibilidad
    SET estado = 'ocupado'
    WHERE id_disponibilidad = NEW.id_disponibilidad;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- TRIGGER: ACTUALIZAR DISPONIBILIDAD
-- =========================================================

CREATE TRIGGER trg_actualizar_disponibilidad_cita
AFTER INSERT ON cita
FOR EACH ROW
EXECUTE FUNCTION actualizar_disponibilidad_cita();



-- =========================================================
-- FUNCIÓN: CAMBIAR ESTADO DE CITA AL CREAR HC 
-- =========================================================

CREATE OR REPLACE FUNCTION actualizar_cita_atendida()
RETURNS TRIGGER
AS $$
BEGIN

    UPDATE cita
    SET estado = 'atendido'
    WHERE id_cita = NEW.id_cita;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- TRIGGER: ACTUALIZAR ESTADO CITA
-- =========================================================

CREATE TRIGGER trg_historia_cita_atendida
AFTER INSERT ON historia_clinica
FOR EACH ROW
EXECUTE FUNCTION actualizar_cita_atendida();