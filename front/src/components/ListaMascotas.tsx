
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FaPaw } from "react-icons/fa";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import EmptyState from "./feedback/EmptyState";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";

function ListaMascotas() {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fallo, setFallo] = useState<unknown>(null);

  const cargarMascotas = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      setFallo(null);

      const response = await api.get("/mascotas");

      const todasLasMascotas = response.data.data || [];

      const misMascotas = todasLasMascotas.filter(
        (mascota) =>
          mascota.propietario_id === usuario?.id_usuario
      );

      setMascotas(misMascotas);
    } catch (err) {
      setFallo(err);
      setError(mensajeDeError(err, "No se pudieron cargar las mascotas."));
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

      <div className="panel">
        <div className="panel__head">
          <h2>Mascotas registradas</h2>

          {!cargando && !error && (
            <span className="badge">
              {mascotas.length}
            </span>
          )}
        </div>

        {cargando ? (
          <LoadingState
            variante="panel"
            titulo="Buscando a tus mascotas"
            mensajes={[
              "Consultando el registro de la clínica...",
              "Revisando las fichas de cada huellita...",
              "Ya casi están aquí...",
            ]}
            filas={3}
            conEsqueleto
          />
        ) : error ? (
          <ErrorState
            variant={varianteDeError(fallo)}
            compacto
            title={tituloDeError(fallo)}
            description={error}
            onRetry={() => void cargarMascotas()}
          />
        ) : mascotas.length === 0 ? (
          <EmptyState
            ilustracion="mascotas"
            titulo="Aún no hay huellas registradas"
            descripcion="Cuando registres a tu primera mascota, aquí verás su ficha, sus citas y su historia clínica."
            sugerencias={[
              "Solo necesitas su nombre, especie y fecha de nacimiento.",
              "Con la mascota registrada ya puedes agendar su primera cita.",
            ]}
            accion={{ etiqueta: "Registrar mi primera mascota", to: "/mascotas/nueva" }}
          />
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
