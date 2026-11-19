/**
 * utils/erroresApi.ts
 * Traduce los errores de la API a mensajes que una persona puede entender
 * (y que además le dicen qué hacer), sin dejar nunca un texto vacío.
 */

type ErrorApi = {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: { message?: string; details?: { fields?: unknown } | null };
  };
};

export function esErrorDeRed(error: unknown): boolean {
  const err = error as ErrorApi;
  if (!err) return false;
  if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") return true;
  if (/network error|failed to fetch|timeout/i.test(String(err.message || ""))) return true;
  return !err.response;
}

export function esErrorDeTiempo(error: unknown): boolean {
  const err = error as ErrorApi;
  return (
    err?.code === "ECONNABORTED" ||
    err?.code === "ETIMEDOUT" ||
    /timeout/i.test(String(err?.message || ""))
  );
}

export function esErrorDeServidor(error: unknown): boolean {
  const estado = (error as ErrorApi)?.response?.status;
  return !estado || estado >= 500;
}

export function estadoHttp(error: unknown): number | undefined {
  return (error as ErrorApi)?.response?.status;
}

/** Primer mensaje "de negocio" que manda el backend, si existe. */
function mensajeDelBackend(error: unknown): string {
  const datos = (error as ErrorApi)?.response?.data;
  const campos = datos?.details?.fields;
  if (Array.isArray(campos)) {
    const primero = campos.find((campo) => typeof campo === "string" && campo.trim());
    if (typeof primero === "string") return primero.trim();
  }
  if (typeof datos?.message === "string" && datos.message.trim()) return datos.message.trim();
  return "";
}

/**
 * Mensaje principal para mostrar en un estado de error.
 * `respaldo` es lo que se muestra si la API no explica nada mejor.
 */
export function mensajeDeError(error: unknown, respaldo: string): string {
  if (esErrorDeTiempo(error)) {
    return "La clínica está tardando más de lo normal en responder. Revisa tu conexión e inténtalo otra vez.";
  }
  if (esErrorDeRed(error)) {
    return "No pudimos conectar con la clínica. Revisa tu conexión o confirma que el servidor esté encendido.";
  }

  const estado = estadoHttp(error);
  const propio = mensajeDelBackend(error);

  if (estado === 401) return propio || "Tu sesión expiró. Vuelve a iniciar sesión para continuar.";
  if (estado === 403) return propio || "Tu cuenta no tiene permiso para ver esta información.";
  if (estado === 404) return propio || "No encontramos lo que buscabas en la clínica.";
  if (estado === 409) return propio || "Alguien se adelantó: ese horario acaba de ocuparse.";
  if (estado && estado >= 500) {
    return propio || "El servidor de la clínica se quedó dormido. Inténtalo de nuevo en unos segundos.";
  }
  return propio || respaldo;
}

/** Título corto, según el tipo de fallo, para acompañar la ilustración. */
export function tituloDeError(error: unknown): string {
  if (esErrorDeTiempo(error)) return "La clínica está tardando demasiado";
  if (esErrorDeRed(error)) return "No hay conexión con la clínica";
  const estado = estadoHttp(error);
  if (estado === 403) return "Esta sección tiene acceso protegido";
  if (estado === 404) return "No encontramos esa información";
  if (estado === 409) return "Ese horario ya no está disponible";
  if (estado === 401) return "Tu sesión necesita renovarse";
  return "Tuvimos un inconveniente";
}

/** Variante de ErrorState que mejor representa el fallo. */
export function varianteDeError(error: unknown): "server" | "network" | "timeout" | "denied" | "appointment" | "search" {
  if (esErrorDeTiempo(error)) return "timeout";
  if (esErrorDeRed(error)) return "network";
  const estado = estadoHttp(error);
  if (estado === 403) return "denied";
  if (estado === 404) return "search";
  if (estado === 409) return "appointment";
  return "server";
}
