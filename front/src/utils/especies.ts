export type EspecieMascota = "perro" | "gato";

export const ETIQUETAS_ESPECIE: Record<EspecieMascota, string> = {
  perro: "Caninos",
  gato: "Felinos",
};

export const RAZAS_RESPALDO: Record<EspecieMascota, string[]> = {
  perro: [
    "Beagle",
    "Bulldog Francés",
    "Chihuahua",
    "Golden Retriever",
    "Husky Siberiano",
    "Labrador Retriever",
    "Pastor Alemán",
    "Poodle",
  ],
  gato: [
    "Angora",
    "Bengalí",
    "British Shorthair",
    "Maine Coon",
    "Persa",
    "Siamés",
  ],
};

function claveDeRaza(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function normalizarRazas(razas: unknown): string[] {
  if (!Array.isArray(razas)) return [];
  const unicas = new Map<string, string>();
  for (const item of razas) {
    const nombre = typeof item === "string" ? item : "";
    const limpio = nombre.trim();
    if (!limpio || limpio.length > 200) continue;
    const clave = claveDeRaza(limpio);
    if (!unicas.has(clave)) unicas.set(clave, limpio);
  }
  return [...unicas.values()].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

export function etiquetaEspecie(especie: string): string {
  return especie === "perro" || especie === "gato"
    ? ETIQUETAS_ESPECIE[especie]
    : especie;
}
