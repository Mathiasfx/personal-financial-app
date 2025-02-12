import {initializeApp, getApps} from 'firebase/app';
import {getAnalytics} from 'firebase/analytics';
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId:process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);

export const loginWithEmailPassword = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  export const registerWithEmailPassword = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  export const logout = async () => {
    return signOut(auth);
  };
  

export default app;
