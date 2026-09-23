import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCalendarCheck, FaStethoscope, FaClipboardList } from "react-icons/fa";
import perritoImg from "../assets/perrito.png";

function Home() {
  const { autenticado } = useAuth();

  return (
    <div className="container">
      <section className="hero">
        <div>
          <p className="hero__eyebrow">Cuidado veterinario sin filas</p>
          <h1>Agenda la próxima cita de tu mascota en minutos</h1>
          <p>
            Huellitas Saludables conecta a los dueños de mascotas con especialistas
            veterinarios: revisa disponibilidad, reserva la cita y sigue el historial
            clínico desde un solo lugar.
          </p>
          <div className="hero__actions">
            {autenticado ? (
              <Link to="/dashboard" className="btn btn-primary">
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/registro" className="btn btn-primary">
                  Crear una cuenta
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero__panel">
          <div className="hero__paw"><img src={perritoImg} alt="Patita de mascota" /></div>
          <h3>Historia clínica al día</h3>
          <p>
            Cada consulta, vacuna y tratamiento queda registrado para que tu
            especialista siempre tenga el contexto completo.
          </p>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-card__icon">
            <FaCalendarCheck />
          </div>
          <h3>Reserva flexible</h3>
          <p>Consulta la disponibilidad real de cada especialista y agenda sin llamadas.</p>
        </div>

        <div className="feature-card">
          <div className="feature-card__icon">
            <FaStethoscope />
          </div>
          <h3>Especialistas verificados</h3>
          <p>Cada profesional tiene su especialización registrada y visible antes de agendar.</p>
        </div>

        <div className="feature-card">
          <div className="feature-card__icon">
            <FaClipboardList />
          </div>
          <h3>Todo en un panel</h3>
          <p>Mascotas, citas próximas e historial clínico, organizados en un solo panel.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
