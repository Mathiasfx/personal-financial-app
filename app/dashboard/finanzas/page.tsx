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
import dayjs from "dayjs";
import { Finanzas } from "@/models/finanzas.model";
import { formatCurrency } from "@/lib/utils";

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
    inversiones: number;
    fechaCobro: string; // puedes poner string o dayjs
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
      inversiones: 0,
      fechaCobro: "",
    });
    setModalOpen(true);
  }

  // Abre formulario con data => EDIT
  function handleOpenEdit(period: PeriodDoc) {
    setFormState({
      oldId: period.id,
      yearMonth: period.id,
      ingresos: period.data.ingresos || 0,
      inversiones: period.data.inversiones || 0,
      fechaCobro: period.data.fechaCobro.toDate().toLocaleDateString() || "",
    });
    setModalOpen(true);
  }

  // Guardar (crear o editar)
  async function handleSubmitForm() {
    if (!formState || !user) return;
    const { oldId, yearMonth, ingresos, inversiones, fechaCobro } = formState;

    try {
      const dataToSave = {
        ingresos,
        inversiones,
        fechaCobro,
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
        className="px-4 py-2 bg-gray-800 text-white rounded-lg mb-4"
        onClick={handleOpenCreate}
      >
        Crear Nuevo Período
      </button>

      {loading && <p>Cargando...</p>}

      {!loading && periods.length === 0 && (
        <p>No hay períodos creados todavía.</p>
      )}

      {!loading && periods.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-2 py-2">Período (ID)</th>
              <th className="px-2 py-2">Ingresos</th>
              <th className="px-2 py-2">Inversiones</th>
              <th className="px-2 py-2">Fecha de Cobro</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-2 py-2">{p.id}</td>
                <td className="px-2 py-2">
                  {formatCurrency(p.data.ingresos) || 0}
                </td>
                <td className="px-2 py-2">
                  {formatCurrency(p.data.inversiones) || 0}
                </td>
                <td className="px-2 py-2">
                  {dayjs(p.data.fechaCobro.toDate()).format("DD/MM/YYYY")}
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="mr-2 px-2 py-1 bg-yellow-400 rounded-md text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-2 py-1 bg-red-400 rounded-md text-sm"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal simple */}
      {modalOpen && formState && (
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

            <label className="block mb-1 font-medium text-sm">
              ID (YYYY-MM)
            </label>
            <input
              className="border rounded-md w-full mb-3 px-2 py-1"
              value={formState.yearMonth}
              onChange={(e) =>
                setFormState({ ...formState, yearMonth: e.target.value })
              }
            />

            <label className="block mb-1 font-medium text-sm">Ingresos</label>
            <input
              type="number"
              className="border rounded-md w-full mb-3 px-2 py-1"
              value={formState.ingresos}
              onChange={(e) =>
                setFormState({ ...formState, ingresos: Number(e.target.value) })
              }
            />

            <label className="block mb-1 font-medium text-sm">
              Inversiones
            </label>
            <input
              type="number"
              className="border rounded-md w-full mb-3 px-2 py-1"
              value={formState.inversiones}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  inversiones: Number(e.target.value),
                })
              }
            />

            <label className="block mb-1 font-medium text-sm">
              Fecha Cobro (YYYY-MM-DD)
            </label>
            <input
              className="border rounded-md w-full mb-3 px-2 py-1"
              value={formState.fechaCobro}
              onChange={(e) =>
                setFormState({ ...formState, fechaCobro: e.target.value })
              }
            />

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
      )}
    </div>
  );
}
