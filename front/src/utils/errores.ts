/**
 * utils/errores.ts
 * Convierte la respuesta de error de la API en una lista de mensajes
 * individuales, para mostrarlos uno por uno en forma de columna.
 *
 * La API responde con:
 *   { success: false, message: "Error A. Error B.", code, details: { fields: ["Error A.", "Error B."] } }
 *
 * Si "details.fields" existe se usa tal cual (un error por campo);
 * si no, se cae al "message" general y, por último, a un texto de respaldo.
 */

type RespuestaError = {
  response?: {
    data?: {
      message?: string;
      details?: { fields?: unknown } | null;
    };
  };
};

export function erroresDeRespuesta(error: RespuestaError | unknown, respaldo: string): string[] {
  const datos = (error as RespuestaError)?.response?.data;
  const campos = datos?.details?.fields;

  if (Array.isArray(campos)) {
    const mensajes = campos
      .filter((campo): campo is string => typeof campo === "string")
      .map((campo) => campo.trim())
      .filter(Boolean);
    if (mensajes.length > 0) return mensajes;
  }

  if (typeof datos?.message === "string" && datos.message.trim()) {
    return [datos.message.trim()];
  }

  return [respaldo];
}
