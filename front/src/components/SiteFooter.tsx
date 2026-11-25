import { Link } from "react-router-dom";
import {
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPaw,
  FaPhone,
  FaWhatsapp,
} from "react-icons/fa";
import huLogo from "../assets/hu.png";
import { legalDocuments, siteInfo } from "../config/siteInfo";

function SiteFooter() {
  const phoneHref = siteInfo.phone !== "Pendiente de configurar"
    ? `tel:${siteInfo.phone.replace(/[^+\d]/g, "")}`
    : undefined;
  const emailHref = siteInfo.email !== "Pendiente de configurar"
    ? `mailto:${siteInfo.email}`
    : undefined;

  const socialLinks = [
    { label: "Facebook", href: siteInfo.social.facebook, icon: FaFacebookF },
    { label: "Instagram", href: siteInfo.social.instagram, icon: FaInstagram },
    { label: "WhatsApp", href: siteInfo.social.whatsapp, icon: FaWhatsapp },
  ];

  return (
    <footer className="site-footer" id="contacto">
      <div className="container site-footer__content">
        <div className="site-footer__brand-block">
          <Link to="/" className="site-footer__brand" aria-label="Huellitas Saludables, ir al inicio">
            <span className="site-footer__logo"><img src={huLogo} alt="" /></span>
            <span>{siteInfo.name}</span>
          </Link>
          <p>Una forma más sencilla de organizar el cuidado y la atención veterinaria de tus mascotas.</p>
          <div className="site-footer__socials" aria-label="Redes sociales">
            {socialLinks.map(({ label, href, icon: Icon }) => href ? (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Visitar ${label} de Huellitas Saludables`}>
                <Icon aria-hidden="true" />
              </a>
            ) : (
              <span key={label} className="site-footer__social-pending" title={`Configura el enlace institucional de ${label}`} aria-label={`${label}: enlace institucional pendiente de configurar`}>
                <Icon aria-hidden="true" />
              </span>
            ))}
          </div>
          <small className="site-footer__config-note">Los datos de contacto y perfiles institucionales deben configurarse antes de publicar.</small>
        </div>

        <section className="site-footer__column" aria-labelledby="footer-contacto">
          <h2 id="footer-contacto">Contacto</h2>
          <ul className="site-footer__list">
            <li><FaPhone aria-hidden="true" />{phoneHref ? <a href={phoneHref}>{siteInfo.phone}</a> : <span>{siteInfo.phone}</span>}</li>
            <li><FaEnvelope aria-hidden="true" />{emailHref ? <a href={emailHref}>{siteInfo.email}</a> : <span>{siteInfo.email}</span>}</li>
            <li><FaMapMarkerAlt aria-hidden="true" /><span>{siteInfo.address}</span></li>
            <li><FaClock aria-hidden="true" /><span>{siteInfo.hours}</span></li>
          </ul>
        </section>

        <nav className="site-footer__column" aria-label="Enlaces institucionales">
          <h2>Explora</h2>
          <ul className="site-footer__nav-list">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/#servicios">Servicios</Link></li>
            <li><Link to="/#acerca-de">Acerca de nosotros</Link></li>
            <li><Link to="/#contacto">Contacto</Link></li>
          </ul>
        </nav>

        <nav className="site-footer__column" aria-label="Documentos legales">
          <h2>Información legal</h2>
          <ul className="site-footer__nav-list">
            {legalDocuments.map(({ slug, label }) => (
              <li key={slug}><Link to={`/legal/${slug}`}>{label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <span><FaPaw aria-hidden="true" /> © {new Date().getFullYear()} {siteInfo.name}. Todos los derechos reservados.</span>
          <span>Hecho para cuidar mejor de cada huellita.</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
