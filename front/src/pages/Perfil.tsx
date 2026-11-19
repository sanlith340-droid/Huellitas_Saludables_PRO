import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaIdCard, FaPhone, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ErrorState from "../components/ErrorState";

function textoSeguro(valor: unknown): string {
  if (typeof valor === "string" && valor.trim()) return valor.trim();
  if (typeof valor === "number") return String(valor);
  return "No registrado";
}

function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState<Record<string, unknown>>((usuario || {}) as Record<string, unknown>);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState<number | null>(null);

  useEffect(() => {
    let vigente = true;
    api.get("/auth/perfil")
      .then((respuesta) => {
        if (vigente && respuesta.data?.data) setDatos(respuesta.data.data);
      })
      .catch((error) => {
        if (vigente) setErrorPerfil(error.response?.status ?? 0);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => { vigente = false; };
  }, []);
  const nombre = [textoSeguro(datos?.nombre), textoSeguro(datos?.apellidos)]
    .filter((parte) => parte !== "No registrado")
    .join(" ") || "Tu perfil";

  const campos = [
    { etiqueta: "Nombre", valor: nombre, icono: FaUser },
    { etiqueta: "Correo electrónico", valor: textoSeguro(datos?.correo ?? datos?.email), icono: FaEnvelope },
    { etiqueta: "Identificador de cuenta", valor: textoSeguro(datos?.id_usuario), icono: FaIdCard },
    { etiqueta: "Teléfono", valor: textoSeguro(datos?.telefono), icono: FaPhone },
  ];

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  if (cargando) {
    return <div className="container profile-page"><p className="empty-state">Cargando perfil…</p></div>;
  }

  if (errorPerfil !== null) {
    const variante = errorPerfil === 403 ? "denied" : errorPerfil === 404 ? "user" : "server";
    return (
      <div className="container error-page">
        <ErrorState
          variant={variante}
          title={errorPerfil === 404 ? "No encontramos tu cuenta" : undefined}
          description={errorPerfil === 404
            ? "La sesión no tiene un perfil disponible. Vuelve a iniciar sesión para actualizar tus datos."
            : undefined}
          to={errorPerfil === 404 ? "/login" : "/dashboard"}
          actionLabel={errorPerfil === 404 ? "Iniciar sesión" : "Volver a mi inicio"}
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
          <button type="button" className="btn btn-outline" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </section>
    </div>
  );
}

export default Perfil;
