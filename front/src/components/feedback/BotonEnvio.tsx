/**
 * components/feedback/BotonEnvio.tsx
 * Botón de envío de formularios: al enviar muestra "Guardando...",
 * se deshabilita y gira una huella. Evita el doble envío y deja claro
 * que la app está trabajando.
 */
import type { ReactNode } from "react";

type Variante = "primary" | "outline" | "ghost" | "danger" | "outline-danger";

type Props = {
  guardando: boolean;
  texto: string;
  textoGuardando?: string;
  icono?: ReactNode;
  variante?: Variante;
  className?: string;
  bloque?: boolean;
  tamano?: "normal" | "sm";
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
};

/** Huella girando: el "spinner" de la marca. */
export function SpinnerHuella({ className = "" }: { className?: string }) {
  return (
    <span className={`huella-girando ${className}`.trim()} aria-hidden="true">
      <span className="huella-girando__aro" />
      <span className="huella-girando__punto" />
    </span>
  );
}

function BotonEnvio({
  guardando,
  texto,
  textoGuardando = "Guardando...",
  icono,
  variante = "primary",
  className = "",
  bloque = false,
  tamano = "normal",
  disabled = false,
  type = "submit",
  onClick,
  title,
  "aria-label": ariaLabel,
}: Props) {
  const clases = [
    "btn",
    `btn-${variante}`,
    tamano === "sm" ? "btn-sm" : "",
    bloque ? "btn-block" : "",
    "btn-envio",
    guardando ? "btn-envio--guardando" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={clases}
      type={type}
      onClick={onClick}
      disabled={guardando || disabled}
      aria-busy={guardando || undefined}
      aria-live="polite"
      title={title}
      aria-label={ariaLabel}
    >
      {guardando ? (
        <>
          <SpinnerHuella />
          <span>{textoGuardando}</span>
        </>
      ) : (
        <>
          {icono}
          <span>{texto}</span>
        </>
      )}
    </button>
  );
}

export default BotonEnvio;
