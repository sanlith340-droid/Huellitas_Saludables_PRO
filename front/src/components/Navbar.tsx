import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaHome,
  FaPaw,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import huLogo from "../assets/hu.png";

type NavItem = {
  label: string;
  to: string;
  icon: typeof FaHome;
  section: "inicio" | "mascotas" | "citas" | "perfil";
};

function Navbar() {
  const { usuario, autenticado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const rol = usuario?.rol?.toLowerCase();
  const inicioPath = autenticado && (rol === "usuario" || !rol) ? "/dashboard" : "/";
  const citasPath =
    rol === "especialista"
      ? "/citas/especialista"
      : rol === "recepcionista"
        ? "/disponibilidad"
        : rol === "admin"
          ? "/admin"
          : "/citas/nueva";
  const items: NavItem[] = [
    { label: "Inicio", to: inicioPath, icon: FaHome, section: "inicio" },
    ...(autenticado
      ? [
          { label: "Mascotas", to: "/mascotas", icon: FaPaw, section: "mascotas" as const },
          { label: "Citas", to: citasPath, icon: FaCalendarCheck, section: "citas" as const },
          { label: "Perfil", to: "/perfil", icon: FaUserCircle, section: "perfil" as const },
        ]
      : []),
  ];

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuAbierto) return undefined;
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAbierto(false);
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [menuAbierto]);

  const estaActivo = (section: NavItem["section"]) => {
    const path = location.pathname;
    if (section === "inicio") {
      return path === "/" || (autenticado && path === "/dashboard");
    }
    if (section === "mascotas") return path.startsWith("/mascotas");
    if (section === "citas") {
      return ["/citas", "/disponibilidad", "/admin"].some((prefix) => path.startsWith(prefix));
    }
    return path.startsWith("/perfil");
  };

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={inicioPath} className="brand" aria-label="Huellitas Saludables, ir a Inicio">
          <span className="brand__mark">
            <img src={huLogo} alt="" />
          </span>
          <span className="brand__name">Huellitas Saludables</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={menuAbierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={menuAbierto}
          aria-controls="navegacion-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>

        <nav
          id="navegacion-principal"
          className={`navbar__menu${menuAbierto ? " is-open" : ""}`}
          aria-label="Navegación principal"
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuAbierto(false);
          }}
        >
          <div className="navbar__links">
            {items.map(({ label, to, icon: Icon, section }) => {
              const active = estaActivo(section);
              return (
                <Link
                  key={section}
                  to={to}
                  className={`navbar__link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icon className="navbar__link-icon" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {autenticado ? (
            <div className="navbar__account">
              <span className="navbar__greeting">
                <span className="navbar__avatar" aria-hidden="true">
                  {(usuario?.nombre?.trim().charAt(0) || "H").toLocaleUpperCase("es-CO")}
                </span>
                <span className="navbar__greeting-text">
                  <strong>{usuario?.nombre || "Mi cuenta"}</strong>
                  <small>{usuario?.rol || "usuario"}</small>
                </span>
              </span>
              <button type="button" className="navbar__logout" onClick={handleLogout}>
                <FaSignOutAlt aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div className="navbar__account navbar__account--public">
              <Link to="/login" className="navbar__login" onClick={() => setMenuAbierto(false)}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary navbar__signup" onClick={() => setMenuAbierto(false)}>
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
