/**
 * utils/inputs.ts
 * Restricciones reutilizables para los campos de los formularios.
 *
 * - Teléfono: solo dígitos (se descartan letras, signos y espacios).
 * - Correo y contraseña: prohibido el uso de espacios.
 *
 * Las restricciones se aplican en tres capas:
 * 1. onKeyDown: la tecla no válida no llega a escribirse.
 * 2. onChange: se limpia cualquier carácter no válido que entre por pegado,
 *    autocompletado o dictado.
 * 3. Validación al enviar: se muestra un error si algo se coló igualmente.
 */

type EntradaTeclado = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  preventDefault: () => void;
};

/** Deja únicamente los dígitos 0-9 de un texto. */
export function soloDigitos(valor: string): string {
  return String(valor ?? "").replace(/\D/g, "");
}

/** Quita todos los espacios (incluidos tabuladores y espacios duros) de un texto. */
export function sinEspacios(valor: string): string {
  return String(valor ?? "").replace(/\s/g, "");
}

/** true si el texto contiene algún tipo de espacio. */
export function tieneEspacios(valor: string): boolean {
  return /\s/u.test(String(valor ?? ""));
}

/** Bloquea la tecla de espacio en un input (correo y contraseña). */
export function bloquearTeclaEspacio(evento: EntradaTeclado): void {
  if (evento.key === " " || evento.key === "\u00A0") {
    evento.preventDefault();
  }
}

/** Bloquea cualquier tecla que no sea un dígito en un input (teléfono). */
export function bloquearTeclaNoDigito(evento: EntradaTeclado): void {
  // Los atajos del navegador o del sistema (copiar, pegar, seleccionar) siguen funcionando.
  if (evento.ctrlKey || evento.metaKey || evento.altKey) return;
  if (evento.key.length === 1 && !/\d/.test(evento.key)) {
    evento.preventDefault();
  }
}
