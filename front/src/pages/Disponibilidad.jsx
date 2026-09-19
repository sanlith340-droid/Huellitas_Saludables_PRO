import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { FaTrash, FaCalendarPlus } from "react-icons/fa";

const ESTADO_INICIAL = {
  id_usuario: "",
  fecha: "",
  hora: "",
  estado: "disponible",
};

function Disponibilidad() {
  const [especialistas, setEspecialistas] = useState([]);
  const [franjas, setFranjas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState("");
  const [accionandoId, setAccionandoId] = useState(null);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeForm("");
    setEnviando(true);

    try {
      await api.post("/disponibilidad", form);
      setForm(ESTADO_INICIAL);
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
          <p>Crea, organiza y libera franjas horarias para el equipo veterinario.</p>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}

      <div className="dash-grid dash-grid--wide">
        <div className="panel">
          <div className="panel__head">
            <h2>Nueva franja horaria</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
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

            <div className="field-row">
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
            </div>

            <button className="btn btn-primary btn-block" disabled={enviando}>
              <FaCalendarPlus /> {enviando ? "Creando..." : "Crear franja"}
            </button>

            {mensajeForm && <p className="message message-error">{mensajeForm}</p>}
          </form>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2>Franjas registradas</h2>
          </div>

          {cargando ? (
            <p className="empty-state">Cargando...</p>
          ) : franjas.length === 0 ? (
            <p className="empty-state">Aún no hay franjas horarias registradas.</p>
          ) : (
            franjas.map((f) => (
              <div className="list-item list-item--cita" key={f.id_disponibilidad}>
                <div className="list-item__body">
                  <div className="list-item__title">
                    {f.especialista_nombre} {f.especialista_apellidos}
                  </div>
                  <div className="list-item__meta">
                    {f.fecha?.slice(0, 10)} · {f.hora}
                    {f.especializacion ? ` · ${f.especializacion}` : ""}
                  </div>
                </div>
                <div className="list-item__side">
                  <span className={`badge badge-${f.estado === "disponible" ? "confirmado" : "pendiente"}`}>
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
      </div>
    </div>
  );
}

export default Disponibilidad;
