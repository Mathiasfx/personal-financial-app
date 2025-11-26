/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import {
  Add,
  DeleteRounded,
  Edit,
  HelpOutline,
  Search,
} from "@mui/icons-material";
import {
  ShoppingCart,
  DirectionsCar,
  Fastfood,
  Movie,
  FitnessCenter,
  LocalHospital,
  Home,
  Flight,
  SportsSoccer,
  Restaurant,
  Work,
  School,
  ShoppingBag,
  LocalGasStation,
  ElectricalServices,
  WaterDrop,
  Wifi,
  MedicalServices,
  LocalPharmacy,
  TheaterComedy,
  MusicNote,
  Nightlight,
  SportsEsports,
  AttachMoney,
  CreditCard,
  Receipt,
  AccountBalance,
  Savings,
  AccountBalanceWallet,
  Pets,
  ChildCare,
  Spa,
  Celebration,
  Cake,
  PhoneAndroid,
  Laptop,
  DevicesOther,
  Public,
  BeachAccess,
  Park,
  Hotel,
  Train,
  DirectionsBus,
  LocalTaxi,
  TwoWheeler,
  Brush,
  LibraryBooks,
  LocalLaundryService,
  CleaningServices,
  Favorite,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import {
  getFinancialData,
  getLatestFinancialPeriod,
  updateExpenseStatus,
  addExpense,
  updateExpense,
  deleteFixedExpense,
  getCategories,
} from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
import { GastoFijo } from "@/models/gasto.model";
import { MenuItem, Switch } from "@mui/material";
import DateWrapper from "../components/DateWrapper";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { formatCurrency, sumaGastoFijoTotal, dayjsToDate } from "@/lib/utils";
import { Finanzas } from "@/models/finanzas.model";
import { Categorias } from "@/models/categorias.model";

export default function GastosFijosPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPagado, setTotalPagado] = useState(0);
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [busqueda, setBusqueda] = useState("");
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
  const [categoriasDB, setCategoriasDB] = useState<Categorias[]>([]);

  // IconMap para renderizar el icono correcto según el nombre
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      // Compras y Gastos Diarios
      case "ShoppingCart":
        return <ShoppingCart className="text-gray-700" />;
      case "ShoppingBag":
        return <ShoppingBag className="text-gray-700" />;
      case "Restaurant":
        return <Restaurant className="text-gray-700" />;
      case "Fastfood":
        return <Fastfood className="text-gray-700" />;

      // Transporte
      case "DirectionsCar":
        return <DirectionsCar className="text-gray-700" />;
      case "LocalGasStation":
        return <LocalGasStation className="text-gray-700" />;
      case "Flight":
        return <Flight className="text-gray-700" />;
      case "Train":
        return <Train className="text-gray-700" />;
      case "DirectionsBus":
        return <DirectionsBus className="text-gray-700" />;
      case "LocalTaxi":
        return <LocalTaxi className="text-gray-700" />;
      case "TwoWheeler":
        return <TwoWheeler className="text-gray-700" />;

      // Hogar y Servicios
      case "Home":
        return <Home className="text-gray-700" />;
      case "ElectricalServices":
        return <ElectricalServices className="text-gray-700" />;
      case "WaterDrop":
        return <WaterDrop className="text-gray-700" />;
      case "Wifi":
        return <Wifi className="text-gray-700" />;
      case "LocalLaundryService":
        return <LocalLaundryService className="text-gray-700" />;
      case "CleaningServices":
        return <CleaningServices className="text-gray-700" />;

      // Salud y Bienestar
      case "LocalHospital":
        return <LocalHospital className="text-gray-700" />;
      case "MedicalServices":
        return <MedicalServices className="text-gray-700" />;
      case "LocalPharmacy":
        return <LocalPharmacy className="text-gray-700" />;
      case "FitnessCenter":
        return <FitnessCenter className="text-gray-700" />;
      case "Spa":
        return <Spa className="text-gray-700" />;

      // Entretenimiento y Ocio
      case "Movie":
        return <Movie className="text-gray-700" />;
      case "TheaterComedy":
        return <TheaterComedy className="text-gray-700" />;
      case "MusicNote":
        return <MusicNote className="text-gray-700" />;
      case "Nightclub":
        return <Nightlight className="text-gray-700" />;
      case "SportsEsports":
        return <SportsEsports className="text-gray-700" />;
      case "SportsSoccer":
        return <SportsSoccer className="text-gray-700" />;

      // Finanzas y Pagos
      case "AttachMoney":
        return <AttachMoney className="text-gray-700" />;
      case "CreditCard":
        return <CreditCard className="text-gray-700" />;
      case "Receipt":
        return <Receipt className="text-gray-700" />;
      case "AccountBalance":
        return <AccountBalance className="text-gray-700" />;
      case "Savings":
        return <Savings className="text-gray-700" />;
      case "AccountBalanceWallet":
        return <AccountBalanceWallet className="text-gray-700" />;

      // Trabajo y Educación
      case "Work":
        return <Work className="text-gray-700" />;
      case "School":
        return <School className="text-gray-700" />;
      case "LibraryBooks":
        return <LibraryBooks className="text-gray-700" />;

      // Viajes y Turismo
      case "Hotel":
        return <Hotel className="text-gray-700" />;
      case "BeachAccess":
        return <BeachAccess className="text-gray-700" />;
      case "Public":
        return <Public className="text-gray-700" />;
      case "Park":
        return <Park className="text-gray-700" />;

      // Tecnología
      case "PhoneAndroid":
        return <PhoneAndroid className="text-gray-700" />;
      case "Laptop":
        return <Laptop className="text-gray-700" />;
      case "DevicesOther":
        return <DevicesOther className="text-gray-700" />;

      // Eventos y Celebraciones
      case "Celebration":
        return <Celebration className="text-gray-700" />;
      case "Cake":
        return <Cake className="text-gray-700" />;

      // Mascotas y Familia
      case "Pets":
        return <Pets className="text-gray-700" />;
      case "ChildCare":
        return <ChildCare className="text-gray-700" />; // Arte y Creatividad
      case "Brush":
        return <Brush className="text-gray-700" />; // Personal
      case "Favorite":
        return <Favorite className="text-gray-700" />;

      // Categoría eliminada o desconocida
      case "QuestionMark":
        return <HelpOutline className="text-gray-700" />;

      default:
        return <ShoppingCart className="text-gray-700" />;
    }
  }; //#region Carga de Categorias
  useEffect(() => {
    if (user) {
      const fetchCategorias = async () => {
        try {
          const categorias = await getCategories(user.uid);
          setCategoriasDB(categorias);
        } catch (error) {
          console.error("Error loading categories:", error);
          toast.showError("Error al cargar las categorías");
        }
      };
      fetchCategorias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, editModalOpen, addModalOpen]); // Recargamos categorías cuando se abre cualquier modal
  //#endregion

  //#region Fetch Finanzas Periodo Actual
  useEffect(() => {
    if (!user) return;
    const fetchFinanzas = async () => {
      try {
        const periodoActual = await getLatestFinancialPeriod(user.uid);
        setPeriodo(periodoActual);

        const data = (await getFinancialData(
          user.uid,
          periodoActual
        )) as Finanzas;
        if (data !== null) {
          setFinanzas(data);
          // Removida notificación redundante de carga exitosa
        }
      } catch (error) {
        console.error("Error loading financial data:", error);
        toast.showError("Error al cargar los datos financieros");
      }
    };
    fetchFinanzas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // toast intencionalmente omitido para evitar bucles infinitos
  //#endregion

  //#region Set Total de Gastos Fijos
  useEffect(() => {
    if (finanzas?.gastosFijos) {
      const gastos = Object.values(finanzas.gastosFijos) as GastoFijo[];
      const totalCalculado = sumaGastoFijoTotal(gastos);
      const pagado = gastos
        .filter((gasto) => gasto.pagado)
        .reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
      const pendiente = totalCalculado - pagado;

      setTotal(totalCalculado);
      setTotalPagado(pagado);
      setTotalPendiente(pendiente);
    } else {
      setTotal(0);
      setTotalPagado(0);
      setTotalPendiente(0);
    }
  }, [finanzas?.gastosFijos]);
  //#endregion
  //#region Manejar estado del gasto
  const handleTogglePayment = async (gastoNombre: string, pagado: boolean) => {
    if (!user || !finanzas) return;

    try {
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
        toast.showSuccess(
          `Gasto fijo marcado como ${pagado ? "pagado" : "no pagado"}`
        );
      } else {
        toast.showError("Error al actualizar el estado del gasto");
      }
    } catch (error) {
      console.error("Error updating expense status:", error);
      toast.showError("Error al actualizar el estado del gasto");
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
    if (!user || !finanzas || !gastoEditando || !gastoEditando.categoria) {
      toast.showWarning("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const fechaVencimiento =
        gastoEditando.fechaVencimiento instanceof Date
          ? gastoEditando.fechaVencimiento
          : gastoEditando.fechaVencimiento &&
            "seconds" in gastoEditando.fechaVencimiento
          ? new Date(gastoEditando.fechaVencimiento.seconds * 1000)
          : gastoEditando.fechaVencimiento;

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
                fechaVencimiento,
                categoria: gastoEditando.categoria,
              },
            },
          };
        });
        setGastoEditando({
          monto: 0,
          descripcion: "",
          pagado: false,
          fechaVencimiento: dayjs().toDate(),
          categoria: { id: "", nombre: "", icono: "" },
        });
        setEditModalOpen(false);
        toast.showSuccess("Gasto fijo actualizado exitosamente");
      } else {
        toast.showError("Error al actualizar el gasto fijo");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.showError("Error al actualizar el gasto fijo");
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
    if (
      !user ||
      !nuevoGasto.descripcion ||
      !nuevoGasto.monto ||
      !nuevoGasto.categoria
    ) {
      toast.showWarning("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const fechaVencimiento =
        nuevoGasto.fechaVencimiento instanceof Date
          ? nuevoGasto.fechaVencimiento
          : nuevoGasto.fechaVencimiento &&
            "seconds" in nuevoGasto.fechaVencimiento
          ? new Date(nuevoGasto.fechaVencimiento.seconds * 1000)
          : nuevoGasto.fechaVencimiento;

      const success = await addExpense(user.uid, periodo, {
        ...nuevoGasto,
        fechaVencimiento,
      });

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
                fechaVencimiento,
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
        toast.showSuccess("Gasto fijo agregado exitosamente");
      } else {
        toast.showError("Error al agregar el gasto fijo");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.showError("Error al agregar el gasto fijo");
    }
  };
  //#endregion
  //#region Eliminar Gasto Fijo
  const handleDeleteGastoFijo = async (gastoNombre: string) => {
    if (!user || !finanzas) return;

    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este gasto fijo?"
    );
    if (!confirmDelete) return;

    try {
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
        toast.showSuccess("Gasto fijo eliminado exitosamente");
      } else {
        toast.showError("Error al eliminar el gasto fijo");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.showError("Error al eliminar el gasto fijo");
    }
  };
  //#endregion

  return (
    <div className="px-0 md:px-0 w-full">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full">
            <h1 className="text-xl font-bold">Gastos Fijos</h1>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-xl font-medium text-gray-700">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Pagado</span>
                <span className="text-xl font-medium text-green-600">
                  {formatCurrency(totalPagado)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Pendiente</span>
                <span
                  className={`text-xl font-medium ${
                    totalPendiente > 0 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {formatCurrency(totalPendiente)}
                </span>
              </div>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar gasto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full mt-4 md:mt-0 md:w-auto md:ml-4">
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 w-full text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              onClick={() => setAddModalOpen(true)}
            >
              <Add className="text-xl font-bold flex-shrink-0" />
              <span className="text-lg font-bold">Gasto Fijo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Card contenedor */}
        <div className="bg-white shadow-md rounded-2xl p-6 min-h-[180px]">
          {finanzas?.gastosFijos ? (
            Object.entries(finanzas.gastosFijos)
              .filter(([nombreGasto, _]) =>
                nombreGasto.toLowerCase().includes(busqueda.toLowerCase())
              )
              .sort(([_, gastoA], [__, gastoB]) => {
                // Si uno está pagado y el otro no, el pagado va primero
                if (gastoA.pagado && !gastoB.pagado) return -1;
                if (!gastoA.pagado && gastoB.pagado) return 1;

                // Si ambos están pagados, mantener el orden original
                if (gastoA.pagado && gastoB.pagado) return 0;

                // Solo ordenar por fecha si ambos están sin pagar
                const fechaA = gastoA.fechaVencimiento
                  ? gastoA.fechaVencimiento instanceof Date
                    ? gastoA.fechaVencimiento
                    : (gastoA.fechaVencimiento as Timestamp).toDate()
                  : new Date(0); // Fecha muy antigua si no hay fecha

                const fechaB = gastoB.fechaVencimiento
                  ? gastoB.fechaVencimiento instanceof Date
                    ? gastoB.fechaVencimiento
                    : (gastoB.fechaVencimiento as Timestamp).toDate()
                  : new Date(0);

                return fechaA.getTime() - fechaB.getTime();
              })
              .map(([nombre, gasto]) => (
                <div
                  key={nombre}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm w-full mb-3"
                >
                  {" "}
                  <div className="flex">
                    <div>
                      <p className="text-lg font-bold">{nombre}</p>
                      <p className="text-sm text-gray-500">
                        Monto: {formatCurrency(gasto.monto)}
                      </p>
                      <div className="flex items-center gap-1">
                        {gasto.categoria?.icono &&
                          renderIcon(gasto.categoria.icono)}
                        <p className="text-sm font-semibold text-gray-700">
                          {gasto.categoria?.nombre}
                        </p>
                      </div>
                      {gasto.fechaVencimiento && (
                        <p className="text-sm text-gray-500">
                          {(gasto.fechaVencimiento instanceof Date
                            ? gasto.fechaVencimiento // ya es Date
                            : (gasto.fechaVencimiento as Timestamp).toDate()
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-x-2">
                    <Switch
                      checked={gasto.pagado}
                      onChange={() =>
                        handleTogglePayment(nombre, !gasto.pagado)
                      }
                      color="success"
                      className="mb-6"
                    />
                    <div className="w-full flex justify-center items-center gap-2">
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
            value={nuevoGasto.monto === 0 ? "" : nuevoGasto.monto.toString()}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/[^0-9.,]/g, "");
              rawValue = rawValue.replace(",", ".");
              setNuevoGasto({
                ...nuevoGasto,
                monto: rawValue === "" ? 0 : parseFloat(rawValue) || 0,
              });
            }}
            sx={{ marginBottom: "1rem" }}
          />{" "}
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
                  <div className="flex items-center gap-2">
                    {renderIcon(cat.icono)}
                    <span>{cat.nombre}</span>
                  </div>
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
                  fechaVencimiento: dayjsToDate(newValue) || undefined,
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
          ></TextField>{" "}
          <TextField
            label="Monto"
            inputMode="decimal"
            type="text"
            fullWidth
            value={
              gastoEditando?.monto === 0 ? "" : gastoEditando?.monto.toString()
            }
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
            {" "}
            {categoriasDB.length > 0 ? (
              categoriasDB.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {renderIcon(cat.icono)}
                    <span>{cat.nombre}</span>
                  </div>
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
                  const newDate = dayjsToDate(newValue);
                  if (newDate) {
                    setGastoEditando((prev) =>
                      prev
                        ? {
                            ...prev,
                            fechaVencimiento: newDate,
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
