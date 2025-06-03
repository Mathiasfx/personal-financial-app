/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import {
  listAllPeriods,
  createPeriod,
  updatePeriod,
  //renamePeriod,
  deletePeriod,
} from "@/lib/finanzasService";
import dayjs, { Dayjs } from "dayjs";
import { Finanzas } from "@/models/finanzas.model";
import { formatCurrency } from "@/lib/utils";
import DateWrapper from "../components/DateWrapper";
import { DatePicker } from "@mui/x-date-pickers";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Timestamp } from "firebase/firestore/lite";
import { DeleteRounded, Edit } from "@mui/icons-material";

interface PeriodDoc {
  id: string;
  data: Finanzas;
}

export default function PeriodosAdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<PeriodDoc[]>([]);

  // Estado para modal / formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<{
    oldId?: string; // si existe => edit
    yearMonth: string; // ID del doc
    ingresos: number;
    ingresosExtras: number;
    inversiones: number;
    fechaCobro: Dayjs | null;
  } | null>(null);
  // Al montar, listamos los períodos
  useEffect(() => {
    if (!user) return;
    loadPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // toast intencionalmente omitido para evitar bucles infinitos
  async function loadPeriods() {
    if (!user) return;
    setLoading(true);
    try {
      const results = await listAllPeriods(user.uid); // Ordenar si quieres
      results.sort((a, b) => a.id.localeCompare(b.id));
      setPeriods(
        results.map((period) => ({
          id: period.id,
          data: period.data as Finanzas,
        }))
      );
      // Removida notificación redundante de carga exitosa
    } catch (error) {
      console.error("Error listando periodos:", error);
      toast.showError("Error al cargar los períodos");
    } finally {
      setLoading(false);
    }
  }

  // Abre formulario vacío => CREAR
  function handleOpenCreate() {
    setFormState({
      oldId: undefined,
      yearMonth: dayjs().format("YYYY-MM"), // Por defecto hoy
      ingresos: 0,
      ingresosExtras: 0,
      inversiones: 0,
      fechaCobro: null,
    });
    setModalOpen(true);
  }

  // Abre formulario con data => EDIT
  function handleOpenEdit(period: PeriodDoc) {
    setFormState({
      oldId: period.id,
      yearMonth: period.id,
      ingresos: period.data.ingresos || 0,
      ingresosExtras: period.data.ingresosExtras || 0,
      inversiones: period.data.inversiones || 0,
      fechaCobro: period.data.fechaCobro
        ? dayjs(period.data.fechaCobro.toDate())
        : null,
    });
    setModalOpen(true);
  }
  // Guardar (crear o editar)
  async function handleSubmitForm() {
    if (!formState || !user) return;

    const {
      oldId,
      yearMonth,
      ingresos,
      ingresosExtras,
      inversiones,
      fechaCobro,
    } = formState;

    // Validar campos requeridos
    if (!yearMonth || ingresos < 0 || ingresosExtras < 0 || inversiones < 0) {
      toast.showWarning("Por favor completa todos los campos correctamente");
      return;
    }

    try {
      const dataToSave = {
        ingresos,
        ingresosExtras,
        inversiones,
        fechaCobro: fechaCobro ? Timestamp.fromDate(fechaCobro.toDate()) : null,
      };

      // CREAR
      if (!oldId) {
        await createPeriod(user.uid, yearMonth, dataToSave);
        toast.showSuccess("Período creado exitosamente");
      } else {
        // EDIT: si no cambió el ID => update
        if (oldId === yearMonth) {
          await updatePeriod(user.uid, yearMonth, dataToSave);
          toast.showSuccess("Período actualizado exitosamente");
        } else {
          // EDIT: si cambió el ID => rename + update
          // await renamePeriod(user.uid, oldId, yearMonth);
          // await updatePeriod(user.uid, yearMonth, dataToSave);
          toast.showWarning("Cambio de ID de período no implementado");
        }
      }

      // Refrescar
      setModalOpen(false);
      loadPeriods();
    } catch (error) {
      console.error(error);
      toast.showError(
        "Error al guardar el período: " + (error as Error).message
      );
    }
  }
  // Borrar
  async function handleDelete(id: string) {
    if (!user) return;
    const sure = window.confirm("¿Eliminar este período?");
    if (!sure) return;

    try {
      await deletePeriod(user.uid, id);
      loadPeriods();
      toast.showSuccess("Período eliminado exitosamente");
    } catch (error) {
      console.error(error);
      toast.showError("Error al eliminar el período");
    }
  }
  return (
    <div className="p-0 md:p-4">
      <div className="flex max-w-screen-lg justify-between items-center mb-4">
        <div className="w-full flex-col items-start md:w-80 md:flex-row flex flex-1 justify-start md:items-center">
          <h1 className="text-xl font-bold m-0 md:mr-5">
            Administrar Períodos
          </h1>
        </div>

        <button
          className="flex items-center gap-2 px-6 border-none py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300 mb-2"
          onClick={handleOpenCreate}
        >
          <span className="text-lg font-bold">Crear Nuevo Período</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-5xl">
        {/* Card contenedor */}
        <div className="bg-white shadow-md rounded-2xl p-6 min-h-[180px]">
          {loading && <p className="text-gray-500 text-center">Cargando...</p>}

          {!loading && periods.length === 0 && (
            <p className="text-gray-500 text-center">
              No hay períodos creados todavía.
            </p>
          )}

          {!loading &&
            periods.length > 0 &&
            periods
              .sort((a, b) => b.id.localeCompare(a.id)) // Ordenar por fecha más reciente primero
              .map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm w-full mb-3"
                >
                  <div>
                    <p className="text-lg font-bold">{p.id}</p>
                    <p className="text-sm text-gray-500">
                      Ingresos: {formatCurrency(p.data.ingresos || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ingresos Extras:{" "}
                      {formatCurrency(p.data.ingresosExtras || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Inversiones: {formatCurrency(p.data.inversiones || 0)}
                    </p>
                    {p.data.fechaCobro && (
                      <p className="text-sm font-semibold text-gray-700">
                        Fecha de Cobro:{" "}
                        {dayjs(p.data.fechaCobro.toDate()).format("DD/MM/YYYY")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-x-2">
                    <div className="w-full flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                      >
                        <Edit className="w-5 h-5 text-gray-700 m-1" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                      >
                        <DeleteRounded className="w-5 h-5 text-red-500 m-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {formState && (
        <Dialog
          open={modalOpen}
          onClose={setModalOpen}
          fullWidth
          maxWidth="sm"
          // Opcional, para redondear el fondo
          slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
        >
          <DialogTitle>
            {formState.oldId ? "Editar Período" : "Crear Período"}
          </DialogTitle>
          <DialogContent>
            {/* Seleccionar el Período (YYYY-MM) */}
            <DateWrapper>
              <DatePicker
                label="Período (YYYY-MM)"
                views={["year", "month"]} // Solo año + mes
                value={
                  formState.yearMonth
                    ? dayjs(`${formState.yearMonth}-01`)
                    : null
                }
                onChange={(newValue: Dayjs | null) => {
                  if (newValue) {
                    setFormState({
                      ...formState,
                      yearMonth: newValue.format("YYYY-MM"),
                    });
                  }
                }}
                sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
              />
            </DateWrapper>

            {/* Ingresos */}
            <TextField
              label="Ingresos"
              type="number"
              fullWidth
              value={formState.ingresos}
              onChange={(e) =>
                setFormState({ ...formState, ingresos: Number(e.target.value) })
              }
              sx={{ marginBottom: "1rem", marginTop: "1rem" }}
            />

            {/* Inversiones */}
            <TextField
              label="Inversiones"
              type="number"
              fullWidth
              value={formState.inversiones}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  inversiones: Number(e.target.value),
                })
              }
              sx={{ marginBottom: "1rem" }}
            />
            {/* Igresos extras */}
            <TextField
              label="Ingresos Extras"
              type="number"
              fullWidth
              value={formState.ingresosExtras}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  ingresosExtras: Number(e.target.value),
                })
              }
              sx={{ marginBottom: "1rem" }}
            />

            {/* Fecha Cobro */}
            <DateWrapper>
              <DatePicker
                label="Fecha Cobro"
                value={formState.fechaCobro}
                onChange={(newValue: Dayjs | null) => {
                  setFormState({ ...formState, fechaCobro: newValue });
                }}
                sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
              />
            </DateWrapper>
          </DialogContent>
          <DialogActions>
            <button
              className="flex items-center gap-2 px-6 py-3 text-white bg-red-500 rounded-full shadow-sm hover:bg-red-800 border-none"
              onClick={() => setModalOpen(false)}
            >
              <span className="text-sm font-bold">Cancelar</span>
            </button>

            <button
              className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
              onClick={handleSubmitForm}
            >
              <span className="text-sm font-bold">Guardar</span>
            </button>
          </DialogActions>{" "}
        </Dialog>
      )}
    </div>
  );
}
