import { Link } from "react-router-dom";
import FormularioMascota from "../components/FormularioMascota";

function NuevaMascota() {
  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Registrar mascota</h1>
          <p>Agrega una nueva mascota a tu cuenta.</p>
        </div>

        <Link to="/mascotas" className="btn btn-outline btn-sm">
          ← Ver mis mascotas
        </Link>
      </div>

      <FormularioMascota />
    </div>
  );
}

export default NuevaMascota;
