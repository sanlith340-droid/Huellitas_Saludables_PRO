import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FaRedo } from "react-icons/fa";
import userConfused from "../assets/errors/user-confused.png";
import notFoundSearch from "../assets/errors/not-found-search.png";
import serverVet from "../assets/errors/server-vet.png";
import appointmentCalendar from "../assets/errors/appointment-calendar.png";
import searchEmpty from "../assets/errors/search-empty.png";
import accessProtected from "../assets/errors/access-protected.png";
import { SpinnerHuella } from "./feedback/BotonEnvio";

type ErrorVariant =
  | "user"
  | "notFound"
  | "server"
  | "appointment"
  | "search"
  | "denied"
  | "network"
  | "timeout";

type Props = {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  /** Muestra un botón "Reintentar" con estado de carga propio. */
  onRetry?: () => void;
  reintentando?: boolean;
  /** Pista técnica corta (por ejemplo, el código HTTP). */
  detalle?: string;
  /** Se muestra como una tarjeta dentro de un panel, no a pantalla completa. */
  compacto?: boolean;
  className?: string;
  children?: ReactNode;
};

const illustrations: Record<ErrorVariant, { src: string; alt: string }> = {
  user: { src: userConfused, alt: "Perrito confundido, buscando entender qué ocurrió" },
  notFound: { src: notFoundSearch, alt: "Perrito buscando algo que se perdió" },
  server: { src: serverVet, alt: "Perrito veterinario con expresión preocupada" },
  appointment: { src: appointmentCalendar, alt: "Perrito frente a un calendario con un horario no disponible" },
  search: { src: searchEmpty, alt: "Perrito mirando a través de una lupa" },
  denied: { src: accessProtected, alt: "Perrito junto a un escudo que protege su acceso" },
  network: { src: serverVet, alt: "Perrito veterinario sin señal de conexión" },
  timeout: { src: serverVet, alt: "Perrito veterinario esperando una respuesta que tarda" },
};

const defaults: Record<ErrorVariant, { title: string; description: string }> = {
  user: {
    title: "No pudimos validar tus datos",
    description: "Revisa la información de tu cuenta e inténtalo de nuevo.",
  },
  notFound: {
    title: "Esta página se perdió",
    description: "No encontramos lo que buscas. Vuelve al inicio y te ayudamos a encontrar el camino.",
  },
  server: {
    title: "Tuvimos un inconveniente",
    description: "El servicio no está disponible por ahora. Inténtalo de nuevo en unos momentos.",
  },
  appointment: {
    title: "Ese horario ya no está disponible",
    description: "Elige otra fecha u horario para continuar con la reserva.",
  },
  search: {
    title: "No encontramos resultados",
    description: "Prueba con otros términos o revisa los filtros de búsqueda.",
  },
  denied: {
    title: "Esta sección tiene acceso protegido",
    description: "Tu cuenta no tiene permiso para ver esta sección.",
  },
  network: {
    title: "No pudimos conectar con la clínica",
    description:
      "Revisa tu conexión a internet y confirma que el servidor esté encendido. En cuanto vuelva la señal, todo aparecerá de nuevo.",
  },
  timeout: {
    title: "La clínica está tardando demasiado",
    description:
      "La respuesta no llegó a tiempo. Puede ser la conexión o un servidor ocupado; prueba otra vez en unos segundos.",
  },
};

function ErrorState({
  variant = "server",
  title,
  description,
  actionLabel,
  to,
  onAction,
  onRetry,
  reintentando = false,
  detalle,
  compacto = false,
  className = "",
  children,
}: Props) {
  const illustration = illustrations[variant];
  const content = defaults[variant];
  const role = variant === "search" ? "status" : "alert";
  const accion = actionLabel && (to || onAction);
  const reintento = !accion && onRetry;

  return (
    <section
      className={`error-state error-state--${variant}${compacto ? " error-state--panel" : ""} ${className}`.trim()}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      data-variant={variant}
    >
      <div className="error-state__illustration-wrap">
        <img className="error-state__illustration" src={illustration.src} alt={illustration.alt} />
      </div>
      <div className="error-state__content">
        <p className="error-state__eyebrow">Huellitas Saludables</p>
        <h2>{title || content.title}</h2>
        <p className="error-state__description">{description || content.description}</p>
        {detalle && <p className="error-state__detalle">{detalle}</p>}
        {children}
        {accion && actionLabel && (
          to ? (
            <Link className="btn btn-primary error-state__action" to={to}>
              {actionLabel}
            </Link>
          ) : (
            <button className="btn btn-primary error-state__action" type="button" onClick={onAction}>
              {actionLabel}
            </button>
          )
        )}
        {reintento && (
          <button
            className="btn btn-primary error-state__action"
            type="button"
            onClick={onRetry}
            disabled={reintentando}
            aria-busy={reintentando || undefined}
          >
            {reintentando ? <SpinnerHuella /> : <FaRedo aria-hidden="true" />}
            {reintentando ? "Reintentando..." : "Reintentar"}
          </button>
        )}
      </div>
    </section>
  );
}

export default ErrorState;
