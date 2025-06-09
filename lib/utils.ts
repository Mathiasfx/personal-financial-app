import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from 'dayjs';
import { GastoFijo } from "@/models/gasto.model";
import { Timestamp } from "firebase/firestore/lite";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
};


//#region Retorna periodo Actual
export function getCurrentPeriod(): string {
  return dayjs().format('YYYY-MM');
}
//#region Retorna Periodo Anterior
export function getPreviousPeriod(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const periodDayjs = dayjs(`${year}-${month}-01`);
  // Restamos 1 mes
  return periodDayjs.subtract(1, "month").format("YYYY-MM");
}

export function sumaGastoFijoTotal(costos:GastoFijo[]):number {
  return costos.reduce((total, costo) => total + costo.monto, 0);
}

/**
 * Convierte un objeto Dayjs a Timestamp de Firebase de manera segura
 * @param dayjsDate - Objeto Dayjs que se quiere convertir
 * @returns Timestamp de Firebase o null si la fecha no es válida
 */
export function dayjsToFirebaseTimestamp(dayjsDate: dayjs.Dayjs | null): Timestamp | null {
  if (!dayjsDate || !dayjsDate.isValid()) {
    return null;
  }
  
  try {
    return Timestamp.fromDate(dayjsDate.toDate());
  } catch (error) {
    console.error('Error converting Dayjs to Firebase Timestamp:', error);
    return null;
  }
}

/**
 * Convierte un objeto Dayjs a Date de JavaScript de manera segura
 * @param dayjsDate - Objeto Dayjs que se quiere convertir
 * @returns Date de JavaScript o null si la fecha no es válida
 */
export function dayjsToDate(dayjsDate: dayjs.Dayjs | null): Date | null {
  if (!dayjsDate || !dayjsDate.isValid()) {
    return null;
  }
  
  try {
    return dayjsDate.toDate();
  } catch (error) {
    console.error('Error converting Dayjs to Date:', error);
    return null;
  }
}