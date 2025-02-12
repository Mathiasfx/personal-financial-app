/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore as db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import * as Icons from "@mui/icons-material";
import { Gasto } from "@/models/gasto.model";
import { Categorias } from "@/models/categorias.model";


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

export const saveFinancialData = async (userId: string, periodo: string, nuevoGasto:Gasto) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const updatedGastosVariables = data.gastosVariables ? [...data.gastosVariables, nuevoGasto] : [nuevoGasto];

      await setDoc(finanzasRef, { ...data, gastosVariables: updatedGastosVariables }, { merge: true });
    } else {
      // Si no existe el documento, lo creamos con el primer gasto
      await setDoc(finanzasRef, { gastosVariables: [nuevoGasto] });
    }

    console.log("Gasto guardado exitosamente en gastosVariables");
  } catch (error) {
    console.error("Error guardando el gasto:", error);
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
  export const getCategories = async (userId: string): Promise<Categorias[]> => {
    try {
      const categoriasRef = collection(db, `usuarios/${userId}/categorias`);
      const snapshot = await getDocs(categoriasRef);
  
      if (snapshot.empty) {
        console.warn("⚠ No hay categorías en Firestore para este usuario.");
        return [];
      }
  
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          icono: data.icono || "default-icon", // 🔥 Asegurar que `icono` existe
          nombre: data.nombre || "Sin nombre", // 🔥 Asegurar que `nombre` existe
        };
      });
    } catch (error) {
      console.error("🔥 Error obteniendo categorías:", error);
      return [];
    }
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
  