import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mensajeAccesoPorRol } from "../utils/roleMessages";

function RoleRoute({ roles, children }) {
  const { usuario, autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(usuario?.rol)) {
    return (
      <main className="container">
        <section className="message message-error" role="alert">
          {mensajeAccesoPorRol(usuario?.rol)}
        </section>
      </main>
    );
  }

  return children;
}

export default RoleRoute;
