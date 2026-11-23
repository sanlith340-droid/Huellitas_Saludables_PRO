/**
 * pages/NuevaContrasena.tsx
 * Pantalla pública a la que llega el enlace del correo (/nueva-contrasena?token=...).
 * Valida el token antes de mostrar el formulario y luego define la contraseña nueva.
 * El token es de un solo uso: si ya se usó o venció, la API responde 400 y aquí
 * se muestra el estado de error con un enlace para pedir otro.
 */
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import ListaErrores from "../components/ListaErrores";
import ErrorState from "../components/ErrorState";
import BotonEnvio from "../components/feedback/BotonEnvio";
import { bloquearTeclaEspacio, sinEspacios } from "../utils/inputs";
import huLogo from "../assets/hu.png";

type EstadoEnlace = "validando" | "valido" | "invalido";

function NuevaContrasena() {
  const [params] = useSearchParams();
  const token = (params.get("token") || "").trim();

  const [estadoEnlace, setEstadoEnlace] = useState<EstadoEnlace>("validando");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    if (!/^[a-f0-9]{64}$/u.test(token)) {
      setEstadoEnlace("invalido");
      return () => {
        cancelado = true;
      };
    }

    api
      .post("/auth/verify-reset-token", { token })
      .then(() => {
        if (!cancelado) setEstadoEnlace("valido");
      })
      .catch(() => {
        if (!cancelado) setEstadoEnlace("invalido");
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrores([]);

    const problemas: string[] = [];
    if (!contrasena) {
      problemas.push("Ingresa tu nueva contraseña.");
    } else if (/\s/u.test(contrasena)) {
      problemas.push("La contraseña no puede contener espacios.");
    } else if (contrasena.length < 4) {
      problemas.push("La contraseña debe tener al menos 4 caracteres.");
    } else if (contrasena.length > 72) {
      problemas.push("La contraseña no puede superar 72 caracteres.");
    }
    if (contrasena && confirmacion !== contrasena) {
      problemas.push("Las contraseñas no coinciden.");
    }
    if (problemas.length > 0) {
      setErrores(problemas);
      return;
    }

    setCargando(true);
    try {
      await api.post("/auth/reset-password", { token, contrasena });
      setListo(true);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        setEstadoEnlace("invalido");
      } else {
        setErrores(["No pudimos cambiar la contraseña. Inténtalo de nuevo."]);
      }
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
          <h2>Crea una contraseña nueva</h2>
          <p>Cuando la guardes, el enlace dejará de funcionar y podrás entrar con ella.</p>
        </div>
      </div>

      <div className="auth__content">
        <div className="auth-card">
          <h1>Nueva contraseña</h1>

          {estadoEnlace === "validando" && (
            <p className="auth-card__subtitle" role="status">
              Verificando el enlace...
            </p>
          )}

          {estadoEnlace === "invalido" && (
            <>
              <ErrorState
                variant="user"
                compacto
                className="error-state--inline"
                title="Este enlace ya no sirve"
                description="El enlace venció o ya fue utilizado. Solicita uno nuevo para continuar."
              />
              <p className="form-footer">
                <Link to="/recuperar-contrasena">Solicitar un enlace nuevo</Link>
              </p>
            </>
          )}

          {estadoEnlace === "valido" && !listo && (
            <>
              <p className="auth-card__subtitle">
                Elige una contraseña sin espacios. Puedes usar letras, números y símbolos.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="contrasena">Contraseña nueva</label>
                  <input
                    id="contrasena"
                    type="password"
                    name="contrasena"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(sinEspacios(e.target.value))}
                    onKeyDown={bloquearTeclaEspacio}
                    aria-describedby="contrasena-ayuda"
                    autoComplete="new-password"
                    required
                  />
                  <span className="field__hint" id="contrasena-ayuda">
                    Mínimo 4 caracteres, sin espacios.
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="confirmacion">Repite la contraseña</label>
                  <input
                    id="confirmacion"
                    type="password"
                    name="confirmacion"
                    placeholder="••••••••"
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(sinEspacios(e.target.value))}
                    onKeyDown={bloquearTeclaEspacio}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <ListaErrores errores={errores} />

                <BotonEnvio
                  guardando={cargando}
                  texto="Guardar contraseña"
                  textoGuardando="Guardando..."
                  bloque
                />
              </form>
            </>
          )}

          {listo && (
            <>
              <p className="message message-success" role="status">
                Contraseña actualizada correctamente. Ya puedes iniciar sesión con ella.
              </p>
              <p className="form-footer">
                <Link to="/login">Ir a iniciar sesión</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NuevaContrasena;
