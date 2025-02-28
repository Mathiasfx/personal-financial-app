"use client";
/**
 * Módulo para agregar Gastos.
 * Este componente permite a los usuarios agregar nuevos gastos a su lista de gastos.
 *
 * @component
 * @example
 * return (
 *   <AgregarGastos />
 * )
 *
 * @returns {JSX.Element} Un elemento JSX que representa el formulario para agregar gastos.
 */
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import { saveExpence, getCategories } from "@/lib/finanzasService";
import { useAuth } from "@/context/AuthContext";

import { NuevoGasto } from "@/models/nuevoGasto.model";
import { Categorias } from "@/models/categorias.model";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import DateWrapper from "./DateWrapper";

const AgregarGastos = ({
  open,
  onClose,
  onGastoAgregado,
  periodo,
}: NuevoGasto) => {
  const { user } = useAuth();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState<Categorias | null>(null);
  const [categoriasDB, setCategoriasBD] = useState<Categorias[]>([]);
  const [fecha, setFecha] = useState(dayjs());

  useEffect(() => {
    if (user && open) {
      const fetchCategorias = async () => {
        const categorias = await getCategories(user?.uid);

        setCategoriasBD(categorias);
      };
      fetchCategorias();
    }
  }, [user, open, categoriasDB]);

  const handleGuardarGasto = async () => {
    if (!descripcion || !monto || !categoria || !periodo || !fecha)
      return alert("Completa todos los campos");

    const nuevoGasto = {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha: fecha.toISOString(),
      id: Date.now(),
    };

    try {
      if (!user?.uid) {
        throw new Error("User ID is undefined");
      }
      await saveExpence(user.uid, periodo, nuevoGasto); // Usa el período correcto
      onGastoAgregado(); // Actualiza el Dashboard
      onClose(); // Cierra el modal
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
    } finally {
      setDescripcion("");
      setMonto("");
      setCategoria(null);
      setFecha(dayjs());
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
    >
      <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />
        <TextField
          label="Monto"
          type="number"
          fullWidth
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />
        <DateWrapper>
          <DatePicker
            label="Fecha del Gasto"
            value={fecha}
            onChange={(newValue) => {
              if (newValue) {
                setFecha(newValue);
              }
            }}
            sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
          />
        </DateWrapper>

        <TextField
          select
          label="Categoría"
          fullWidth
          value={categoria?.id || ""}
          onChange={(e) => {
            const selectedCategoria = categoriasDB.find(
              (cat) => cat.id === e.target.value
            );
            if (selectedCategoria) setCategoria(selectedCategoria);
          }}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        >
          {categoriasDB.length > 0 ? (
            categoriasDB.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre} {/* Aquí podrías agregar el icono también */}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Cargando categorías...</MenuItem>
          )}
        </TextField>
      </DialogContent>
      <DialogActions>
        <button
          className="flex items-center gap-2 px-6 py-3 text-white bg-red-500 rounded-full shadow-sm hover:bg-red-800 border-none  "
          onClick={onClose}
        >
          <span className=" text-sm font-bold">Cancelar</span>
        </button>
        <button
          onClick={handleGuardarGasto}
          className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
        >
          <span className="text-sm font-bold"> Guardar</span>
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarGastos;
