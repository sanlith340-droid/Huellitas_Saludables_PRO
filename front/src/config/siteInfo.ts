const configured = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export const siteInfo = {
  name: "Huellitas Saludables",
  phone: import.meta.env.VITE_CONTACT_PHONE?.trim() || "Pendiente de configurar",
  email: import.meta.env.VITE_CONTACT_EMAIL?.trim() || "Pendiente de configurar",
  address: configured(import.meta.env.VITE_CONTACT_ADDRESS, "Dirección pendiente de configurar"),
  hours: configured(import.meta.env.VITE_CONTACT_HOURS, "Horario de atención pendiente de configurar"),
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK?.trim() || "",
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM?.trim() || "",
    whatsapp: import.meta.env.VITE_SOCIAL_WHATSAPP?.trim() || "",
  },
};

export const legalDocuments = [
  { slug: "tratamiento-datos", label: "Política de tratamiento de datos personales" },
  { slug: "privacidad", label: "Política de privacidad" },
  { slug: "terminos", label: "Términos y condiciones" },
] as const;

export const CURRENT_POLICY_VERSION = "2026-11-24-v1";
