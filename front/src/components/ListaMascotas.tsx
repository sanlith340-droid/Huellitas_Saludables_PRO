
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaPaw } from "react-icons/fa";

function ListaMascotas() {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarMascotas = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get("/mascotas");

      const todasLasMascotas = response.data.data || [];

      const misMascotas = todasLasMascotas.filter(
        (mascota) =>
          mascota.propietario_id === usuario?.id_usuario
      );

      setMascotas(misMascotas);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las mascotas."
      );
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarMascotas();
  }, [cargarMascotas]);

  return (
    <div className="container">
      <div className="dash-header">
        <div>
          <h1>Mis mascotas</h1>
          <p>
            Consulta las mascotas registradas en tu cuenta.
          </p>
        </div>

        <Link
          to="/mascotas/nueva"
          className="btn btn-primary"
        >
          + Registrar mascota
        </Link>
      </div>

      {error && (
        <p className="message message-error">
          {error}
        </p>
      )}

      <div className="panel">
        <div className="panel__head">
          <h2>Mascotas registradas</h2>

          {!cargando && (
            <span className="badge">
              {mascotas.length}
            </span>
          )}
        </div>

        {cargando ? (
          <p className="empty-state">
            Cargando mascotas...
          </p>
        ) : mascotas.length === 0 ? (
          <div className="empty-state">
            <p>
              Aún no tienes mascotas registradas.
            </p>

            <Link
              to="/mascotas/nueva"
              className="btn btn-primary"
            >
              Registrar mi primera mascota
            </Link>
          </div>
        ) : (
          <div className="list">
            {mascotas.map((mascota, index) => (
              <div
                className="list-item"
                key={
                  mascota.id_mascota ?? index
                }
              >
                <div className="list-item__icon">
                  <FaPaw />
                </div>

                <div>
                  <div className="list-item__title">
                    {mascota.mascota}
                  </div>

                  <div className="list-item__meta">
                    {mascota.especie}
                    {" · "}
                    {mascota.genero}

                    {mascota.raza
                      ? ` · ${mascota.raza}`
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaMascotas;

