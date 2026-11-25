import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import HistoriaClinicaCita from "./HistoriaClinicaCita";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import EmptyState from "./feedback/EmptyState";
import { SpinnerHuella } from "./feedback/BotonEnvio";
import { EsqueletoCitas } from "./feedback/Esqueletos";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import {
  FaPaw,
  FaClock,
  FaSearch,
  FaUser,
  FaCheck,
  FaBan,
  FaTimes,
  FaCalendarDay,
} from "react-icons/fa";

interface Cita {
  id_cita: number;
  mascota_nombre: string;
  mascota_especie?: string;
  motivo: string;
  estado: "pendiente" | "confirmado" | "cancelado" | "atendido";
  fecha_cita: string;
  hora_cita: string;
  disponibilidad_estado?: "disponible" | "ocupado";
  propietario_nombre?: string | null;
  propietario_telefono?: string | null;
  id_especialista?: string;
  especialista_nombre?: string | null;
  especialista_apellidos?: string | null;
  especializacion?: string | null;
}

interface PanelCitasProps {
  titulo: string;
  descripcion: string;
  // Endpoint que devuelve las citas a mostrar. Vacío = aún no se puede cargar.
  urlCitas: string;
  rolVista?: "admin" | "especialista" | "recepcion";
}

const MENSAJES_CARGA = [
  "Revisando la agenda de la clínica...",
  "Buscando las citas de cada especialista...",
  "Ordenando los horarios por fecha...",
];


const ESTADO_LABEL = {
  pendiente: "Pendiente",
  confirmado: "Confirmada",
  cancelado: "Cancelada",
  atendido: "Atendida",
};

// Orden en que se muestran los filtros de estado
const FILTROS_ESTADO = ["todas", "pendiente", "confirmado", "atendido", "cancelado"];

const FILTRO_ESTADO_LABEL = {
  todas: "Todas",
  ...ESTADO_LABEL,
};

// Una cita solo admite decisión del especialista mientras esté abierta
const esAccionable = (estado: string) => estado === "pendiente" || estado === "confirmado";

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function soloFecha(fechaISO: string) {
  return String(fechaISO || "").slice(0, 10);
}

