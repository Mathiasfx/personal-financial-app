import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Categorias } from "@/models/categorias.model";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/finanzasService";
import { RootState } from "../store";


export const fetchCategorias = createAsyncThunk(
  "categorias/fetchCategorias",
  async (uid: string) => {
    return await getCategories(uid);
  }
);

export const crearCategoria = createAsyncThunk(
  "categorias/crearCategoria",
  async ({ uid, categoria }: { uid: string; categoria: Omit<Categorias, "id"> }) => {
    return await addCategory(uid, categoria);
  }
);

export const eliminarCategoria = createAsyncThunk(
  "categorias/eliminarCategoria",
  async ({ uid, id }: { uid: string; id: string }) => {
    await deleteCategory(uid, id);
    return id;
  }
);

export const editarCategoria = createAsyncThunk(
  "categorias/editarCategoria",
  async ({ uid, categoria }: { uid: string; categoria: Categorias }) => {
    await updateCategory(uid, categoria.id, categoria);
    return categoria;
  }
);


interface CategoriasState {
  lista: Categorias[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriasState = {
  lista: [],
  loading: false,
  error: null,
};

// 🧩 Slice
const categoriasSlice = createSlice({
  name: "categorias",
  initialState,
  reducers: {
    setCategorias(state, action: PayloadAction<Categorias[]>) {
      state.lista = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Obtener
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar categorías";
      })

      // Crear
      .addCase(crearCategoria.fulfilled, (state, action) => {
        state.lista.push(action.payload);
      })

      // Eliminar
      .addCase(eliminarCategoria.fulfilled, (state, action) => {
        state.lista = state.lista.filter((cat) => cat.id !== action.payload);
      })

      // Editar
      .addCase(editarCategoria.fulfilled, (state, action) => {
        const index = state.lista.findIndex(
          (cat) => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.lista[index] = action.payload;
        }
      });
  },
});

// 🧪 Selectores
export const selectCategorias = (state: RootState) => state.categorias.lista;
export const selectCategoriasLoading = (state: RootState) => state.categorias.loading;
export const { setCategorias } = categoriasSlice.actions;

export default categoriasSlice.reducer;
