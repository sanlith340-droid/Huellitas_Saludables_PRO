import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";
import {
  FaTrash,
  FaCalendarPlus,
  FaClock,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";

const ESTADO_INICIAL = {
  id_usuario: "",
  fecha: "",
  hora: "",
  estado: "disponible",
};

const ESTADO_DIA_LABEL = {
  disponible: "Disponible",
  "pocos-disponibles": "Pocos disponibles",
  "no-disponible": "No disponible",
  "sin-datos": "Sin franjas",
};

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonday(date) {
  const d = new Date(date);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatRangoSemana(monday) {
  const sunday = addDays(monday, 6);
  const mismoMes = monday.getMonth() === sunday.getMonth();
  const anio = sunday.getFullYear();

  if (mismoMes) {
    const mes = sunday.toLocaleDateString("es-CO", { month: "long" });
    return `${monday.getDate()} – ${sunday.getDate()} de ${mes} de ${anio}`;
  }

  const mesInicio = monday
    .toLocaleDateString("es-CO", { month: "short" })
    .replace(".", "");
  const mesFin = sunday.toLocaleDateString("es-CO", { month: "long" });
  return `${monday.getDate()} ${mesInicio} – ${sunday.getDate()} ${mesFin} de ${anio}`;
}

function iniciales(nombre = "", apellidos = "") {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || "?";
}

function estadoDia(franjasDia) {
  if (franjasDia.length === 0) return "sin-datos";
  const disponibles = franjasDia.filter((f) => f.estado === "disponible").length;
  if (disponibles === franjasDia.length) return "disponible";
  if (disponibles === 0) return "no-disponible";
  return "pocos-disponibles";
}

function Disponibilidad() {
  const [especialistas, setEspecialistas] = useState([]);
  const [franjas, setFranjas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState("");
  const [accionandoId, setAccionandoId] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [selectedEspId, setSelectedEspId] = useState("");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [resEspecialistas, resDisponibilidad] = await Promise.all([
        api.get("/usuarios/especialistas"),
        api.get("/disponibilidad"),
      ]);

      setEspecialistas(resEspecialistas.data.data || []);
      setFranjas(resDisponibilidad.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar la disponibilidad. Verifica que el backend esté activo."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Selecciona el primer especialista automáticamente cuando llegan los datos
  useEffect(() => {
    if (!selectedEspId && especialistas.length > 0) {
      setSelectedEspId(String(especialistas[0].id_usuario));
    }
  }, [especialistas, selectedEspId]);

  const especialistasFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return especialistas;
    return especialistas.filter((e) =>
      `${e.nombre} ${e.apellidos} ${e.especializacion || ""}`
        .toLowerCase()
        .includes(termino)
    );
  }, [especialistas, busqueda]);

  const especialistaSeleccionado = especialistas.find(
    (e) => String(e.id_usuario) === String(selectedEspId)
  );

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const franjasPorDia = useCallback(
    (fechaISO) =>
      franjas.filter(
        (f) =>
          String(f.id_usuario) === String(selectedEspId) &&
          (f.fecha || "").slice(0, 10) === fechaISO
      ),
    [franjas, selectedEspId]
  );

  const detalleDia = selectedDay
    ? [...franjasPorDia(selectedDay)].sort((a, b) => (a.hora > b.hora ? 1 : -1))
    : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirFormulario = () => {
    setForm({
      ...ESTADO_INICIAL,
      id_usuario: selectedEspId || "",
      fecha: selectedDay || "",
    });
    setMensajeForm("");
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeForm("");
    setEnviando(true);

    try {
      await api.post("/disponibilidad", form);
      setSelectedEspId(String(form.id_usuario));
      setSelectedDay(form.fecha || null);
      setForm(ESTADO_INICIAL);
      setMostrarForm(false);
      await cargarDatos();
    } catch (err) {
      setMensajeForm(err.response?.data?.message || "No se pudo crear la franja horaria.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id_disponibilidad) => {
    setAccionandoId(id_disponibilidad);
    setError("");
    try {
      await api.delete(`/disponibilidad/${id_disponibilidad}`);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo eliminar la franja horaria.");
    } finally {
      setAccionandoId(null);
    }
  };

  const handleCambiarEstado = async (franja) => {
    const nuevoEstado = franja.estado === "disponible" ? "ocupado" : "disponible";
    setAccionandoId(franja.id_disponibilidad);
    setError("");
    try {
      await api.put(`/disponibilidad/${franja.id_disponibilidad}`, { estado: nuevoEstado });
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el estado.");
    } finally {
      setAccionandoId(null);
    }
  };

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Disponibilidad de especialistas</h1>
          <p>Consulta la disponibilidad semanal de cada especialista y crea nuevas franjas.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={abrirFormulario}>
          <FaCalendarPlus /> Nueva franja
        </button>
      </div>

      {error && <p className="message message-error">{error}</p>}

      {mostrarForm && (
        <div className="panel avail-form-panel">
          <div className="panel__head">
            <h2>Nueva franja horaria</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMostrarForm(false)}>
              <FaTimes /> Cerrar
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="avail-form">
            <div className="field">
              <label htmlFor="id_usuario">Especialista</label>
              <select
                id="id_usuario"
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                required
                disabled={cargando}
              >
                <option value="" disabled>
                  {cargando ? "Cargando..." : "Selecciona un especialista"}
                </option>
                {especialistas.map((e) => (
                  <option key={e.id_usuario} value={e.id_usuario}>
                    {e.nombre} {e.apellidos}
                    {e.especializacion ? ` · ${e.especializacion}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="hora">Hora</label>
              <input
                id="hora"
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary" disabled={enviando}>
              <FaCalendarPlus /> {enviando ? "Creando..." : "Crear franja"}
            </button>
          </form>

          {mensajeForm && <p className="message message-error">{mensajeForm}</p>}
        </div>
      )}

      <div className="avail-layout">
        <aside className="panel avail-specialists">
          <div className="avail-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar especialista..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="avail-specialists__list">
            {cargando ? (
              <p className="empty-state">Cargando...</p>
            ) : especialistasFiltrados.length === 0 ? (
              <p className="empty-state">Sin resultados.</p>
            ) : (
              especialistasFiltrados.map((e) => (
                <button
                  type="button"
                  key={e.id_usuario}
                  className={`doctor-card avail-doctor ${
                    String(e.id_usuario) === String(selectedEspId) ? "doctor-card--selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedEspId(String(e.id_usuario));
                    setSelectedDay(null);
                  }}
                >
                  <div className="doctor-card__avatar">{iniciales(e.nombre, e.apellidos)}</div>
                  <div className="doctor-card__info">
                    <span className="doctor-card__name">
                      {e.nombre} {e.apellidos}
                    </span>
                    <span className="doctor-card__specialty">
                      {e.especializacion || "Sin especialidad"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="avail-main">
          <div className="panel">
            {especialistaSeleccionado ? (
              <div className="avail-doctor-header">
                <div className="doctor-card__avatar avail-doctor-header__avatar">
                  {iniciales(especialistaSeleccionado.nombre, especialistaSeleccionado.apellidos)}
                </div>
                <div>
                  <div className="list-item__title">
                    {especialistaSeleccionado.nombre} {especialistaSeleccionado.apellidos}
                  </div>
                  <div className="list-item__meta">
                    {especialistaSeleccionado.especializacion || "Sin especialidad"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty-state">
                {cargando ? "Cargando especialistas..." : "No hay especialistas registrados."}
              </p>
            )}

            <div className="avail-toolbar">
              <div className="avail-legend">
                <span className="legend-item">
                  <span className="legend-dot legend-dot--disponible"></span> Disponible
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-dot--pocos"></span> Pocos disponibles
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-dot--no"></span> No disponible
                </span>
              </div>

              <div className="week-nav">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setWeekStart(addDays(weekStart, -7))}
                  aria-label="Semana anterior"
                >
                  <FaChevronLeft />
                </button>
                <span className="week-nav__label">
                  <FaCalendarAlt /> {formatRangoSemana(weekStart)}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setWeekStart(addDays(weekStart, 7))}
                  aria-label="Semana siguiente"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {especialistaSeleccionado && (
              <div className="week-grid">
                {weekDates.map((fecha) => {
                  const iso = toISODate(fecha);
                  const franjasDia = franjasPorDia(iso);
                  const estado = estadoDia(franjasDia);
                  const seleccionado = selectedDay === iso;

                  return (
                    <button
                      type="button"
                      key={iso}
                      className={`day-cell day-cell--${estado} ${
                        seleccionado ? "day-cell--selected" : ""
                      }`}
                      onClick={() => setSelectedDay(seleccionado ? null : iso)}
                    >
                      <span className="day-cell__weekday">
                        {fecha
                          .toLocaleDateString("es-CO", { weekday: "short" })
                          .replace(/^./, (c) => c.toUpperCase())}
                      </span>
                      <span className="day-cell__date">
                        {fecha.getDate()}{" "}
                        {fecha.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="day-cell__status">{ESTADO_DIA_LABEL[estado]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDay && especialistaSeleccionado && (
            <div className="panel avail-detail">
              <div className="panel__head">
                <h2>Horarios del día</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedDay(null)}>
                  <FaTimes /> Cerrar
                </button>
              </div>

              <p className="state-note" style={{ marginBottom: 12 }}>
                {new Date(`${selectedDay}T00:00:00`).toLocaleDateString("es-CO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              {detalleDia.length === 0 ? (
                <p className="empty-state">No hay franjas registradas para este día.</p>
              ) : (
                detalleDia.map((f) => (
                  <div className="list-item list-item--cita" key={f.id_disponibilidad}>
                    <div className="list-item__icon">
                      <FaClock />
                    </div>
                    <div className="list-item__body">
                      <div className="list-item__title">{f.hora}</div>
                    </div>
                    <div className="list-item__side">
                      <span
                        className={`badge badge-${
                          f.estado === "disponible" ? "confirmado" : "pendiente"
                        }`}
                      >
                        {f.estado}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={accionandoId === f.id_disponibilidad}
                          onClick={() => handleCambiarEstado(f)}
                        >
                          {f.estado === "disponible" ? "Marcar ocupado" : "Liberar"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={accionandoId === f.id_disponibilidad}
                          onClick={() => handleEliminar(f.id_disponibilidad)}
                          title="Eliminar franja"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Disponibilidad;
