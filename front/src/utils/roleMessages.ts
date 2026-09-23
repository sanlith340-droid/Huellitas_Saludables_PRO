export const MENSAJES_ACCESO: Record<string, string> = {
  usuario:
    "Tu cuenta de usuario no tiene permisos para ver esta sección. Solo el personal autorizado puede acceder.",
  especialista:
    "Tu cuenta de especialista no tiene permisos para ver esta sección. Si necesitas gestionar horarios o citas administrativas, solicita apoyo a recepción.",
  recepcionista:
    "Tu cuenta de recepcionista no tiene permisos para ver esta sección. Esta función está reservada para especialistas o administradores.",
  admin:
    "Tu cuenta de administrador no tiene permisos para ver esta sección con la configuración actual. Verifica la operación solicitada.",
};

export function mensajeAccesoPorRol(rol?: string): string {
  return (
    MENSAJES_ACCESO[rol?.toLowerCase() ?? ""] ??
    "Tu cuenta no tiene permisos para ver esta sección. Verifica tu tipo de usuario o solicita apoyo al administrador."
  );
}
