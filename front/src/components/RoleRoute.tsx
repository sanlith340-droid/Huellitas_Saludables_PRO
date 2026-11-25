import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorState from "./ErrorState";
import { mensajeAccesoPorRol, rutaInicioPorRol } from "../utils/roleMessages";

function RoleRoute({ roles, children }) {
  const { usuario, autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(usuario?.rol)) {
    return (
      <div className="container error-page">
        <ErrorState
          variant="denied"
          title="Tu acceso está protegido"
          description={mensajeAccesoPorRol(usuario?.rol)}
          to={rutaInicioPorRol(usuario?.rol)}
          actionLabel="Ir a mi inicio"
        />
      </div>
    );
  }

  return children;
}

export default RoleRoute;
