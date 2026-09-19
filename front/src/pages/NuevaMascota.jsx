import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ESTADO_INICIAL = {
  nombre: "",
  fecha_nacimiento: "",
  especie: "perro",
  genero: "macho",
  id_raza: "",
};

function NuevaMascota() {
  const navigate = useNavigate();

  const [razas, setRazas] = useState([]);
  const [cargandoRazas, setCargandoRazas] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarRazas = async () => {
      try {
        const respuesta = await api.get("/razas");
        setRazas(respuesta.data.data || []);
      } catch (err) {
        setMensaje(
          err.response?.data?.message || "No se pudieron cargar las razas disponibles."
        );
      } finally {
        setCargandoRazas(false);
      }
    };

    cargarRazas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setEnviando(true);

    try {
      await api.post("/mascotas", {
        ...form,
        id_raza: Number(form.id_raza),
      });

      navigate("/dashboard");
    } catch (err) {
      setMensaje(err.response?.data?.message || "No se pudo registrar la mascota.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container">
      <div className="form-page">
        <Link to="/dashboard" className="back-link">
          ← Volver a mi panel
        </Link>

        <div className="form-card">
          <h1>Registrar mascota</h1>
          <p className="auth-card__subtitle">
            Completa los datos de tu mascota para poder agendarle citas.
          </p>

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
                    {cargandoRazas ? "Cargando razas..." : "Selecciona una raza"}
                  </option>
                  {razas.map((raza) => (
                    <option key={raza.id_raza} value={raza.id_raza}>
                      {raza.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={enviando}>
              {enviando ? "Registrando..." : "Registrar mascota"}
            </button>
          </form>

          {mensaje && <p className="message message-error">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

export default NuevaMascota;
