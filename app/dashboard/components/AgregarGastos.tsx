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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
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
      id: Date.now(), // ID temporal
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
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ borderRadius: "24px" }}
    >
      <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Monto"
          type="number"
          fullWidth
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          sx={{ marginBottom: "1rem" }}
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
            sx={{ marginBottom: "1rem", width: "100%" }}
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
          sx={{ marginBottom: "1rem" }}
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
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardarGasto}
          variant="contained"
          color="primary"
          sx={{ backgroundColor: "#171717", color: "#fff" }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarGastos;
