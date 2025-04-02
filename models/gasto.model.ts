import { Timestamp } from "firebase/firestore";



export interface Gasto {
    id: number;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: {
      id: string;
      nombre: string;
      icono: string;
    };
  }
  
  export interface GastoFijo {
    descripcion: string;
    monto: number;
    pagado: boolean;
    categoria?: {
      id: string;
      nombre: string;
      icono: string;
    };
    fechaVencimiento?: Date | { seconds: number; nanoseconds: number } | Timestamp;
  }