import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut} from "firebase/auth";



// #region Autenticación con email y contraseña
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
// #endregion

//#region Registrar usuario con email y contraseña
export const register = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};
//#endregion

//#region Iniciar sesión con Google
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};
//#endregion

// #region Cerrar sesión
export const logout = async () => {
  return await signOut(auth);
};
// #endregion