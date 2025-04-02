import { Timestamp } from "firebase/firestore/lite";
import { Gasto } from "./gasto.model";

  export interface Finanzas {
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Timestamp ;
    gastosFijos: {
      [key: string]: {
        categoria?: { id: string; nombre: string; icono: string; };      
        monto: number;
        pagado: boolean;
        fechaVencimiento?: Date | { seconds: number; nanoseconds: number } | Timestamp;
      };
    };
    gastosVariables: Gasto[];
  }