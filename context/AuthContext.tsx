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
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

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
      value={{ user, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
