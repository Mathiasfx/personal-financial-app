/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore as db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import * as Icons from "@mui/icons-material";


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

  //#region Categorias
 export const getCategories = async (userId: string) => {
    const categoriasRef = collection(db, `usuarios/${userId}/categorias`);
    const snapshot = await getDocs(categoriasRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const addCategory = async (userId: string, category: { nombre: string; icono: string }) => {
    const categoriasRef = collection(db, `usuarios/${userId}/categorias`);
    const newCategoryRef = doc(categoriasRef);
    await setDoc(newCategoryRef, category);
    return { id: newCategoryRef.id, ...category };
  };
  
  export const updateCategory = async (userId: string, categoryId: string, updatedData: { nombre?: string; icono?: string }) => {
    const categoryRef = doc(db, `usuarios/${userId}/categorias/${categoryId}`);
    await updateDoc(categoryRef, updatedData);
  };
  
  export const deleteCategory = async (userId: string, categoryId: string) => {
    const categoryRef = doc(db, `usuarios/${userId}/categorias/${categoryId}`);
    await deleteDoc(categoryRef);
  };

  export const iconOptions = Object.keys(Icons);

  
  //#endregion
  