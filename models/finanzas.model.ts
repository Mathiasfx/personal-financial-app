import { Timestamp } from "firebase/firestore/lite";
import { Gasto } from "./gasto.model";

  export interface Finanzas {
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Timestamp;
    gastosFijos: {
      [key: string]: {
        monto: number;
        pagado: boolean;
        fechaVencimiento: Timestamp;
      };
    };
    gastosVariables: Gasto[];
  }