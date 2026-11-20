/**
 * components/feedback/PerritoCorriendo.tsx
 * El perrito pixelado de la marca, corriendo sin parar.
 *
 * Se usa como señal de "estamos trabajando en eso": mientras la API responde,
 * el perrito corre sobre su pista y va dejando huellas.
 */
import { useEffect, useState } from "react";
import perritoAnimado from "../../assets/feedback/perrito-corriendo.gif";
import perritoQuieto from "../../assets/feedback/perrito-corriendo.png";

type Props = {
  /** Tamaño del perrito en píxeles (ancho). */
  tamano?: number;
  /** Muestra el fondo de pradera, sol y nubes. */
  escenario?: boolean;
  className?: string;
};

/** Respeta a quien pidió menos movimiento en su sistema. */
function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducido(consulta.matches);
    actualizar();
    consulta.addEventListener?.("change", actualizar);
    return () => consulta.removeEventListener?.("change", actualizar);
  }, []);

  return reducido;
}

function PerritoCorriendo({ tamano = 220, escenario = true, className = "" }: Props) {
  const reducido = useMovimientoReducido();

  return (
    <div
      className={`perrito-escena ${escenario ? "perrito-escena--escenario" : ""} ${className}`.trim()}
      style={{ ["--perrito-ancho" as string]: `${tamano}px` }}
      aria-hidden="true"
    >
      {escenario && (
        <>
          <span className="perrito-escena__sol" />
          <span className="perrito-escena__nube perrito-escena__nube--1" />
          <span className="perrito-escena__nube perrito-escena__nube--2" />
          <span className="perrito-escena__nube perrito-escena__nube--3" />
        </>
      )}

      <span className="perrito-escena__lineas">
        <i />
        <i />
        <i />
      </span>

      <div className="perrito-escena__corredor">
        <img
          className="perrito-escena__sprite"
          src={reducido ? perritoQuieto : perritoAnimado}
          alt=""
          draggable={false}
        />
        <span className="perrito-escena__sombra" />
        <span className="perrito-escena__polvo">
          <i />
          <i />
          <i />
        </span>
      </div>

      <span className="perrito-escena__pista">
        <span className="perrito-escena__rayas" />
      </span>

      <span className="perrito-escena__huellas">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export default PerritoCorriendo;
