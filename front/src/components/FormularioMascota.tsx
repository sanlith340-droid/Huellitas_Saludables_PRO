import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingState from "./feedback/LoadingState";
import BotonEnvio from "./feedback/BotonEnvio";
import EmptyState from "./feedback/EmptyState";
import { mensajeDeError } from "../utils/erroresApi";
import {
  etiquetaEspecie,
  normalizarRazas,
  RAZAS_RESPALDO,
  type EspecieMascota,
} from "../utils/especies";

const VALOR_OTROS = "__otros__";

const ESTADO_INICIAL = {
  nombre: "",
  fecha_nacimiento: "",
  especie: "perro" as EspecieMascota,
  genero: "macho",
  raza: "",
  raza_personalizada: "",
  foto_url: "",
};

function FormularioMascota({ onMascotaRegistrada = null }) {
  const [razas, setRazas] = useState<string[]>(RAZAS_RESPALDO.perro);
  const [cargandoRazas, setCargandoRazas] = useState(true);
  const [catalogoRespaldo, setCatalogoRespaldo] = useState(false);
  const [errorRazas, setErrorRazas] = useState("");
  const [intentoCarga, setIntentoCarga] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState(ESTADO_INICIAL);

  useEffect(() => {
    let vigente = true;
    const especie = form.especie;

    async function cargarRazas() {
      setCargandoRazas(true);
      setErrorRazas("");
      setCatalogoRespaldo(false);
      try {
        const response = await api.get("/razas/catalogo", { params: { especie }, timeout: 7000 });
        if (!vigente) return;
        const data = response.data?.data;
        const catalogo = normalizarRazas(data?.razas);
        if (catalogo.length === 0) throw new Error("El catálogo no contiene razas disponibles.");
        setRazas(catalogo);
        const usaRespaldo = data?.origen === "respaldo";
        setCatalogoRespaldo(usaRespaldo);
        if (usaRespaldo) {
          setErrorRazas("El catálogo en línea no está disponible. Puedes continuar con estas razas de respaldo o elegir Otros.");
        }
      } catch {
        if (!vigente) return;
        setRazas(normalizarRazas(RAZAS_RESPALDO[especie]));
        setCatalogoRespaldo(true);
        setErrorRazas("No pudimos consultar el catálogo en línea. Puedes continuar con estas razas de respaldo o elegir Otros.");
      } finally {
        if (vigente) setCargandoRazas(false);
      }
    }

    void cargarRazas();
    return () => {
      vigente = false;
    };
  }, [form.especie, intentoCarga]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((formularioActual) => ({
      ...formularioActual,
      [name]: value,
      ...(name === "especie" && value !== formularioActual.especie
        ? { raza: "", raza_personalizada: "" }
        : {}),
      ...(name === "raza" && value !== VALOR_OTROS ? { raza_personalizada: "" } : {}),
    }));
    setMensaje("");
    setError("");
    setLimiteAlcanzado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLimiteAlcanzado(false);

    const razaNombre = form.raza === VALOR_OTROS
      ? form.raza_personalizada.trim()
      : form.raza.trim();
    if (!form.nombre.trim() || !form.fecha_nacimiento || !razaNombre) {
      setError("Completa el nombre, la fecha de nacimiento y la raza antes de continuar.");
      return;
    }
    if (form.foto_url.trim()) {
      try {
        if (new URL(form.foto_url).protocol !== "https:") throw new Error("HTTPS requerido");
      } catch {
        setError("La fotografía debe tener una URL pública válida que comience con https://.");
        return;
      }
    }

    setEnviando(true);

    try {
      const response = await api.post("/mascotas", {
        nombre: form.nombre,
        fecha_nacimiento: form.fecha_nacimiento,
        especie: form.especie,
        genero: form.genero,
        raza_nombre: razaNombre,
        foto_url: form.foto_url.trim() || null,
      });

      setMensaje(response.data?.message || "Mascota registrada correctamente.");
      setForm(ESTADO_INICIAL);
      onMascotaRegistrada?.();
    } catch (err) {
      const codigo = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (codigo === "MASCOTAS_LIMITE_ALCANZADO") {
        setLimiteAlcanzado(true);
      } else {
        setError(mensajeDeError(err, "No se pudo registrar la mascota."));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel__head">
        <h2>Datos de la mascota</h2>
      </div>

      {error && (
        <p className="message message-error" role="alert">
          {error}
        </p>
      )}

      {cargandoRazas && (
        <LoadingState variante="en-linea" etiqueta={`Cargando razas de ${etiquetaEspecie(form.especie).toLowerCase()}...`} />
      )}

      {catalogoRespaldo && !cargandoRazas && (
        <p className="field__hint" role="status" aria-live="polite">
          {errorRazas}{" "}
          <button className="btn btn-outline btn-sm" type="button" onClick={() => setIntentoCarga((n) => n + 1)}>
            Reintentar
          </button>
        </p>
      )}

      {limiteAlcanzado ? (
        <EmptyState
          ilustracion="mascotas"
          variante="tarjeta"
          titulo="Ya tienes 5 mascotas registradas"
          descripcion="Alcanzaste el límite de mascotas por usuario. Puedes consultar y administrar tus fichas actuales desde el listado."
          sugerencias={["Revisa tus mascotas registradas antes de intentar crear otra.", "Si necesitas reemplazar una ficha, contacta a la clínica."]}
          accion={{ etiqueta: "Ver mis mascotas", to: "/mascotas" }}
        />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Nombre de la mascota"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="especie">Especie</label>
              <select id="especie" name="especie" value={form.especie} onChange={handleChange}>
                <option value="perro">Caninos</option>
                <option value="gato">Felinos</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="genero">Género</label>
              <select id="genero" name="genero" value={form.genero} onChange={handleChange}>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="raza">Raza</label>
              <select
                id="raza"
                name="raza"
                value={form.raza}
                onChange={handleChange}
                required
                disabled={cargandoRazas}
              >
                <option value="" disabled>
                  {cargandoRazas ? "Cargando razas..." : "Selecciona una raza"}
                </option>
                {razas.map((raza) => (
                  <option key={raza} value={raza}>
                    {raza}
                  </option>
                ))}
                <option value={VALOR_OTROS}>Otros</option>
              </select>
            </div>
          </div>

          {form.raza === VALOR_OTROS && (
            <div className="field">
              <label htmlFor="raza_personalizada">Especifica la raza de tu mascota</label>
              <input
                id="raza_personalizada"
                type="text"
                name="raza_personalizada"
                placeholder="Especifica la raza de tu mascota"
                value={form.raza_personalizada}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="foto_url">Fotografía (opcional)</label>
            <input
              id="foto_url"
              type="url"
              name="foto_url"
              placeholder="https://ejemplo.com/foto-de-mi-mascota.jpg"
              value={form.foto_url}
              onChange={handleChange}
              autoComplete="url"
            />
            <span className="field__hint">Pega un enlace HTTPS público a la foto. Si lo dejas vacío, aparecerá una ilustración de referencia.</span>
          </div>

          <BotonEnvio
            guardando={enviando}
            texto="Registrar mascota"
            textoGuardando="Guardando..."
            bloque
            disabled={cargandoRazas}
          />
        </form>
      )}

      {mensaje && (
        <p className="message message-success" role="status">
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default FormularioMascota;

export { ESTADO_INICIAL };
