import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";
import {
  FaTrash,
  FaCalendarPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const POR_PAGINA = 15;

const ESTADO_INICIAL = {
  id_usuario: "",
  fecha: "",
  hora: "",
  estado: "disponible",
};

/**
 * Fecha de HOY en la zona horaria del navegador, formato YYYY-MM-DD.
 * (No usamos toISOString() porque devuelve la fecha en UTC y, de noche
 * en Colombia, ya marcaría "mañana".)
 */
function hoyLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Por defecto solo se muestran las franjas de hoy en adelante: las
// pasadas ya no se pueden agendar y son las que más saturan la lista.
const filtrosPorDefecto = () => ({
  id_usuario: "",
  estado: "",
  fecha_desde: hoyLocal(),
  fecha_hasta: "",
});

function formatearFechaLarga(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Agrupa las franjas (ya ordenadas por fecha y hora desde el back) en
 * DÍA -> ESPECIALISTA -> horas. Así cada fecha se muestra una sola vez y,
 * cuando se ven todos los especialistas, sus horarios no se mezclan.
 */
function agruparPorFecha(franjas) {
  const dias = new Map();

  for (const f of franjas) {
    const fecha = f.fecha?.slice(0, 10);
    if (!dias.has(fecha)) dias.set(fecha, new Map());

    const porEspecialista = dias.get(fecha);
    if (!porEspecialista.has(f.id_usuario)) {
      porEspecialista.set(f.id_usuario, {
        id_usuario: f.id_usuario,
        nombre: `${f.especialista_nombre} ${f.especialista_apellidos}`,
        especializacion: f.especializacion,
        items: [],
      });
    }
    porEspecialista.get(f.id_usuario).items.push(f);
  }

  return Array.from(dias, ([fecha, porEspecialista]) => {
    const especialistas = Array.from(porEspecialista.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
    const total = especialistas.reduce((suma, e) => suma + e.items.length, 0);
    return { fecha, total, especialistas };
  });
}

function Disponibilidad() {
  const [especialistas, setEspecialistas] = useState([]);
  const [cargandoEspecialistas, setCargandoEspecialistas] = useState(true);

  // ----- Lista (se pide al back ya filtrada y paginada) -----
  const [filtros, setFiltros] = useState(filtrosPorDefecto);
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0); // se incrementa para forzar un refetch
  const [franjas, setFranjas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState("");

  // ----- Formulario de nueva franja -----
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState("");
  const [exitoForm, setExitoForm] = useState("");
  const [accionandoId, setAccionandoId] = useState(null);

  const recargar = useCallback(() => setRecarga((n) => n + 1), []);

  // Especialistas: se cargan una sola vez (alimentan el filtro y el formulario).
  useEffect(() => {
    let cancelado = false;

    async function cargarEspecialistas() {
      try {
        const res = await api.get("/usuarios/especialistas");
        if (!cancelado) setEspecialistas(res.data.data || []);
      } catch (err) {
        if (!cancelado) {
          setError(
            err.response?.data?.message ||
              "No se pudo cargar la lista de especialistas. Verifica que el backend esté activo."
          );
        }
      } finally {
        if (!cancelado) setCargandoEspecialistas(false);
      }
    }

    cargarEspecialistas();
    return () => {
      cancelado = true;
    };
  }, []);

  // Franjas: se vuelven a pedir cada vez que cambian los filtros o la página.
  useEffect(() => {
    let cancelado = false;

    async function cargarFranjas() {
      setCargandoLista(true);
      setError("");

      try {
        const params = { page, limit: POR_PAGINA };
        if (filtros.estado) params.estado = filtros.estado;
        if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
        if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;

        // Con un especialista elegido usamos la ruta dedicada a ese id.
        const url = filtros.id_usuario
          ? `/disponibilidad/especialista/${encodeURIComponent(filtros.id_usuario)}`
          : "/disponibilidad";

        const res = await api.get(url, { params });
        if (cancelado) return;

        const datos = res.data.data || [];
        const metaRes = res.data.meta || null;

        // Si al eliminar/liberar se vació la última página, retrocedemos.
        if (datos.length === 0 && page > 1 && metaRes && metaRes.total_paginas < page) {
          setPage(metaRes.total_paginas);
          return;
        }

        setFranjas(datos);
        setMeta(metaRes);
      } catch (err) {
        if (cancelado) return;
        setError(
          err.response?.data?.message ||
            "No se pudo cargar la disponibilidad. Verifica que el backend esté activo."
        );
      } finally {
        if (!cancelado) setCargandoLista(false);
      }
    }

    cargarFranjas();
    return () => {
      cancelado = true;
    };
  }, [filtros, page, recarga]);

  const grupos = useMemo(() => agruparPorFecha(franjas), [franjas]);

  const especialistaFiltrado = especialistas.find(
    (e) => e.id_usuario === filtros.id_usuario
  );

  const resumen = meta?.resumen;
  const totalFranjas = resumen ? resumen.disponible + resumen.ocupado : null;

  const hayFiltrosActivos =
    filtros.id_usuario !== "" ||
    filtros.estado !== "" ||
    filtros.fecha_hasta !== "" ||
    filtros.fecha_desde !== hoyLocal();

  // ----- Filtros -----
  // Cualquier cambio de filtro vuelve a la página 1.
  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => {
      const siguiente = { ...prev, [campo]: valor };

      // El back rechaza rangos invertidos (fecha_hasta < fecha_desde), así que
      // si "Desde" pasa a ser posterior a "Hasta" limpiamos "Hasta".
      if (campo === "fecha_desde" && valor && prev.fecha_hasta && valor > prev.fecha_hasta) {
        siguiente.fecha_hasta = "";
      }

      // Y si se teclea un "Hasta" anterior a "Desde", se ignora el cambio.
      if (campo === "fecha_hasta" && valor && prev.fecha_desde && valor < prev.fecha_desde) {
        return prev;
      }

      return siguiente;
    });
    setPage(1);

    // Comodidad: si el formulario aún no tiene especialista, usa el del filtro.
    if (campo === "id_usuario" && valor) {
      setForm((prev) => (prev.id_usuario === "" ? { ...prev, id_usuario: valor } : prev));
    }
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosPorDefecto());
    setPage(1);
  };

  const verTodasLasFechas = () => {
    setFiltros((prev) => ({ ...prev, fecha_desde: "", fecha_hasta: "" }));
    setPage(1);
  };

  // ----- Formulario -----
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeForm("");
    setExitoForm("");
    setEnviando(true);

    try {
      await api.post("/disponibilidad", form);
      setExitoForm(
        `Franja creada: ${formatearFechaLarga(form.fecha)} a las ${form.hora.slice(0, 5)}.`
      );
      // Conservamos el especialista elegido para cargar varias franjas seguidas.
      setForm({ ...ESTADO_INICIAL, id_usuario: form.id_usuario });
      recargar();
    } catch (err) {
      setMensajeForm(err.response?.data?.message || "No se pudo crear la franja horaria.");
    } finally {
      setEnviando(false);
    }
  };

  // ----- Acciones sobre una franja -----
  const handleEliminar = async (id_disponibilidad) => {
    setAccionandoId(id_disponibilidad);
    setError("");
    try {
      await api.delete(`/disponibilidad/${id_disponibilidad}`);
      recargar();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo eliminar la franja horaria.");
    } finally {
      setAccionandoId(null);
    }
  };

  const handleCambiarEstado = async (franja) => {
    const nuevoEstado = franja.estado === "disponible" ? "ocupado" : "disponible";
    setAccionandoId(franja.id_disponibilidad);
    setError("");
    try {
      await api.put(`/disponibilidad/${franja.id_disponibilidad}`, { estado: nuevoEstado });
      recargar();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el estado.");
    } finally {
      setAccionandoId(null);
    }
  };

  const opcionesEstado = [
    { valor: "", etiqueta: "Todas", cantidad: totalFranjas },
    { valor: "disponible", etiqueta: "Disponibles", cantidad: resumen?.disponible },
    { valor: "ocupado", etiqueta: "Ocupadas", cantidad: resumen?.ocupado },
  ];

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Disponibilidad de especialistas</h1>
          <p>Crea, organiza y libera franjas horarias para el equipo veterinario.</p>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}

      <div className="dash-grid dash-grid--wide">
        <div className="panel">
          <div className="panel__head">
            <h2>Nueva franja horaria</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="id_usuario">Especialista</label>
              <select
                id="id_usuario"
                name="id_usuario"
                value={form.id_usuario}
                onChange={handleChange}
                required
                disabled={cargandoEspecialistas}
              >
                <option value="" disabled>
                  {cargandoEspecialistas ? "Cargando..." : "Selecciona un especialista"}
                </option>
                {especialistas.map((e) => (
                  <option key={e.id_usuario} value={e.id_usuario}>
                    {e.nombre} {e.apellidos}
                    {e.especializacion ? ` · ${e.especializacion}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="fecha">Fecha</label>
                <input
                  id="fecha"
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="hora">Hora</label>
                <input
                  id="hora"
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={enviando}>
              <FaCalendarPlus /> {enviando ? "Creando..." : "Crear franja"}
            </button>

            {mensajeForm && <p className="message message-error">{mensajeForm}</p>}
            {exitoForm && <p className="message message-success">{exitoForm}</p>}
          </form>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2>Franjas registradas</h2>
            {hayFiltrosActivos && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* ---------- Filtros ---------- */}
          <div className="filters">
            <div className="field filters__wide">
              <label htmlFor="filtro_especialista">Especialista</label>
              <select
                id="filtro_especialista"
                value={filtros.id_usuario}
                onChange={(e) => cambiarFiltro("id_usuario", e.target.value)}
                disabled={cargandoEspecialistas}
              >
                <option value="">Todos los especialistas</option>
                {especialistas.map((e) => (
                  <option key={e.id_usuario} value={e.id_usuario}>
                    {e.nombre} {e.apellidos}
                    {e.especializacion ? ` · ${e.especializacion}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="filtro_desde">Desde</label>
              <input
                id="filtro_desde"
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => cambiarFiltro("fecha_desde", e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="filtro_hasta">Hasta</label>
              <input
                id="filtro_hasta"
                type="date"
                value={filtros.fecha_hasta}
                min={filtros.fecha_desde || undefined}
                onChange={(e) => cambiarFiltro("fecha_hasta", e.target.value)}
              />
            </div>
          </div>

          <div className="segmented" role="group" aria-label="Filtrar por estado">
            {opcionesEstado.map((op) => (
              <button
                key={op.valor || "todas"}
                type="button"
                className={`segmented__btn ${
                  filtros.estado === op.valor ? "segmented__btn--active" : ""
                }`}
                aria-pressed={filtros.estado === op.valor}
                onClick={() => cambiarFiltro("estado", op.valor)}
              >
                {op.etiqueta}
                {op.cantidad != null && (
                  <span className="segmented__count">({op.cantidad})</span>
                )}
              </button>
            ))}
          </div>

          {especialistaFiltrado && (
            <p className="filter-note">
              Mostrando solo a{" "}
              <strong>
                {especialistaFiltrado.nombre} {especialistaFiltrado.apellidos}
              </strong>
              {especialistaFiltrado.especializacion
                ? ` · ${especialistaFiltrado.especializacion}`
                : ""}
            </p>
          )}

          {/* ---------- Resultados ---------- */}
          {cargandoLista && franjas.length === 0 ? (
            <p className="empty-state">Cargando...</p>
          ) : franjas.length === 0 ? (
            <div className="empty-state">
              <p>No hay franjas con estos filtros.</p>
              <div className="empty-state__actions">
                {filtros.fecha_desde && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={verTodasLasFechas}
                  >
                    Ver todas las fechas
                  </button>
                )}
                {hayFiltrosActivos && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={cargandoLista ? "slot-list slot-list--loading" : "slot-list"}>
              {grupos.map((grupo) => (
                <section className="day-group" key={grupo.fecha}>
                  <header className="day-group__head">
                    <span className="day-group__title">
                      {capitalizar(formatearFechaLarga(grupo.fecha))}
                    </span>
                    <span className="day-group__count">
                      {grupo.total} {grupo.total === 1 ? "franja" : "franjas"}
                    </span>
                  </header>

                  {grupo.especialistas.map((esp) => (
                    <div className="specialist-block" key={esp.id_usuario}>
                      {/* Con un especialista filtrado el nombre sobra: ya está arriba. */}
                      {!filtros.id_usuario && (
                        <div className="specialist-head">
                          <strong>{esp.nombre}</strong>
                          {esp.especializacion ? <span> · {esp.especializacion}</span> : null}
                        </div>
                      )}

                      {esp.items.map((f) => (
                        <div className="slot-row" key={f.id_disponibilidad}>
                          <span className="slot-row__time">{f.hora?.slice(0, 5)}</span>

                          <span
                            className={`badge badge-${
                              f.estado === "disponible" ? "confirmado" : "pendiente"
                            }`}
                          >
                            {f.estado}
                          </span>

                          <div className="slot-row__actions">
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={accionandoId === f.id_disponibilidad}
                              onClick={() => handleCambiarEstado(f)}
                            >
                              {f.estado === "disponible" ? "Marcar ocupado" : "Liberar"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={accionandoId === f.id_disponibilidad}
                              onClick={() => handleEliminar(f.id_disponibilidad)}
                              title="Eliminar franja"
                              aria-label="Eliminar franja"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}

          {/* ---------- Paginación ---------- */}
          {meta && meta.total > 0 && (
            <nav className="pagination" aria-label="Paginación de franjas">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page <= 1 || cargandoLista}
                onClick={() => setPage((p) => p - 1)}
              >
                <FaChevronLeft /> Anterior
              </button>

              <span>
                Página {meta.page} de {meta.total_paginas} · {meta.total}{" "}
                {meta.total === 1 ? "franja" : "franjas"}
              </span>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page >= meta.total_paginas || cargandoLista}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente <FaChevronRight />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default Disponibilidad;
