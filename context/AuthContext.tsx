"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User,
  getIdToken,
  UserCredential,
} from "firebase/auth";
import {
  login,
  register,
  loginWithGoogle as googleSignIn,
  logout,
} from "@/lib/authService";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// 📌 Agregamos un contexto con valor inicial `null`
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 🔥 Mejora para evitar pantallas en blanco

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = await getIdToken(currentUser);
        Cookies.set("token", token, { expires: 1 });
      } else {
        setUser(null);
        Cookies.remove("token");
      }
      setLoading(false); // 🚀 Evita cargar indefinidamente
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await googleSignIn();
      if (!result.user) throw new Error("No se pudo obtener el usuario");

      setUser(result.user);
      const token = await getIdToken(result.user);
      Cookies.set("token", token, { expires: 1 });
    } catch (error) {
      console.error("Error en login con Google:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 📌 Hook para consumir el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
