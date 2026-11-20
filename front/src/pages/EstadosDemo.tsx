/**
 * pages/EstadosDemo.tsx
 * Vitrina de estados de interfaz (solo en desarrollo): /estados
 *
 * Sirve para revisar de un vistazo cómo se ven las pantallas de carga,
 * los vacíos, los errores y los botones "Guardando..." sin depender del
 * backend. No se publica en producción.
 */
import { useState } from "react";
import LoadingState from "../components/feedback/LoadingState";
import EmptyState from "../components/feedback/EmptyState";
import BotonEnvio from "../components/feedback/BotonEnvio";
import ErrorState from "../components/ErrorState";
import {
  EsqueletoCitas,
  EsqueletoDoctores,
  EsqueletoEstadisticas,
  EsqueletoFilas,
  EsqueletoPerfil,
  EsqueletoSemana,
  EsqueletoTexto,
} from "../components/feedback/Esqueletos";
import { loadingStore } from "../services/loadingStore";
import { FaCalendarPlus, FaPaw, FaUserPlus } from "react-icons/fa";

type Pestana = "carga" | "vacios" | "errores" | "guardando";

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: "carga", etiqueta: "Cargando" },
  { id: "vacios", etiqueta: "Sin datos" },
  { id: "errores", etiqueta: "Errores" },
  { id: "guardando", etiqueta: "Guardando..." },
];

