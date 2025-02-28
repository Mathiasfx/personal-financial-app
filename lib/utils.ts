import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from 'dayjs';
import { GastoFijo } from "@/models/gasto.model";

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