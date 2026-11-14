import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ListaErrores from "../components/ListaErrores";
import { erroresDeRespuesta } from "../utils/errores";
import {
  bloquearTeclaEspacio,
  bloquearTeclaNoDigito,
  sinEspacios,
  soloDigitos,
} from "../utils/inputs";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^\d{7,10}$/;

type ErrorCampo = {
  campo: string;
  mensaje: string;
};

/**
 * Valida todos los campos y devuelve TODOS los problemas encontrados,
 * uno por cada regla incumplida, para mostrarlos en columna.
 */
function validarRegistro(form: typeof ESTADO_INICIAL): ErrorCampo[] {
  const errores: ErrorCampo[] = [];

  if (!form.nombre.trim()) {
    errores.push({ campo: "nombre", mensaje: "Ingresa tu nombre." });
  }

  if (!form.apellidos.trim()) {
    errores.push({ campo: "apellidos", mensaje: "Ingresa tus apellidos." });
  }

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

  if (!form.telefono) {
    errores.push({ campo: "telefono", mensaje: "Ingresa tu número de teléfono." });
  } else if (!/^\d+$/.test(form.telefono)) {
    errores.push({
      campo: "telefono",
      mensaje: "El teléfono solo puede contener números, sin letras ni símbolos.",
    });
  } else if (!TELEFONO_REGEX.test(form.telefono)) {
    errores.push({
      campo: "telefono",
      mensaje: "El teléfono debe tener entre 7 y 10 dígitos.",
    });
  }

  if (!form.direccion.trim()) {
    errores.push({ campo: "direccion", mensaje: "Ingresa tu dirección." });
  }

  if (!form.contrasena) {
    errores.push({ campo: "contrasena", mensaje: "Ingresa una contraseña." });
  } else if (/\s/u.test(form.contrasena)) {
    errores.push({
      campo: "contrasena",
      mensaje: "La contraseña no puede contener espacios.",
    });
  } else if (form.contrasena.length < 4) {
    errores.push({
      campo: "contrasena",
      mensaje: "La contraseña debe tener al menos 4 caracteres.",
    });
  }

  return errores;
}

function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [errores, setErrores] = useState<ErrorCampo[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const camposInvalidos = new Set(errores.map((error) => error.campo));
  const esInvalido = (campo: string) => (camposInvalidos.has(campo) ? true : undefined);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valor = value;

    // El teléfono solo admite dígitos; correo y contraseña no admiten espacios.
    if (name === "telefono") valor = soloDigitos(valor);
    if (name === "correo" || name === "contrasena") valor = sinEspacios(valor);

    setForm({
      ...form,
      [name]: valor,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setExito(false);

    const problemas = validarRegistro(form);
    setErrores(problemas);
    if (problemas.length > 0) return;

    setCargando(true);

    try {
      await api.post("/auth/registro", {
        ...form,
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
      });

      setExito(true);
      setMensaje("Cuenta creada. Ya puedes iniciar sesión.");
      setForm(ESTADO_INICIAL);

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const detalles = erroresDeRespuesta(error, "No se pudo completar el registro");
      setErrores(detalles.map((mensajeError) => ({ campo: "", mensaje: mensajeError })));
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
                  aria-invalid={esInvalido("nombre")}
                  autoComplete="given-name"
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
                  aria-invalid={esInvalido("apellidos")}
                  autoComplete="family-name"
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
                  onKeyDown={bloquearTeclaNoDigito}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  aria-invalid={esInvalido("telefono")}
                  aria-describedby="telefono-ayuda"
                  autoComplete="tel-national"
                  required
                />
                <span className="field__hint" id="telefono-ayuda">
                  Solo números (7 a 10 dígitos).
                </span>
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
                aria-invalid={esInvalido("direccion")}
                autoComplete="street-address"
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
                onKeyDown={bloquearTeclaEspacio}
                aria-invalid={esInvalido("contrasena")}
                aria-describedby="contrasena-ayuda"
                autoComplete="new-password"
                minLength={4}
                required
              />
              <span className="field__hint" id="contrasena-ayuda">
                Sin espacios, mínimo 4 caracteres.
              </span>
            </div>

            <ListaErrores errores={errores.map((error) => error.mensaje)} />

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
