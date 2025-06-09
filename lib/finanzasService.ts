/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore as db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore/lite";
import { Gasto, GastoFijo } from "@/models/gasto.model";
import { Categorias } from "@/models/categorias.model";
import { getPreviousPeriod } from "./utils";
import { Finanzas } from "@/models/finanzas.model";
import dayjs from "dayjs";

/**
 * Helper function para actualizar la fecha de vencimiento al nuevo mes
 * Mantiene el mismo día pero cambia el año-mes
 */
function updateDateToNewMonth(
  fechaVencimiento: Date | { seconds: number; nanoseconds: number } | any, 
  newYearMonth: string
): Date {
  try {
    let originalDate: dayjs.Dayjs;
    
    // Manejar diferentes tipos de fecha (Date, Timestamp de Firestore, etc.)
    if (fechaVencimiento instanceof Date) {
      originalDate = dayjs(fechaVencimiento);
    } else if (typeof fechaVencimiento === 'object' && fechaVencimiento !== null && 'seconds' in fechaVencimiento) {
      // Timestamp de Firestore
      originalDate = dayjs((fechaVencimiento as { seconds: number }).seconds * 1000);
    } else if (typeof fechaVencimiento === 'string') {
      originalDate = dayjs(fechaVencimiento);
    } else {
      // Fallback: intentar parsear como está
      originalDate = dayjs(fechaVencimiento);
    }

    // Extraer el día del mes original
    const dayOfMonth = originalDate.date();
    
    // Crear nueva fecha con el nuevo año-mes y el mismo día
    const newDate = dayjs(newYearMonth + '-01').date(dayOfMonth);
    
    return newDate.toDate();
  } catch (error) {
    console.error('Error actualizando fecha de vencimiento:', error);
    // En caso de error, devolver una fecha por defecto (primer día del nuevo mes)
    return dayjs(newYearMonth + '-01').toDate();
  }
}

//#region Periodo y Finanzas
/**
 * Lista todos los períodos que existen
 */
export async function listAllPeriods(userId: string) {
  const ref = collection(db, "usuarios", userId, "finanzas");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({
    id: d.id,
    data: d.data(),
  }));
}

/**
 * Crea un período
 */
export async function createPeriod(
  userId: string,
  yearMonth: string,
  data: any
) {

  const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);
  const docSnap = await getDoc(docRef);

  // Si ya existe no crear
  if (docSnap.exists()) {
    throw new Error(`Ya existe un período con ID ${yearMonth}`);
  }

  const prevMonth = dayjs(yearMonth).subtract(1, "month").format("YYYY-MM");

  const prevDocRef = doc(db, "usuarios", userId, "finanzas", prevMonth);
  const prevSnap = await getDoc(prevDocRef);

  const gastosFijos: Record<string, GastoFijo> = {};
  // Copiar Gastos Fijos
  if (prevSnap.exists()) {
    const prevData = prevSnap.data();
    if (prevData?.gastosFijos) {
  
      const gf = prevData.gastosFijos as Record<string, GastoFijo>;
    
      for (const key in gf) {
        const gastoOriginal = gf[key];
        gastosFijos[key] = {
          ...gastoOriginal,
          pagado: false,
          // Actualizar fechaVencimiento al nuevo mes si existe
          fechaVencimiento: gastoOriginal.fechaVencimiento 
            ? updateDateToNewMonth(gastoOriginal.fechaVencimiento, yearMonth)
            : gastoOriginal.fechaVencimiento
        };
      }
    }
  }

  // 4. Mezclar campos que te mandan por parámetro con los gastos fijos copiados
  const newData:Finanzas = {
    ingresos: data.ingresos || 0,
    ingresosExtras: data.ingresosExtras || 0,
    inversiones: data.inversiones || 0,
    fechaCobro: data.fechaCobro ?? null,
    gastosVariables: [], 
    gastosFijos
  };


  await setDoc(docRef, newData);
}

/**
 * Hace un update de un período existente.
 */
export async function updatePeriod(
  userId: string,
  yearMonth: string,
  data: any
) {
  const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`No existe el período ${yearMonth}`);
  }

  await updateDoc(docRef, data);
}

