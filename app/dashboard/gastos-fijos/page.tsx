/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { Add, DeleteRounded, Edit } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import {
  getFinancialData,
  getLatestFinancialPeriod,
  updateExpenseStatus,
  addExpense,
  updateExpense,
  deleteFixedExpense,
} from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
import { Gasto, GastoFijo } from "@/models/gasto.model";
import { Switch } from "@mui/material";
import DateWrapper from "../components/DateWrapper";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { formatCurrency, sumaGastoFijoTotal } from "@/lib/utils";
import { Finanzas } from "@/models/finanzas.model";

export default function GastosFijosPage() {
  const { user } = useAuth();
  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [total, setTotal] = useState(0);
  const [periodo, setPeriodo] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<GastoFijo | null>(null);
  const [nuevoGasto, setNuevoGasto] = useState<GastoFijo>({
    categoria: { id: "", nombre: "", icono: "" },
    monto: 0,
    descripcion: "",
    pagado: false,
    fechaVencimiento: dayjs().toDate(),
  });

  //#region Fetch Finanzas Periodo Actual
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
  //#endregion

  //#region Set Total de Gastos Fijos
  useEffect(() => {
    if (finanzas?.gastosFijos) {
      setTotal(
        sumaGastoFijoTotal(Object.values(finanzas.gastosFijos) as GastoFijo[])
      );
    }
  }, [finanzas?.gastosFijos]);
  //#endregion

  //#region Manejar estado del gasto
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
  //#endregion

  //#region Editar Gasto Fijo
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
              fechaVencimiento:
                gastoEditando.fechaVencimiento instanceof Timestamp
                  ? gastoEditando.fechaVencimiento.toDate()
                  : gastoEditando.fechaVencimiento,
            },
          },
        };
      });
      setGastoEditando({
        monto: 0,
        descripcion: "",
        pagado: false,
        fechaVencimiento: dayjs().toDate(),
      });
      setEditModalOpen(false);
    }
    if (finanzas?.gastosFijos) {
      setTotal(
        sumaGastoFijoTotal(Object.values(finanzas.gastosFijos) as GastoFijo[])
      );
    }
  };
  //#endregion

  //#region Agregar Gasto Fijo
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

      setNuevoGasto({
        categoria: { id: "", nombre: "", icono: "" },
        monto: 0,
        descripcion: "",
        pagado: false,
        fechaVencimiento: dayjs().toDate(),
      });
      setAddModalOpen(false);
    }
  };
  //#endregion

  //#region Eliminar Gasto Fijo
  const handleDeleteGastoFijo = async (gastoNombre: string) => {
    if (!user || !finanzas) return;

    const success = await deleteFixedExpense(user.uid, periodo, gastoNombre);
    if (success) {
      setFinanzas((prev) => {
        if (!prev) return prev;
        const updatedGastosFijos = { ...prev.gastosFijos };
        delete updatedGastosFijos[gastoNombre];
        return {
          ...prev,
          gastosFijos: updatedGastosFijos,
        };
      });
    }
  };
  //#endregion

  return (
    <div className="p-0 md:p-4">
      <div className="flex max-w-screen-lg justify-between items-center mb-4">
        <div className="w-full flex-col items-start md:w-80 md:flex-row flex flex-1 justify-start md:items-center">
          <h1 className="text-xl font-bold m-0 md:mr-5">Gastos Fijos</h1>
          <h2 className="m-0 text-xl font-medium text-gray-700 ">
            Total: {formatCurrency(total)}
          </h2>
        </div>

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
            Object.entries(finanzas.gastosFijos)
              .sort(([_, gastoA], [__, gastoB]) => {
                const fechaA = gastoA.fechaVencimiento
                  ? gastoA.fechaVencimiento instanceof Date
                    ? gastoA.fechaVencimiento
                    : (gastoA.fechaVencimiento as Timestamp).toDate()
                  : null;

                const fechaB = gastoB.fechaVencimiento
                  ? gastoB.fechaVencimiento instanceof Date
                    ? gastoB.fechaVencimiento
                    : (gastoB.fechaVencimiento as Timestamp).toDate()
                  : null;

                if (fechaA && fechaB) {
                  return fechaA.getTime() - fechaB.getTime();
                } else if (fechaA && !fechaB) {
                  return -1;
                } else if (!fechaA && fechaB) {
                  return 1;
                } else {
                  return 0;
                }
              })
              .map(([nombre, gasto]) => (
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
                        {(gasto.fechaVencimiento instanceof Date
                          ? gasto.fechaVencimiento // ya es Date
                          : (gasto.fechaVencimiento as Timestamp).toDate()
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={gasto.pagado}
                      onChange={() =>
                        handleTogglePayment(nombre, !gasto.pagado)
                      }
                      color="success"
                    />
                    <button
                      onClick={() =>
                        handleOpenEditModal(nombre, {
                          ...gasto,
                          descripcion: nombre,
                          categoria: gasto.categoria || {
                            id: "",
                            nombre: "",
                            icono: "",
                          },
                        })
                      }
                      className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                    >
                      <Edit className="w-5 h-5 text-gray-700 m-1 " />
                    </button>
                    <button
                      onClick={() => handleDeleteGastoFijo(nombre)}
                      className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                    >
                      <DeleteRounded className="w-5 h-5 text-red-500 m-1" />
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
            inputMode="decimal"
            type="text"
            fullWidth
            value={nuevoGasto.monto.toString()}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/[^0-9.,]/g, "");
              rawValue = rawValue.replace(",", ".");
              setNuevoGasto({
                ...nuevoGasto,
                monto: rawValue === "" ? 0 : parseFloat(rawValue) || 0,
              });
            }}
            onBlur={() => {
              setNuevoGasto((prev) => ({
                ...prev,
                monto: prev.monto ? Number(prev.monto) : 0,
              }));
            }}
            sx={{ marginBottom: "1rem" }}
          />

          <DateWrapper>
            <DatePicker
              label="Fecha de Vencimiento"
              format="DD/MM/YYYY"
              value={
                nuevoGasto.fechaVencimiento
                  ? dayjs(nuevoGasto.fechaVencimiento)
                  : null
              }
              onChange={(newValue) => {
                setNuevoGasto({
                  ...nuevoGasto,
                  fechaVencimiento: newValue ? newValue.toDate() : undefined,
                });
              }}
              sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
            ></DatePicker>
          </DateWrapper>
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
            label="Descripcion"
            type="text"
            fullWidth
            value={gastoEditando?.descripcion}
            disabled
            sx={{ marginTop: "1rem" }}
          ></TextField>
          <TextField
            label="Monto"
            inputMode="decimal"
            type="text"
            fullWidth
            value={gastoEditando?.monto ? gastoEditando.monto.toString() : ""}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/[^0-9.,]/g, "");
              rawValue = rawValue.replace(",", ".");
              setGastoEditando((prev) =>
                prev
                  ? {
                      ...prev,
                      monto: rawValue === "" ? 0 : parseFloat(rawValue) || 0,
                    }
                  : null
              );
            }}
            onBlur={() => {
              setGastoEditando((prev) =>
                prev
                  ? {
                      ...prev,
                      monto: prev.monto ? Number(prev.monto) : 0,
                    }
                  : null
              );
            }}
            sx={{ marginTop: "1rem" }}
          />

          <DateWrapper>
            {gastoEditando && (
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha de Vencimiento"
                value={
                  gastoEditando.fechaVencimiento
                    ? gastoEditando.fechaVencimiento instanceof Timestamp
                      ? dayjs(gastoEditando.fechaVencimiento.toDate())
                      : dayjs(gastoEditando.fechaVencimiento)
                    : null
                }
                onChange={(newValue) => {
                  if (newValue) {
                    setGastoEditando((prev) =>
                      prev
                        ? {
                            ...prev,
                            fechaVencimiento: newValue.toDate(),
                          }
                        : null
                    );
                  }
                }}
                sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
              ></DatePicker>
            )}
          </DateWrapper>
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
