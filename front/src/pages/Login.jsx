import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import huLogo from "../assets/hu.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [mensaje, setMensaje] = useState("");
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
      const respuesta = await api.post("/auth/login", form);
      const datos = respuesta.data.data;

      login(datos.usuario);
      localStorage.setItem("token", datos.token);

      navigate("/dashboard");
    } catch (error) {
      setMensaje(error.response?.data?.message || "Error al iniciar sesión");
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
          <h2>Bienvenido de nuevo a Huellitas Saludables</h2>
          <p>Inicia sesión para ver las citas y el historial clínico de tus mascotas.</p>
        </div>
      </div>

      <div className="auth__content">
        <div className="auth-card">
          <h1>Iniciar sesión</h1>
          <p className="auth-card__subtitle">Ingresa tus datos para continuar.</p>

          <form onSubmit={handleSubmit} noValidate>
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

            <div className="field">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                name="contrasena"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary btn-block" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          {mensaje && <p className="message message-error">{mensaje}</p>}

          <p className="form-footer">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
