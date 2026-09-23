import { createContext, useContext, useState, type ReactNode } from "react";

export interface Usuario {
  id_usuario?: number;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  usuario: Usuario | null;
  login: (datosUsuario: Usuario) => void;
  logout: () => void;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? (JSON.parse(usuarioGuardado) as Usuario) : null;
  });

  const login = (datosUsuario: Usuario): void => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
  };

  const logout = (): void => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, autenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
};
