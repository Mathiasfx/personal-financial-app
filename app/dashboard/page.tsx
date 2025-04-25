"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
//#redux
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFinanzasPorPeriodo,
  selectFinanzas,
  selectFinanzasLoading,
  selectPeriodo,
  setPeriodo,
} from "../redux/slices/finanzas";
import { AppDispatch } from "@/app/redux/store";
//#redux
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { editExpense, listAllPeriods } from "@/lib/finanzasService";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Gasto } from "@/models/gasto.model";
import { formatCurrency } from "@/lib/utils";
import { Edit, DeleteRounded } from "@mui/icons-material";
import { deleteExpense } from "@/lib/finanzasService";
import DateWrapper from "./components/DateWrapper";
import AgregarGastos from "./components/AgregarGastos";

export default function Dashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const finanzas = useSelector(selectFinanzas);
  const loading = useSelector(selectFinanzasLoading);
  const periodo = useSelector(selectPeriodo) as string;
  const [periodosDisponibles, setPeriodosDisponibles] = useState<string[]>([]);
  const [numGastos, setNumGastos] = useState(10);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastGastoRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setNumGastos((prev) => prev + 5);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const handleOpenEditModal = (gasto: Gasto | null) => {
    if (gasto === null) return;
    setGastoEditando(gasto);
    setEditModalOpen(true);
  };

  const totalGastosFijos = useMemo(() => {
    return Object.values(finanzas?.gastosFijos || {}).reduce(
      (sum, gasto) => sum + (gasto.pagado ? gasto.monto : 0),
      0
    );
  }, [finanzas]);

  const totalGastosVariables = useMemo(() => {
    return (finanzas?.gastosVariables || []).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );
  }, [finanzas]);

  const dineroDisponible = useMemo(() => {
    return (
      (finanzas?.ingresos || 0) +
      (finanzas?.ingresosExtras || 0) -
      (totalGastosFijos + totalGastosVariables + (finanzas?.inversiones || 0))
    );
  }, [finanzas, totalGastosFijos, totalGastosVariables]);

  const diasCobro = useMemo(() => {
    if (!finanzas?.fechaCobro) return 0;
    return dayjs(finanzas.fechaCobro as Date).diff(dayjs(), "day");
  }, [finanzas]);

  useEffect(() => {
    const fetchPeriodos = async () => {
      if (!user) return;
      const allPeriods = await listAllPeriods(user.uid);
      const ids = allPeriods.map((p) => p.id);
      const current = dayjs().format("YYYY-MM");
      if (!ids.includes(current)) ids.push(current);
      ids.sort();
      setPeriodosDisponibles(ids);
      dispatch(setPeriodo(current));
    };
    fetchPeriodos();
  }, [user, dispatch]);

  useEffect(() => {
    if (user && periodo) {
      dispatch(fetchFinanzasPorPeriodo({ uid: user.uid, periodo }));
    }
  }, [user, periodo, dispatch]);

  const handleGastoAgregado = async () => {
    setModalOpen(false);
    if (user) {
      await dispatch(fetchFinanzasPorPeriodo({ uid: user.uid, periodo }));
    }
  };

  const handleDeleteExpense = async (gastoId: number) => {
    if (!user || !finanzas || gastoId === undefined) return;
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este gasto?"
    );
    if (!confirmDelete) return;
    const success = await deleteExpense(user.uid, periodo, gastoId);
    if (success) {
      await dispatch(fetchFinanzasPorPeriodo({ uid: user.uid, periodo }));
    }
  };

  const handleEditGasto = async (updatedData: Gasto) => {
    if (!user || !finanzas || !gastoEditando) return;
    const success = await editExpense(
      user.uid,
      periodo,
      gastoEditando.id,
      updatedData
    );
    if (success) {
      await dispatch(fetchFinanzasPorPeriodo({ uid: user.uid, periodo }));
      setEditModalOpen(false);
    }
  };

  return (
    <div className="p-0 md:p-4">
      <div className="w-full max-w-7xl flex justify-end">
        <button
          className="flex items-center gap-2 px-6 border-none py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300   mb-2"
          onClick={() => setModalOpen(true)}
          aria-label="Agregar nuevo gasto"
        >
          <span className="text-xl font-bold">+</span>
          <span className="text-lg font-medium">Nuevo Gasto</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl">
        <div className="w-full max-w-lg bg-white shadow-md rounded-xl p-4">
          {periodosDisponibles.length > 0 && (
            <div className="my-4 flex">
              <h6 className="text-xl font-bold text-gray-800  m-0 ">
                Estado del mes{" "}
                {loading ? (
                  <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
                ) : null}
              </h6>
              <select
                value={periodo}
                onChange={(e) => dispatch(setPeriodo(e.target.value))}
                className="border rounded-md p-2 ml-2 text-sm font-semibold w-32 "
              >
                {periodosDisponibles.map((p) => (
                  <option key={p} value={p} className="text-sm">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-lg m-0">
            Ingresos:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(finanzas?.ingresos || 0)
            )}
          </p>
          <p className="text-lg m-0">
            Ingresos Extras:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(finanzas?.ingresosExtras || 0)
            )}
          </p>
          <p className="text-lg m-0">
            Inversiones:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(finanzas?.inversiones || 0)
            )}
          </p>
          <p className="text-lg m-0">
            Fecha de Cobro:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : finanzas?.fechaCobro ? (
              dayjs(finanzas.fechaCobro as Date).format("DD/MM/YYYY")
            ) : (
              "-"
            )}
          </p>
        </div>

        <div className="w-full max-w-lg bg-gray-900 text-white shadow-md rounded-xl p-4 ">
          <h6 className="text-xl font-bold text-yellow-400 m-0">Resumen</h6>
          <p className="text-2xl m-0">
            Disponible:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(dineroDisponible)
            )}
          </p>
          <p className="text-lg m-0">
            Días restantes:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              diasCobro
            )}
          </p>
          <p className="m-0">
            Total Gastos Fijos:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(totalGastosFijos)
            )}
          </p>
          <p className="m-0">
            Total Gastos Variables:{" "}
            {loading ? (
              <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
            ) : (
              formatCurrency(totalGastosVariables)
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-7xl ">
          <h6 className="text-xl font-bold text-gray-800 mb-4">
            Transacciones de gastos variables
          </h6>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="w-full h-20 bg-gray-300 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : finanzas?.gastosVariables?.length && user ? (
            <div className="space-y-4">
              {[...(finanzas?.gastosVariables || [])]
                .sort((a, b) => dayjs(b.fecha).diff(dayjs(a.fecha)))
                .slice(0, numGastos)
                .map((gasto, index) => (
                  <div
                    key={gasto.id}
                    ref={index === numGastos - 1 ? lastGastoRef : null}
                    className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-bold">{gasto.descripcion}</p>
                      <p className="text-sm text-gray-500">
                        {dayjs(gasto.fecha).format("DD/MM/YYYY")}
                      </p>
                      <span className="text-red-500 font-bold">
                        -{formatCurrency(gasto.monto)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(gasto)}
                        className="text-gray-900 hover:underline border-none bg-none rounded-full "
                      >
                        <Edit className="m-1 text-gray-900" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(gasto.id)}
                        className="text-red-500 hover:underline border-none bg-none rounded-full "
                      >
                        <DeleteRounded className="m-1" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay transacciones</p>
          )}
        </div>
      </div>

      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
      >
        <DialogTitle>Editar Gasto</DialogTitle>
        <DialogContent>
          <TextField
            label="Descripción"
            fullWidth
            defaultValue={gastoEditando?.descripcion}
            onChange={(e) =>
              setGastoEditando((prev) =>
                prev
                  ? {
                      ...prev,
                      descripcion: e.target.value,
                    }
                  : prev
              )
            }
            sx={{ marginBottom: "1rem", marginTop: "1rem" }}
          />
          <TextField
            label="Monto"
            type="number"
            fullWidth
            defaultValue={gastoEditando?.monto}
            onChange={(e) =>
              setGastoEditando((prev) =>
                prev ? { ...prev, monto: Number(e.target.value) } : prev
              )
            }
            sx={{ marginBottom: "1rem", marginTop: "1rem" }}
          />
          <DateWrapper>
            <DatePicker
              label="Fecha"
              value={dayjs(gastoEditando?.fecha)}
              onChange={(newValue: dayjs.Dayjs | null) =>
                setGastoEditando((prev) =>
                  prev
                    ? {
                        ...prev,
                        fecha: newValue ? newValue.toISOString() : "",
                      }
                    : prev
                )
              }
              sx={{ marginBottom: "1rem", width: "100%" }}
            />
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
            onClick={() => gastoEditando && handleEditGasto(gastoEditando)}
          >
            <span className=" text-sm font-bold">Guardar Cambios</span>
          </button>
        </DialogActions>
      </Dialog>
      <AgregarGastos
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGastoAgregado={handleGastoAgregado}
        periodo={periodo}
      />
    </div>
  );
}
