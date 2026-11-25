import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import BotonEnvio from "./feedback/BotonEnvio";
import EmptyState from "./feedback/EmptyState";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";

const ESTADO_INICIAL = {
  nombre: "",
  fecha_nacimiento: "",
  especie: "perro",
  genero: "macho",
  id_raza: "",
  foto_url: "",
};

const RAZAS_POR_ESPECIE = {
  perro: new Set([
    "labrador retriever",
    "golden retriever",
    "pastor aleman",
    "bulldog frances",
    "beagle",
    "poodle",
    "chihuahua",
    "husky siberiano",
  ]),
  gato: new Set([
    "persa",
    "siames",
    "maine coon",
    "bengali",
    "angora",
    "british shorthair",
  ]),
};

const normalizarNombre = (nombre) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function FormularioMascota({ onMascotaRegistrada = null }) {
  const [razas, setRazas] = useState([]);
  const [cargandoRazas, setCargandoRazas] = useState(true);
  const [falloRazas, setFalloRazas] = useState<unknown>(null);
  const [errorRazas, setErrorRazas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState(ESTADO_INICIAL);

  const razasFiltradas = razas.filter((raza) =>
    RAZAS_POR_ESPECIE[form.especie]?.has(normalizarNombre(raza.nombre))
  );

  const cargarRazas = useCallback(async () => {
    try {
      setCargandoRazas(true);
      setErrorRazas("");
      setFalloRazas(null);
      const response = await api.get("/razas");
      setRazas(response.data.data || []);
    } catch (err) {
      setFalloRazas(err);
      setErrorRazas(mensajeDeError(err, "No se pudieron cargar las razas."));
    } finally {
      setCargandoRazas(false);
    }
  }, []);

  useEffect(() => {
    void cargarRazas();
  }, [cargarRazas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((formularioActual) => ({
      ...formularioActual,
      [name]: value,
      ...(name === "especie" && value !== formularioActual.especie
        ? { id_raza: "" }
        : {}),
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

    if (!form.nombre.trim() || !form.fecha_nacimiento || !form.id_raza) {
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
        ...form,
        id_raza: Number(form.id_raza),
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

      {errorRazas && (
        <ErrorState
          variant={varianteDeError(falloRazas)}
          compacto
          title={tituloDeError(falloRazas)}
          description={errorRazas}
          onRetry={() => void cargarRazas()}
        />
      )}

      {cargandoRazas && !errorRazas && (
        <LoadingState variante="en-linea" etiqueta="Cargando razas..." />
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
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
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
            <label htmlFor="id_raza">Raza</label>
            <select
              id="id_raza"
              name="id_raza"
              value={form.id_raza}
              onChange={handleChange}
              required
              disabled={cargandoRazas}
            >
              <option value="" disabled>
                {cargandoRazas
                  ? "Cargando razas..."
                  : razasFiltradas.length === 0
                  ? "No hay razas disponibles"
                  : "Selecciona una raza"}
              </option>
              {razasFiltradas.map((raza) => (
                <option key={raza.id_raza} value={raza.id_raza}>
                  {raza.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

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
          disabled={cargandoRazas || Boolean(errorRazas)}
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
