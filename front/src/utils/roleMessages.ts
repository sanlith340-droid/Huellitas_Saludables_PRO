export const MENSAJES_ACCESO: Record<string, string> = {
  usuario:
    "Tu cuenta de usuario no tiene permisos para ver esta sección. Solo el personal autorizado puede acceder.",
  especialista:
    "Tu cuenta de especialista no tiene permisos para ver esta sección. Usa el menú para volver a tus citas y notificaciones.",
  recepcionista:
    "Tu cuenta de recepción no tiene permisos para ver esta sección. Usa el menú para abrir la agenda y las citas de la clínica.",
  admin:
    "Tu cuenta de administrador no tiene permisos para ver esta sección. Vuelve a tu panel para acceder a las opciones habilitadas.",
};

const RUTAS_INICIO_POR_ROL: Record<string, string> = {
  usuario: "/dashboard",
  especialista: "/citas/especialista",
  recepcionista: "/disponibilidad",
  admin: "/admin",
};

export function rutaInicioPorRol(rol?: string): string {
  return RUTAS_INICIO_POR_ROL[rol?.toLowerCase() ?? ""] ?? "/";
}

export function mensajeAccesoPorRol(rol?: string): string {
  return (
    MENSAJES_ACCESO[rol?.toLowerCase() ?? ""] ??
    "Tu cuenta no tiene permisos para ver esta sección. Verifica tu tipo de usuario o solicita apoyo al administrador."
  );
}
