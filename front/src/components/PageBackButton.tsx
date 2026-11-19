import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import mascot from "../assets/huellitas-mascota-web.jpg";

function PageBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { autenticado, usuario } = useAuth();
  const historyState = window.history.state as { idx?: unknown } | null;
  const historyIndex = historyState?.idx;
  const tienePaginaAnterior = typeof historyIndex === "number" && historyIndex > 0;

  if (location.pathname === "/" && !tienePaginaAnterior) return null;

  const regresar = () => {
    if (tienePaginaAnterior) {
      navigate(-1);
      return;
    }

    const esTutor = usuario?.rol?.toLowerCase() === "usuario";
    navigate(autenticado && esTutor ? "/dashboard" : "/", { replace: true });
  };

  return (
    <div className="container page-backbar">
      <button
        className="page-backbar__button"
        type="button"
        onClick={regresar}
        aria-label="Regresar a la página anterior"
      >
        <FaArrowLeft aria-hidden="true" />
        <span>Regresar</span>
      </button>

      <div className="page-backbar__mascot" aria-hidden="true">
        <span className="page-backbar__caption">Un paso a la vez</span>
        <img src={mascot} alt="" />
      </div>
    </div>
  );
}

export default PageBackButton;
