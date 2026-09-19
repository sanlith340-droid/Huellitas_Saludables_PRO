import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaPaw, FaCalendarAlt, FaPlus } from "react-icons/fa";

function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  confirmado: "Confirmada",
  cancelado: "Cancelada",
  atendido: "Atendida",
};

function Dashboard() {
  const { usuario } = useAuth();

  if (usuario?.rol === "especialista") {
    return <Navigate to="/citas/especialista" replace />;
  }

  if (usuario?.rol === "recepcionista" || usuario?.rol === "admin") {
    return <Navigate to="/disponibilidad" replace />;
  }

  return <DashboardUsuario usuario={usuario} />;
}

function DashboardUsuario({ usuario }) {

  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resMascotas = await api.get("/mascotas");
      const misMascotas = (resMascotas.data.data || []).filter(
        (m) => m.propietario_id === usuario?.id_usuario
      );
      setMascotas(misMascotas);

      const idsMascotas = new Set(misMascotas.map((m) => m.id_mascota));

      const resCitas = await api.get("/citas");
      const misCitas = (resCitas.data.data || []).filter((c) =>
        idsMascotas.has(c.id_mascota)
      );
      setCitas(misCitas);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo conectar con el servidor. Verifica que el backend y la base de datos estén activos."
      );
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCancelar = async (id_cita) => {
    setCancelandoId(id_cita);
    try {
      await api.patch(`/citas/${id_cita}/cancelar`);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cancelar la cita.");
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Hola, {usuario?.nombre || "de nuevo"}</h1>
          <p>Este es el resumen de tu cuenta en Huellitas Saludables.</p>
        </div>
        <span className="badge">{usuario?.rol}</span>
      </div>

      {error && <p className="message message-error">{error}</p>}

      <div className="dash-grid">
        <div className="panel">
          <div className="panel__head">
            <h2>Mascotas</h2>
            <Link to="/mascotas/nueva" className="btn btn-outline btn-sm">
              <FaPlus /> Agregar
            </Link>
          </div>

          {cargando ? (
            <p className="empty-state">Cargando mascotas...</p>
          ) : mascotas.length === 0 ? (
            <p className="empty-state">Aún no tienes mascotas registradas.</p>
          ) : (
            mascotas.map((mascota, i) => (
              <div className="list-item" key={mascota.id_mascota ?? i}>
                <div className="list-item__icon">
                  <FaPaw />
                </div>
                <div>
                  <div className="list-item__title">{mascota.mascota}</div>
                  <div className="list-item__meta">
                    {mascota.especie}
                    {mascota.raza ? ` · ${mascota.raza}` : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2>Citas</h2>
            <Link to="/citas/nueva" className="btn btn-outline btn-sm">
              <FaPlus /> Agendar
            </Link>
          </div>

          {cargando ? (
            <p className="empty-state">Cargando citas...</p>
          ) : citas.length === 0 ? (
            <p className="empty-state">No tienes citas agendadas.</p>
          ) : (
            citas.map((cita, i) => (
              <div className="list-item list-item--cita" key={cita.id_cita ?? i}>
                <div className="list-item__icon">
                  <FaCalendarAlt />
                </div>
                <div className="list-item__body">
                  <div className="list-item__title">{cita.motivo}</div>
                  <div className="list-item__meta">
                    {cita.mascota_nombre} · {formatearFecha(cita.fecha_cita)} · {cita.hora_cita}
                  </div>
                  <div className="list-item__meta">
                    Dr(a). {cita.especialista_nombre} {cita.especialista_apellidos}
                  </div>
                </div>
                <div className="list-item__side">
                  <span className={`badge badge-${cita.estado}`}>
                    {ESTADO_LABEL[cita.estado] || cita.estado}
                  </span>
                  {cita.estado !== "cancelado" && cita.estado !== "atendido" && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={cancelandoId === cita.id_cita}
                      onClick={() => handleCancelar(cita.id_cita)}
                    >
                      {cancelandoId === cita.id_cita ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