function formatearFechaLarga(fechaISO: string) {
  if (!fechaISO) return "";
  const fecha = new Date(soloFecha(fechaISO) + "T00:00:00");
  const texto = fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearHora(hora: string) {
  return String(hora || "").slice(0, 5);
}

function PanelCitas({ titulo, descripcion, urlCitas, rolVista = "admin" }: PanelCitasProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [fallo, setFallo] = useState<unknown>(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [rango, setRango] = useState("todas"); // todas | hoy | proximos | fecha
  const [fecha, setFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Acciones
  const [accionandoId, setAccionandoId] = useState<number | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [liberarHorario, setLiberarHorario] = useState(true);
  const [historiaAbiertaId, setHistoriaAbiertaId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!urlCitas) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorCarga("");
    setFallo(null);
    try {
      const respuesta = await api.get(urlCitas);
      setCitas(respuesta.data.data || []);
    } catch (err) {
      setFallo(err);
      setErrorCarga(mensajeDeError(err, "No se pudieron cargar las citas."));
    } finally {
      setCargando(false);
    }
  }, [urlCitas]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Citas que cumplen fecha + búsqueda (sin filtrar por estado, para poder
  // mostrar el contador de cada estado en los chips).
  const citasBase = useMemo(() => {
    const hoy = toISODate(new Date());
    const en7Dias = new Date();
    en7Dias.setDate(en7Dias.getDate() + 7);
    const limite = toISODate(en7Dias);
    const termino = busqueda.trim().toLowerCase();

    return citas.filter((c) => {
      const f = soloFecha(c.fecha_cita);

      if (rango === "hoy" && f !== hoy) return false;
      if (rango === "proximos" && (f < hoy || f > limite)) return false;
      if (rango === "fecha" && fecha && f !== fecha) return false;

      if (termino) {
        const texto = `${c.mascota_nombre} ${c.propietario_nombre || ""} ${c.motivo}`.toLowerCase();
        if (!texto.includes(termino)) return false;
      }
      return true;
    });
  }, [citas, rango, fecha, busqueda]);

  const conteo = useMemo(() => {
    const base = { todas: citasBase.length, pendiente: 0, confirmado: 0, atendido: 0, cancelado: 0 };
    citasBase.forEach((c) => {
      base[c.estado] += 1;
    });
    return base;
  }, [citasBase]);

  // Agrupadas por fecha, de la más próxima a la más lejana
  const grupos = useMemo(() => {
    const visibles = citasBase
      .filter((c) => filtroEstado === "todas" || c.estado === filtroEstado)
      .sort((a, b) =>
        `${soloFecha(a.fecha_cita)} ${a.hora_cita}`.localeCompare(
          `${soloFecha(b.fecha_cita)} ${b.hora_cita}`
        )
      );

    const mapa = new Map<string, Cita[]>();
    visibles.forEach((c) => {
      const clave = soloFecha(c.fecha_cita);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(c);
    });
    return Array.from(mapa.entries());
  }, [citasBase, filtroEstado]);

  const hayFiltros = filtroEstado !== "todas" || rango !== "todas" || busqueda.trim() !== "";

  const limpiarFiltros = () => {
    setFiltroEstado("todas");
    setRango("todas");
    setFecha("");
    setBusqueda("");
  };

  const reemplazarCita = (actualizada: Cita) => {
    setCitas((prev) => prev.map((c) => (c.id_cita === actualizada.id_cita ? actualizada : c)));
  };

  const decidir = async (cita: Cita, estado: "atendido" | "cancelado") => {
    setAccionandoId(cita.id_cita);
    setErrorAccion("");
    setAviso("");
    try {
      const body: { estado: string; liberar_horario?: boolean } = { estado };
      if (estado === "cancelado") body.liberar_horario = liberarHorario;

      const respuesta = await api.patch(`/citas/${cita.id_cita}/estado`, body);
      reemplazarCita(respuesta.data.data);
      setCancelandoId(null);

      if (estado === "atendido") {
        setAviso(`La cita de ${cita.mascota_nombre} se marcó como atendida.`);
      } else {
        setAviso(
          liberarHorario
            ? `Cita de ${cita.mascota_nombre} cancelada. El horario quedó disponible.`
            : `Cita de ${cita.mascota_nombre} cancelada. El horario sigue bloqueado.`
        );
      }
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo actualizar la cita."));
    } finally {
      setAccionandoId(null);
    }
  };

  const cancelarComoRecepcion = async (cita: Cita) => {
    setAccionandoId(cita.id_cita);
    setErrorAccion("");
    setAviso("");
    try {
      const respuesta = await api.patch(`/citas/${cita.id_cita}/cancelar`);
      reemplazarCita(respuesta.data.data);
      setCancelandoId(null);
      setAviso(`La cita de ${cita.mascota_nombre} se canceló.`);
    } catch (err) {
      setErrorAccion(mensajeDeError(err, "No se pudo cancelar la cita."));
    } finally {
      setAccionandoId(null);
    }
  };

  const abrirCancelacion = (id: number) => {
    setLiberarHorario(true);
    setCancelandoId(id);
  };

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
      </div>

      {errorAccion && <p className="message message-error">{errorAccion}</p>}
      {aviso && <p className="message message-success">{aviso}</p>}

      {/* ---------- Filtros ---------- */}
      <div className="panel cita-filters">
        <div className="cita-filters__row">
          <div className="avail-search cita-filters__search">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar por mascota, dueño o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar citas"
            />
          </div>

          <div className="cita-filters__dates">
            <button
              type="button"
              className={`chip ${rango === "todas" ? "chip--active" : ""}`}
              onClick={() => {
                setRango("todas");
                setFecha("");
              }}
            >
              Todas las fechas
            </button>
            <button
              type="button"
              className={`chip ${rango === "hoy" ? "chip--active" : ""}`}
              onClick={() => {
                setRango("hoy");
                setFecha("");
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              className={`chip ${rango === "proximos" ? "chip--active" : ""}`}
              onClick={() => {
                setRango("proximos");
                setFecha("");
              }}
            >
              Próximos 7 días
            </button>
            <input
              type="date"
              className={`cita-filters__date ${rango === "fecha" ? "cita-filters__date--active" : ""}`}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setRango(e.target.value ? "fecha" : "todas");
              }}
              aria-label="Filtrar por fecha"
            />
          </div>
        </div>

        <div className="cita-filters__estados" role="group" aria-label="Filtrar por estado">
          {FILTROS_ESTADO.map((estado) => (
            <button
              type="button"
              key={estado}
              className={`chip chip--estado chip--${estado} ${
                filtroEstado === estado ? "chip--active" : ""
              }`}
              onClick={() => setFiltroEstado(estado)}
            >
              {FILTRO_ESTADO_LABEL[estado]}{" "}
              {!cargando && !errorCarga && (
                <span className="chip__count">{conteo[estado]}</span>
              )}
            </button>
          ))}

          {hayFiltros && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
              <FaTimes /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ---------- Listado agrupado por fecha ---------- */}
      <div style={{ marginTop: 24 }}>
        {cargando ? (
          <>
            <LoadingState
              variante="panel"
              titulo="Preparando la agenda"
              mensajes={MENSAJES_CARGA}
              className="carga--agenda"
            />
            <div style={{ marginTop: 16 }}>
              <EsqueletoCitas grupos={2} filas={2} />
            </div>
          </>
        ) : !urlCitas ? (
          <ErrorState
            variant="user"
            compacto
            title="No pudimos identificar tu cuenta"
            description="Tu sesión no tiene el identificador del especialista. Vuelve a iniciar sesión para ver tus citas."
            to="/login"
            actionLabel="Iniciar sesión"
          />
        ) : errorCarga ? (
          <ErrorState
            variant={varianteDeError(fallo)}
            compacto
            title={tituloDeError(fallo)}
            description={errorCarga}
            onRetry={() => void cargar()}
          />
        ) : citas.length === 0 ? (
          <EmptyState
            ilustracion="citas"
            titulo="La agenda está libre"
            descripcion="No hay citas registradas para esta vista. En cuanto alguien reserve un horario, aparecerá aquí."
            sugerencias={[
              "Revisa la disponibilidad de los especialistas para abrir nuevos horarios.",
              "Las citas canceladas también quedan registradas en esta lista.",
            ]}
            accion={{ etiqueta: "Actualizar la agenda", onClick: () => void cargar(), variante: "outline" }}
          />
        ) : grupos.length === 0 ? (
          <EmptyState
            ilustracion="busqueda"
            titulo="Ninguna cita coincide con los filtros"
            descripcion="La agenda sí tiene citas, pero ninguna pasa los filtros que elegiste. Prueba con otro estado, otra fecha u otro término de búsqueda."
            accion={{ etiqueta: "Limpiar filtros", onClick: limpiarFiltros }}
          />
        ) : (
          grupos.map(([fechaGrupo, citasDia]) => {
            const citaHistoria = citasDia.find((c) => c.id_cita === historiaAbiertaId);
            return (
            <div className="panel cita-group" key={fechaGrupo}>
              <div className="cita-group__title">
                <FaCalendarDay /> {formatearFechaLarga(fechaGrupo)}
                <span className="cita-group__count">
                  {citasDia.length} {citasDia.length === 1 ? "cita" : "citas"}
                </span>
              </div>

              {citasDia.map((cita) => (
                <div className="list-item list-item--cita cita-row" key={cita.id_cita}>
                  <div className="list-item__icon">
                    <FaPaw />
                  </div>

                  <div className="list-item__body">
                    <div className="list-item__title">
                      {cita.mascota_nombre} · {cita.motivo}
                    </div>
                    {cita.propietario_nombre && (
                      <div className="cita-owner">
                        <span className="cita-owner__icon">
                          <FaUser />
                        </span>
                        <span className="cita-owner__name">{cita.propietario_nombre}</span>
                        {cita.propietario_telefono && (
                          <span className="cita-owner__phone">{cita.propietario_telefono}</span>
                        )}
                      </div>
                    )}
                    <div className="list-item__meta">
                      <FaClock /> {formatearHora(cita.hora_cita)}
                    </div>

                    {cancelandoId === cita.id_cita && (
                      <div className="cancel-confirm">
                        <p>¿Cancelar la cita de {cita.mascota_nombre}?</p>
                        {rolVista !== "recepcion" && (
                          <label className="cancel-confirm__check">
                              <input
                                type="checkbox"
                                checked={liberarHorario}
                                onChange={(e) => setLiberarHorario(e.target.checked)}
                              />
                              Dejar el horario disponible para nuevas citas
                          </label>
                        )}
                        <div className="cita-actions">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={accionandoId === cita.id_cita}
                            aria-busy={accionandoId === cita.id_cita || undefined}
                            onClick={() =>
                              rolVista === "recepcion"
                                ? void cancelarComoRecepcion(cita)
                                : void decidir(cita, "cancelado")
                            }
                          >
                            {accionandoId === cita.id_cita ? <SpinnerHuella /> : <FaBan />}
                            {accionandoId === cita.id_cita
                              ? "Guardando..."
                              : rolVista === "recepcion"
                                ? "Confirmar cancelación"
                                : "Sí, cancelar"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={accionandoId === cita.id_cita}
                            onClick={() => setCancelandoId(null)}
                          >
                            Volver
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list-item__side">
                    <span className={`badge badge-${cita.estado}`}>
                      {ESTADO_LABEL[cita.estado] || cita.estado}
                    </span>

                    {cita.estado === "cancelado" && (
                      <span
                        className={`badge ${
                          cita.disponibilidad_estado === "disponible"
                            ? "badge-horario-libre"
                            : "badge-horario-bloqueado"
                        }`}
                      >
                        {cita.disponibilidad_estado === "disponible"
                          ? "Horario disponible"
                          : "Horario bloqueado"}
                      </span>
                    )}

                    {rolVista === "especialista" && cita.estado === "atendido" && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        aria-expanded={historiaAbiertaId === cita.id_cita}
                        aria-controls={
                          historiaAbiertaId === cita.id_cita
                            ? `historia-cita-${cita.id_cita}`
                            : undefined
                        }
                        onClick={() =>
                          setHistoriaAbiertaId((actual) =>
                            actual === cita.id_cita ? null : cita.id_cita
                          )
                        }
                      >
                        {historiaAbiertaId === cita.id_cita ? "Cerrar historia" : "Historia clínica"}
                      </button>
                    )}

                    {esAccionable(cita.estado) && cancelandoId !== cita.id_cita && (
                      <div className="cita-actions">
                        {rolVista !== "recepcion" && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={accionandoId === cita.id_cita}
                            aria-busy={accionandoId === cita.id_cita || undefined}
                            onClick={() => void decidir(cita, "atendido")}
                          >
                            {accionandoId === cita.id_cita ? <SpinnerHuella /> : <FaCheck />}
                            {accionandoId === cita.id_cita ? "Guardando..." : "Atendida"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={accionandoId === cita.id_cita}
                          onClick={() => abrirCancelacion(cita.id_cita)}
                        >
                          <FaBan /> Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {citaHistoria && (
                <HistoriaClinicaCita
                  key={citaHistoria.id_cita}
                  idCita={citaHistoria.id_cita}
                  mascotaNombre={citaHistoria.mascota_nombre}
                  onCerrar={() => setHistoriaAbiertaId(null)}
                />
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PanelCitas;
