"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import {
  createPeriodIfNotExists,
  editExpense,
  getFinancialData,
  listAllPeriods,
} from "@/lib/finanzasService";
import { Finanzas } from "@/models/finanzas.model";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Gasto } from "@/models/gasto.model";
//import { getLatestFinancialPeriod } from "@/lib/finanzasService";
import { formatCurrency } from "@/lib/utils";
import { Edit, DeleteRounded } from "@mui/icons-material";
import { deleteExpense } from "@/lib/finanzasService";
import DateWrapper from "./components/DateWrapper";
import AgregarGastos from "./components/AgregarGastos";

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [periodosDisponibles, setPeriodosDisponibles] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState(dayjs().format("YYYY-MM"));
  const [loading, setLoading] = useState<boolean>(true);
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
          setNumGastos((prev) => prev + 5); // Carga 5 más cada vez
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

  //#region Calcular total de gastos fijos pagados
  const totalGastosFijos = useMemo(() => {
    return Object.values(finanzas?.gastosFijos || {}).reduce(
      (sum, gasto) => sum + (gasto.pagado ? gasto.monto : 0),
      0
    );
  }, [finanzas]);
  //#endregion

  //#region Calcular total de gastos variables
  const totalGastosVariables = useMemo(() => {
    return (finanzas?.gastosVariables || []).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );
  }, [finanzas]);
  //#endregion

  //#region Disponible
  const dineroDisponible = useMemo(() => {
    return (
      (finanzas?.ingresos || 0) +
      (finanzas?.ingresosExtras || 0) -
      (totalGastosFijos +
        totalGastosVariables +
        (finanzas?.inversiones ? finanzas.inversiones : 0))
    );
  }, [finanzas, totalGastosFijos, totalGastosVariables]);
  //#endregion

  //#region Dias restantes Cobro
  const diasCobro = useMemo(() => {
    if (!finanzas?.fechaCobro) return 0;
    return dayjs(finanzas.fechaCobro).diff(dayjs(), "day");
  }, [finanzas]);
  //#endregion
  //#region Obtener Datos Finanzas
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const allPeriods = await listAllPeriods(user.uid);
        // listAllPeriods -> te retorna un array de { id, data }

        // Extraemos sólo los IDs
        const ids = allPeriods.map((p) => p.id);

        // Ordenamos los IDs (opcional)
        ids.sort();

        // Si prefieres que siempre aparezca el mes actual en el select
        // aunque no exista todavía en la base:
        const current = dayjs().format("YYYY-MM");
        if (!ids.includes(current)) {
          ids.push(current);
          ids.sort();
        }

        setPeriodosDisponibles(ids);
      } catch (error) {
        console.error("Error listando periodos:", error);
        toast.showError("Error al cargar los períodos disponibles");
      }
    })();
  }, [user, toast]);
  const fetchCurrentPeriodData = useCallback(async () => {
    if (!user || !periodo) return;
    setLoading(true);
    try {
      await createPeriodIfNotExists(user.uid, periodo); // Crea si no existe
      const data = await getFinancialData(user.uid, periodo); // Lee
      setFinanzas(data);
    } catch (error) {
      console.error(error);
      toast.showError("Error al cargar los datos financieros");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, periodo]); // toast intencionalmente omitido para evitar bucles infinitos

  useEffect(() => {
    fetchCurrentPeriodData();
  }, [fetchCurrentPeriodData]);
  //#endregion
  //#region Gastos Funciones
  //actualiza la info cuando se agrega un gasto y cierra modal
  const handleGastoAgregado = async () => {
    setModalOpen(false);
    setLoading(true);
    try {
      await fetchCurrentPeriodData();
      toast.showSuccess("Gasto variable agregado exitosamente");
    } catch (error) {
      toast.showError("Error al cargar datos actualizados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (gastoId: number) => {
    if (!user || !finanzas || gastoId === undefined) return;

    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este gasto?"
    );
    if (!confirmDelete) return;

    try {
      const success = await deleteExpense(user.uid, periodo, gastoId);
      if (success) {
        setFinanzas((prev) =>
          prev
            ? {
                ...prev,
                gastosVariables: prev.gastosVariables.filter(
                  (g) => g.id !== gastoId
                ),
              }
            : prev
        );
        toast.showSuccess("Gasto variable eliminado exitosamente");
      } else {
        toast.showError("Error al eliminar el gasto");
      }
    } catch (error) {
      toast.showError("Error al eliminar el gasto");
      console.error(error);
    }
  };

  const handleEditGasto = async (updatedData: Gasto) => {
    if (!user || !finanzas || !gastoEditando) return;

    try {
      const success = await editExpense(
        user.uid,
        periodo,
        gastoEditando.id,
        updatedData
      );
      if (success) {
        setFinanzas((prev) =>
          prev
            ? {
                ...prev,
                gastosVariables: prev.gastosVariables.map((g) =>
                  g.id === gastoEditando.id ? { ...g, ...updatedData } : g
                ),
              }
            : prev
        );
        setEditModalOpen(false);
        toast.showSuccess("Gasto variable actualizado exitosamente");
      } else {
        toast.showError("Error al actualizar el gasto");
      }
    } catch (error) {
      toast.showError("Error al actualizar el gasto");
      console.error(error);
    }
  };
  //#endregion

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
                onChange={(e) => setPeriodo(e.target.value)}
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
              dayjs(finanzas.fechaCobro).format("DD/MM/YYYY")
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
              {finanzas?.gastosVariables
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
