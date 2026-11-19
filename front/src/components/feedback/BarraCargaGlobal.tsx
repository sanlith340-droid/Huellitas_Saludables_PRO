/**
 * components/feedback/BarraCargaGlobal.tsx
 * Barra fina en la parte superior con el perrito corriendo.
 *
 * Se activa con cualquier petición a la API, incluso en pantallas que todavía
 * no tienen su propio indicador. Es la red de seguridad contra pantallas
 * "congeladas": si algo viaja por la red, se ve.
 */
import { usePeticionesActivas } from "../../services/loadingStore";
import perrito from "../../assets/feedback/perrito-corriendo.gif";
import perritoQuieto from "../../assets/feedback/perrito-corriendo.png";

function BarraCargaGlobal() {
  const activas = usePeticionesActivas();
  const visible = activas > 0;

  return (
    <div
      className={`barra-global${visible ? " is-visible" : ""}`}
      aria-hidden="true"
      data-peticiones={activas}
    >
      <span className="barra-global__pista">
        <span className="barra-global__relleno" />
        <span className="barra-global__huellas" />
      </span>
      <span className="barra-global__perrito">
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={perritoQuieto} />
          <img src={perrito} alt="" draggable={false} />
        </picture>
      </span>
    </div>
  );
}

export default BarraCargaGlobal;
