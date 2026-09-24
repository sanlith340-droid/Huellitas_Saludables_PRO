import { useEffect, useState } from "react";
import api from "../services/api";

const ESTADO_INICIAL = {
  nombre: "",
  fecha_nacimiento: "",
  especie: "perro",
  genero: "macho",
  id_raza: "",
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
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState(ESTADO_INICIAL);

  const razasFiltradas = razas.filter((raza) =>
    RAZAS_POR_ESPECIE[form.especie]?.has(normalizarNombre(raza.nombre))
  );

  useEffect(() => {
    const cargarRazas = async () => {
      try {
        setCargandoRazas(true);
        setError("");
        const response = await api.get("/razas");
        setRazas(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "No se pudieron cargar las razas."
        );
      } finally {
        setCargandoRazas(false);
      }
    };

    cargarRazas();
  }, []);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setEnviando(true);

    try {
      const response = await api.post("/mascotas", {
        ...form,
        id_raza: Number(form.id_raza),
      });

      setMensaje(response.data?.message || "Mascota registrada correctamente.");
      setForm(ESTADO_INICIAL);
      onMascotaRegistrada?.();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo registrar la mascota.");
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

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? "Registrando..." : "Registrar mascota"}
        </button>
      </form>

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
