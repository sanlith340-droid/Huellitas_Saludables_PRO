import { Link, Navigate, useParams } from "react-router-dom";
import { CURRENT_POLICY_VERSION, legalDocuments } from "../config/siteInfo";
import "../styles/site-layout.css";

type Seccion = { heading: string; paragraphs: string[] };
type Documento = { title: string; summary: string; sections: Seccion[] };

const documentos: Record<string, Documento> = {
  "tratamiento-datos": {
    title: "Política de tratamiento de datos personales",
    summary: "Información sobre los datos que se solicitan al crear una cuenta y cómo se usan dentro de Huellitas Saludables.",
    sections: [
      { heading: "Responsable y alcance", paragraphs: ["Huellitas Saludables utiliza los datos que las personas proporcionan al registrarse y al usar las funciones de mascotas, citas y atención veterinaria. Antes de publicar este documento, la institución debe completar y verificar la razón social, identificación del responsable, domicilio y canal oficial para consultas y solicitudes de titulares."] },
      { heading: "Datos y finalidades", paragraphs: ["El sistema puede tratar nombre, apellidos, teléfono, correo electrónico y dirección; también datos asociados a las mascotas, sus citas y la información clínica que corresponda. Se utilizan para crear y administrar cuentas, identificar a los responsables de las mascotas, organizar citas, prestar seguimiento veterinario, atender solicitudes y proteger la operación del servicio.", "No se deben solicitar ni registrar datos que no sean necesarios para estas finalidades. El acceso a la información debe limitarse a personal autorizado según sus funciones."] },
      { heading: "Derechos y solicitudes", paragraphs: ["La persona titular puede solicitar consulta, actualización o corrección de sus datos y presentar las demás solicitudes previstas por la normativa aplicable. Para ejercer esos derechos, debe utilizarse el canal institucional oficial, que se encuentra pendiente de configurar en esta versión de demostración."] },
      { heading: "Conservación y seguridad", paragraphs: ["La información se conserva durante el tiempo necesario para las finalidades del servicio y para atender obligaciones aplicables. Huellitas Saludables debe mantener medidas de seguridad y acceso acordes con la sensibilidad de la información, especialmente la relacionada con atención y salud de mascotas.", "Esta descripción es informativa y no sustituye la aprobación de una política institucional completa ni la revisión jurídica correspondiente."] },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    summary: "Resumen de privacidad para quienes navegan y utilizan la aplicación.",
    sections: [
      { heading: "Información que usamos", paragraphs: ["Al crear una cuenta se solicitan datos de identificación y contacto. Al utilizar la aplicación se generan además registros necesarios para autenticar la sesión, administrar mascotas y citas, y mostrar funciones según el rol de cada cuenta."] },
      { heading: "Uso y acceso", paragraphs: ["La información se utiliza para operar las funciones solicitadas y no debe emplearse para finalidades incompatibles. El personal solo debe acceder a los datos necesarios para su trabajo; las reglas de acceso deben comprobarse en el servidor, no únicamente en la interfaz."] },
      { heading: "Seguridad y tecnologías", paragraphs: ["La aplicación utiliza mecanismos técnicos para autenticación, gestión de solicitudes y almacenamiento. La configuración final de cookies, registros técnicos, servicios externos, plazos de conservación y medidas de seguridad debe describirse de acuerdo con el despliegue real antes de abrir el servicio al público."] },
      { heading: "Contacto y vigencia", paragraphs: ["Los canales institucionales de contacto y la fecha de aprobación de esta política deben completarse antes de producción. Esta página corresponde a un borrador funcional de demostración y no constituye asesoría legal."] },
    ],
  },
  terminos: {
    title: "Términos y condiciones",
    summary: "Condiciones generales de uso de la aplicación Huellitas Saludables.",
    sections: [
      { heading: "Uso de la aplicación", paragraphs: ["Huellitas Saludables es una herramienta para gestionar cuentas, registrar mascotas, consultar disponibilidad y organizar citas y registros de atención. La persona usuaria debe proporcionar información correcta y mantener protegidas sus credenciales."] },
      { heading: "Citas y atención", paragraphs: ["Las solicitudes están sujetas a la disponibilidad publicada y a la confirmación que corresponda. La aplicación organiza información y comunicaciones administrativas; no debe considerarse un servicio de urgencias veterinarias ni sustituye la valoración de un profesional."] },
      { heading: "Responsabilidades de la cuenta", paragraphs: ["La persona usuaria es responsable de revisar los datos que registra, informar cambios relevantes y utilizar la cuenta de forma legítima. Debe reportar cualquier acceso no autorizado mediante los canales oficiales una vez que estos hayan sido configurados."] },
      { heading: "Disponibilidad y cambios", paragraphs: ["El servicio puede actualizarse o estar temporalmente fuera de línea por mantenimiento. Las reglas de cancelación, reprogramación, costos, jurisdicción, vigencia y terminación deben ser completadas por la institución antes de habilitar el uso real."] },
    ],
  },
};

function DocumentosLegales() {
  const { documento } = useParams();
  const contenido = documento ? documentos[documento] : undefined;
  if (!contenido) return <Navigate to="/pagina-no-encontrada" replace />;

  return (
    <div className="container legal-page">
      <nav className="legal-page__breadcrumbs" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link><span aria-hidden="true">/</span><span>Información legal</span>
      </nav>
      <header className="legal-page__header">
        <p className="legal-page__eyebrow">Huellitas Saludables · Documento informativo</p>
        <h1>{contenido.title}</h1>
        <p className="legal-page__summary">{contenido.summary}</p>
        <p className="legal-page__version">Versión vigente: {CURRENT_POLICY_VERSION}</p>
      </header>
      <aside className="legal-page__notice" role="note">
        <strong>Borrador para revisión institucional.</strong> Antes de aceptar usuarios reales, completar los datos del responsable y los canales de contacto, y obtener revisión/aprobación jurídica.
      </aside>
      <div className="legal-page__tabs" aria-label="Otros documentos legales">
        {legalDocuments.map(({ slug, label }) => (
          <Link key={slug} to={`/legal/${slug}`} aria-current={slug === documento ? "page" : undefined}>{label}</Link>
        ))}
      </div>
      <article className="legal-page__content">
        {contenido.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </article>
      <p className="legal-page__back"><Link to="/registro">Volver al registro</Link></p>
    </div>
  );
}

export default DocumentosLegales;
