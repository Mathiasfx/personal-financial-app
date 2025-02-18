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
  
  export interface GastoFijo extends Gasto{
    pagado:boolean
  }