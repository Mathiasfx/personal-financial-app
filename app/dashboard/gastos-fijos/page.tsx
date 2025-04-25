/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
//redux
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGastosFijos,
  selectGastosFijos,
  selectGastosFijosLoading,
  selectPeriodoGastos,
  toggleEstadoGastoFijo,
  editarGastoFijo,
  crearGastoFijo,
  eliminarGastoFijo,
} from "@/app/redux/slices/gastosFijos";
import { AppDispatch } from "@/app/redux/store";
//redux
import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { Add, DeleteRounded, Edit } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { GastoFijo } from "@/models/gasto.model";
import { MenuItem, Switch } from "@mui/material";
import DateWrapper from "../components/DateWrapper";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { formatCurrency } from "@/lib/utils";

import {
  fetchCategorias,
  selectCategorias,
} from "@/app/redux/slices/categorias";

export default function GastosFijosPage() {
  const { user } = useAuth();

  const dispatch = useDispatch<AppDispatch>();
  const gastosFijos = useSelector(selectGastosFijos);
  const total = useMemo(
    () => gastosFijos.reduce((sum, gasto) => sum + gasto.monto, 0),
    [gastosFijos]
  );

  const loading = useSelector(selectGastosFijosLoading);
  const periodo = useSelector(selectPeriodoGastos);
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
  const categoriasDB = useSelector(selectCategorias);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchGastosFijos(user.uid));
      dispatch(fetchCategorias(user.uid));
    }
  }, [user, dispatch]);

  //#region Manejar estado del gasto
  const handleTogglePayment = async (gastoNombre: string, pagado: boolean) => {
    if (user && periodo) {
      await dispatch(
        toggleEstadoGastoFijo({
          uid: user.uid,
          periodo,
          nombre: gastoNombre,
          pagado,
        })
      );
    }
  };

  //#endregion

  //#region Editar Gasto Fijo
  // const handleOpenEditModal = (gastoNombre: string, gasto: GastoFijo) => {
  //   if (gasto !== null) {
  //     setGastoEditando({ ...gasto, descripcion: gastoNombre });
  //     setEditModalOpen(true);
  //   }
  // };

  const handleEditGasto = async () => {
    if (user && gastoEditando && periodo) {
      await dispatch(
        editarGastoFijo({ uid: user.uid, periodo, gasto: gastoEditando })
      );
      setEditModalOpen(false);
    }
  };

  //#endregion

  //#region Agregar Gasto Fijo
  const handleAddGastoFijo = async () => {
    if (
      user &&
      periodo &&
      nuevoGasto.descripcion &&
      nuevoGasto.monto &&
      nuevoGasto.categoria
    ) {
      await dispatch(
        crearGastoFijo({ uid: user.uid, periodo, gasto: nuevoGasto })
      );
      setAddModalOpen(false);
    }
  };

  //#endregion

  //#region Eliminar Gasto Fijo
  const handleDeleteGastoFijo = async (gastoNombre: string) => {
    if (user && periodo) {
      await dispatch(
        eliminarGastoFijo({ uid: user.uid, periodo, nombre: gastoNombre })
      );
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

      {/* Lista de gastos fijos ordenada por fecha */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-5xl ">
        <div className="bg-white shadow-md rounded-2xl p-6 min-h-[180px]">
          {gastosFijos.length > 0 ? (
            [...gastosFijos]
              .sort((a, b) => {
                const fechaA =
                  a.fechaVencimiento instanceof Date
                    ? a.fechaVencimiento
                    : new Date();
                const fechaB =
                  b.fechaVencimiento instanceof Date
                    ? b.fechaVencimiento
                    : new Date();
                return fechaA.getTime() - fechaB.getTime();
              })
              .map((gasto) => (
                <div
                  key={gasto.descripcion}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm w-full mb-3"
                >
                  <div>
                    <p className="text-lg font-bold">{gasto.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      Monto: {formatCurrency(gasto.monto)}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {gasto.categoria?.nombre}
                    </p>
                    {gasto.fechaVencimiento && (
                      <p className="text-sm text-gray-500">
                        {dayjs(
                          gasto.fechaVencimiento instanceof Date
                            ? gasto.fechaVencimiento
                            : "seconds" in gasto.fechaVencimiento
                            ? new Date(gasto.fechaVencimiento.seconds * 1000)
                            : new Date()
                        ).format("DD/MM/YYYY")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-x-2">
                    <Switch
                      checked={gasto.pagado}
                      onChange={() =>
                        handleTogglePayment(gasto.descripcion, !gasto.pagado)
                      }
                      color="success"
                      className="mb-6"
                    />
                    <div className="w-full flex justify-center items-center gap-2">
                      <button
                        onClick={() => {
                          setGastoEditando(gasto);
                          setEditModalOpen(true);
                        }}
                        className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                      >
                        <Edit className="w-5 h-5 text-gray-700 m-1" />
                      </button>
                      <button
                        onClick={() => handleDeleteGastoFijo(gasto.descripcion)}
                        className="rounded-full border-none bg-gray-300 hover:bg-gray-400 transition-all"
                      >
                        <DeleteRounded className="w-5 h-5 text-red-500 m-1" />
                      </button>
                    </div>
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
          <TextField
            select
            label="Categoría"
            fullWidth
            value={nuevoGasto.categoria?.id || ""}
            onChange={(e) => {
              const selectedCategoria = categoriasDB.find(
                (cat) => cat.id === e.target.value
              );
              if (selectedCategoria) {
                setNuevoGasto((prev) => ({
                  ...prev,
                  categoria: selectedCategoria,
                }));
              }
            }}
            sx={{ marginBottom: "1rem", marginTop: "1rem" }}
          >
            {categoriasDB.length > 0 ? (
              categoriasDB.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando categorías...</MenuItem>
            )}
          </TextField>

          <DateWrapper>
            <DatePicker
              label="Fecha de Vencimiento"
              format="DD/MM/YYYY"
              value={
                nuevoGasto.fechaVencimiento
                  ? dayjs(
                      nuevoGasto.fechaVencimiento instanceof Date
                        ? nuevoGasto.fechaVencimiento
                        : "seconds" in nuevoGasto.fechaVencimiento
                        ? new Date(nuevoGasto.fechaVencimiento.seconds * 1000)
                        : nuevoGasto.fechaVencimiento
                    )
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
          <TextField
            select
            label="Categoría"
            fullWidth
            value={gastoEditando?.categoria?.id || ""}
            onChange={(e) => {
              const selectedCategoria = categoriasDB.find(
                (cat) => cat.id === e.target.value
              );
              if (selectedCategoria) {
                setGastoEditando((prev) =>
                  prev
                    ? {
                        ...prev,
                        categoria: selectedCategoria,
                      }
                    : null
                );
              }
            }}
            sx={{ marginBottom: "1rem", marginTop: "1rem" }}
          >
            {categoriasDB.length > 0 ? (
              categoriasDB.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando categorías...</MenuItem>
            )}
          </TextField>

          <DateWrapper>
            {gastoEditando && (
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha de Vencimiento"
                value={
                  gastoEditando?.fechaVencimiento
                    ? dayjs(
                        gastoEditando.fechaVencimiento instanceof Timestamp
                          ? gastoEditando.fechaVencimiento.toDate() // Si es Timestamp, conviértelo a Date
                          : "seconds" in gastoEditando.fechaVencimiento // Si es un objeto con seconds/nanoseconds
                          ? new Date(
                              gastoEditando.fechaVencimiento.seconds * 1000
                            )
                          : gastoEditando.fechaVencimiento // Si ya es Date, úsalo directamente
                      )
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
