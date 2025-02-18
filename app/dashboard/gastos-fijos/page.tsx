"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Paper,
  Switch,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid2,
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import {
  getFinancialData,
  getLatestFinancialPeriod,
  updateExpenseStatus,
  addExpense,
} from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
import { Gasto, GastoFijo } from "@/models/gasto.model";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function GastosFijosPage() {
  const { user } = useAuth();
  interface Finanzas {
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Timestamp;
    gastosFijos: Record<string, GastoFijo>;
    gastosVariables: Gasto[];
  }
  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [periodo, setPeriodo] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<GastoFijo | null>(null);
  const [nuevoGasto, setNuevoGasto] = useState<GastoFijo>({
    id: 0,
    fecha: "",
    categoria: { id: "", nombre: "", icono: "" },
    monto: 0,
    descripcion: "",
    pagado: false,
  });

  useEffect(() => {
    if (!user) return;
    const fetchFinanzas = async () => {
      const periodoActual = await getLatestFinancialPeriod(user.uid);
      setPeriodo(periodoActual);

      const data = (await getFinancialData(
        user.uid,
        periodoActual
      )) as Finanzas;
      if (data !== null) {
        setFinanzas(data);
      }
    };

    fetchFinanzas();
  }, [user]);

  const handleTogglePayment = async (gastoNombre: string, pagado: boolean) => {
    if (!user || !finanzas) return;

    const success = await updateExpenseStatus(
      user.uid,
      periodo,
      gastoNombre,
      pagado
    );
    if (success) {
      setFinanzas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gastosFijos: {
            ...prev.gastosFijos,
            ...prev.gastosFijos,
            [gastoNombre]: { ...prev.gastosFijos[gastoNombre], pagado },
          },
        };
      });
    }
  };

  const handleOpenEditModal = (gastoNombre: string, gasto: GastoFijo) => {
    if (gasto !== null) {
      setGastoEditando({ ...gasto, descripcion: gastoNombre });
      setEditModalOpen(true);
    }
  };

  const handleEditGasto = async () => {
    if (!user || !finanzas || !gastoEditando) return;

    const success = await updateExpenseStatus(
      user.uid,
      periodo,
      gastoEditando.descripcion,
      gastoEditando.pagado
    );

    if (success) {
      setFinanzas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gastosFijos: {
            ...prev.gastosFijos,
            [gastoEditando.descripcion]: {
              ...prev.gastosFijos[gastoEditando.descripcion],
              monto: gastoEditando.monto,
            },
          },
        };
      });
      setEditModalOpen(false);
    }
  };
  const handleAddGastoFijo = async () => {
    if (!user || !nuevoGasto.descripcion || !nuevoGasto.monto) return;

    const success = await addExpense(user.uid, periodo, nuevoGasto);
    if (success) {
      setFinanzas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gastosFijos: {
            ...prev.gastosFijos,
            [nuevoGasto.descripcion]: {
              id: nuevoGasto.id,
              fecha: nuevoGasto.fecha,
              categoria: nuevoGasto.categoria,
              monto: parseFloat(nuevoGasto.monto.toString()),
              descripcion: nuevoGasto.descripcion,
              pagado: nuevoGasto.pagado,
            },
          },
        };
      });
      setAddModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gastos Fijos</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddModalOpen(true)}
        >
          Nuevo Gasto Fijo
        </Button>
      </div>

      <Grid2 container spacing={2}>
        <Grid2 sx={{ width: "100%", maxWidth: "1200px" }}>
          <Card
            sx={{
              boxShadow: "1",
              borderRadius: "24px",
              minHeight: "180px",
              padding: "16px",
            }}
          >
            {finanzas?.gastosFijos ? (
              Object.entries(finanzas.gastosFijos).map(([nombre, gasto]) => (
                <Paper
                  key={nombre}
                  sx={{
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "16px",
                    boxShadow: "1",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <Typography variant="body1" fontWeight="bold">
                      {nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monto: {formatCurrency(gasto.monto)}
                    </Typography>
                  </div>
                  <div>
                    <Switch
                      checked={gasto.pagado}
                      onChange={() =>
                        handleTogglePayment(nombre, !gasto.pagado)
                      }
                      color="success"
                    />
                    <IconButton
                      sx={{ color: "#171717" }}
                      onClick={() => handleOpenEditModal(nombre, gasto)}
                    >
                      <Edit />
                    </IconButton>
                  </div>
                </Paper>
              ))
            ) : (
              <Typography variant="body2">
                No hay gastos fijos registrados.
              </Typography>
            )}
          </Card>
        </Grid2>
      </Grid2>
      {/* Modal para Agregar Gasto Fijo */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar Gasto Fijo</DialogTitle>
        <DialogContent>
          <TextField
            label="Descripcion"
            fullWidth
            value={nuevoGasto.descripcion}
            onChange={(e) =>
              setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })
            }
            sx={{ marginBottom: "1rem" }}
          />
          <TextField
            label="Monto"
            type="number"
            fullWidth
            value={nuevoGasto.monto}
            onChange={(e) =>
              setNuevoGasto({
                ...nuevoGasto,
                monto: parseFloat(e.target.value),
              })
            }
            sx={{ marginBottom: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleAddGastoFijo}
            variant="contained"
            sx={{ color: "#171717" }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Editar Gasto Fijo */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar Gasto Fijo</DialogTitle>
        <DialogContent>
          <TextField
            label="Monto"
            type="number"
            fullWidth
            defaultValue={gastoEditando?.monto}
            onChange={(e) =>
              setGastoEditando((prev) =>
                prev ? { ...prev, monto: parseFloat(e.target.value) } : null
              )
            }
            sx={{ marginBottom: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleEditGasto}
            variant="contained"
            sx={{ color: "#171717" }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
