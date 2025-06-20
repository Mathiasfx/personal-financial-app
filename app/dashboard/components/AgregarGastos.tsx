"use client";
/**
 * Módulo para agregar Gastos.
 * Este componente permite a los usuarios agregar nuevos gastos a su lista de gastos.
 *
 * @component
 * @example
 * return (
 *   <AgregarGastos />
 * )
 *
 * @returns {JSX.Element} Un elemento JSX que representa el formulario para agregar gastos.
 */
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
// Importamos los iconos que se usarán según el tipo de categoría
import {
  ShoppingCart,
  HelpOutline,
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

import { saveExpence, getCategories } from "@/lib/finanzasService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";

import { NuevoGasto } from "@/models/nuevoGasto.model";
import { Categorias } from "@/models/categorias.model";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import DateWrapper from "./DateWrapper";

const AgregarGastos = ({
  open,
  onClose,
  onGastoAgregado,
  periodo,
}: NuevoGasto) => {
  const { user } = useAuth();
  const toast = useToast();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState<Categorias | null>(null);
  const [categoriasDB, setCategoriasBD] = useState<Categorias[]>([]);
  const [fecha, setFecha] = useState(dayjs());
  useEffect(() => {
    if (user && open) {
      const fetchCategorias = async () => {
        try {
          // Siempre hacemos una nueva petición a Firestore cuando se abre el modal
          const categorias = await getCategories(user?.uid);
          setCategoriasBD(categorias);
        } catch (error) {
          console.error("Error loading categories:", error);
          toast.showError("Error al cargar las categorías");
        }
      };
      fetchCategorias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open]); // toast intencionalmente omitido para evitar bucles infinitos
  const handleGuardarGasto = async () => {
    if (!descripcion || !monto || !categoria || !periodo || !fecha) {
      toast.showWarning("Por favor completa todos los campos");
      return;
    }

    const nuevoGasto = {
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha: fecha.toISOString(),
      id: Date.now(),
    };

    try {
      if (!user?.uid) {
        throw new Error("User ID is undefined");
      }
      await saveExpence(user.uid, periodo, nuevoGasto); // Usa el período correcto
      onGastoAgregado(); // Actualiza el Dashboard
      onClose(); // Cierra el modal
      toast.showSuccess("Gasto agregado exitosamente");
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
      toast.showError("Error al guardar el gasto");
    } finally {
      setDescripcion("");
      setMonto("");
      setCategoria(null);
      setFecha(dayjs());
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "24px" } } }}
    >
      <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          fullWidth
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />{" "}
        <TextField
          label="Monto"
          type="text"
          inputMode="decimal"
          fullWidth
          value={monto}
          onChange={(e) => {
            // Permitir valores vacíos o entrada numérica con punto decimal
            let rawValue = e.target.value.replace(/[^0-9.,]/g, "");
            rawValue = rawValue.replace(",", ".");
            setMonto(rawValue);
          }}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        />
        <DateWrapper>
          <DatePicker
            label="Fecha del Gasto"
            value={fecha}
            onChange={(newValue) => {
              if (newValue) {
                setFecha(newValue);
              }
            }}
            sx={{ marginBottom: "1rem", width: "100%", marginTop: "1rem" }}
          />
        </DateWrapper>
        <TextField
          select
          label="Categoría"
          fullWidth
          value={categoria?.id || ""}
          onChange={(e) => {
            const selectedCategoria = categoriasDB.find(
              (cat) => cat.id === e.target.value
            );
            if (selectedCategoria) setCategoria(selectedCategoria);
          }}
          sx={{ marginBottom: "1rem", marginTop: "1rem" }}
        >
          {" "}
          {categoriasDB.length > 0 ? (
            categoriasDB.map((cat) => {
              // Renderizar el icono basado en el nombre del icono almacenado en la categoría
              const renderIcon = (iconName: string) => {
                switch (iconName) {
                  // Compras y Gastos Diarios
                  case "ShoppingCart":
                    return <ShoppingCart fontSize="small" />;
                  case "ShoppingBag":
                    return <ShoppingBag fontSize="small" />;
                  case "Restaurant":
                    return <Restaurant fontSize="small" />;
                  case "Fastfood":
                    return <Fastfood fontSize="small" />;

                  // Transporte
                  case "DirectionsCar":
                    return <DirectionsCar fontSize="small" />;
                  case "LocalGasStation":
                    return <LocalGasStation fontSize="small" />;
                  case "Flight":
                    return <Flight fontSize="small" />;
                  case "Train":
                    return <Train fontSize="small" />;
                  case "DirectionsBus":
                    return <DirectionsBus fontSize="small" />;
                  case "LocalTaxi":
                    return <LocalTaxi fontSize="small" />;
                  case "TwoWheeler":
                    return <TwoWheeler fontSize="small" />;

                  // Hogar y Servicios
                  case "Home":
                    return <Home fontSize="small" />;
                  case "ElectricalServices":
                    return <ElectricalServices fontSize="small" />;
                  case "WaterDrop":
                    return <WaterDrop fontSize="small" />;
                  case "Wifi":
                    return <Wifi fontSize="small" />;
                  case "LocalLaundryService":
                    return <LocalLaundryService fontSize="small" />;
                  case "CleaningServices":
                    return <CleaningServices fontSize="small" />;

                  // Salud y Bienestar
                  case "LocalHospital":
                    return <LocalHospital fontSize="small" />;
                  case "MedicalServices":
                    return <MedicalServices fontSize="small" />;
                  case "LocalPharmacy":
                    return <LocalPharmacy fontSize="small" />;
                  case "FitnessCenter":
                    return <FitnessCenter fontSize="small" />;
                  case "Spa":
                    return <Spa fontSize="small" />;

                  // Entretenimiento y Ocio
                  case "Movie":
                    return <Movie fontSize="small" />;
                  case "TheaterComedy":
                    return <TheaterComedy fontSize="small" />;
                  case "MusicNote":
                    return <MusicNote fontSize="small" />;
                  case "Nightclub":
                    return <Nightlight fontSize="small" />;
                  case "SportsEsports":
                    return <SportsEsports fontSize="small" />;
                  case "SportsSoccer":
                    return <SportsSoccer fontSize="small" />;

                  // Finanzas y Pagos
                  case "AttachMoney":
                    return <AttachMoney fontSize="small" />;
                  case "CreditCard":
                    return <CreditCard fontSize="small" />;
                  case "Receipt":
                    return <Receipt fontSize="small" />;
                  case "AccountBalance":
                    return <AccountBalance fontSize="small" />;
                  case "Savings":
                    return <Savings fontSize="small" />;
                  case "AccountBalanceWallet":
                    return <AccountBalanceWallet fontSize="small" />;

                  // Trabajo y Educación
                  case "Work":
                    return <Work fontSize="small" />;
                  case "School":
                    return <School fontSize="small" />;
                  case "LibraryBooks":
                    return <LibraryBooks fontSize="small" />;

                  // Viajes y Turismo
                  case "Hotel":
                    return <Hotel fontSize="small" />;
                  case "BeachAccess":
                    return <BeachAccess fontSize="small" />;
                  case "Public":
                    return <Public fontSize="small" />;
                  case "Park":
                    return <Park fontSize="small" />;

                  // Tecnología
                  case "PhoneAndroid":
                    return <PhoneAndroid fontSize="small" />;
                  case "Laptop":
                    return <Laptop fontSize="small" />;
                  case "DevicesOther":
                    return <DevicesOther fontSize="small" />;

                  // Eventos y Celebraciones
                  case "Celebration":
                    return <Celebration fontSize="small" />;
                  case "Cake":
                    return <Cake fontSize="small" />;

                  // Mascotas y Familia
                  case "Pets":
                    return <Pets fontSize="small" />;
                  case "ChildCare":
                    return <ChildCare fontSize="small" />; // Arte y Creatividad
                  case "Brush":
                    return <Brush fontSize="small" />; // Personal
                  case "Favorite":
                    return <Favorite fontSize="small" />;

                  // Categoría eliminada o desconocida
                  case "QuestionMark":
                    return <HelpOutline fontSize="small" />;

                  default:
                    return <ShoppingCart fontSize="small" />;
                }
              };

              const IconComponent = renderIcon(cat.icono);

              return (
                <MenuItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {IconComponent && <span>{IconComponent}</span>}
                    <span>{cat.nombre}</span>
                  </div>
                </MenuItem>
              );
            })
          ) : (
            <MenuItem disabled>Cargando categorías...</MenuItem>
          )}
        </TextField>
      </DialogContent>
      <DialogActions>
        <button
          className="flex items-center gap-2 px-6 py-3 text-white bg-red-500 rounded-full shadow-sm hover:bg-red-800 border-none  "
          onClick={onClose}
        >
          <span className=" text-sm font-bold">Cancelar</span>
        </button>
        <button
          onClick={handleGuardarGasto}
          className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
        >
          <span className="text-sm font-bold"> Guardar</span>
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarGastos;
