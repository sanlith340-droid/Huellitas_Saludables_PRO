import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ListaErrores from "../components/ListaErrores";
import { erroresDeRespuesta } from "../utils/errores";
import { bloquearTeclaEspacio, sinEspacios } from "../utils/inputs";
import huLogo from "../assets/hu.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErrorCampo = {
  campo: string;
  mensaje: string;
};

function validarLogin(form: { correo: string; contrasena: string }): ErrorCampo[] {
  const errores: ErrorCampo[] = [];

  if (!form.correo) {
    errores.push({ campo: "correo", mensaje: "Ingresa tu correo electrónico." });
  } else if (/\s/u.test(form.correo)) {
    errores.push({
      campo: "correo",
      mensaje: "El correo electrónico no puede contener espacios.",
    });
  } else if (!EMAIL_REGEX.test(form.correo)) {
    errores.push({
      campo: "correo",
      mensaje: "Ingresa un correo electrónico válido (ej. nombre@correo.com).",
    });
  }

  if (!form.contrasena) {
    errores.push({ campo: "contrasena", mensaje: "Ingresa tu contraseña." });
  } else if (/\s/u.test(form.contrasena)) {
    errores.push({
      campo: "contrasena",
      mensaje: "La contraseña no puede contener espacios.",
    });
  }

  return errores;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [errores, setErrores] = useState<ErrorCampo[]>([]);
  const [cargando, setCargando] = useState(false);

  const camposInvalidos = new Set(errores.map((error) => error.campo));
  const esInvalido = (campo: string) => (camposInvalidos.has(campo) ? true : undefined);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Correo y contraseña: prohibido escribir espacios.
    setForm({
      ...form,
      [name]: sinEspacios(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores([]);

    const problemas = validarLogin(form);
    setErrores(problemas);
    if (problemas.length > 0) return;

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/login", {
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });
      const datos = respuesta.data.data;

      login(datos.usuario);
      localStorage.setItem("token", datos.token);

      navigate("/dashboard");
    } catch (error) {
      const detalles = erroresDeRespuesta(error, "Error al iniciar sesión");
      setErrores(detalles.map((mensaje) => ({ campo: "", mensaje })));
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
                onKeyDown={bloquearTeclaEspacio}
                aria-invalid={esInvalido("correo")}
                aria-describedby="correo-ayuda"
                autoComplete="email"
                spellCheck={false}
                required
              />
              <span className="field__hint" id="correo-ayuda">
                Sin espacios.
              </span>
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
                onKeyDown={bloquearTeclaEspacio}
                aria-invalid={esInvalido("contrasena")}
                aria-describedby="contrasena-ayuda"
                autoComplete="current-password"
                required
              />
              <span className="field__hint" id="contrasena-ayuda">
                Sin espacios.
              </span>
            </div>

            <ListaErrores errores={errores.map((error) => error.mensaje)} />

            <button className="btn btn-primary btn-block" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="form-footer">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
