import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ roles, children }) {
  const { usuario, autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
