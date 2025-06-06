import { configureStore } from '@reduxjs/toolkit';
import finanzasReducer from './slices/finanzas';
import categoriasReducer from './slices/categorias';
import gastosFijosReducer from './slices/gastosFijos';

export const store = configureStore({
    reducer: {
        finanzas: finanzasReducer,
        categorias: categoriasReducer,
        gastosFijos: gastosFijosReducer,


    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
          }),

    });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;