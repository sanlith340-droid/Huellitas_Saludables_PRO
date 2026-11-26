import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FaPaw } from "react-icons/fa";
import ErrorState from "./ErrorState";
import LoadingState from "./feedback/LoadingState";
import EmptyState from "./feedback/EmptyState";
import HistoriaClinicaMascota from "./HistoriaClinicaMascota";
import { mensajeDeError, tituloDeError, varianteDeError } from "../utils/erroresApi";
import mascotaReferencia from "../assets/huellitas-mascota-web.jpg";
import "../styles/mascotas.css";

type Mascota = {
  id_mascota: number;
  mascota: string;
  especie: string;
  genero: string;
  raza?: string | null;
  foto_url?: string | null;
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
            {mascotas.map((mascota) => {
              const seleccionada = mascotaSeleccionada?.id_mascota === mascota.id_mascota;
              return (
                <article className={`mascota-card${seleccionada ? " mascota-card--activo" : ""}`} key={mascota.id_mascota}>
                  <div className="mascota-card__photo-wrap">
                    <img
                      className="mascota-card__photo"
                      src={mascota.foto_url || mascotaReferencia}
                      alt={mascota.foto_url ? `Fotografía de ${mascota.mascota}` : `Imagen de referencia para ${mascota.mascota}`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = mascotaReferencia;
                      }}
                    />
                    {!mascota.foto_url && <span className="mascota-card__photo-note"><FaPaw aria-hidden="true" /> Imagen de referencia</span>}
                  </div>
                  <div className="mascota-card__body">
                    <h3 className="mascota-card__name">{mascota.mascota}</h3>
                    <p className="mascota-card__meta">{mascota.especie} <span aria-hidden="true">·</span> {mascota.genero}</p>
                    <p className="mascota-card__breed"><span>Raza</span>{mascota.raza || "Sin especificar"}</p>
                  </div>
                  <div className="mascota-card__actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setMascotaSeleccionada(mascota)} aria-pressed={seleccionada}>
                      {seleccionada ? "Historia abierta" : "Historia clínica"}
                    </button>
                    <Link to="/citas/nueva" className="mascota-card__appointment">Agendar cita</Link>
                  </div>
                </article>
              );
            })}
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
