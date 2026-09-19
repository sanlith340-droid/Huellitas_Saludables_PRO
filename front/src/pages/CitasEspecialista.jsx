import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaPaw, FaClock } from "react-icons/fa";

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  confirmado: "Confirmada",
  cancelado: "Cancelada",
  atendido: "Atendida",
};

function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const fecha = new Date(String(fechaISO).slice(0, 10) + "T00:00:00");
  return fecha.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function CitasEspecialista() {
  const { usuario } = useAuth();

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario?.id_usuario) return;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const respuesta = await api.get(`/citas/especialista/${usuario.id_usuario}`);
        setCitas(respuesta.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar tus citas. Verifica que el backend esté activo."
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [usuario]);

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Mis citas</h1>
          <p>Consultas asignadas para {usuario?.nombre}.</p>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}

      <div className="panel" style={{ marginTop: 24 }}>
        {cargando ? (
          <p className="empty-state">Cargando citas...</p>
        ) : citas.length === 0 ? (
          <p className="empty-state">No tienes citas asignadas por el momento.</p>
        ) : (
          citas.map((cita) => (
            <div className="list-item list-item--cita" key={cita.id_cita}>
              <div className="list-item__icon">
                <FaPaw />
              </div>
              <div className="list-item__body">
                <div className="list-item__title">
                  {cita.mascota_nombre} · {cita.motivo}
                </div>
                <div className="list-item__meta">
                  <FaClock /> {formatearFecha(cita.fecha_cita)} · {cita.hora_cita}
                </div>
              </div>
              <div className="list-item__side">
                <span className={`badge badge-${cita.estado}`}>
                  {ESTADO_LABEL[cita.estado] || cita.estado}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CitasEspecialista;
