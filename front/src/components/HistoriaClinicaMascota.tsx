import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/historia-clinica.css";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import EmptyState from "./feedback/EmptyState";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";

type HistoriaClinica = {
  id_historia_clinica: number;
  id_cita: number;
  peso?: number | string | null;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string | null;
  fecha_registro?: string | null;
  fecha_cita?: string | null;
  hora_cita?: string | null;
  especialista_nombre?: string | null;
  especialista_apellidos?: string | null;
  cita_motivo?: string | null;
};

type Props = {
  idMascota: number;
  mascotaNombre: string;
  onCerrar: () => void;
};

type Periodo = { anio: string; mes: string };

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "Fecha no disponible";
  const resultado = new Date(`${fecha}T00:00:00`);
  return Number.isNaN(resultado.getTime()) ? fecha : resultado.toLocaleDateString("es-CO");
}

function obtenerPeriodo(historia: HistoriaClinica): Periodo | null {
  const fecha = historia.fecha_cita || historia.fecha_registro;
  if (!fecha) return null;
  const partes = String(fecha).slice(0, 10).split("-");
  if (partes.length < 2 || !/^\d{4}$/.test(partes[0]) || !/^\d{2}$/.test(partes[1])) return null;
  return { anio: partes[0], mes: partes[1] };
}

function nombreMes(mes: string) {
  const fecha = new Date(2024, Number(mes) - 1, 1);
  return fecha.toLocaleDateString("es-CO", { month: "long" }).replace(/^./, (letra) => letra.toUpperCase());
}

