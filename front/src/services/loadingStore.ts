/**
 * services/loadingStore.ts
 * Lleva la cuenta de cuántas peticiones a la API están en curso.
 *
 * Sirve para dos cosas:
 *  1. Mostrar la barra global de carga (con el perrito corriendo) en cualquier
 *     pantalla, incluso en las que todavía no tienen su propio estado de carga.
 *  2. Evitar que una pantalla quede en blanco: si algo está viajando por la red,
 *     siempre hay una señal visible.
 */
import { useSyncExternalStore } from "react";

type Oyente = () => void;

let pendientes = 0;
const oyentes = new Set<Oyente>();

function notificar() {
  oyentes.forEach((oyente) => oyente());
}

export const loadingStore = {
  iniciar() {
    pendientes += 1;
    notificar();
  },
  terminar() {
    pendientes = Math.max(0, pendientes - 1);
    notificar();
  },
  contar() {
    return pendientes;
  },
  suscribir(oyente: Oyente) {
    oyentes.add(oyente);
    return () => {
      oyentes.delete(oyente);
    };
  },
};

/** Número de peticiones activas, suscrito a React. */
export function usePeticionesActivas(): number {
  return useSyncExternalStore(
    loadingStore.suscribir,
    loadingStore.contar,
    () => 0
  );
}
