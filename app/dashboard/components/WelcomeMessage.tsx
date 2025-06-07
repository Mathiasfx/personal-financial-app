"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import { createPeriod } from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
import DateWrapper from "./DateWrapper";
import {
  InfoOutlined,
  MonetizationOnOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";

interface WelcomeMessageProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    ingresos: 0,
    ingresosExtras: 0,
    inversiones: 0,
    fechaCobro: null as Dayjs | null,
  });

  const steps = [
    "Bienvenido/a",
    "Configura tu primer período",
    "¡Listo para empezar!",
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateFirstPeriod = async () => {
    if (!user) return;

    // Validar datos básicos
    if (formData.ingresos <= 0) {
      toast.showWarning("Por favor ingresa tus ingresos mensuales");
      return;
    }

    setLoading(true);
    try {
      const currentMonth = dayjs().format("YYYY-MM");

      const dataToSave = {
        ingresos: formData.ingresos,
        ingresosExtras: formData.ingresosExtras,
        inversiones: formData.inversiones,
        fechaCobro: formData.fechaCobro
          ? Timestamp.fromDate(formData.fechaCobro.toDate())
          : null,
      };

      await createPeriod(user.uid, currentMonth, dataToSave);

      toast.showSuccess("¡Tu primer período ha sido creado exitosamente!");
      handleNext(); // Ir al último paso
    } catch (error) {
      console.error("Error creando primer período:", error);
      toast.showError("Error al crear el período. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box className="text-center py-6">
            <InfoOutlined className="text-6xl text-blue-500 mb-4" />
            <Typography variant="h5" className="font-bold mb-4 text-gray-800">
              ¡Bienvenido/a a tu Gestor Financiero Personal!
            </Typography>
            <Typography
              variant="body1"
              className="mb-6 text-gray-600 max-w-md mx-auto"
            >
              Esta aplicación te ayudará a gestionar tus finanzas de manera
              fácil y organizada. Te guiaremos paso a paso para que comiences a
              usar todas las funcionalidades.
            </Typography>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <Typography
                variant="h6"
                className="font-semibold mb-3 text-gray-800"
              >
                ¿Cómo funciona?
              </Typography>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <CalendarTodayOutlined className="text-blue-500 mt-1" />
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Períodos Mensuales
                    </Typography>{" "}
                    <Typography variant="body2" className="text-gray-600">
                      Organizamos tus finanzas por meses. Cada mes es un
                      &quot;período&quot; con sus propios ingresos y gastos.
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MonetizationOnOutlined className="text-green-500 mt-1" />
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Gastos Fijos y Variables
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Los gastos fijos se copian automáticamente cada mes. Los
                      variables los registras cuando los hagas.
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUpOutlined className="text-purple-500 mt-1" />
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Control Total
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Visualiza cuánto dinero te queda disponible y cuándo es tu
                      próximo cobro fijo.
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        );

      case 1:
        return (
          <Box className="py-4">
            <Typography
              variant="h6"
              className="font-bold mb-4 text-gray-800 text-center"
            >
              Configura tu primer período ({dayjs().format("MMMM YYYY")})
            </Typography>
            <Typography
              variant="body2"
              className="mb-6 text-gray-600 text-center"
            >
              Necesitamos algunos datos básicos para crear tu primer período
              financiero:
            </Typography>

            <div className="space-y-4">
              <TextField
                label="Ingresos Mensuales *"
                type="number"
                fullWidth
                value={formData.ingresos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ingresos: Number(e.target.value),
                  })
                }
                helperText="Tu sueldo u ingresos principales del mes"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                label="Ingresos Extras"
                type="number"
                fullWidth
                value={formData.ingresosExtras}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ingresosExtras: Number(e.target.value),
                  })
                }
                helperText="Trabajos extra, bonos, etc. (opcional)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                label="Inversiones/Ahorros"
                type="number"
                fullWidth
                value={formData.inversiones}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inversiones: Number(e.target.value),
                  })
                }
                helperText="Dinero que destinas a inversiones o ahorros (opcional)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <DateWrapper>
                <DatePicker
                  label="Fecha de tu próximo cobro"
                  value={formData.fechaCobro}
                  onChange={(newValue) =>
                    setFormData({ ...formData, fechaCobro: newValue })
                  }
                  slotProps={{
                    textField: {
                      helperText: "Para calcular días restantes (opcional)",
                      sx: {
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      },
                    },
                  }}
                />
              </DateWrapper>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 mt-6">
              <Typography variant="body2" className="text-yellow-800">
                {" "}
                💡 <strong>Tip:</strong> Solo los ingresos mensuales son
                obligatorios. Los demás campos puedes completarlos después en la
                sección &quot;Períodos&quot;.
              </Typography>
            </div>
          </Box>
        );

      case 2:
        return (
          <Box className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <Typography variant="h5" className="font-bold mb-4 text-gray-800">
              ¡Todo listo!
            </Typography>
            <Typography
              variant="body1"
              className="mb-6 text-gray-600 max-w-md mx-auto"
            >
              Tu primer período ha sido creado exitosamente. Ahora puedes
              empezar a:
            </Typography>

            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-500 font-bold">1.</span>{" "}
                <Typography variant="body2">
                  <strong>Agregar gastos fijos</strong> (alquiler, servicios,
                  etc.) en la sección &quot;Gastos Fijos&quot;
                </Typography>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-green-500 font-bold">2.</span>
                <Typography variant="body2">
                  <strong>Crear categorías</strong> para organizar mejor tus
                  gastos
                </Typography>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-500 font-bold">3.</span>
                <Typography variant="body2">
                  <strong>Registrar gastos variables</strong> desde el dashboard
                  principal
                </Typography>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <Typography variant="body2" className="text-green-800">
                🌟 <strong>¡Explora!</strong> Usa el menú lateral para navegar
                entre las diferentes secciones de la aplicación y descubrir
                todas las funcionalidades.
              </Typography>
            </div>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}} // No permitir cerrar haciendo clic afuera
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            minHeight: "600px",
          },
        },
      }}
    >
      {" "}
      <DialogTitle className="text-center border-b">
        <Typography
          variant="h6"
          component="span"
          className="font-bold text-gray-800"
        >
          Configuración Inicial
        </Typography>
        <Stepper activeStep={activeStep} className="mt-4">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      <DialogContent className="p-6">
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions className="p-6 border-t">
        {activeStep === 0 && (
          <div className="w-full flex justify-center">
            <button
              className="flex items-center gap-2 px-8 py-3 text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 border-none"
              onClick={handleNext}
            >
              <span className="text-sm font-bold">¡Comenzar!</span>
            </button>
          </div>
        )}

        {activeStep === 1 && (
          <div className="w-full flex justify-between">
            <button
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300 transition-all duration-300 border-none"
              onClick={handleBack}
            >
              <span className="text-sm font-bold">Atrás</span>
            </button>

            <button
              className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-all duration-300 border-none"
              onClick={handleCreateFirstPeriod}
              disabled={loading || formData.ingresos <= 0}
            >
              <span className="text-sm font-bold">
                {loading ? "Creando..." : "Crear Período"}
              </span>
            </button>
          </div>
        )}

        {activeStep === 2 && (
          <div className="w-full flex justify-center">
            <button
              className="flex items-center gap-2 px-8 py-3 text-white bg-gray-900 rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 border-none"
              onClick={handleComplete}
            >
              <span className="text-sm font-bold">¡Entendido!</span>
            </button>
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeMessage;
