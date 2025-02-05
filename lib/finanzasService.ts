/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore as db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export const getFinancialData = async (userId: string, yearMonth: string) => { 
    try {
        const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);
        const docSnap = await getDoc(docRef);    
        return docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        console.error("Error obteniendo finanzas:", error);
        return null;
      }
};

export const saveFinancialData = async (userId: string, yearMonth: string, data: any) => {
  try {
    const docRef = doc(db, `usuarios/${userId}/finanzas`, yearMonth);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving financial data: ", error);
    return false;
  }
};

export const updateExpenseStatus = async (userId: string, yearMonth: string, expenseKey: string, status: boolean) => {
  try {
    const docRef = doc(db, `usuarios/${userId}/finanzas`, yearMonth);
    await updateDoc(docRef, {
      [`gastosFijos.${expenseKey}.pagado`]: status,
    });
    return true;
  } catch (error) {
    console.error("Error updating expense status: ", error);
    return false;
  }
};



  export const getLatestFinancialPeriod = async (userId: string) => {
    const collectionRef = collection(db, `usuarios/${userId}/finanzas`);
    const snapshot = await getDocs(collectionRef);
    const periods = snapshot.docs.map(doc => doc.id);
    return periods.sort().reverse()[0] || "2025-2";
  };
  