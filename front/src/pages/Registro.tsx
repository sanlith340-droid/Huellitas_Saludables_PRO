import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import huLogo from "../assets/hu.png";

const ESTADO_INICIAL = {
  nombre: "",
  apellidos: "",
  telefono: "",
  correo: "",
  direccion: "",
  contrasena: "",
  tipo: "principal",
};

function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      await api.post("/auth/registro", form);

      setExito(true);
      setMensaje("Cuenta creada. Ya puedes iniciar sesión.");
      setForm(ESTADO_INICIAL);

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setExito(false);
      setMensaje(error.response?.data?.message || "No se pudo completar el registro");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__side">
        <div>
          <span className="brand__mark">
            <img src={huLogo} alt="Huellitas Saludables" />
          </span>
          <h2>Crea tu cuenta en Huellitas Saludables</h2>
          <p>Registra tus datos para agendar citas y llevar el historial clínico de tus mascotas.</p>
        </div>
      </div>

      <div className="auth__content">
        <div className="auth-card">
          <h1>Crear cuenta</h1>
          <p className="auth-card__subtitle">Completa tus datos para registrarte.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <div className="field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                name="correo"
                placeholder="nombre@correo.com"
                value={form.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  placeholder="3001234567"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="tipo">Tipo de usuario</label>
                <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                  <option value="principal">Principal</option>
                  <option value="acudiente">Acudiente</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                name="direccion"
                placeholder="Calle 123 # 45-67"
                value={form.direccion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                name="contrasena"
                placeholder="Mínimo 4 caracteres"
                value={form.contrasena}
                onChange={handleChange}
                minLength={4}
                required
              />
            </div>

            <button className="btn btn-primary btn-block" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {mensaje && (
            <p className={`message ${exito ? "message-success" : "message-error"}`}>{mensaje}</p>
          )}

          <p className="form-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
