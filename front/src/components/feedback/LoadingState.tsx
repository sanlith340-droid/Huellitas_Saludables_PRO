/**
 * components/feedback/LoadingState.tsx
 * Pantalla de carga con el perrito corriendo.
 *
 * Variantes:
 *  - "pagina": escena grande (sol, pradera, huellas) para cargas de pantalla completa.
 *  - "panel":  versión compacta para el interior de una tarjeta.
 *  - "en-linea": una sola línea con el perrito en miniatura.
 *  - "esqueleto": solo bloques grises con la forma del contenido.
 */
import { useEffect, useMemo, useState } from "react";
import PerritoCorriendo from "./PerritoCorriendo";
import { EsqueletoFilas } from "./Esqueletos";

type Variante = "pagina" | "panel" | "en-linea" | "esqueleto";

type Props = {
  variante?: Variante;
  titulo?: string;
  mensajes?: string[];
  /** Filas de esqueleto que se muestran debajo de la escena. */
  filas?: number;
  conEsqueleto?: boolean;
  /** Texto para la variante "en-linea". */
  etiqueta?: string;
  tamano?: number;
  className?: string;
};

const MENSAJES_POR_DEFECTO = [
  "Buscando las fichas clínicas...",
  "Acomodando las camitas de la sala de espera...",
  "Revisando el calendario de los especialistas...",
  "Peinando los datos para que todo se vea bonito...",
];

function useMensajeRotativo(mensajes: string[]) {
  const [indice, setIndice] = useState(0);
  const lista = useMemo(
    () => (mensajes.length > 0 ? mensajes : MENSAJES_POR_DEFECTO),
    [mensajes]
  );

  useEffect(() => {
    setIndice(0);
  }, [lista]);

  useEffect(() => {
    if (lista.length < 2) return undefined;
    const temporizador = window.setInterval(() => {
      setIndice((actual) => (actual + 1) % lista.length);
    }, 2400);
    return () => window.clearInterval(temporizador);
  }, [lista]);

  return lista[indice] ?? lista[0];
}

function LoadingState({
  variante = "panel",
  titulo,
  mensajes = [],
  filas = 3,
  conEsqueleto = false,
  etiqueta = "Cargando...",
  tamano,
  className = "",
}: Props) {
  const mensaje = useMensajeRotativo(mensajes);

  if (variante === "en-linea") {
    return (
      <span className={`carga-linea ${className}`.trim()} role="status" aria-live="polite">
        <PerritoCorriendo tamano={34} escenario={false} />
        <span className="carga-linea__texto">{etiqueta}</span>
        <span className="carga-linea__puntos" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </span>
    );
  }

  if (variante === "esqueleto") {
    return (
      <div
        className={`carga-esqueleto ${className}`.trim()}
        role="status"
        aria-busy="true"
        aria-label={titulo || etiqueta}
      >
        <EsqueletoFilas filas={filas} />
      </div>
    );
  }

  const esPagina = variante === "pagina";

  return (
    <section
      className={`carga carga--${variante} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="carga__escena">
        <PerritoCorriendo
          tamano={tamano ?? (esPagina ? 260 : 170)}
          escenario={esPagina}
        />
      </div>

      <div className="carga__texto">
        <p className="carga__eyebrow">
          <span className="carga__huella" aria-hidden="true" />
          Huellitas Saludables
        </p>
        <h2 className="carga__titulo">{titulo || "Estamos preparando todo"}</h2>
        <p className="carga__mensaje" key={mensaje}>
          {mensaje}
        </p>
      </div>

      <div className="carga__barra" aria-hidden="true">
        <span className="carga__barra-relleno" />
      </div>

      {conEsqueleto && (
        <div className="carga__esqueleto">
          <EsqueletoFilas filas={filas} />
        </div>
      )}
    </section>
  );
}

export default LoadingState;
