"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import {
  createPeriodIfNotExists,
  editExpense,
  getFinancialData,
  listAllPeriods,
  getCategories,
} from "@/lib/finanzasService";
import { Finanzas } from "@/models/finanzas.model";
import { Categorias } from "@/models/categorias.model";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Gasto } from "@/models/gasto.model";
import { MenuItem } from "@mui/material";
//import { getLatestFinancialPeriod } from "@/lib/finanzasService";
import { formatCurrency } from "@/lib/utils";
import { Edit, DeleteRounded, HelpOutline } from "@mui/icons-material";
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
import { deleteExpense } from "@/lib/finanzasService";
import DateWrapper from "./components/DateWrapper";
import AgregarGastos from "./components/AgregarGastos";
import WelcomeMessage from "./components/WelcomeMessage";
import { Search } from "@mui/icons-material";

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  // Helper function to convert Firebase Timestamp to Date
  const convertFirebaseTimestamp = (timestamp: unknown): Date | string => {
    if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return timestamp as string;
  };

  // Function to render the appropriate icon based on the icon name
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
  };

  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [periodosDisponibles, setPeriodosDisponibles] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState(""); // Inicializar vacío hasta detectar tipo de usuario
  const [loading, setLoading] = useState<boolean>(true);
  const [numGastos, setNumGastos] = useState(5);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [busquedaGastos, setBusquedaGastos] = useState("");
  const [categorias, setCategorias] = useState<Categorias[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
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
  //#endregion  //#region Dias restantes Cobro
  const diasCobro = useMemo(() => {
    if (!finanzas?.fechaCobro) return 0;

    const fechaCobroDate = convertFirebaseTimestamp(finanzas.fechaCobro);
    const fechaCobro = dayjs(fechaCobroDate);

    if (!fechaCobro.isValid()) return 0;

    return fechaCobro.diff(dayjs(), "day");
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
        const ids = allPeriods.map((p) => p.id); // Detectar si es usuario nuevo (no tiene períodos)
        const isUserNew = ids.length === 0;
        setIsNewUser(isUserNew);

        if (isUserNew) {
          setShowWelcome(true);
        } // Ordenamos los IDs (opcional)
        if (!isUserNew) {
          const current = dayjs().format("YYYY-MM");
          if (!ids.includes(current)) {
            ids.push(current);
            ids.sort();
          }
          // Solo establecer período para usuarios recurrentes
          if (!periodo) {
            setPeriodo(current);
          }
        }

        setPeriodosDisponibles(ids);

        // Cargar categorías también en este efecto para mantener todo sincronizado
        if (user) {
          const categoriasData = await getCategories(user.uid);
          setCategorias(categoriasData);
        }
      } catch (error) {
        console.error("Error listando periodos:", error);
        toast.showError("Error al cargar los datos");
      }
    })();
  }, [user, toast, periodo, modalOpen]);
  const fetchCurrentPeriodData = useCallback(async () => {
    if (!user || !periodo) return;

    // No crear período automáticamente si es usuario nuevo y aún no completó el wizard
    if (isNewUser && showWelcome) {
      setLoading(false);
      return;
    }

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
  }, [user, periodo, isNewUser, showWelcome]); // toast intencionalmente omitido para evitar bucles infinitos
  useEffect(() => {
    fetchCurrentPeriodData();
  }, [fetchCurrentPeriodData]);
  //#endregion
  // #region Gastos Funciones
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
  //#region Welcome Message Handlers
  const handleWelcomeComplete = async () => {
    setShowWelcome(false);
    setIsNewUser(false);

    // Refrescar los datos después de crear el primer período
    try {
      const allPeriods = await listAllPeriods(user?.uid || "");
      const ids = allPeriods.map((p) => p.id);
      ids.sort();

      const current = dayjs().format("YYYY-MM");
      if (!ids.includes(current)) {
        ids.push(current);
        ids.sort();
      }

      setPeriodosDisponibles(ids);

      // Establecer el período actual para el usuario
      setPeriodo(current);

      toast.showSuccess(
        "¡Bienvenido! Tu primer período ha sido creado exitosamente."
      );
    } catch (error) {
      console.error("Error refrescando datos:", error);
      toast.showError("Error al cargar los datos del nuevo período");
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
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
        </button>{" "}
      </div>

      {/* Solo mostrar contenido principal si no es usuario nuevo o ya completó el wizard */}
      {(!isNewUser || !showWelcome) && (
        <>
          {/* Mensaje para usuarios nuevos que ya completaron el wizard */}
          {isNewUser && !showWelcome && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full max-w-7xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👋</span>
                <div>
                  <Typography
                    variant="h6"
                    className="font-semibold text-blue-800 mb-1"
                  >
                    ¡Bienvenido/a a tu nuevo gestor financiero!
                  </Typography>
                  <Typography variant="body2" className="text-blue-700">
                    Comienza agregando tus gastos fijos en el menú lateral o
                    registra tu primer gasto variable aquí.
                  </Typography>
                </div>
              </div>
            </div>
          )}

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
              </p>{" "}
              <p className="text-lg m-0">
                Fecha de Cobro:{" "}
                {loading ? (
                  <span className="w-full h-4 bg-gray-300 animate-pulse rounded-lg"></span>
                ) : finanzas?.fechaCobro ? (
                  dayjs(convertFirebaseTimestamp(finanzas.fechaCobro)).format(
                    "DD/MM/YYYY"
                  )
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h6 className="text-xl font-bold text-gray-800">
                  Transacciones de gastos variables
                </h6>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Buscar gasto..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                    value={busquedaGastos}
                    onChange={(e) => setBusquedaGastos(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
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
                    .filter((gasto) =>
                      gasto.descripcion
                        .toLowerCase()
                        .includes(busquedaGastos.toLowerCase())
                    )
                    .sort((a, b) => dayjs(b.fecha).diff(dayjs(a.fecha)))
                    .slice(0, numGastos)
                    .map((gasto, index) => (
                      <div
                        key={gasto.id}
                        ref={index === numGastos - 1 ? lastGastoRef : null}
                        className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                      >
                        {" "}
                        <div className="flex">
                          <div>
                            <p className="font-bold">{gasto.descripcion}</p>
                            {gasto.categoria && (
                              <div className="flex items-center gap-1">
                                {gasto.categoria?.icono &&
                                  renderIcon(gasto.categoria.icono)}
                                <p className="text-sm text-gray-700 font-medium">
                                  {gasto.categoria.nombre}
                                </p>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">
                              {dayjs(gasto.fecha).format("DD/MM/YYYY")}
                            </p>
                            <span className="text-red-500 font-bold">
                              -{formatCurrency(gasto.monto)}
                            </span>
                          </div>
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
              />{" "}
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
              <TextField
                select
                label="Categoría"
                fullWidth
                value={gastoEditando?.categoria?.id || ""}
                onChange={(e) => {
                  const selectedCategoria = categorias.find(
                    (cat) => cat.id === e.target.value
                  );
                  setGastoEditando((prev) =>
                    prev
                      ? {
                          ...prev,
                          categoria: selectedCategoria || {
                            id: "",
                            nombre: "",
                            icono: "",
                          },
                        }
                      : prev
                  );
                }}
                sx={{ marginBottom: "1rem" }}
              >
                {" "}
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    <div className="flex items-center gap-2">
                      {renderIcon(categoria.icono)}
                      <span>{categoria.nombre}</span>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
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
              </button>{" "}
            </DialogActions>
          </Dialog>
        </>
      )}

      <AgregarGastos
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGastoAgregado={handleGastoAgregado}
        periodo={periodo}
      />

      <WelcomeMessage
        open={showWelcome}
        onClose={handleWelcomeClose}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
}