function EstadosDemo() {
  const [pestana, setPestana] = useState<Pestana>("carga");
  const [guardando, setGuardando] = useState(false);

  const probarBarra = () => {
    loadingStore.iniciar();
    window.setTimeout(() => loadingStore.terminar(), 2600);
  };

  const simularGuardado = () => {
    setGuardando(true);
    window.setTimeout(() => setGuardando(false), 2200);
  };

  return (
    <div className="container demo-estados">
      <div className="dash-header">
        <div>
          <h1>Vitrina de estados</h1>
          <p>
            Así se ve Huellitas Saludables mientras carga, cuando no hay datos, cuando algo falla y
            mientras guarda. Esta página solo existe en desarrollo.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={probarBarra}>
          <FaPaw /> Probar barra global
        </button>
      </div>

      <div className="cita-filters__estados" role="tablist" aria-label="Tipo de estado">
        {PESTANAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={pestana === item.id}
            className={`chip ${pestana === item.id ? "chip--active" : ""}`}
            onClick={() => setPestana(item.id)}
          >
            {item.etiqueta}
          </button>
        ))}
      </div>

      {pestana === "carga" && (
        <div className="demo-grid">
          <section className="demo-bloque demo-bloque--ancho">
            <h2>Pantalla completa (variante página)</h2>
            <LoadingState
              variante="pagina"
              titulo="Preparando la consulta"
              mensajes={[
                "Buscando las fichas clínicas...",
                "Revisando el calendario de los especialistas...",
                "Acomodando las camitas de la sala de espera...",
              ]}
            />
          </section>

          <section className="demo-bloque">
            <h2>Dentro de una tarjeta</h2>
            <div className="panel">
              <div className="panel__head">
                <h2>Mis mascotas</h2>
              </div>
              <LoadingState
                variante="panel"
                titulo="Buscando a tus mascotas"
                mensajes={["Consultando el registro...", "Ya casi están aquí..."]}
              />
            </div>
          </section>

          <section className="demo-bloque">
            <h2>En línea</h2>
            <div className="panel demo-lineas">
              <LoadingState variante="en-linea" etiqueta="Cargando razas..." />
              <LoadingState variante="en-linea" etiqueta="Guardando horario..." />
              <LoadingState variante="en-linea" etiqueta="Buscando especialistas..." />
            </div>
          </section>

          <section className="demo-bloque demo-bloque--ancho">
            <h2>Esqueletos por pantalla</h2>
            <div className="panel">
              <div className="panel__head">
                <h2>Lista de mascotas</h2>
              </div>
              <EsqueletoFilas filas={3} />
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Citas</h2>
              </div>
              <EsqueletoCitas grupos={2} filas={2} />
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Panel de administración</h2>
              </div>
              <EsqueletoEstadisticas />
              <div style={{ marginTop: 18 }}>
                <EsqueletoFilas filas={2} />
              </div>
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Disponibilidad</h2>
              </div>
              <EsqueletoSemana />
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Agendar cita</h2>
              </div>
              <EsqueletoDoctores cantidad={3} />
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Perfil</h2>
              </div>
              <EsqueletoPerfil />
            </div>
            <div className="panel">
              <div className="panel__head">
                <h2>Texto</h2>
              </div>
              <EsqueletoTexto lineas={4} />
            </div>
          </section>
        </div>
      )}

      {pestana === "vacios" && (
        <div className="demo-grid">
          <section className="demo-bloque">
            <h2>Sin mascotas</h2>
            <EmptyState
              ilustracion="mascotas"
              titulo="Aún no hay huellas registradas"
              descripcion="Cuando registres a tu primera mascota, aquí verás su ficha, sus citas y su historia clínica."
              accion={{ etiqueta: "Registrar mi primera mascota", to: "/mascotas/nueva" }}
            />
          </section>

          <section className="demo-bloque">
            <h2>Sin citas</h2>
            <EmptyState
              ilustracion="citas"
              titulo="La agenda está libre"
              descripcion="No hay citas para este rango de fechas. Cuando alguien reserve, aparecerá aquí."
              accion={{ etiqueta: "Agendar una cita", to: "/citas/nueva" }}
            />
          </section>

          <section className="demo-bloque">
            <h2>Búsqueda sin resultados</h2>
            <EmptyState
              ilustracion="busqueda"
              titulo="No encontramos coincidencias"
              descripcion="Prueba con otro nombre, correo o filtro. La lupa del perrito no muerde."
              accion={{ etiqueta: "Limpiar filtros", onClick: () => undefined, variante: "outline" }}
            />
          </section>

          <section className="demo-bloque">
            <h2>Sin horarios</h2>
            <EmptyState
              ilustracion="horarios"
              titulo="Este día no tiene franjas"
              descripcion="Crea una nueva franja horaria para que los tutores puedan reservar."
              accion={{ etiqueta: "Nueva franja", onClick: () => undefined }}
            />
          </section>

          <section className="demo-bloque">
            <h2>Sin personal</h2>
            <EmptyState
              ilustracion="personal"
              titulo="Todavía no hay cuentas de personal"
              descripcion="Registra especialistas, recepcionistas y administradores desde el formulario."
              accion={{ etiqueta: "Registrar usuario", onClick: () => undefined }}
            />
          </section>

          <section className="demo-bloque">
            <h2>Versión en línea</h2>
            <div className="panel">
              <EmptyState
                variante="en-linea"
                ilustracion="generico"
                titulo="Sin novedades"
                descripcion="No hay registros nuevos por hoy."
              />
            </div>
          </section>
        </div>
      )}

      {pestana === "errores" && (
        <div className="demo-grid">
          <section className="demo-bloque demo-bloque--ancho">
            <h2>Error de red (sin conexión con la API)</h2>
            <ErrorState
              variant="network"
              onRetry={() => undefined}
              detalle="GET /api/mascotas · sin respuesta del servidor"
            />
          </section>

          <section className="demo-bloque">
            <h2>Error dentro de una tarjeta</h2>
            <div className="panel">
              <ErrorState
                variant="server"
                compacto
                title="No pudimos cargar las mascotas"
                description="El servidor no respondió a tiempo. Revisa tu conexión e inténtalo de nuevo."
                onRetry={() => undefined}
              />
            </div>
          </section>

          <section className="demo-bloque">
            <h2>Tiempo de espera agotado</h2>
            <div className="panel">
              <ErrorState
                variant="timeout"
                compacto
                title="La clínica está tardando demasiado"
                description="La respuesta no llegó a tiempo. Prueba otra vez en unos segundos."
                onRetry={() => undefined}
                reintentando
              />
            </div>
          </section>

          <section className="demo-bloque">
            <h2>Acceso protegido</h2>
            <div className="panel">
              <ErrorState
                variant="denied"
                compacto
                description="Tu cuenta no tiene permiso para ver esta sección."
                to="/dashboard"
                actionLabel="Ir a mi inicio"
              />
            </div>
          </section>

          <section className="demo-bloque">
            <h2>Horario ocupado</h2>
            <div className="panel">
              <ErrorState
                variant="appointment"
                compacto
                title="Ese horario acaba de ocuparse"
                description="La disponibilidad cambió mientras completabas la reserva."
                actionLabel="Elegir otro horario"
                onAction={() => undefined}
              />
            </div>
          </section>
        </div>
      )}

      {pestana === "guardando" && (
        <div className="demo-grid">
          <section className="demo-bloque demo-bloque--ancho">
            <h2>Botones de formulario</h2>
            <div className="panel demo-botones">
              <div className="demo-boton">
                <BotonEnvio
                  type="button"
                  guardando={guardando}
                  texto="Registrar mascota"
                  textoGuardando="Guardando..."
                  icono={<FaPaw />}
                  onClick={simularGuardado}
                />
                <span className="demo-boton__nota">Estado normal y estado enviando</span>
              </div>

              <div className="demo-boton">
                <BotonEnvio
                  type="button"
                  guardando
                  texto="Crear franja"
                  textoGuardando="Guardando..."
                  icono={<FaCalendarPlus />}
                  onClick={() => undefined}
                />
                <span className="demo-boton__nota">Siempre guardando</span>
              </div>

              <div className="demo-boton">
                <BotonEnvio
                  type="button"
                  guardando={guardando}
                  texto="Crear especialista"
                  textoGuardando="Guardando..."
                  variante="outline"
                  icono={<FaUserPlus />}
                  onClick={simularGuardado}
                />
                <span className="demo-boton__nota">Variante outline</span>
              </div>

              <div className="demo-boton">
                <BotonEnvio
                  type="button"
                  guardando
                  texto="Confirmar cita"
                  textoGuardando="Guardando..."
                  bloque
                  onClick={() => undefined}
                />
                <span className="demo-boton__nota">Bloque completo</span>
              </div>
            </div>
          </section>

          <section className="demo-bloque">
            <h2>Así se siente</h2>
            <div className="panel">
              <p className="state-note">
                Al enviar un formulario el botón queda deshabilitado (sin doble envío), cambia el
                texto a “Guardando...” y gira una huella.
              </p>
              <div style={{ marginTop: 16 }}>
                <BotonEnvio
                  type="button"
                  guardando={guardando}
                  texto="Probar el envío"
                  textoGuardando="Guardando..."
                  onClick={simularGuardado}
                  bloque
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default EstadosDemo;
