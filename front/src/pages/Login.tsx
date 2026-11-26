import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCat, FaDog, FaPaw } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ListaErrores from "../components/ListaErrores";
import ErrorState from "../components/ErrorState";
import BotonEnvio from "../components/feedback/BotonEnvio";
import { erroresDeRespuesta } from "../utils/errores";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import { bloquearTeclaEspacio, sinEspacios } from "../utils/inputs";

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
  const { login, avisoSesion, limpiarAvisoSesion } = useAuth();
  // Aviso tras cerrar sesión: se copia al estado local y se limpia del contexto para no repetirlo.
  const [avisoCierre] = useState<string | null>(avisoSesion);
  useEffect(() => {
    if (avisoSesion) limpiarAvisoSesion();
  }, [avisoSesion, limpiarAvisoSesion]);

  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [errores, setErrores] = useState<ErrorCampo[]>([]);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorApi, setErrorApi] = useState<unknown>(null);

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
    setErrorUsuario(false);
    setErrorApi(null);

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
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setErrorUsuario(true);
        return;
      }
      // Fallos de red o del servidor: pantalla de error con reintento en vez de un texto suelto.
      if (!status || status >= 500) {
        setErrorApi(error);
        return;
      }
      const detalles = erroresDeRespuesta(error, "Error al iniciar sesión");
      setErrores(detalles.map((mensaje) => ({ campo: "", mensaje })));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__side">
        <div className="auth__message">
          <span className="auth__message-eyebrow">Cada huella cuenta</span>
          <h2>Cuidamos lo que más quieres.</h2>
          <p>Un espacio sencillo para acompañar el bienestar de tus mascotas.</p>
        </div>
        <div className="auth__pet-silhouettes" aria-hidden="true">
          <FaPaw className="auth__pet-paw auth__pet-paw--left" />
          <FaCat className="auth__pet-cat" />
          <FaDog className="auth__pet-dog" />
          <FaPaw className="auth__pet-paw auth__pet-paw--right" />
        </div>
      </div>

      <div className="auth__content">
        <div className="auth-card">
          <h1>Iniciar sesión</h1>
          <p className="auth-card__subtitle">Ingresa tus datos para continuar.</p>

          {avisoCierre && (
            <p className="message message-success" role="status">
              {avisoCierre}
            </p>
          )}

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

            {errorUsuario && (
              <ErrorState
                variant="user"
                className="error-state--inline"
                title="No encontramos una coincidencia"
                description="El correo o la contraseña no coinciden. Revisa tus datos e inténtalo de nuevo."
              />
            )}
            <ListaErrores errores={errores.map((error) => error.mensaje)} />

            {errorApi && (
              <ErrorState
                variant={varianteDeError(errorApi)}
                compacto
                className="error-state--inline"
                title={tituloDeError(errorApi)}
                description={mensajeDeError(errorApi, "No pudimos iniciar sesión. Inténtalo de nuevo.")}
              />
            )}

            <BotonEnvio
              guardando={cargando}
              texto="Iniciar sesión"
              textoGuardando="Entrando..."
              bloque
            />
          </form>

          <p className="form-footer">
            <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
          </p>

          <p className="form-footer">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
