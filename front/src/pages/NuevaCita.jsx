import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaCalendarAlt, FaClock, FaUserMd, FaCheck } from "react-icons/fa";

function formatearFechaLarga(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatearFechaCorta(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatearHora(horaStr) {
  // "08:00:00" -> "8:00 a. m."
  const [h, m] = horaStr.split(":");
  const fecha = new Date();
  fecha.setHours(Number(h), Number(m), 0, 0);
  return fecha.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
}

/**
 * Agrupa las franjas planas que devuelve el backend en una estructura
 * de 3 niveles (especialista -> fecha -> horas) para que el usuario
 * elija paso a paso en vez de ver todas las combinaciones a la vez.
 */
function agruparPorEspecialista(disponibilidad) {
  const especialistas = new Map();

  for (const slot of disponibilidad) {
    if (!especialistas.has(slot.id_usuario)) {
      especialistas.set(slot.id_usuario, {
        id_usuario: slot.id_usuario,
        nombre: `${slot.especialista_nombre} ${slot.especialista_apellidos}`,
        especializacion: slot.especializacion,
        totalSlots: 0,
        fechas: new Map(),
      });
    }

    const especialista = especialistas.get(slot.id_usuario);
    especialista.totalSlots += 1;

    if (!especialista.fechas.has(slot.fecha)) {
      especialista.fechas.set(slot.fecha, []);
    }
    especialista.fechas.get(slot.fecha).push(slot);
  }

  return Array.from(especialistas.values());
}

function NuevaCita() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idEspecialista, setIdEspecialista] = useState(null);
  const [fechaElegida, setFechaElegida] = useState(null);
  const [idDisponibilidad, setIdDisponibilidad] = useState(null);

  const [idMascota, setIdMascota] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError("");

      try {
        const [resMascotas, resDisponibilidad] = await Promise.all([
          api.get("/mascotas"),
          api.get("/disponibilidad", { params: { estado: "disponible" } }),
        ]);

        const misMascotas = (resMascotas.data.data || []).filter(
          (m) => m.propietario_id === usuario?.id_usuario
        );

        setMascotas(misMascotas);
        setDisponibilidad(resDisponibilidad.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudo cargar la disponibilidad. Verifica que el backend esté activo."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  const especialistas = useMemo(
    () => agruparPorEspecialista(disponibilidad),
    [disponibilidad]
  );

  const especialistaActivo = especialistas.find((e) => e.id_usuario === idEspecialista);

  const fechasDisponibles = especialistaActivo
    ? Array.from(especialistaActivo.fechas.keys()).sort()
    : [];

  const horariosDelDia =
    especialistaActivo && fechaElegida
      ? especialistaActivo.fechas.get(fechaElegida) || []
      : [];

  const slotElegido = horariosDelDia.find(
    (s) => s.id_disponibilidad === idDisponibilidad
  );

  const handleElegirEspecialista = (id_usuario) => {
    setIdEspecialista(id_usuario);
    setFechaElegida(null);
    setIdDisponibilidad(null);
  };

  const handleElegirFecha = (fecha) => {
    setFechaElegida(fecha);
    setIdDisponibilidad(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!idMascota || !idDisponibilidad || !motivo.trim()) {
      setMensaje("Selecciona tu mascota, un horario y escribe el motivo de la cita.");
      return;
    }

    setEnviando(true);

    try {
      await api.post("/citas", {
        id_mascota: Number(idMascota),
        id_disponibilidad: Number(idDisponibilidad),
        motivo: motivo.trim(),
      });

      navigate("/dashboard");
    } catch (err) {
      setMensaje(err.response?.data?.message || "No se pudo agendar la cita.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container">
      <div className="form-page form-page--wide">
        <Link to="/dashboard" className="back-link">
          ← Volver a mi panel
        </Link>

        <h1>Agendar cita</h1>
        <p className="auth-card__subtitle">
          Elige un doctor, un día y una hora disponible para tu mascota.
        </p>

        {error && <p className="message message-error">{error}</p>}

        {!error && cargando && <p className="empty-state">Cargando disponibilidad...</p>}

        {!error && !cargando && mascotas.length === 0 && (
          <p className="message message-error">
            Primero necesitas registrar una mascota. <Link to="/mascotas/nueva">Regístrala aquí</Link>.
          </p>
        )}

        {!error && !cargando && mascotas.length > 0 && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Paso 1: doctor */}
            <h2 className="section-title">1. Elige un doctor</h2>

            {especialistas.length === 0 ? (
              <p className="empty-state">No hay horarios disponibles por el momento.</p>
            ) : (
              <div className="doctor-grid">
                {especialistas.map((esp) => (
                  <button
                    type="button"
                    key={esp.id_usuario}
                    className={`doctor-card ${
                      idEspecialista === esp.id_usuario ? "doctor-card--selected" : ""
                    }`}
                    onClick={() => handleElegirEspecialista(esp.id_usuario)}
                  >
                    <span className="doctor-card__avatar">
                      <FaUserMd />
                    </span>
                    <span className="doctor-card__info">
                      <span className="doctor-card__name">{esp.nombre}</span>
                      <span className="doctor-card__specialty">{esp.especializacion}</span>
                      <span className="doctor-card__count">
                        {esp.totalSlots} {esp.totalSlots === 1 ? "horario" : "horarios"} disponibles
                      </span>
                    </span>
                    {idEspecialista === esp.id_usuario && (
                      <span className="doctor-card__check">
                        <FaCheck />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Paso 2: día */}
            {especialistaActivo && (
              <>
                <h2 className="section-title">2. Elige un día</h2>
                <div className="date-tabs">
                  {fechasDisponibles.map((fecha) => (
                    <button
                      type="button"
                      key={fecha}
                      className={`date-tab ${fechaElegida === fecha ? "date-tab--selected" : ""}`}
                      onClick={() => handleElegirFecha(fecha)}
                    >
                      {formatearFechaCorta(fecha)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Paso 3: hora */}
            {especialistaActivo && fechaElegida && (
              <>
                <h2 className="section-title">3. Elige una hora</h2>
                <div className="time-grid">
                  {horariosDelDia.map((slot) => (
                    <button
                      type="button"
                      key={slot.id_disponibilidad}
                      className={`time-chip ${
                        idDisponibilidad === slot.id_disponibilidad ? "time-chip--selected" : ""
                      }`}
                      onClick={() => setIdDisponibilidad(slot.id_disponibilidad)}
                    >
                      {formatearHora(slot.hora)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Resumen de lo elegido */}
            {slotElegido && especialistaActivo && (
              <div className="selection-summary">
                <FaCalendarAlt />
                <span>
                  {especialistaActivo.nombre} · {formatearFechaLarga(slotElegido.fecha)} ·{" "}
                  {formatearHora(slotElegido.hora)}
                </span>
              </div>
            )}

            {/* Paso 4: datos de la cita */}
            <h2 className="section-title">4. Datos de la cita</h2>

            <div className="field">
              <label htmlFor="id_mascota">Mascota</label>
              <select
                id="id_mascota"
                value={idMascota}
                onChange={(e) => setIdMascota(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona tu mascota
                </option>
                {mascotas.map((m) => (
                  <option key={m.id_mascota} value={m.id_mascota}>
                    {m.mascota}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="motivo">Motivo de la consulta</label>
              <input
                id="motivo"
                type="text"
                placeholder="Ej. Control de vacunas"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <button className="btn btn-primary" disabled={enviando || !idDisponibilidad}>
              <FaClock /> {enviando ? "Agendando..." : "Confirmar cita"}
            </button>

            {mensaje && <p className="message message-error">{mensaje}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default NuevaCita;
