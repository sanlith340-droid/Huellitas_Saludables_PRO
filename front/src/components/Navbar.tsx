import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBell,
  FaCalendarAlt,
  FaCalendarCheck,
  FaHome,
  FaPaw,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { rutaInicioPorRol } from "../utils/roleMessages";
import huLogo from "../assets/hu.png";

type NavItem = {
  label: string;
  to: string;
  icon: typeof FaHome;
  activePaths?: string[];
};

const ROLE_LABEL: Record<string, string> = {
  usuario: "Usuario",
  especialista: "Especialista",
  recepcionista: "Recepción",
  admin: "Administrador",
};

const ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  usuario: [
    { label: "Mi panel", to: "/dashboard", icon: FaHome },
    { label: "Mascotas", to: "/mascotas", icon: FaPaw },
    { label: "Solicitar cita", to: "/citas/nueva", icon: FaCalendarCheck, activePaths: ["/citas"] },
    { label: "Perfil", to: "/perfil", icon: FaUserCircle },
  ],
  especialista: [
    { label: "Mis citas", to: "/citas/especialista", icon: FaCalendarCheck, activePaths: ["/citas"] },
    { label: "Notificaciones", to: "/notificaciones", icon: FaBell },
    { label: "Perfil", to: "/perfil", icon: FaUserCircle },
  ],
  recepcionista: [
    { label: "Agenda", to: "/disponibilidad", icon: FaCalendarAlt },
    { label: "Citas", to: "/citas/recepcion", icon: FaCalendarCheck, activePaths: ["/citas"] },
    { label: "Perfil", to: "/perfil", icon: FaUserCircle },
  ],
  admin: [
    { label: "Panel", to: "/admin", icon: FaHome },
    { label: "Personal", to: "/usuarios/admin", icon: FaUsers, activePaths: ["/usuarios"] },
    { label: "Disponibilidad", to: "/disponibilidad", icon: FaCalendarAlt },
    { label: "Citas", to: "/citas/admin", icon: FaCalendarCheck, activePaths: ["/citas"] },
    { label: "Perfil", to: "/perfil", icon: FaUserCircle },
  ],
};

function Navbar() {
  const { usuario, autenticado, logout, cerrandoSesion } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const rol = usuario?.rol?.toLowerCase() || "";
  const inicioPath = autenticado ? rutaInicioPorRol(rol) : "/";
  const items: NavItem[] = autenticado
    ? ITEMS_BY_ROLE[rol] || [{ label: "Perfil", to: "/perfil", icon: FaUserCircle }]
    : [{ label: "Inicio", to: "/", icon: FaHome }];

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

  const estaActivo = (item: NavItem) => {
    const path = location.pathname;
    return [item.to, ...(item.activePaths || [])].some(
      (ruta) => path === ruta || (ruta !== "/" && path.startsWith(`${ruta}/`))
    );
  };

  // La revocación del token, la limpieza local y la redirección viven en AuthContext.
  const handleLogout = () => {
    setMenuAbierto(false);
    void logout();
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={inicioPath} className="brand" aria-label="Huellitas Saludables, ir a mi panel">
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
            {items.map((item) => {
              const { label, to, icon: Icon } = item;
              const active = estaActivo(item);
              return (
                <Link
                  key={`${to}-${label}`}
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
                  <small>{ROLE_LABEL[rol] || usuario?.rol || "Usuario"}</small>
                </span>
              </span>
              <button
                type="button"
                className="navbar__logout"
                onClick={handleLogout}
                disabled={cerrandoSesion}
                aria-busy={cerrandoSesion}
              >
                <FaSignOutAlt aria-hidden="true" />
                <span>{cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}</span>
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
