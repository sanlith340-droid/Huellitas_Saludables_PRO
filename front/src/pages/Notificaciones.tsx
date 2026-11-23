import { useCallback, useEffect, useState } from "react";
import { FaBell, FaCheck, FaCheckDouble, FaRedoAlt } from "react-icons/fa";
import api from "../services/api";
import EmptyState from "../components/feedback/EmptyState";
import LoadingState from "../components/feedback/LoadingState";
import { mensajeDeError } from "../utils/erroresApi";

type IdentificadorNotificacion = number | string;

interface Notificacion {
  id_notificacion: IdentificadorNotificacion;
  tipo: string;
  asunto: string;
  mensaje: string;
  id_cita: number | null;
  id_disponibilidad: number | null;
  leida: boolean;
  fecha_creacion: string;
  leida_en: string | null;
}

interface RespuestaNotificaciones {
  success: boolean;
  data: {
    notificaciones: Notificacion[];
    no_leidas: number;
  };
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return fecha || "Fecha no disponible";
  return valor.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function etiquetaTipo(tipo: string): string {
  if (!tipo) return "Aviso";
  return tipo
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letra) => letra.toLocaleUpperCase("es-CO"));
}

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [accionandoId, setAccionandoId] = useState<IdentificadorNotificacion | null>(null);
  const [leyendoTodas, setLeyendoTodas] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");
    setErrorAccion("");
    try {
      const respuesta = await api.get<RespuestaNotificaciones>("/notificaciones");
      const datos = respuesta.data.data;
      setNotificaciones(datos.notificaciones);
      setNoLeidas(datos.no_leidas);
    } catch (error) {
      setErrorCarga(mensajeDeError(error, "No pudimos cargar tus notificaciones."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarNotificaciones();
  }, [cargarNotificaciones]);

  const marcarComoLeida = async (id: IdentificadorNotificacion) => {
    setAccionandoId(id);
    setErrorAccion("");
    try {
      await api.patch(`/notificaciones/${id}/leida`);
      setNotificaciones((actuales) =>
        actuales.map((notificacion) =>
          notificacion.id_notificacion === id ? { ...notificacion, leida: true } : notificacion
        )
      );
      setNoLeidas((actual) => Math.max(0, actual - 1));
    } catch (error) {
      setErrorAccion(mensajeDeError(error, "No pudimos marcar esta notificación como leída. Inténtalo de nuevo."));
    } finally {
      setAccionandoId(null);
    }
  };

  const marcarTodasComoLeidas = async () => {
    setLeyendoTodas(true);
    setErrorAccion("");
    try {
      await api.patch("/notificaciones/leer-todas");
      setNotificaciones((actuales) => actuales.map((notificacion) => ({ ...notificacion, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      setErrorAccion(mensajeDeError(error, "No pudimos marcar todas las notificaciones como leídas. Inténtalo de nuevo."));
    } finally {
      setLeyendoTodas(false);
    }
  };

  return (
    <main className="container notifications-page">
      <header className="dash-header notifications-page__header">
        <div>
          <p className="notifications-page__eyebrow">Tu espacio de trabajo</p>
          <h1>Notificaciones</h1>
          <p>Revisa las novedades relacionadas con tu agenda y tus citas.</p>
        </div>
        {!cargando && !errorCarga && notificaciones.length > 0 && (
          <button
            type="button"
            className="btn btn-outline notifications-page__read-all"
            onClick={() => void marcarTodasComoLeidas()}
            disabled={noLeidas === 0 || leyendoTodas || accionandoId !== null}
            aria-busy={leyendoTodas}
          >
            <FaCheckDouble aria-hidden="true" />
            {leyendoTodas ? "Marcando todas..." : "Leer todas"}
          </button>
        )}
      </header>

      {!cargando && !errorCarga && (
        <p className="notifications-page__summary" aria-live="polite">
          <FaBell aria-hidden="true" />
          {noLeidas === 0
            ? "Estás al día; no tienes notificaciones sin leer."
            : `${noLeidas} ${noLeidas === 1 ? "notificación sin leer" : "notificaciones sin leer"}`}
        </p>
      )}

      {errorCarga ? (
        <section className="notifications-message notifications-message--error" role="alert">
          <p>{errorCarga}</p>
          <button type="button" className="btn btn-outline" onClick={() => void cargarNotificaciones()}>
            <FaRedoAlt aria-hidden="true" /> Reintentar
          </button>
        </section>
      ) : cargando ? (
        <LoadingState
          variante="panel"
          titulo="Buscando tus notificaciones"
          mensajes={["Consultando las novedades de tu agenda...", "Ordenando tus avisos..."]}
        />
      ) : (
        <>
          {errorAccion && (
            <div className="notifications-message notifications-message--error" role="alert">
              <p>{errorAccion}</p>
              <span>Puedes volver a intentarlo con la acción correspondiente.</span>
            </div>
          )}

          {notificaciones.length === 0 ? (
            <EmptyState
              ilustracion="generico"
              titulo="No tienes notificaciones todavía"
              descripcion="Cuando haya novedades para ti, aparecerán aquí."
              variante="panel"
              className="notifications-page__empty"
            />
          ) : (
            <section className="notifications-list" aria-label="Lista de notificaciones" aria-live="polite">
              {notificaciones.map((notificacion) => {
                const procesandoEsta = accionandoId === notificacion.id_notificacion;
                return (
                  <article
                    className={`notification-card${notificacion.leida ? "" : " notification-card--unread"}`}
                    key={notificacion.id_notificacion}
                    aria-label={`${notificacion.leida ? "Leída" : "No leída"}: ${notificacion.asunto || "Notificación"}`}
                  >
                    <span className="notification-card__icon" aria-hidden="true">
                      <FaBell />
                    </span>
                    <div className="notification-card__content">
                      <div className="notification-card__meta">
                        <span className="notification-card__type">{etiquetaTipo(notificacion.tipo)}</span>
                        {!notificacion.leida && <span className="notification-card__unread-label">Sin leer</span>}
                      </div>
                      <h2>{notificacion.asunto || "Notificación"}</h2>
                      <p className="notification-card__message">{notificacion.mensaje}</p>
                      <time className="notification-card__date" dateTime={notificacion.fecha_creacion}>
                        {formatearFecha(notificacion.fecha_creacion)}
                      </time>
                    </div>
                    {!notificacion.leida && (
                      <button
                        type="button"
                        className="notification-card__action"
                        onClick={() => void marcarComoLeida(notificacion.id_notificacion)}
                        disabled={procesandoEsta || leyendoTodas}
                        aria-busy={procesandoEsta}
                        aria-label={`Marcar como leída: ${notificacion.asunto || "notificación"}`}
                      >
                        <FaCheck aria-hidden="true" />
                        <span>{procesandoEsta ? "Guardando..." : "Marcar como leída"}</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default Notificaciones;
