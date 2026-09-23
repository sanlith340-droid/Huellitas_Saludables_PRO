import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import huLogo from "../assets/hu.png";

function Navbar() {
  const { usuario, autenticado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const panelPath =
    usuario?.rol === "especialista"
      ? "/citas/especialista"
      : usuario?.rol === "recepcionista" || usuario?.rol === "admin"
      ? "/disponibilidad"
      : "/dashboard";

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">
            <img src={huLogo} alt="Huellitas Saludables" />
          </span>
          Huellitas Saludables
        </Link>

        <nav className="navbar__links">
          {autenticado ? (
            <>
              <Link to={panelPath}>
                {usuario?.rol === "especialista"
                  ? "Mis citas"
                  : usuario?.rol === "recepcionista" || usuario?.rol === "admin"
                  ? "Disponibilidad"
                  : "Mi panel"}
              </Link>
              {usuario?.rol === "usuario" && <Link to="/citas/nueva">Agendar cita</Link>}
              <div className="navbar__user">
                <span>
                  {usuario?.nombre} · <span className="badge">{usuario?.rol}</span>
                </span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
