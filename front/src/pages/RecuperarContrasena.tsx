/**
 * pages/RecuperarContrasena.tsx
 * Pantalla pública para pedir el enlace de recuperación de contraseña.
 * La respuesta del backend es siempre genérica: nunca revela si el correo
 * existe o no, para no permitir la enumeración de cuentas.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ListaErrores from "../components/ListaErrores";
import ErrorState from "../components/ErrorState";
import BotonEnvio from "../components/feedback/BotonEnvio";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import { bloquearTeclaEspacio, sinEspacios } from "../utils/inputs";
import huLogo from "../assets/hu.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [errorApi, setErrorApi] = useState<unknown>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrores([]);
    setErrorApi(null);

    const valor = correo.trim();
    if (!valor) {
      setErrores(["Ingresa tu correo electrónico."]);
      return;
    }
    if (/\s/u.test(valor) || !EMAIL_REGEX.test(valor)) {
      setErrores(["Ingresa un correo electrónico válido (ej. nombre@correo.com)."]);
      return;
    }

    setCargando(true);
    try {
      const respuesta = await api.post("/auth/forgot-password", { correo: valor });
      setEnviado(
        respuesta.data?.message ||
          "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.",
      );
    } catch (error) {
      // 503: el correo no está configurado o el servidor SMTP no responde.
      setErrorApi(error);
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
          <h2>Recupera el acceso a tu cuenta</h2>
          <p>Te enviaremos un enlace de un solo uso para que crees una contraseña nueva.</p>
        </div>
      </div>

      <div className="auth__content">
        <div className="auth-card">
          <h1>Recuperar contraseña</h1>
          <p className="auth-card__subtitle">
            Escribe el correo con el que te registraste y revisa tu bandeja de entrada.
          </p>

          {enviado ? (
            <>
              <p className="message message-success" role="status">
                {enviado}
              </p>
              <p className="auth-card__subtitle">
                El enlace vence en 30 minutos y solo puede usarse una vez. Si no lo ves, revisa la
                carpeta de correo no deseado.
              </p>
              <p className="form-footer">
                <Link to="/login">Volver a iniciar sesión</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  placeholder="nombre@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(sinEspacios(e.target.value))}
                  onKeyDown={bloquearTeclaEspacio}
                  aria-invalid={errores.length > 0 ? true : undefined}
                  aria-describedby="correo-ayuda"
                  autoComplete="email"
                  spellCheck={false}
                  required
                />
                <span className="field__hint" id="correo-ayuda">
                  El mismo correo con el que inicias sesión.
                </span>
              </div>

              <ListaErrores errores={errores} />

              {errorApi && (
                <ErrorState
                  variant={varianteDeError(errorApi)}
                  compacto
                  className="error-state--inline"
                  title={tituloDeError(errorApi)}
                  description={mensajeDeError(
                    errorApi,
                    "No pudimos enviar el correo de recuperación. Inténtalo de nuevo.",
                  )}
                />
              )}

              <BotonEnvio
                guardando={cargando}
                texto="Enviar enlace"
                textoGuardando="Enviando..."
                bloque
              />
            </form>
          )}

          {!enviado && (
            <p className="form-footer">
              ¿Ya tienes el enlace? <Link to="/login">Inicia sesión</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecuperarContrasena;