/**
 * Renombra un período: copia los datos al nuevo ID y borra el documento viejo.
 */
export async function renamePeriod(
  userId: string,
  oldPeriod: string,
  newPeriod: string
) {
  const oldDocRef = doc(db, "usuarios", userId, "finanzas", oldPeriod);
  const oldSnap = await getDoc(oldDocRef);

  if (!oldSnap.exists()) {
    throw new Error(`El período ${oldPeriod} no existe`);
  }

  // Creamos el doc nuevo
  const data = oldSnap.data();
  const newDocRef = doc(db, "usuarios", userId, "finanzas", newPeriod);
  await setDoc(newDocRef, data);

  // Borramos el viejo
  //await deleteDoc(oldDocRef);
}

/**
 * Borra un período existente.
 */
export async function deletePeriod(userId: string, yearMonth: string) {
  const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);
  await deleteDoc(docRef);
}



export async function createPeriodIfNotExists(
  userId: string,
  yearMonth: string
): Promise<boolean> {
  try {  
    const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);
    const docSnap = await getDoc(docRef);
    // si existe no crear
    if (docSnap.exists()) {
      return false;
    }

    // Si NO existe, creamos el nuevo con gastos fijos anteriores y datos.

    const previousPeriod = getPreviousPeriod(yearMonth);
    const prevDocRef = doc(db, "usuarios", userId, "finanzas", previousPeriod);
    const prevDocSnap = await getDoc(prevDocRef);

  
    const newData = {
      ingresos: 0,
      ingresosExtras: 0,
      inversiones: 0,
      fechaCobro: null,
      gastosFijos: {},     
      gastosVariables: [], 
    };

    if (prevDocSnap.exists()) {
      const prevData = prevDocSnap.data();

      newData.ingresos = prevData.ingresos || 0;


        // Copiamos gastos fijos y seteamos pagado = false, si tu lógica lo requiere.
      if (prevData.gastosFijos) {
        const clonados: any = {};
        Object.entries(prevData.gastosFijos).forEach(([key, gasto]: any) => {
          clonados[key] = {
            ...gasto,
            pagado: false,
            // Actualizar fechaVencimiento al nuevo mes si existe
            fechaVencimiento: gasto.fechaVencimiento 
              ? updateDateToNewMonth(gasto.fechaVencimiento, yearMonth)
              : gasto.fechaVencimiento
          };
        });
        newData.gastosFijos = clonados;
      }
    }

    // Escribimos el nuevo doc en Firestore
    await setDoc(docRef, newData);

    // Retornamos true indicando que SÍ fue creado
    return true;
  } catch (error) {
    console.error("Error creando período:", error);
    throw error; // o return false, según prefieras
  }
}

export async function getFinancialData(
  userId: string,
  yearMonth: string
): Promise<any> {
  try {
    const docRef = doc(db, "usuarios", userId, "finanzas", yearMonth);


    const docSnap = await getDoc(docRef);

    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error obteniendo finanzas:", error);
    return null;
  }
}
//#endregion


//#region Gastos Variables
export const saveExpence = async (userId: string, periodo: string, nuevoGasto:Gasto) => {
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

export const editExpense = async (userId: string, periodo: string, gastoId: number, updatedData: any) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);

    if (!snapshot.exists()) {
      console.error("No existen datos financieros para este período.");
      return false;
    }

    const data = snapshot.data();
    const updatedGastosVariables = data.gastosVariables.map((gasto: { id: number }) =>
      gasto.id === gastoId ? { ...gasto, ...updatedData } : gasto
    );

    await updateDoc(finanzasRef, {
      gastosVariables: updatedGastosVariables,
    });

    console.log("Gasto editado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al editar el gasto:", error);
    return false;
  }
};

export const deleteExpense = async (userId: string, periodo: string, gastoId: number) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);

    if (!snapshot.exists()) {
      console.error("No existen datos financieros para este período.");
      return false;
    }

    const data = snapshot.data();
    const updatedGastosVariables = data.gastosVariables.filter((gasto: { id: number }) => gasto.id !== gastoId);

    await updateDoc(finanzasRef, {
      gastosVariables: updatedGastosVariables,
    });

    console.log("Gasto eliminado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al eliminar el gasto:", error);
    return false;
  }
};



