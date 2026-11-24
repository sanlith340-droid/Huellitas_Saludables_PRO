import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FaPaw } from "react-icons/fa";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import EmptyState from "./feedback/EmptyState";
import HistoriaClinicaMascota from "./HistoriaClinicaMascota";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import "../styles/mascotas.css";

type Mascota = {
  id_mascota: number;
  mascota: string;
  especie: string;
  genero: string;
  raza?: string | null;
};

function ListaMascotas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fallo, setFallo] = useState<unknown>(null);

  const cargarMascotas = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      setFallo(null);
      const response = await api.get("/mascotas");
      // El backend ya aplica la pertenencia por usuario autenticado.
      setMascotas((response.data.data || []) as Mascota[]);
    } catch (err) {
      setFallo(err);
      setError(mensajeDeError(err, "No se pudieron cargar las mascotas."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarMascotas();
  }, [cargarMascotas]);

  return (
    <div className="container mascotas-page">
      <div className="mascotas-hero">
        <div>
          <p className="mascotas-hero__eyebrow"><FaPaw /> Cuidado personalizado</p>
          <h1>Mis mascotas</h1>
          <p className="mascotas-hero__lead">Todas sus fichas en un solo lugar. Selecciona una mascota para consultar su historia clínica.</p>
        </div>
        <Link to="/mascotas/nueva" className="btn btn-primary mascotas-hero__action">+ Registrar mascota</Link>
      </div>

      <div className="mascotas-summary" aria-live="polite">
        <div className="mascotas-summary__icon"><FaPaw /></div>
        <div>
          <strong>{cargando ? "Buscando tus huellitas…" : `${mascotas.length} ${mascotas.length === 1 ? "mascota registrada" : "mascotas registradas"}`}</strong>
          <span>Sus historias clínicas están protegidas y solo tú puedes consultarlas.</span>
        </div>
      </div>

      <section className="mascotas-panel" aria-labelledby="mascotas-registradas">
        <div className="mascotas-panel__heading">
          <div>
            <p className="mascotas-panel__eyebrow">Tu familia</p>
            <h2 id="mascotas-registradas">Mascotas registradas</h2>
          </div>
          {!cargando && !error && <span className="mascotas-count">{mascotas.length}</span>}
        </div>

        {cargando ? (
          <LoadingState variante="panel" titulo="Buscando a tus mascotas" mensajes={["Consultando el registro de la clínica...", "Revisando las fichas de cada huellita...", "Ya casi están aquí..."]} filas={3} conEsqueleto />
        ) : error ? (
          <ErrorState variant={varianteDeError(fallo)} compacto title={tituloDeError(fallo)} description={error} onRetry={() => void cargarMascotas()} />
        ) : mascotas.length === 0 ? (
          <EmptyState ilustracion="mascotas" titulo="Aún no hay huellas registradas" descripcion="Cuando registres a tu primera mascota, aquí verás su ficha y su historia clínica." sugerencias={["Solo necesitas su nombre, especie y fecha de nacimiento.", "Con la mascota registrada ya puedes agendar su primera cita."]} accion={{ etiqueta: "Registrar mi primera mascota", to: "/mascotas/nueva" }} />
        ) : (
          <div className="mascotas-grid">
            {mascotas.map((mascota) => (
              <button
                className={`mascota-card ${mascotaSeleccionada?.id_mascota === mascota.id_mascota ? "mascota-card--activo" : ""}`}
                key={mascota.id_mascota}
                type="button"
                onClick={() => setMascotaSeleccionada(mascota)}
                aria-pressed={mascotaSeleccionada?.id_mascota === mascota.id_mascota}
              >
                <span className="mascota-card__top">
                  <span className="mascota-card__avatar"><FaPaw /></span>
                  <span className="mascota-card__arrow" aria-hidden="true">↗</span>
                </span>
                <span className="mascota-card__name">{mascota.mascota}</span>
                <span className="mascota-card__meta">{mascota.especie} <i /> {mascota.genero}</span>
                {mascota.raza && <span className="mascota-card__breed">{mascota.raza}</span>}
                <span className="mascota-card__footer">
                  <span>Historia clínica</span>
                  <span className="mascota-card__action">Ver ficha</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {mascotaSeleccionada && (
        <HistoriaClinicaMascota
          idMascota={mascotaSeleccionada.id_mascota}
          mascotaNombre={mascotaSeleccionada.mascota}
          onCerrar={() => setMascotaSeleccionada(null)}
        />
      )}
    </div>
  );
}

export default ListaMascotas;
