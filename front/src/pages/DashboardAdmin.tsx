import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaUsers, FaUserMd, FaConciergeBell, FaUserShield, FaArrowRight } from "react-icons/fa";

const ROL_LABEL = {
  especialista: "Especialista",
  recepcionista: "Recepcionista",
  admin: "Administrador",
};

function iniciales(nombre = "", apellidos = "") {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || "?";
}

function DashboardAdmin() {
  const { usuario } = useAuth();

  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const respuesta = await api.get("/usuarios/personal");
        setPersonal(respuesta.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudo cargar el resumen. Verifica que el backend esté activo."
        );
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const resumen = useMemo(
    () => ({
      total: personal.length,
      especialistas: personal.filter((p) => p.rol === "especialista").length,
      recepcionistas: personal.filter((p) => p.rol === "recepcionista").length,
      admins: personal.filter((p) => p.rol === "admin").length,
    }),
    [personal]
  );

  // Las 5 cuentas registradas más recientemente
  const recientes = useMemo(
    () =>
      [...personal]
        .sort((a, b) => String(b.fecha_registro).localeCompare(String(a.fecha_registro)))
        .slice(0, 5),
    [personal]
  );

  const valor = (n: number) => (cargando ? "–" : n);

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Panel de administración</h1>
          <p>Hola, {usuario?.nombre}. Administra las cuentas del personal de la clínica.</p>
        </div>
        <Link to="/usuarios/admin" className="btn btn-primary btn-sm">
          <FaUsers /> Gestionar personal
        </Link>
      </div>

      {error && <p className="message message-error">{error}</p>}

      <div className="admin-stats">
        <Link to="/usuarios/admin" className="stat-card">
          <span className="stat-card__icon">
            <FaUsers />
          </span>
          <span className="stat-card__value">{valor(resumen.total)}</span>
          <span className="stat-card__label">Cuentas de personal</span>
        </Link>

        <Link to="/usuarios/admin" className="stat-card">
          <span className="stat-card__icon">
            <FaUserMd />
          </span>
          <span className="stat-card__value">{valor(resumen.especialistas)}</span>
          <span className="stat-card__label">Especialistas</span>
        </Link>

        <Link to="/usuarios/admin" className="stat-card">
          <span className="stat-card__icon">
            <FaConciergeBell />
          </span>
          <span className="stat-card__value">{valor(resumen.recepcionistas)}</span>
          <span className="stat-card__label">Recepcionistas</span>
        </Link>

        <Link to="/usuarios/admin" className="stat-card">
          <span className="stat-card__icon">
            <FaUserShield />
          </span>
          <span className="stat-card__value">{valor(resumen.admins)}</span>
          <span className="stat-card__label">Administradores</span>
        </Link>
      </div>

      <section className="panel admin-recent">
        <div className="panel__head">
          <h2>Cuentas registradas recientemente</h2>
          <Link to="/usuarios/admin" className="admin-link">
            Ver todo el personal <FaArrowRight />
          </Link>
        </div>

        {cargando ? (
          <p className="empty-state">Cargando...</p>
        ) : recientes.length === 0 ? (
          <p className="empty-state">Aún no hay personal registrado.</p>
        ) : (
          recientes.map((p) => (
            <div className="list-item" key={p.id_usuario}>
              <div className="doctor-card__avatar">{iniciales(p.nombre, p.apellidos)}</div>
              <div className="list-item__body">
                <div className="list-item__title">
                  {p.nombre} {p.apellidos}
                </div>
                <div className="list-item__meta">
                  {p.correo} · ID {p.id_usuario}
                </div>
              </div>
              <div className="list-item__side">
                <span className={`badge badge-rol badge-rol--${p.rol}`}>{ROL_LABEL[p.rol]}</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default DashboardAdmin;
