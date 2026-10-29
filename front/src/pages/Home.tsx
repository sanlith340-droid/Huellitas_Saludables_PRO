import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaPaw,
  FaShieldAlt,
  FaStethoscope,
} from "react-icons/fa";
import perritoImg from "../assets/perrito.png";

const slides = [
  {
    eyebrow: "Su bienestar, nuestra prioridad",
    title: "Cuidar de tu mascota nunca fue tan sencillo",
    description:
      "Encuentra atención veterinaria de confianza y agenda una cita en pocos minutos, sin llamadas ni filas.",
    visual: "puppy",
    visualLabel: "Conoce una forma más fácil de cuidar de tu mejor amigo",
  },
  {
    eyebrow: "Agenda a tu ritmo",
    title: "El momento perfecto para su próxima visita",
    description:
      "Revisa horarios disponibles y reserva con especialistas verificados cuando mejor te convenga.",
    visual: "appointment",
    visualLabel: "Citas claras, horarios a tu medida",
  },
  {
    eyebrow: "Todo en un mismo lugar",
    title: "Su historia de salud, siempre contigo",
    description:
      "Consulta sus citas, vacunas y tratamientos para que cada visita tenga el contexto que merece.",
    visual: "records",
    visualLabel: "Un seguimiento más completo para tu mascota",
  },
];

function Home() {
  const { autenticado } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const showSlide = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };
  const slide = slides[activeSlide];

  return (
    <div className="container home-page">
      <section
        className="home-carousel"
        aria-label="Servicios de Huellitas Saludables"
        aria-roledescription="carrusel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
      >
        <div className="home-carousel__content" key={slide.title}>
          <p className="home-carousel__eyebrow">
            <span className="home-carousel__eyebrow-mark"><FaPaw /></span>
            {slide.eyebrow}
          </p>
          <h1>{slide.title}</h1>
          <p className="home-carousel__description">{slide.description}</p>
          <div className="home-carousel__actions">
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
          <div className="home-carousel__trust">
            <span><FaCheckCircle /> Atención organizada</span>
            <span><FaShieldAlt /> Especialistas verificados</span>
          </div>
        </div>

        <div className={`home-carousel__visual home-carousel__visual--${slide.visual}`} aria-label={slide.visualLabel}>
          {slide.visual === "puppy" && (
            <>
              <div className="home-carousel__sun" />
              <img className="home-carousel__puppy" src={perritoImg} alt="Cachorro listo para su próxima revisión veterinaria" />
              <div className="home-carousel__floating-note">
                <span className="home-carousel__note-icon"><FaPaw /></span>
                <span><strong>Pequeños cuidados,</strong><br />grandes momentos</span>
              </div>
              <span className="home-carousel__visual-caption">Un cuidado que se siente como en casa</span>
            </>
          )}

          {slide.visual === "appointment" && (
            <div className="appointment-preview">
              <div className="appointment-preview__topline"><span>PRÓXIMA CITA</span><FaCalendarCheck /></div>
              <div className="appointment-preview__date"><strong>12</strong><span>JUN<br />JUEVES</span></div>
              <div className="appointment-preview__details">
                <span className="appointment-preview__avatar"><FaStethoscope /></span>
                <span><strong>Consulta general</strong><small>Revisión de bienestar</small></span>
              </div>
              <div className="appointment-preview__time"><span>Horario reservado</span><strong>10:30 a. m.</strong></div>
              <span className="appointment-preview__badge"><FaCheckCircle /> Confirmada</span>
            </div>
          )}

          {slide.visual === "records" && (
            <div className="records-preview">
              <div className="records-preview__heading">
                <span className="records-preview__paw"><FaPaw /></span>
                <span><small>HISTORIAL DE</small><strong>Tu compañero</strong></span>
                <FaClipboardList className="records-preview__list-icon" />
              </div>
              <div className="records-preview__status"><FaShieldAlt /><span><strong>Todo al día</strong><small>Seguimiento de salud</small></span><FaCheckCircle /></div>
              <div className="records-preview__entry"><span className="records-preview__entry-icon"><FaStethoscope /></span><span><strong>Chequeo anual</strong><small>Consulta veterinaria</small></span><span className="records-preview__entry-date">MAY 18</span></div>
              <div className="records-preview__entry"><span className="records-preview__entry-icon records-preview__entry-icon--gold"><FaPaw /></span><span><strong>Plan preventivo</strong><small>Cuidado continuo</small></span><span className="records-preview__entry-date">ABR 02</span></div>
            </div>
          )}

          <div className="home-carousel__controls">
            <button type="button" className="home-carousel__arrow" aria-label="Ver diapositiva anterior" onClick={() => showSlide(activeSlide - 1)}>
              <FaChevronLeft />
            </button>
            <div className="home-carousel__dots" role="group" aria-label="Elegir diapositiva">
              {slides.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  className={`home-carousel__dot${index === activeSlide ? " is-active" : ""}`}
                  aria-label={`Diapositiva ${index + 1}: ${item.eyebrow}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                  onClick={() => showSlide(index)}
                />
              ))}
            </div>
            <button type="button" className="home-carousel__arrow" aria-label="Ver diapositiva siguiente" onClick={() => showSlide(activeSlide + 1)}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>

      <section className="features" aria-label="Beneficios de Huellitas Saludables">
        <div className="feature-card">
          <div className="feature-card__icon"><FaCalendarCheck /></div>
          <h3>Reserva flexible</h3>
          <p>Consulta la disponibilidad real de cada especialista y agenda sin llamadas.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon"><FaStethoscope /></div>
          <h3>Especialistas verificados</h3>
          <p>Cada profesional tiene su especialización registrada y visible antes de agendar.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon"><FaClipboardList /></div>
          <h3>Todo en un panel</h3>
          <p>Mascotas, citas próximas e historial clínico, organizados en un solo panel.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
