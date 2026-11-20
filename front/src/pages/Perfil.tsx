import { useCallback, useEffect, useState } from "react";
import { FaEnvelope, FaIdCard, FaPhone, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { EsqueletoPerfil } from "../components/feedback/Esqueletos";
import { mensajeDeError } from "../utils/erroresApi";

function textoSeguro(valor: unknown): string {
  if (typeof valor === "string" && valor.trim()) return valor.trim();
  if (typeof valor === "number") return String(valor);
  return "No registrado";
}

function Perfil() {
  const { usuario, logout, cerrandoSesion } = useAuth();
  const [datos, setDatos] = useState<Record<string, unknown>>((usuario || {}) as Record<string, unknown>);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState<number | null>(null);
  const [mensajeError, setMensajeError] = useState("");

  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setErrorPerfil(null);
    setMensajeError("");
    try {
      const respuesta = await api.get("/auth/perfil");
      if (respuesta.data?.data) setDatos(respuesta.data.data);
    } catch (error) {
      const estado = (error as { response?: { status?: number } })?.response?.status ?? 0;
      setErrorPerfil(estado);
      setMensajeError(mensajeDeError(error, "No pudimos cargar tu perfil."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarPerfil();
  }, [cargarPerfil]);
  const nombre = [textoSeguro(datos?.nombre), textoSeguro(datos?.apellidos)]
    .filter((parte) => parte !== "No registrado")
    .join(" ") || "Tu perfil";

  const campos = [
    { etiqueta: "Nombre", valor: nombre, icono: FaUser },
    { etiqueta: "Correo electrónico", valor: textoSeguro(datos?.correo ?? datos?.email), icono: FaEnvelope },
    { etiqueta: "Identificador de cuenta", valor: textoSeguro(datos?.id_usuario), icono: FaIdCard },
    { etiqueta: "Teléfono", valor: textoSeguro(datos?.telefono), icono: FaPhone },
  ];

  // Misma función centralizada que usa la Navbar (revoca el token y limpia la sesión).
  const cerrarSesion = () => {
    void logout();
  };

  if (cargando) {
    return (
      <div className="container profile-page">
        <div className="dash-header profile-page__header">
          <div>
            <p className="profile-page__eyebrow">Mi cuenta</p>
            <h1>Perfil</h1>
            <p>Consulta la información asociada a tu sesión.</p>
          </div>
        </div>
        <LoadingState
          variante="panel"
          titulo="Buscando tu ficha"
          mensajes={["Consultando tus datos de cuenta...", "Acomodando tu carné de la clínica..."]}
        />
        <div style={{ marginTop: 18 }}>
          <EsqueletoPerfil />
        </div>
      </div>
    );
  }

  if (errorPerfil !== null) {
    const variante = errorPerfil === 403 ? "denied" : errorPerfil === 404 ? "user" : "server";
    const esDeRed = errorPerfil === 0;
    return (
      <div className="container error-page">
        <ErrorState
          variant={esDeRed ? "network" : variante}
          title={errorPerfil === 404 ? "No encontramos tu cuenta" : undefined}
          description={
            errorPerfil === 404
              ? "La sesión no tiene un perfil disponible. Vuelve a iniciar sesión para actualizar tus datos."
              : mensajeError || undefined
          }
          to={errorPerfil === 404 ? "/login" : undefined}
          actionLabel={errorPerfil === 404 ? "Iniciar sesión" : undefined}
          onRetry={errorPerfil === 404 ? undefined : () => void cargarPerfil()}
        />
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <header className="dash-header profile-page__header">
        <div>
          <p className="profile-page__eyebrow">Mi cuenta</p>
          <h1>Perfil</h1>
          <p>Consulta la información asociada a tu sesión.</p>
        </div>
      </header>

      <section className="profile-card" aria-labelledby="profile-title">
        <div className="profile-card__identity">
          <span className="profile-card__avatar" aria-hidden="true">
            {(usuario?.nombre?.trim().charAt(0) || "H").toLocaleUpperCase("es-CO")}
          </span>
          <div>
            <h2 id="profile-title">{nombre}</h2>
            <span className="badge">{textoSeguro(datos?.rol)}</span>
          </div>
        </div>

        <dl className="profile-details">
          {campos.map(({ etiqueta, valor, icono: Icon }) => (
            <div className="profile-details__row" key={etiqueta}>
              <dt><Icon aria-hidden="true" /> {etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="profile-card__footer">
          <p>¿Necesitas actualizar tus datos? Contacta al equipo de recepción para recibir ayuda.</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={cerrarSesion}
            disabled={cerrandoSesion}
            aria-busy={cerrandoSesion}
          >
            {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Perfil;
