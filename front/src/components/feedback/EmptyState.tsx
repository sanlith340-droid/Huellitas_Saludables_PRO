/**
 * components/feedback/EmptyState.tsx
 * Estado vacío con ilustración: cuando la API responde bien pero no hay nada
 * que mostrar. Nunca deja un hueco en blanco: explica qué pasa y qué hacer.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import vacioMascotas from "../../assets/feedback/vacio-mascotas.webp";
import vacioCitas from "../../assets/feedback/vacio-citas.webp";
import vacioBusqueda from "../../assets/feedback/vacio-busqueda.webp";
import vacioHorarios from "../../assets/feedback/vacio-horarios.webp";
import vacioPersonal from "../../assets/feedback/vacio-personal.webp";

type Ilustracion = "mascotas" | "citas" | "busqueda" | "horarios" | "personal" | "generico";

type Accion = {
  etiqueta: string;
  to?: string;
  onClick?: () => void;
  variante?: "primary" | "outline" | "ghost";
};

type Props = {
  ilustracion?: Ilustracion;
  titulo: string;
  descripcion?: string;
  accion?: Accion;
  accionSecundaria?: Accion;
  sugerencias?: string[];
  variante?: "tarjeta" | "panel" | "en-linea";
  className?: string;
  children?: ReactNode;
};

const ILUSTRACIONES: Record<Ilustracion, { src: string; alt: string }> = {
  mascotas: {
    src: vacioMascotas,
    alt: "Perrito junto a un plato de comida vacío y un collar esperando a su mascota",
  },
  citas: {
    src: vacioCitas,
    alt: "Perrito frente a un calendario sin citas marcadas",
  },
  busqueda: {
    src: vacioBusqueda,
    alt: "Perrito mirando a través de una lupa sin encontrar resultados",
  },
  horarios: {
    src: vacioHorarios,
    alt: "Perrito junto a un reloj y una agenda sin horarios",
  },
  personal: {
    src: vacioPersonal,
    alt: "Perrito con bata de veterinario y un portapapeles vacío",
  },
  generico: {
    src: vacioMascotas,
    alt: "Perrito esperando tranquilo",
  },
};

function BotonAccion({ accion }: { accion: Accion }) {
  const clase = `btn btn-${accion.variante || "primary"} vacio__accion`;
  if (accion.to) {
    return (
      <Link className={clase} to={accion.to}>
        {accion.etiqueta}
      </Link>
    );
  }
  return (
    <button className={clase} type="button" onClick={accion.onClick}>
      {accion.etiqueta}
    </button>
  );
}

function EmptyState({
  ilustracion = "generico",
  titulo,
  descripcion,
  accion,
  accionSecundaria,
  sugerencias = [],
  variante = "panel",
  className = "",
  children,
}: Props) {
  const arte = ILUSTRACIONES[ilustracion];

  return (
    <section
      className={`vacio vacio--${variante} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="vacio__arte">
        <img className="vacio__imagen" src={arte.src} alt={arte.alt} loading="lazy" />
      </div>

      <div className="vacio__contenido">
        <p className="vacio__eyebrow">Huellitas Saludables</p>
        <h3 className="vacio__titulo">{titulo}</h3>
        {descripcion && <p className="vacio__descripcion">{descripcion}</p>}

        {sugerencias.length > 0 && (
          <ul className="vacio__sugerencias">
            {sugerencias.map((sugerencia) => (
              <li key={sugerencia}>
                <span aria-hidden="true">🐾</span>
                {sugerencia}
              </li>
            ))}
          </ul>
        )}

        {children}

        {(accion || accionSecundaria) && (
          <div className="vacio__acciones">
            {accion && <BotonAccion accion={accion} />}
            {accionSecundaria && <BotonAccion accion={{ variante: "outline", ...accionSecundaria }} />}
          </div>
        )}
      </div>
    </section>
  );
}

export default EmptyState;
