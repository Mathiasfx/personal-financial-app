import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLatestFinancialPeriod,
  getFinancialData,
  updateExpenseStatus,
  addExpense,
  updateExpense,
  deleteFixedExpense,
} from "@/lib/finanzasService";
import { GastoFijo } from "@/models/gasto.model";
import { RootState } from "../store";

type GastoFijoConDescripcion = GastoFijo & { descripcion: string };

interface GastosFijosState {
  lista: GastoFijoConDescripcion[];
  loading: boolean;
  error: string | null;
  periodo: string;
}

const initialState: GastosFijosState = {
  lista: [],
  loading: false,
  error: null,
  periodo: "",
};


export const fetchGastosFijos = createAsyncThunk(
  "gastosFijos/fetchGastosFijos",
  async (uid: string) => {
    const periodoActual = await getLatestFinancialPeriod(uid);
    const data = await getFinancialData(uid, periodoActual);
    const lista: GastoFijoConDescripcion[] = Object.entries(data.gastosFijos || {}).map(
      ([key, value]) => ({ ...(value as GastoFijo), descripcion: key })
    );
    return { periodo: periodoActual, lista };
  }
);


export const toggleEstadoGastoFijo = createAsyncThunk(
  "gastosFijos/toggleEstado",
  async (
    {
      uid,
      periodo,
      nombre,
      pagado,
    }: { uid: string; periodo: string; nombre: string; pagado: boolean }  ) => {
    await updateExpenseStatus(uid, periodo, nombre, pagado);
    return { nombre, pagado };
  }
);


export const editarGastoFijo = createAsyncThunk(
  "gastosFijos/editarGastoFijo",
  async ({
    uid,
    periodo,
    gasto,
  }: {
    uid: string;
    periodo: string;
    gasto: GastoFijoConDescripcion;
  }) => {
    await updateExpense(uid, periodo, gasto);
    return gasto;
  }
);


export const crearGastoFijo = createAsyncThunk(
  "gastosFijos/crearGastoFijo",
  async ({
    uid,
    periodo,
    gasto,
  }: {
    uid: string;
    periodo: string;
    gasto: GastoFijoConDescripcion;
  }) => {
    await addExpense(uid, periodo, gasto);
    return gasto;
  }
);


export const eliminarGastoFijo = createAsyncThunk(
  "gastosFijos/eliminarGastoFijo",
  async ({
    uid,
    periodo,
    nombre,
  }: {
    uid: string;
    periodo: string;
    nombre: string;
  }) => {
    await deleteFixedExpense(uid, periodo, nombre);
    return nombre;
  }
);

const gastosFijosSlice = createSlice({
  name: "gastosFijos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGastosFijos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGastosFijos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload.lista;
        state.periodo = action.payload.periodo;
      })
      .addCase(fetchGastosFijos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al cargar gastos fijos";
      })

      .addCase(toggleEstadoGastoFijo.fulfilled, (state, action) => {
        const index = state.lista.findIndex(g => g.descripcion === action.payload.nombre);
        if (index !== -1) {
          state.lista[index].pagado = action.payload.pagado;
        }
      })

      .addCase(editarGastoFijo.fulfilled, (state, action) => {
        const index = state.lista.findIndex(g => g.descripcion === action.payload.descripcion);
        if (index !== -1) {
          state.lista[index] = action.payload;
        }
      })

      .addCase(crearGastoFijo.fulfilled, (state, action) => {
        state.lista.push(action.payload);
      })

      .addCase(eliminarGastoFijo.fulfilled, (state, action) => {
        state.lista = state.lista.filter(g => g.descripcion !== action.payload);
      });
  },
});

// 🔎 Selectores
export const selectGastosFijos = (state: RootState) => state.gastosFijos.lista;
export const selectPeriodoGastos = (state: RootState) => state.gastosFijos.periodo;
export const selectGastosFijosLoading = (state: RootState) => state.gastosFijos.loading;

export default gastosFijosSlice.reducer;
