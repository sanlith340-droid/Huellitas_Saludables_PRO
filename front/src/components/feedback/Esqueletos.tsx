/**
 * components/feedback/Esqueletos.tsx
 * Piezas de "esqueleto" (skeleton) que ocupan el lugar del contenido real
 * mientras llegan los datos. Así ninguna pantalla se ve vacía ni salta de
 * golpe cuando la API responde.
 */
import type { CSSProperties } from "react";

type BloqueProps = {
  ancho?: string | number;
  alto?: number;
  radio?: number;
  className?: string;
  style?: CSSProperties;
};

export function Esqueleto({ ancho = "100%", alto = 12, radio = 999, className = "", style }: BloqueProps) {
  return (
    <span
      className={`esqueleto ${className}`.trim()}
      style={{ width: ancho, height: alto, borderRadius: radio, ...style }}
      aria-hidden="true"
    />
  );
}

export function EsqueletoTexto({
  lineas = 3,
  anchoUltima = "58%",
  alto = 11,
}: {
  lineas?: number;
  anchoUltima?: string;
  alto?: number;
}) {
  return (
    <span className="esqueleto-texto" aria-hidden="true">
      {Array.from({ length: lineas }).map((_, indice) => (
        <Esqueleto
          key={indice}
          alto={alto}
          ancho={indice === lineas - 1 ? anchoUltima : `${88 + ((indice * 7) % 12)}%`}
        />
      ))}
    </span>
  );
}

/** Filas tipo "lista": círculo + dos líneas. Ideal para mascotas, citas o personal. */
export function EsqueletoFilas({ filas = 3, conIcono = true }: { filas?: number; conIcono?: boolean }) {
  return (
    <div className="esqueleto-filas" aria-hidden="true">
      {Array.from({ length: filas }).map((_, indice) => (
        <div className="esqueleto-fila" key={indice}>
          {conIcono && <Esqueleto ancho={38} alto={38} radio={10} className="esqueleto--icono" />}
          <div className="esqueleto-fila__texto">
            <Esqueleto ancho={`${52 + ((indice * 9) % 26)}%`} alto={12} />
            <Esqueleto ancho={`${30 + ((indice * 13) % 24)}%`} alto={9} />
          </div>
          <Esqueleto ancho={64} alto={20} className="esqueleto--pastilla" />
        </div>
      ))}
    </div>
  );
}

/** Tarjetas de estadística del panel de administración. */
export function EsqueletoEstadisticas({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="esqueleto-stats" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, indice) => (
        <div className="esqueleto-stat" key={indice}>
          <Esqueleto ancho={34} alto={34} radio={10} />
          <Esqueleto ancho="46%" alto={26} radio={8} />
          <Esqueleto ancho="72%" alto={10} />
        </div>
      ))}
    </div>
  );
}

/** Rejilla de días de la agenda de disponibilidad. */
export function EsqueletoSemana({ dias = 7 }: { dias?: number }) {
  return (
    <div className="esqueleto-semana" aria-hidden="true">
      {Array.from({ length: dias }).map((_, indice) => (
        <div className="esqueleto-dia" key={indice}>
          <Esqueleto ancho="52%" alto={9} />
          <Esqueleto ancho="78%" alto={18} radio={6} />
          <Esqueleto ancho="64%" alto={8} />
        </div>
      ))}
    </div>
  );
}

/** Tarjetas de especialista (agendar cita). */
export function EsqueletoDoctores({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="esqueleto-doctores" aria-hidden="true">
      {Array.from({ length: cantidad }).map((_, indice) => (
        <div className="esqueleto-doctor" key={indice}>
          <Esqueleto ancho={44} alto={44} radio={12} />
          <div className="esqueleto-fila__texto">
            <Esqueleto ancho={`${58 + ((indice * 11) % 20)}%`} alto={11} />
            <Esqueleto ancho="46%" alto={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ficha de perfil: avatar + filas de datos. */
export function EsqueletoPerfil() {
  return (
    <div className="esqueleto-perfil" aria-hidden="true">
      <div className="esqueleto-perfil__cabeza">
        <Esqueleto ancho={64} alto={64} radio={20} />
        <div className="esqueleto-fila__texto">
          <Esqueleto ancho="46%" alto={20} radio={7} />
          <Esqueleto ancho="30%" alto={10} />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, indice) => (
        <div className="esqueleto-perfil__fila" key={indice}>
          <Esqueleto ancho="32%" alto={11} />
          <Esqueleto ancho="54%" alto={11} />
        </div>
      ))}
    </div>
  );
}

/** Grupo de citas: encabezado de fecha + filas. */
export function EsqueletoCitas({ grupos = 2, filas = 2 }: { grupos?: number; filas?: number }) {
  return (
    <div className="esqueleto-citas" aria-hidden="true">
      {Array.from({ length: grupos }).map((_, grupo) => (
        <div className="esqueleto-grupo" key={grupo}>
          <div className="esqueleto-grupo__titulo">
            <Esqueleto ancho={22} alto={22} radio={6} />
            <Esqueleto ancho={`${28 + grupo * 8}%`} alto={13} />
            <Esqueleto ancho={62} alto={18} className="esqueleto--pastilla" />
          </div>
          <EsqueletoFilas filas={filas} />
        </div>
      ))}
    </div>
  );
}
