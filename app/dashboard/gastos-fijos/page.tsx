"use client";

import { useEffect, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { Add, Edit } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import {
  getFinancialData,
  getLatestFinancialPeriod,
  updateExpenseStatus,
  addExpense,
  updateExpense,
} from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
import { Gasto, GastoFijo } from "@/models/gasto.model";
import { Switch } from "@mui/material";

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
    fechaVencimiento: undefined,
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

    const success = await updateExpense(user.uid, periodo, gastoEditando);

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
              fechaVencimiento: nuevoGasto.fechaVencimiento
                ? nuevoGasto.fechaVencimiento
                : undefined,
            },
          },
        };
      });
      setAddModalOpen(false);
    }
  };

  return (
    <div className="p-0 md:p-4">
      <div className="flex max-w-screen-lg justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gastos Fijos</h1>
        <button
          className="flex items-center gap-2 px-6 border-none py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300   mb-2"
          onClick={() => setAddModalOpen(true)}
        >
          <Add className="text-xl font-bold" />
          <span className="text-lg font-bold"> Gasto Fijo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-5xl ">
        {/* Card contenedor */}
        <div className="bg-white shadow-md rounded-2xl p-6 min-h-[180px]">
          {finanzas?.gastosFijos ? (
            Object.entries(finanzas.gastosFijos).map(([nombre, gasto]) => (
              <div
                key={nombre}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm w-full mb-3"
              >
                <div>
                  <p className="text-lg font-bold">{nombre}</p>
                  <p className="text-sm text-gray-500">
                    Monto: {formatCurrency(gasto.monto)}
                  </p>
                  {gasto.fechaVencimiento && (
                    <p className="text-sm text-gray-500">
                      {gasto.fechaVencimiento.toDate().toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={gasto.pagado}
                    onChange={() => handleTogglePayment(nombre, !gasto.pagado)}
                    color="success"
                  />
                  <button
                    onClick={() => handleOpenEditModal(nombre, gasto)}
                    className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                  >
                    <Edit className="w-5 h-5 text-gray-700 m-1 " />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No hay gastos fijos registrados.
            </p>
          )}
        </div>
      </div>

      {/* Modal para Agregar Gasto Fijo */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
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
            sx={{ marginBottom: "1rem", marginTop: "1rem" }}
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
          <button
            className="flex items-center gap-2 px-6 py-3 text-white bg-red-500 rounded-full shadow-sm hover:bg-red-800 border-none "
            onClick={() => setAddModalOpen(false)}
          >
            <span className=" text-sm font-bold">Cancelar</span>
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
            onClick={handleAddGastoFijo}
          >
            <span className=" text-sm font-bold">Agregar</span>
          </button>
        </DialogActions>
      </Dialog>

      {/* Modal para Editar Gasto Fijo */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
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
            sx={{ marginTop: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <button
            className="flex items-center gap-2 px-6 py-3 text-white bg-red-500 rounded-full shadow-sm hover:bg-red-800 border-none "
            onClick={() => setEditModalOpen(false)}
          >
            <span className=" text-sm font-bold">Cancelar</span>
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
            onClick={handleEditGasto}
          >
            <span className=" text-sm font-bold">Guardar cambios</span>
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
