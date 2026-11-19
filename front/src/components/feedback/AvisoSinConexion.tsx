/**
 * components/feedback/AvisoSinConexion.tsx
 * Aviso flotante cuando el navegador pierde la conexión (y confirmación
 * cuando vuelve). Evita que la persona crea que la app "se dañó".
 */
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaWifi } from "react-icons/fa";

function AvisoSinConexion() {
  const [enLinea, setEnLinea] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [recuperado, setRecuperado] = useState(false);
  const estabaFuera = useRef(false);

  useEffect(() => {
    const alPerder = () => {
      estabaFuera.current = true;
      setRecuperado(false);
      setEnLinea(false);
    };
    const alVolver = () => {
      setEnLinea(true);
      if (estabaFuera.current) {
        setRecuperado(true);
        window.setTimeout(() => setRecuperado(false), 4200);
      }
    };

    window.addEventListener("offline", alPerder);
    window.addEventListener("online", alVolver);
    return () => {
      window.removeEventListener("offline", alPerder);
      window.removeEventListener("online", alVolver);
    };
  }, []);

  const visible = !enLinea || recuperado;

  return (
    <div
      className={`aviso-conexion${visible ? " is-visible" : ""}${
        enLinea ? " aviso-conexion--ok" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="aviso-conexion__icono" aria-hidden="true">
        {enLinea ? <FaCheckCircle /> : <FaWifi />}
      </span>
      <span className="aviso-conexion__texto">
        {enLinea ? (
          <>
            <strong>¡Volvimos!</strong> La conexión está de nuevo en marcha.
          </>
        ) : (
          <>
            <strong>Sin conexión.</strong> Tu perrito sigue esperando: revisa tu red y vuelve a intentarlo.
          </>
        )}
      </span>
    </div>
  );
}

export default AvisoSinConexion;