function HistoriaClinicaMascota({ idMascota, mascotaNombre, onCerrar }: Props) {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fallo, setFallo] = useState<unknown>(null);
  const [intento, setIntento] = useState(0);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarHistorias() {
      setCargando(true);
      setError("");
      setFallo(null);
      try {
        const respuesta = await api.get(`/historia/mascota/${idMascota}`, {
          signal: controlador.signal,
        });
        setHistorias((respuesta.data.data || []) as HistoriaClinica[]);
      } catch (err) {
        if (controlador.signal.aborted) return;
        setFallo(err);
        setError(mensajeDeError(err, "No se pudo cargar la historia clínica de esta mascota."));
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargarHistorias();
    return () => controlador.abort();
  }, [idMascota, intento]);

  const periodos = useMemo(() => {
    const unicos = new Map<string, Periodo>();
    historias.forEach((historia) => {
      const periodo = obtenerPeriodo(historia);
      if (periodo) unicos.set(`${periodo.anio}-${periodo.mes}`, periodo);
    });
    return [...unicos.values()].sort((a, b) => `${b.anio}-${b.mes}`.localeCompare(`${a.anio}-${a.mes}`));
  }, [historias]);

  const aniosDisponibles = useMemo(
    () => [...new Set(periodos.map((periodo) => periodo.anio))].sort((a, b) => b.localeCompare(a)),
    [periodos]
  );

  const mesesDisponibles = useMemo(
    () => periodos.filter((periodo) => periodo.anio === anioSeleccionado).sort((a, b) => b.mes.localeCompare(a.mes)),
    [periodos, anioSeleccionado]
  );

  useEffect(() => {
    if (!periodos.length) {
      setAnioSeleccionado("");
      setMesSeleccionado("");
      return;
    }
    const periodoInicial = periodos[0];
    setAnioSeleccionado((actual) => aniosDisponibles.includes(actual) ? actual : periodoInicial.anio);
    setMesSeleccionado((actual) => actual || periodoInicial.mes);
  }, [periodos, aniosDisponibles]);

  useEffect(() => {
    if (mesesDisponibles.length && !mesesDisponibles.some((periodo) => periodo.mes === mesSeleccionado)) {
      setMesSeleccionado(mesesDisponibles[0].mes);
    }
  }, [mesesDisponibles, mesSeleccionado]);

  const historiasFiltradas = useMemo(
    () => historias.filter((historia) => {
      const periodo = obtenerPeriodo(historia);
      return periodo?.anio === anioSeleccionado && periodo.mes === mesSeleccionado;
    }),
    [historias, anioSeleccionado, mesSeleccionado]
  );

  const cambiarAnio = (anio: string) => {
    setAnioSeleccionado(anio);
    const primerMes = periodos.find((periodo) => periodo.anio === anio)?.mes || "";
    setMesSeleccionado(primerMes);
  };

  return (
    <section className="historia-clinica historia-clinica--lectura" aria-labelledby={`historia-mascota-${idMascota}`}>
      <div className="historia-clinica__encabezado">
        <div>
          <p className="historia-clinica__ceja">Consulta protegida</p>
          <h2 id={`historia-mascota-${idMascota}`}>Historia clínica · {mascotaNombre}</h2>
          <p className="historia-clinica__nota">
            Solo puedes consultar la información de tus mascotas. Esta pantalla no permite crear ni editar historias.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCerrar}>Cerrar</button>
      </div>

      {cargando ? (
        <LoadingState variante="panel" titulo="Consultando la historia clínica" filas={2} conEsqueleto />
      ) : error ? (
        <ErrorState
          variant={varianteDeError(fallo)}
          compacto
          title={tituloDeError(fallo)}
          description={error}
          onRetry={() => setIntento((actual) => actual + 1)}
        />
      ) : historias.length === 0 ? (
        <EmptyState
          ilustracion="mascotas"
          titulo="Esta mascota aún no tiene historias clínicas"
          descripcion="Cuando un especialista registre una atención, aparecerá aquí para consulta."
        />
      ) : (
        <>
          <div className="historia-clinica__filtros" aria-label="Filtrar historias clínicas por fecha">
            <div>
              <label htmlFor={`historia-anio-${idMascota}`}>Año</label>
              <select
                id={`historia-anio-${idMascota}`}
                value={anioSeleccionado}
                onChange={(evento) => cambiarAnio(evento.target.value)}
              >
                {aniosDisponibles.map((anio) => <option key={anio} value={anio}>{anio}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`historia-mes-${idMascota}`}>Mes</label>
              <select
                id={`historia-mes-${idMascota}`}
                value={mesSeleccionado}
                onChange={(evento) => setMesSeleccionado(evento.target.value)}
              >
                {mesesDisponibles.map((periodo) => (
                  <option key={periodo.mes} value={periodo.mes}>{nombreMes(periodo.mes)}</option>
                ))}
              </select>
            </div>
            <p className="historia-clinica__filtros-ayuda">
              Mostrando {historiasFiltradas.length} {historiasFiltradas.length === 1 ? "historia" : "historias"} de {nombreMes(mesSeleccionado)} de {anioSeleccionado}.
            </p>
          </div>

          {historiasFiltradas.length === 0 ? (
            <EmptyState
              ilustracion="mascotas"
              titulo="No hay historias en el periodo seleccionado"
              descripcion="Selecciona otro año o mes para consultar una atención diferente."
            />
          ) : (
            <div className="historia-clinica__lista" aria-live="polite">
              {historiasFiltradas.map((historia) => (
                <article className="historia-clinica__registro" key={historia.id_historia_clinica}>
                  <div className="historia-clinica__registro-cabecera">
                    <div>
                      <p className="historia-clinica__ceja">Atención #{historia.id_cita}</p>
                      <h3>{formatearFecha(historia.fecha_cita || historia.fecha_registro)}</h3>
                    </div>
                    <span className="badge">Solo lectura</span>
                  </div>
                  <dl className="historia-clinica__detalle">
                    <div><dt>Diagnóstico</dt><dd>{historia.diagnostico}</dd></div>
                    <div><dt>Tratamiento</dt><dd>{historia.tratamiento}</dd></div>
                    <div><dt>Peso</dt><dd>{historia.peso == null ? "No registrado" : `${historia.peso} kg`}</dd></div>
                    <div><dt>Especialista</dt><dd>{[historia.especialista_nombre, historia.especialista_apellidos].filter(Boolean).join(" ") || "No disponible"}</dd></div>
                    {historia.cita_motivo && <div><dt>Motivo de la cita</dt><dd>{historia.cita_motivo}</dd></div>}
                    <div className="historia-clinica__detalle--ancho"><dt>Observaciones</dt><dd>{historia.observaciones || "Sin observaciones"}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HistoriaClinicaMascota;
