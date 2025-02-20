"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Grid2 from "@mui/material/Grid2";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { editExpense, getFinancialData } from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
//import { DatePicker } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Gasto } from "@/models/gasto.model";
import { getLatestFinancialPeriod } from "@/lib/finanzasService";
import { formatCurrency } from "@/lib/utils";
import { Edit, DeleteRounded } from "@mui/icons-material";
import { deleteExpense } from "@/lib/finanzasService";
import DateWrapper from "./components/DateWrapper";

export default function Dashboard() {
  const { user } = useAuth();
  interface Finanzas {
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Timestamp;
    gastosFijos: {
      [key: string]: {
        monto: number;
        pagado: boolean;
        fechaVencimiento: Timestamp;
      };
    };
    gastosVariables: Gasto[];
  }
  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);

  const [periodo, setPeriodo] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [numGastos, setNumGastos] = useState(10);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  // Calcular total de gastos fijos pagados
  const totalGastosFijos = useMemo(() => {
    return Object.values(finanzas?.gastosFijos || {}).reduce(
      (sum, gasto) => sum + (gasto.pagado ? gasto.monto : 0),
      0
    );
  }, [finanzas]);

  // Calcular total de gastos variables
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
      (totalGastosFijos + totalGastosVariables)
    );
  }, [finanzas, totalGastosFijos, totalGastosVariables]);

  const diasCobro = useMemo(() => {
    if (!finanzas?.fechaCobro) return 0;
    return dayjs(finanzas.fechaCobro.toDate()).diff(dayjs(), "day");
  }, [finanzas]);

  const fetchFinanzas = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const periodoActual = await getLatestFinancialPeriod(user.uid);
      if (!periodoActual) {
        console.error("No se encontró un período financiero válido.");
        setLoading(false);
        return;
      }

      setPeriodo(periodoActual);

      const data = (await getFinancialData(
        user.uid,
        periodoActual
      )) as Finanzas;
      if (!data) {
        console.error("Los datos financieros son inválidos o nulos.");
        setLoading(false);
        return;
      }

      setFinanzas(data);
    } catch (error) {
      console.error("Error al obtener los datos financieros:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFinanzas();
  }, [fetchFinanzas]);

  //#region Gastos Funciones
  const handleDeleteExpense = async (gastoId: number) => {
    if (!user || !finanzas || gastoId === undefined) return;

    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este gasto?"
    );
    if (!confirmDelete) return;

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
    }
  };
  //#endregion

  return (
    <div className="p-0 md:p-4">
      {/* Sección de Cards principales */}
      <Grid2 container spacing={2}>
        <Grid2 sx={{ width: "100%", maxWidth: "600px" }}>
          <Card
            sx={{ boxShadow: "1", borderRadius: "24px", minHeight: "180px" }}
          >
            <CardContent>
              <h6 className="text-xl font-bold text-gray-800">
                Estado del mes {loading ? <Skeleton width={100} /> : periodo}
              </h6>
              <Typography>
                Ingresos:{" "}
                {loading ? (
                  <Skeleton width={120} />
                ) : (
                  formatCurrency(finanzas?.ingresos || 0)
                )}
              </Typography>
              <Typography>
                Inversiones:{" "}
                {loading ? (
                  <Skeleton width={120} />
                ) : (
                  formatCurrency(finanzas?.inversiones || 0)
                )}
              </Typography>
              <Typography>
                Fecha de Cobro:{" "}
                {loading ? (
                  <Skeleton width={100} />
                ) : finanzas?.fechaCobro ? (
                  dayjs(finanzas.fechaCobro.toDate()).format("DD/MM/YYYY")
                ) : (
                  "-"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 sx={{ width: "100%", maxWidth: "600px" }}>
          <Card
            sx={{
              boxShadow: "1",
              borderRadius: "24px",
              backgroundColor: "#171717",
              color: "#f9fafb",
            }}
          >
            <CardContent>
              <h6 className="text-xl font-bold text-[#F9BD24]">Resumen</h6>
              <p className="text-2xl font-normal">
                Disponible:{" "}
                {loading ? (
                  <Skeleton width={400} style={{ backgroundColor: "gray" }} />
                ) : (
                  formatCurrency(dineroDisponible)
                )}
              </p>
              <p className="text-lg font-normal">
                Días restantes:{" "}
                {loading ? (
                  <Skeleton width={120} style={{ backgroundColor: "gray" }} />
                ) : (
                  diasCobro
                )}
              </p>
              <p>
                Total Gastos Fijos:{" "}
                {loading ? (
                  <Skeleton width={220} style={{ backgroundColor: "gray" }} />
                ) : (
                  formatCurrency(totalGastosFijos)
                )}
              </p>
              <p>
                Total Gastos Variables:{" "}
                {loading ? (
                  <Skeleton width={220} style={{ backgroundColor: "gray" }} />
                ) : (
                  formatCurrency(totalGastosVariables)
                )}
              </p>
            </CardContent>
          </Card>
        </Grid2>

        {/* Sección de Gastos Variables - Ocupa toda la fila */}
        <Grid2 sx={{ width: "100%", maxWidth: "1216px" }}>
          <Card
            sx={{
              boxShadow: "1",
              borderRadius: "24px",
              minHeight: "180px",
              padding: "16px",
            }}
          >
            <h6 className="text-xl font-bold text-gray-800 mb-4">
              Gastos Variables
            </h6>

            {loading ? (
              <Grid2 container spacing={2}>
                {[1, 2, 3].map((_, index) => (
                  <Grid2 key={index} sx={{ width: "100%", maxWidth: "1200px" }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: "16px" }}
                    />
                  </Grid2>
                ))}
              </Grid2>
            ) : finanzas?.gastosVariables.length ? (
              <Grid2 container spacing={2}>
                {finanzas?.gastosVariables
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                  )
                  .slice(0, numGastos)
                  .map((gasto, index) => (
                    <Grid2
                      key={gasto.id}
                      ref={index === numGastos - 1 ? lastGastoRef : null}
                      sx={{ width: "100%", maxWidth: "1200px" }}
                    >
                      <Paper
                        sx={{
                          padding: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderRadius: "16px",
                          boxShadow: "1",
                          width: "100%",
                        }}
                      >
                        <div>
                          <Typography variant="body1" fontWeight="bold">
                            {gasto.descripcion}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(gasto.fecha).format("DD/MM/YYYY")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error"
                          >
                            -{formatCurrency(gasto.monto)}
                          </Typography>
                        </div>
                        <div className="flex justify-center items-center max-w-28 pr-4">
                          <IconButton
                            style={{ color: "#171717" }}
                            onClick={() => handleOpenEditModal(gasto)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteExpense(gasto.id)}
                          >
                            <DeleteRounded />
                          </IconButton>
                        </div>
                      </Paper>
                    </Grid2>
                  ))}
              </Grid2>
            ) : (
              <Typography variant="body2">No hay gastos variables</Typography>
            )}
          </Card>
        </Grid2>
      </Grid2>
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth="sm"
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
            sx={{ marginBottom: "1rem" }}
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
            sx={{ marginBottom: "1rem" }}
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
          <Button onClick={() => setEditModalOpen(false)} color="error">
            Cancelar
          </Button>
          <Button
            onClick={() => gastoEditando && handleEditGasto(gastoEditando)}
            variant="contained"
            color="primary"
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
