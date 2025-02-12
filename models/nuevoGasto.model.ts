export interface NuevoGasto {
    open: boolean;
    onClose: () => void;
    onGastoAgregado: () => void;
    periodo:string;
}