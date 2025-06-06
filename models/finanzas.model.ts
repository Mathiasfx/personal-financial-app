import { Timestamp } from "firebase/firestore/lite";
import { Gasto } from "./gasto.model";

  export interface Finanzas {
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Date | null ;
    gastosFijos: {
      [key: string]: {
        categoria?: { id: string; nombre: string; icono: string; };      
        monto: number;
        pagado: boolean;
        fechaVencimiento?: Date | Timestamp | { seconds: number; nanoseconds: number };
      };
    };
    gastosVariables: Gasto[];
  }