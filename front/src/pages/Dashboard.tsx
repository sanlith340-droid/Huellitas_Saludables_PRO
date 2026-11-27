import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaPaw, FaCalendarAlt, FaPlus } from "react-icons/fa";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import EmptyState from "../components/feedback/EmptyState";
import { SpinnerHuella } from "../components/feedback/BotonEnvio";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import { etiquetaEspecie } from "../utils/especies";

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

  if (usuario?.rol === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (usuario?.rol === "recepcionista") {
    return <Navigate to="/disponibilidad" replace />;
  }

  return <DashboardUsuario usuario={usuario} />;
}

function DashboardUsuario({ usuario }) {

  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [error, setError] = useState("");
  const [fallo, setFallo] = useState(null);
  const [errorServidor, setErrorServidor] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");
    setFallo(null);
    setErrorServidor(false);

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
      setErrorServidor(!err.response || err.response.status >= 500);
      setFallo(err);
      setError(mensajeDeError(err, "No se pudo cargar el resumen de tu cuenta."));
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
      setErrorServidor(!err.response || err.response.status >= 500);
      setFallo(err);
      setError(mensajeDeError(err, "No se pudo cancelar la cita."));
    } finally {
      setCancelandoId(null);
    }
  };

  if (errorServidor && error) {
    return (
      <div className="container error-page">
        <ErrorState
          variant="server"
          description={error}
          actionLabel="Reintentar"
          onAction={() => void cargarDatos()}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Hola, {usuario?.nombre || "de nuevo"}</h1>
          <p>Este es el resumen de tu cuenta en Huellitas Saludables.</p>
        </div>
        <span className="badge">{usuario?.rol}</span>
      </div>

      {error && !errorServidor && (
        <ErrorState
          variant={varianteDeError(fallo)}
          compacto
          title={tituloDeError(fallo)}
          description={error}
          onRetry={() => void cargarDatos()}
        />
      )}

      <div className="dash-grid">
        <div className="panel">
          <div className="panel__head">
            <h2>Mascotas</h2>
            <Link to="/mascotas/nueva" className="btn btn-outline btn-sm">
              <FaPlus /> Agregar
            </Link>
          </div>

          {cargando ? (
            <LoadingState variante="esqueleto" filas={3} titulo="Cargando mascotas" />
          ) : mascotas.length === 0 ? (
            <EmptyState
              variante="en-linea"
              ilustracion="mascotas"
              titulo="Aún no hay mascotas"
              descripcion="Registra a tu compañero para agendar su primera cita."
              accion={{ etiqueta: "Registrar mascota", to: "/mascotas/nueva" }}
            />
          ) : (
            mascotas.map((mascota, i) => (
              <div className="list-item" key={mascota.id_mascota ?? i}>
                <div className="list-item__icon">
                  <FaPaw />
                </div>
                <div>
                  <div className="list-item__title">{mascota.mascota}</div>
                  <div className="list-item__meta">
                    {etiquetaEspecie(mascota.especie)}
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
            <LoadingState variante="esqueleto" filas={3} titulo="Cargando citas" />
          ) : citas.length === 0 ? (
            <EmptyState
              variante="en-linea"
              ilustracion="citas"
              titulo="No tienes citas agendadas"
              descripcion="Cuando reserves un horario, aparecerá aquí con su estado."
              accion={{ etiqueta: "Agendar cita", to: "/citas/nueva" }}
            />
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
                      aria-busy={cancelandoId === cita.id_cita || undefined}
                      onClick={() => handleCancelar(cita.id_cita)}
                    >
                      {cancelandoId === cita.id_cita && <SpinnerHuella />}
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
