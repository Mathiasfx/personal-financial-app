/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  }, [user]);

  async function loadPeriods() {
    if (!user) return;
    setLoading(true);
    try {
      const results = await listAllPeriods(user.uid);
      // Ordenar si quieres
      results.sort((a, b) => a.id.localeCompare(b.id));
      setPeriods(
        results.map((period) => ({
          id: period.id,
          data: period.data as Finanzas,
        }))
      );
    } catch (error) {
      console.error("Error listando periodos:", error);
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
      fechaCobro: period.data.fechaCobro ? dayjs(period.data.fechaCobro) : null,
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
      } else {
        // EDIT: si no cambió el ID => update
        if (oldId === yearMonth) {
          await updatePeriod(user.uid, yearMonth, dataToSave);
        } else {
          // EDIT: si cambió el ID => rename + update
          // await renamePeriod(user.uid, oldId, yearMonth);
          // await updatePeriod(user.uid, yearMonth, dataToSave);
        }
      }

      // Refrescar
      setModalOpen(false);
      loadPeriods();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
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
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Administrar Períodos</h1>

      <button
        className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none mb-2"
        onClick={handleOpenCreate}
      >
        <span className="text-sm font-bold"> Crear Nuevo Período</span>
      </button>

      {loading && <p>Cargando...</p>}

      {!loading && periods.length === 0 && (
        <p>No hay períodos creados todavía.</p>
      )}

      {!loading && periods.length > 0 && (
        <div className="overflow-x-auto rounded-2xl shadow-md">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-700">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-2 py-2">Período (ID)</th>
                <th className="px-2 py-2">Ingresos</th>
                <th className="px-2 py-2">Ingresos Extras</th>
                <th className="px-2 py-2">Inversiones</th>
                <th className="px-2 py-2">Fecha de Cobro</th>
                <th className="px-2 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-100 transition-all"
                >
                  <td className="px-6 py-3">{p.id}</td>
                  <td className="px-2 py-2">
                    {formatCurrency(p.data.ingresos) || 0}
                  </td>
                  <td className="px-2 py-2">
                    {formatCurrency(p.data.ingresosExtras) || 0}
                  </td>
                  <td className="px-2 py-2">
                    {formatCurrency(p.data.inversiones) || 0}
                  </td>
                  <td className="px-2 py-2">
                    {p.data.fechaCobro
                      ? dayjs(p.data.fechaCobro).format("DD/MM/YYYY")
                      : ""}
                  </td>
                  <td className="px-6 py-3 flex space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="rounded-full border-none mr-1 bg-gray-300 hover:bg-gray-400 transition-all"
                    >
                      <Edit className="w-5 h-5 text-gray-700 m-1 " />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                    >
                      <DeleteRounded className="w-5 h-5 text-red-500 m-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          </DialogActions>
        </Dialog>
      )}
      {/* {modalOpen && formState && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-md p-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">
              {formState.oldId ? "Editar Período" : "Crear Período"}
            </h2>

            <DateWrapper>
              <DatePicker
                label="Período (YYYY-MM)"
                views={["year", "month"]} // Solo año + mes
                // Si no tienes un día definido, puedes armar un string "YYYY-MM" + día "01"
                // y lo pasas a dayjs para no tener problemas.
                value={
                  formState.yearMonth
                    ? dayjs(`${formState.yearMonth}-01`)
                    : null
                }
                onChange={(newValue: Dayjs | null) => {
                  if (newValue) {
                    // Guardas en tu estado solo "YYYY-MM"
                    setFormState({
                      ...formState,
                      yearMonth: newValue.format("YYYY-MM"),
                    });
                  }
                }}
                sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
              />
            </DateWrapper>

            <TextField
              label="Ingresos"
              type="number"
              fullWidth
              value={formState.ingresos}
              onChange={(e) =>
                setFormState({ ...formState, ingresos: Number(e.target.value) })
              }
            />

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
              sx={{ marginBottom: "1rem", marginTop: "1rem" }}
            />

            <DateWrapper>
              <DatePicker
                label=" Fecha Cobro "
                value={formState.fechaCobro}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue) {
                    setFormState({
                      ...formState,
                      fechaCobro: newValue,
                    });
                  }
                }}
                sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
              />
            </DateWrapper>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleSubmitForm}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
