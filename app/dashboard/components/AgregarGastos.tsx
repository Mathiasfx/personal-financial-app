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
import { saveFinancialData, getCategories } from "@/lib/finanzasService";
import { useAuth } from "@/context/AuthContext";

import { NuevoGasto } from "@/models/nuevoGasto.model";

const AgregarGastos = ({
  open,
  onClose,
  onGastoAgregado,
  periodo,
}: NuevoGasto) => {
  const { user } = useAuth();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState<string>("");
  const [categoriasDB, setCategoriasBD] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchCategorias = async () => {
      const categorias = await getCategories(user?.uid);
      console.log("categorias", categorias);
      setCategoriasBD(categorias.map((cat) => cat.id));
    };
    fetchCategorias();
  }, [user]);

  const handleGuardarGasto = async () => {
    if (!descripcion || !monto || !categoria || !periodo)
      return alert("Completa todos los campos");

    const nuevoGasto = {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha: new Date().toISOString(),
      id: Date.now(), // ID temporal
    };

    try {
      if (!user?.uid) {
        throw new Error("User ID is undefined");
      }
      await saveFinancialData(user.uid, periodo, nuevoGasto); // Usa el período correcto
      onGastoAgregado(); // Actualiza el Dashboard
      onClose(); // Cierra el modal
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mb-4"
        />
        <TextField
          label="Monto"
          type="number"
          fullWidth
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="mb-4"
        />
        <TextField
          select
          label="Categoría"
          fullWidth
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="mb-4"
        >
          {categoriasDB.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
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
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarGastos;
