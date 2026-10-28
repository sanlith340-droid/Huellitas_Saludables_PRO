import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
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
}


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

function PanelCitas({ titulo, descripcion, urlCitas }: PanelCitasProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    if (!urlCitas) return;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const respuesta = await api.get(urlCitas);
        setCitas(respuesta.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar tus citas. Verifica que el backend esté activo."
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [urlCitas]);

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
    setError("");
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
      setError(err.response?.data?.message || "No se pudo actualizar la cita.");
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

      {error && <p className="message message-error">{error}</p>}
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
              {FILTRO_ESTADO_LABEL[estado]} <span className="chip__count">{conteo[estado]}</span>
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
          <div className="panel">
            <p className="empty-state">Cargando citas...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="panel">
            <p className="empty-state">No tienes citas asignadas por el momento.</p>
          </div>
        ) : grupos.length === 0 ? (
          <div className="panel">
            <p className="empty-state">Ninguna cita coincide con los filtros seleccionados.</p>
          </div>
        ) : (
          grupos.map(([fechaGrupo, citasDia]) => (
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
                        <label className="cancel-confirm__check">
                          <input
                            type="checkbox"
                            checked={liberarHorario}
                            onChange={(e) => setLiberarHorario(e.target.checked)}
                          />
                          Dejar el horario disponible para nuevas citas
                        </label>
                        <div className="cita-actions">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={accionandoId === cita.id_cita}
                            onClick={() => decidir(cita, "cancelado")}
                          >
                            <FaBan /> {accionandoId === cita.id_cita ? "Cancelando..." : "Sí, cancelar"}
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

                    {esAccionable(cita.estado) && cancelandoId !== cita.id_cita && (
                      <div className="cita-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={accionandoId === cita.id_cita}
                          onClick={() => decidir(cita, "atendido")}
                        >
                          <FaCheck /> {accionandoId === cita.id_cita ? "Guardando..." : "Atendida"}
                        </button>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PanelCitas;