//#endregion

//#region Gastos Fijos
//agregar gasto fijo
export const addExpense = async (userId: string, periodo: string, nuevoGasto:GastoFijo) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);

    if (!snapshot.exists()) {
      console.error("No existen datos financieros para este período.");
      return false;
    }

    const data = snapshot.data();
    const updatedGastosFijos = {
      ...data.gastosFijos,
      [nuevoGasto.descripcion]: {
        ...nuevoGasto, // Esto incluye id, fecha, categoria, pagado, fechaVencimiento, etc.
        monto: parseFloat(nuevoGasto.monto.toString()),
      },
    };

    await updateDoc(finanzasRef, {
      gastosFijos: updatedGastosFijos,
    });
    console.log("Gasto fijo agregado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al agregar el gasto fijo:", error);
    return false;
  }
};

//editar gasto fijo
export const updateExpense = async (
  userId: string,
  periodo: string,
  updatedGasto: GastoFijo
) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);

    if (!snapshot.exists()) {
      console.error("No existen datos financieros para este período.");
      return false;
    }

    const data = snapshot.data();
    if (!data.gastosFijos || !data.gastosFijos[updatedGasto.descripcion]) {
      console.error("El gasto fijo no existe.");
      return false;
    }
 
    await updateDoc(finanzasRef, {
      [`gastosFijos.${updatedGasto.descripcion}`]: {
        ...updatedGasto, // esto clona id, fecha, fechaVencimiento, etc.
        monto: parseFloat(updatedGasto.monto.toString()), // sobreescribe monto
      },
    });

    console.log("Gasto fijo actualizado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al actualizar el gasto fijo:", error);
    return false;
  }
};


//actualizar estado de gasto fijo
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

//delete gasto fijo
export const deleteFixedExpense = async (userId: string, periodo: string, descripcion: string) => {
  try {
    const finanzasRef = doc(db, `usuarios/${userId}/finanzas/${periodo}`);
    const snapshot = await getDoc(finanzasRef);

    if (!snapshot.exists()) {
      console.error("No existen datos financieros para este período.");
      return false;
    }

    const data = snapshot.data();
    if (!data.gastosFijos || !data.gastosFijos[descripcion]) {
      console.error("El gasto fijo no existe.");
      return false;
    }

    const updatedGastosFijos = { ...data.gastosFijos };
    delete updatedGastosFijos[descripcion];

    await updateDoc(finanzasRef, { gastosFijos: updatedGastosFijos });
    console.log("Gasto fijo eliminado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al eliminar el gasto fijo:", error);
    return false;
  }
};

//#endregion


//#region Periodo
  export const getLatestFinancialPeriod = async (userId: string) => {
    const collectionRef = collection(db, `usuarios/${userId}/finanzas`);
    const snapshot = await getDocs(collectionRef);
    const periods = snapshot.docs.map(doc => doc.id);
    return periods.sort().reverse()[0] || "2025-02";
  };
  //#endregion

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
          icono: data.icono || "default-icon", 
          nombre: data.nombre || "Sin nombre", 
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

  /**
   * Crea categorías básicas por defecto para un nuevo usuario
   */
  export const createDefaultCategories = async (userId: string) => {
    const defaultCategories = [
      { nombre: "Supermercado", icono: "ShoppingCart" },
      { nombre: "Transporte", icono: "DirectionsCar" },
      { nombre: "Comida", icono: "Fastfood" },
      { nombre: "Entretenimiento", icono: "Movie" },
      { nombre: "Salud", icono: "LocalHospital" },
      { nombre: "Hogar", icono: "Home" }
    ];

    try {
      // Crear todas las categorías en paralelo
      const categoryPromises = defaultCategories.map(category => 
        addCategory(userId, category)
      );
      
      await Promise.all(categoryPromises);
      console.log("✅ Categorías por defecto creadas exitosamente");
    } catch (error) {
      console.error("❌ Error creando categorías por defecto:", error);
      throw error;
    }
  };

  //#endregion
