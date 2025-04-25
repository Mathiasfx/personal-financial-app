import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Finanzas } from "@/models/finanzas.model";
import { getFinancialData, createPeriodIfNotExists } from "@/lib/finanzasService";
import { RootState } from "../store";


export const fetchFinanzasPorPeriodo = createAsyncThunk(
  "finanzas/fetchFinanzasPorPeriodo",
  async ({ uid, periodo }: { uid: string; periodo: string }) => {
    await createPeriodIfNotExists(uid, periodo);
    const data = await getFinancialData(uid, periodo);
    return {
      ...data,
      fechaCobro: data.fechaCobro?.toDate?.() || null, 
    };
  }
);

interface FinanzasState {
  data: Finanzas | null;
  loading: boolean;
  error: string | null;
  periodo: string;
}

const initialState: FinanzasState = {
  data: null,
  loading: false,
  error: null,
  periodo: "", 
};

const finanzasSlice = createSlice({
  name: "finanzas",
  initialState,
  reducers: {
    setPeriodo(state, action: PayloadAction<string>) {
      state.periodo = action.payload;
    },
    clearFinanzas(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanzasPorPeriodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinanzasPorPeriodo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFinanzasPorPeriodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al cargar finanzas";
      });
  },
});

// Selectores
export const selectFinanzas = (state: RootState) => state.finanzas.data;
export const selectFinanzasLoading = (state: RootState) => state.finanzas.loading;
export const selectPeriodo = (state: RootState) => state.finanzas.periodo;

export const { setPeriodo, clearFinanzas } = finanzasSlice.actions;
export default finanzasSlice.reducer;
