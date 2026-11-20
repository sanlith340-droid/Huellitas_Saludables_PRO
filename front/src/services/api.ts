/* Este archivo será el único encargado de comunicarse con Express. */

import axios from "axios";
import { loadingStore } from "./loadingStore";

declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * La petición gestiona por su cuenta un 401 (p. ej. POST /auth/logout, que es
     * quien limpia la sesión): el interceptor no debe limpiar ni redirigir.
     */
    omitirManejo401?: boolean;
  }
}

// Permite sobreescribir la URL del backend con una variable de entorno
// (VITE_API_URL) en producción, sin tocar el código.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  // Si el backend no responde, la petición no se queda colgada para siempre:
  // a los 20 s se corta y la pantalla muestra un error con botón de reintento.
  timeout: 20000,
});

// El backend autentica con JWT (Authorization: Bearer <token>), no con
// los headers x-user-id / x-user-role que se usaban antes. El token se
// guarda en localStorage al iniciar sesión (ver Login.jsx).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Cuenta la petición para la barra global de carga (el perrito que corre).
  (config as { __contada?: boolean }).__contada = true;
  loadingStore.iniciar();

  return config;
});

// Si el token expiró, fue revocado (cierre de sesión) o es inválido, el backend
// responde 401. En ese caso limpiamos la sesión local y mandamos al usuario de
// vuelta al login en vez de dejar la pantalla en un estado inconsistente.
// Solo se redirige una vez aunque varias peticiones en paralelo reciban 401.
let redirigiendoPorSesionInvalida = false;

api.interceptors.response.use(
  (response) => {
    if ((response.config as { __contada?: boolean })?.__contada) {
      (response.config as { __contada?: boolean }).__contada = false;
      loadingStore.terminar();
    }
    return response;
  },
  (error) => {
    const config = error?.config as { __contada?: boolean; omitirManejo401?: boolean } | undefined;
    if (config?.__contada) {
      config.__contada = false;
      loadingStore.terminar();
    }

    if (error.response?.status === 401 && !config?.omitirManejo401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      if (!redirigiendoPorSesionInvalida && window.location.pathname !== "/login") {
        redirigiendoPorSesionInvalida = true;
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
