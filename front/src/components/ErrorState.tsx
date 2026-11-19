import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import userConfused from "../assets/errors/user-confused.png";
import notFoundSearch from "../assets/errors/not-found-search.png";
import serverVet from "../assets/errors/server-vet.png";
import appointmentCalendar from "../assets/errors/appointment-calendar.png";
import searchEmpty from "../assets/errors/search-empty.png";
import accessProtected from "../assets/errors/access-protected.png";

type ErrorVariant = "user" | "notFound" | "server" | "appointment" | "search" | "denied";

type Props = {
  variant: ErrorVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
};

const illustrations: Record<ErrorVariant, { src: string; alt: string }> = {
  user: { src: userConfused, alt: "Perrito confundido, buscando entender qué ocurrió" },
  notFound: { src: notFoundSearch, alt: "Perrito buscando algo que se perdió" },
  server: { src: serverVet, alt: "Perrito veterinario con expresión preocupada" },
  appointment: { src: appointmentCalendar, alt: "Perrito frente a un calendario con un horario no disponible" },
  search: { src: searchEmpty, alt: "Perrito mirando a través de una lupa" },
  denied: { src: accessProtected, alt: "Perrito junto a un escudo que protege su acceso" },
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
};

function ErrorState({
  variant,
  title,
  description,
  actionLabel,
  to,
  onAction,
  children,
  className = "",
}: Props) {
  const illustration = illustrations[variant];
  const content = defaults[variant];
  const role = variant === "search" ? "status" : "alert";

  return (
    <section className={`error-state error-state--${variant} ${className}`.trim()} role={role} aria-live={role === "alert" ? "assertive" : "polite"}>
      <div className="error-state__illustration-wrap">
        <img className="error-state__illustration" src={illustration.src} alt={illustration.alt} />
      </div>
      <div className="error-state__content">
        <p className="error-state__eyebrow">Huellitas Saludables</p>
        <h2>{title || content.title}</h2>
        <p className="error-state__description">{description || content.description}</p>
        {children}
        {(to || onAction) && actionLabel && (
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
      </div>
    </section>
  );
}

export default ErrorState;
