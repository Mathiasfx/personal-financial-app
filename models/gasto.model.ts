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
  