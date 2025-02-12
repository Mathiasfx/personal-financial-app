"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  auth,
  loginWithEmailPassword,
  registerWithEmailPassword,
  logout as firebaseLogout,
} from "./firebase"; // Renombramos logout
import { onAuthStateChanged, User } from "firebase/auth";

// Tipo para el contexto de autenticación
type AuthContextType = {
  user: User | null; // Cambiamos "any" por el tipo User que provee Firebase
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>; // Aquí sigue siendo logout, pero se refiere al logout del contexto
};

// Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Tipo para las props del AuthProvider
type AuthProviderProps = {
  children: ReactNode;
};

// Componente proveedor de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // Métodos para manejar la autenticación
  const login = async (email: string, password: string) => {
    try {
      await loginWithEmailPassword(email, password);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await registerWithEmailPassword(email, password);
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout(); // Usamos la función de logout de Firebase renombrada
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
