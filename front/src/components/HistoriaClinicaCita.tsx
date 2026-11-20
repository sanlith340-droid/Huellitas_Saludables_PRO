import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import "../styles/historia-clinica.css";

type HistoriaClinica = {
  id_historia_clinica: number;
  peso?: number | string | null;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string | null;
};

type FormularioHistoria = {
  peso: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
};

type Props = {
  idCita: number;
  mascotaNombre: string;
  onCerrar: () => void;
};

const formularioVacio: FormularioHistoria = {
  peso: "",
  diagnostico: "",
  tratamiento: "",
  observaciones: "",
};

function mensajeError(error: unknown, alternativa: string) {
  const detalle = error as { response?: { data?: { message?: string } } };
  return detalle.response?.data?.message || alternativa;
}

function HistoriaClinicaCita({ idCita, mascotaNombre, onCerrar }: Props) {
  const [historiaId, setHistoriaId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<FormularioHistoria>(formularioVacio);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [intentoCarga, setIntentoCarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarHistoria() {
      setCargando(true);
      setError("");
      try {
        const respuesta = await api.get(`/historia/cita/${idCita}`, {
          signal: controlador.signal,
        });
        const historia = respuesta.data.data as HistoriaClinica;
        setHistoriaId(historia.id_historia_clinica);
        setFormulario({
          peso: historia.peso == null ? "" : String(historia.peso),
          diagnostico: historia.diagnostico || "",
          tratamiento: historia.tratamiento || "",
          observaciones: historia.observaciones || "",
        });
      } catch (err) {
        if (controlador.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setHistoriaId(null);
          setFormulario(formularioVacio);
        } else {
          setError(mensajeError(err, "No se pudo cargar la historia clínica."));
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    void cargarHistoria();
    return () => controlador.abort();
  }, [idCita, intentoCarga]);

  const cambiarCampo = (campo: keyof FormularioHistoria, valor: string) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setAviso("");
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    setAviso("");
    setGuardando(true);

    const cambios: {
      peso?: number;
      diagnostico: string;
      tratamiento: string;
      observaciones: string;
    } = {
      diagnostico: formulario.diagnostico.trim(),
      tratamiento: formulario.tratamiento.trim(),
      observaciones: formulario.observaciones.trim(),
    };
    if (formulario.peso.trim()) cambios.peso = Number(formulario.peso);

    try {
      const respuesta = historiaId
        ? await api.put(`/historia/${historiaId}`, cambios)
        : await api.post("/historia", { id_cita: idCita, ...cambios });
      const historia = respuesta.data.data as HistoriaClinica;
      setHistoriaId(historia.id_historia_clinica);
      setFormulario({
        peso: historia.peso == null ? "" : String(historia.peso),
        diagnostico: historia.diagnostico || cambios.diagnostico,
        tratamiento: historia.tratamiento || cambios.tratamiento,
        observaciones: historia.observaciones || cambios.observaciones,
      });
      setAviso("Historia clínica guardada.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la historia clínica."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section
      id={`historia-cita-${idCita}`}
      className="historia-clinica"
      aria-labelledby={`historia-titulo-${idCita}`}
    >
      <div className="historia-clinica__encabezado">
        <div>
          <p className="historia-clinica__ceja">Registro clínico de la cita #{idCita}</p>
          <h2 id={`historia-titulo-${idCita}`}>Historia clínica · {mascotaNombre}</h2>
          <p className="historia-clinica__nota">
            Esta historia queda vinculada a la cita y solo puede gestionarla el especialista asignado.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      {cargando ? (
        <p className="historia-clinica__estado" role="status">Cargando historia clínica…</p>
      ) : error ? (
        <div className="historia-clinica__error" role="alert">
          <p>{error}</p>
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={() => setIntentoCarga((actual) => actual + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <form className="historia-clinica__formulario" onSubmit={guardar}>
          <div className="historia-clinica__campos">
            <label>
              Diagnóstico <span aria-hidden="true">*</span>
              <textarea
                value={formulario.diagnostico}
                onChange={(evento) => cambiarCampo("diagnostico", evento.target.value)}
                maxLength={200}
                rows={3}
                required
              />
              <small>{formulario.diagnostico.length}/200 caracteres</small>
            </label>

            <label>
              Tratamiento <span aria-hidden="true">*</span>
              <textarea
                value={formulario.tratamiento}
                onChange={(evento) => cambiarCampo("tratamiento", evento.target.value)}
                maxLength={200}
                rows={3}
                required
              />
              <small>{formulario.tratamiento.length}/200 caracteres</small>
            </label>

            <label>
              Peso (kg) · opcional
              <input
                type="number"
                value={formulario.peso}
                onChange={(evento) => cambiarCampo("peso", evento.target.value)}
                min="0.01"
                max="999.99"
                step="0.01"
                inputMode="decimal"
              />
              <small>Al editar, dejarlo vacío conserva el valor previamente guardado.</small>
            </label>

            <label className="historia-clinica__observaciones">
              Observaciones · opcional
              <textarea
                value={formulario.observaciones}
                onChange={(evento) => cambiarCampo("observaciones", evento.target.value)}
                maxLength={500}
                rows={3}
              />
              <small>{formulario.observaciones.length}/500 caracteres</small>
            </label>
          </div>

          {error && <p className="historia-clinica__error" role="alert">{error}</p>}
          {aviso && <p className="historia-clinica__aviso" role="status">{aviso}</p>}

          <div className="historia-clinica__acciones">
            <button className="btn btn-primary" type="submit" disabled={guardando} aria-busy={guardando}>
              {guardando ? "Guardando…" : historiaId ? "Guardar cambios" : "Registrar historia"}
            </button>
            <button className="btn btn-outline" type="button" onClick={onCerrar} disabled={guardando}>
              Cerrar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default HistoriaClinicaCita;
