/* Este archivo será el único encargado de comunicarse con Express. */

import axios from "axios";

// Permite sobreescribir la URL del backend con una variable de entorno
// (VITE_API_URL) en producción, sin tocar el código. En producción usa /api
// por defecto; en desarrollo local mantiene el backend de Vite.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL =
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:3000/api" : "/api");

const api = axios.create({ baseURL });

// El backend autentica con JWT (Authorization: Bearer <token>), no con
// los headers x-user-id / x-user-role que se usaban antes. El token se
// guarda en localStorage al iniciar sesión (ver Login.jsx).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Si el token expiró o es inválido, el backend responde 401. En ese caso
// limpiamos la sesión local y mandamos al usuario de vuelta al login en
// vez de dejar la pantalla en un estado inconsistente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;