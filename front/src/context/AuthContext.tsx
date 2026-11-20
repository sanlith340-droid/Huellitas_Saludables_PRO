import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export interface Usuario {
  id_usuario?: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  usuario: Usuario | null;
  login: (datosUsuario: Usuario) => void;
  /**
   * Cierra la sesión de forma centralizada (Navbar y Perfil usan esta misma función):
   * 1) pide al backend revocar el JWT actual (POST /auth/logout),
   * 2) limpia siempre la sesión local, aunque el backend falle o el token ya haya expirado,
   * 3) redirige al login con un aviso informativo.
   */
  logout: () => Promise<void>;
  /** true mientras el cierre de sesión está en curso (para deshabilitar los botones). */
  cerrandoSesion: boolean;
  /** Aviso informativo que la pantalla de login muestra tras cerrar sesión. */
  avisoSesion: string | null;
  limpiarAvisoSesion: () => void;
  autenticado: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AVISO_SESION_CERRADA = "Sesión cerrada correctamente.";
const AVISO_SIN_CONFIRMAR =
  "Cerraste sesión en este dispositivo, pero no pudimos confirmarlo con el servidor. Si usas un equipo compartido, vuelve a intentarlo cuando tengas conexión.";
// Si el backend no responde no se debe dejar al usuario esperando para salir.
const TIMEOUT_LOGOUT_MS = 5000;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? (JSON.parse(usuarioGuardado) as Usuario) : null;
  });
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [avisoSesion, setAvisoSesion] = useState<string | null>(null);
  // Evita lanzar varias solicitudes de logout por pulsaciones repetidas.
  const logoutEnCurso = useRef(false);

  const login = (datosUsuario: Usuario): void => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
  };

  const logout = useCallback(async (): Promise<void> => {
    if (logoutEnCurso.current) return;
    logoutEnCurso.current = true;
    setCerrandoSesion(true);

    let aviso = AVISO_SESION_CERRADA;
    try {
      if (localStorage.getItem("token")) {
        // omitirManejo401: el interceptor de api.ts no debe limpiar ni redirigir por su cuenta;
        // la limpieza y la navegación las hace este bloque, una sola vez.
        await api.post("/auth/logout", null, {
          omitirManejo401: true,
          timeout: TIMEOUT_LOGOUT_MS,
        });
      }
    } catch (error) {
      const estado = (error as { response?: { status?: number } })?.response?.status;
      // 401 = el token ya había expirado o estaba revocado: la sesión de servidor ya no existe.
      if (estado !== 401) aviso = AVISO_SIN_CONFIRMAR;
    } finally {
      // La limpieza local ocurre siempre: el usuario debe poder salir aunque el backend falle.
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setUsuario(null);
      setAvisoSesion(aviso);
      setCerrandoSesion(false);
      logoutEnCurso.current = false;
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const limpiarAvisoSesion = useCallback(() => setAvisoSesion(null), []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        cerrandoSesion,
        avisoSesion,
        limpiarAvisoSesion,
        autenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
