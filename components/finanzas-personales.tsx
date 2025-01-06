"use client";
import { useState, useEffect } from "react";
import {
  CalendarIcon,
  SaveIcon,
  UploadIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Categoria =
  | "Delivery y Comida afuera"
  | "Supermercado"
  | "Transporte"
  | "Entretenimiento y amigos"
  | "Salud"
  | "Educación"
  | "Gastos Fijos"
  | "Imprevistos y Emergencias"
  | "Hogar y Mantenimiento"
  | "Regalos y Donaciones"
  | "Carli Tarjetas"
  | "Carli"
  | "Ahorro"
  | "Otros";

type Gasto = {
  id: number;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: Categoria;
};

type GastoFijo = {
  [key: string]: {
    monto: number;
    pagado: boolean;
  };
};

type GastoFijoOld = {
  [key: string]: number;
};

type DatosFinancieros = {
  ingresos: number;
  ingresosExtras: number;
  gastos: Gasto[];
  gastosFijos: GastoFijo;
  inversiones: number;
  fechaCobro: Date | null;
};

interface Datosjson {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const categorias: Categoria[] = [
  "Delivery y Comida afuera",
  "Supermercado",
  "Transporte",
  "Entretenimiento y amigos",
  "Salud",
  "Educación",
  "Gastos Fijos",
  "Imprevistos y Emergencias",
  "Hogar y Mantenimiento",
  "Regalos y Donaciones",
  "Carli",
  "Ahorro",
  "Otros",
];

const gastosFijosPredeterminadosOld: GastoFijoOld = {
  Alquiler: 178000,
  Expensas: 15000,
  Internet: 32000,
  CelularPersonal: 23000,
  CelularClaro: 8000,
  Agua: 20000,
  Luz: 30000,
  TarjetaNaranja: 80000,
  TarjetaVisa: 230000,
  TarjetaAmerican: 50000,
  TarjetaCarli: 60000,
  Gymnasio: 66000,
  MonotributoMat: 26600,
  MonotributoCar: 26600,
  SeguroAuto: 25000,
  Combustible: 52000,
  Prestamo: 0,
  Supermercado: 120000,
  CombustibleAuto: 0,
  CombustibleMoto: 0,
  Rentas: 0,
  Carli: 0,
};

const gastosFijosPredeterminados: GastoFijo = Object.fromEntries(
  Object.entries(gastosFijosPredeterminadosOld).map(([key, value]) => [
    key,
    { monto: value, pagado: false },
  ])
);

export default function FinanzasPersonales() {
  const [datos, setDatos] = useState<DatosFinancieros>({
    ingresos: 0,
    ingresosExtras: 0,
    gastos: [],
    gastosFijos: { ...gastosFijosPredeterminados },
    inversiones: 0,
    fechaCobro: null,
  });
  const [nuevoGasto, setNuevoGasto] = useState<Omit<Gasto, "id" | "fecha">>({
    descripcion: "",
    monto: 0,
    categoria: "Otros",
  });
  const [mesActual, setMesActual] = useState(() =>
    new Date()
      .toLocaleDateString("es-ES", {
        month: "2-digit",
        year: "numeric",
      })
      .replace("/", "-")
  );
  const [editandoGasto, setEditandoGasto] = useState<Gasto | null>(null);
  const [mesesDisponibles, setMesesDisponibles] = useState<string[]>([]);

  useEffect(() => {
    cargarDatos();
    actualizarMesesDisponibles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesActual]);

  useEffect(() => {
    const intervaloGuardado = setInterval(() => {
      guardarDatos();
      console.log("Datos guardados automáticamente");
    }, 5 * 60 * 1000); // 5 minutos (5 * 60 segundos * 1000 milisegundos)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervaloGuardado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, mesActual]); // Se vuelve a ejecutar si cambian los datos o el mes actual

  const actualizarMesesDisponibles = () => {
    const meses = Object.keys(localStorage)
      .filter((key) => key.startsWith("finanzas_"))
      .map((key) => key.replace("finanzas_", "")) // Extraer mes guardado
      .map((key) => {
        const [year, month] = key.split("-");
        return `${month}-${year}`; // Convertir de YYYY-MM a MM-YYYY para mostrar
      })
      .sort((a, b) => {
        const [monthA, yearA] = a.split("-");
        const [monthB, yearB] = b.split("-");
        return yearB !== yearA
          ? Number(yearB) - Number(yearA)
          : Number(monthB) - Number(monthA);
      });
    setMesesDisponibles(meses);
  };

  const cargarDatos = () => {
    const [month, year] = mesActual.split("-"); // mesActual en MM-YYYY
    const formattedMesActual = `${month}-${year}`; // Convertir a YYYY-MM para cargar de localStorage

    const datosGuardados = localStorage.getItem(
      `finanzas_${formattedMesActual}`
    );

    if (datosGuardados) {
      const datosParsed = JSON.parse(datosGuardados);
      setDatos({
        ...datosParsed,
        ingresosExtras: datosParsed.ingresosExtras || 0,
        fechaCobro: datosParsed.fechaCobro
          ? new Date(datosParsed.fechaCobro)
          : null,
        gastos: datosParsed.gastos.map((g: Gasto) => ({
          ...g,
          fecha: new Date(g.fecha),
        })),
        gastosFijos: Object.fromEntries(
          Object.entries({
            ...gastosFijosPredeterminados,
            ...datosParsed.gastosFijos,
          }).map(([key, value]) => [
            key,
            typeof value === "number" ? { monto: value, pagado: false } : value,
          ])
        ),
      });
    } else {
      setDatos((prev) => ({
        ...prev,
        gastosFijos: { ...gastosFijosPredeterminados },
      }));
    }
  };

  const guardarDatos = () => {
    const [month, year] = mesActual.split("-"); // mesActual en formato MM-YYYY
    const formattedMesActual = `${month}-${year}`; // Convertir a YYYY-MM para guardar

    localStorage.setItem(
      `finanzas_${formattedMesActual}`,
      JSON.stringify(datos)
    );
    actualizarMesesDisponibles();
  };

  const descargarDatos = () => {
    const datosFinancieros: Datosjson = {};

    // Recorre todos los meses disponibles en localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("finanzas_")) {
        datosFinancieros[key] = JSON.parse(localStorage.getItem(key) || "{}");
      }
    });

    // Convierte los datos a un archivo JSON
    const blob = new Blob([JSON.stringify(datosFinancieros, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "datos_financieros.json"; // Nombre del archivo
    link.click();
  };

  const handleAddGasto = () => {
    if (nuevoGasto.descripcion && nuevoGasto.monto > 0) {
      if (editandoGasto) {
        setDatos((prev) => ({
          ...prev,
          gastos: prev.gastos.map((g) =>
            g.id === editandoGasto.id ? { ...editandoGasto, ...nuevoGasto } : g
          ),
        }));
        setEditandoGasto(null);
      } else {
        setDatos((prev) => ({
          ...prev,
          gastos: [
            ...prev.gastos,
            { ...nuevoGasto, id: Date.now(), fecha: new Date() },
          ],
        }));
      }
      setNuevoGasto({ descripcion: "", monto: 0, categoria: "Otros" });
    }
  };

  const handleEditGasto = (gasto: Gasto) => {
    setEditandoGasto(gasto);
    setNuevoGasto({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      categoria: gasto.categoria,
    });
  };

  const handleDeleteGasto = (id: number) => {
    setDatos((prev) => ({
      ...prev,
      gastos: prev.gastos.filter((g) => g.id !== id),
    }));
  };

  const calcularResumenFinanciero = () => {
    const totalGastosFijos = Object.values(datos.gastosFijos)
      .filter(({ pagado }) => pagado)
      .reduce((sum, { monto }) => sum + monto, 0);
    const gastosVariables = datos.gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalGastos = totalGastosFijos + gastosVariables;
    const dineroDisponible =
      datos.ingresos + datos.ingresosExtras - totalGastos - datos.inversiones;

    let diasRestantes = 30;
    if (datos.fechaCobro) {
      const hoy = new Date();
      const diferencia = datos.fechaCobro.getTime() - hoy.getTime();
      diasRestantes = Math.max(Math.ceil(diferencia / (1000 * 3600 * 24)), 0);
    }

    const gastoSemanalPermitido = dineroDisponible / (diasRestantes / 7);

    return {
      dineroDisponible,
      gastoSemanalPermitido,
      diasRestantes,
      totalGastosFijos,
      gastosVariables,
    };
  };

  const getColorForDiasRestantes = (dias: number) => {
    if (dias <= 3) return "text-red-500";
    if (dias <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const resumen = calcularResumenFinanciero();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Administrador de Finanzas Personales
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mes">Mes</Label>
                <Input
                  id="mes"
                  type="text"
                  value={mesActual}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^\d{2}-\d{4}$/; // Validar formato MM-YYYY
                    if (regex.test(value)) {
                      setMesActual(value); // Solo actualizar si el formato es correcto
                    }
                  }}
                  placeholder="MM-YYYY"
                />
              </div>
              <div>
                <Label htmlFor="ingresos">Ingresos</Label>
                <Input
                  id="ingresos"
                  type="text"
                  value={datos.ingresos === 0 ? "" : `$${datos.ingresos}`} // Si el valor es 0, mostramos campo vacío
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Solo permitir números
                    setDatos((prev) => ({
                      ...prev,
                      ingresos: value !== "" ? Number(value) : 0, // Almacenar número o 0 si está vacío
                    }));
                  }}
                  placeholder="Ingresos"
                />
              </div>
              <div>
                <Label htmlFor="ingresosExtras">Ingresos Extras</Label>
                <Input
                  id="ingresosExtras"
                  type="text"
                  value={
                    datos.ingresosExtras === 0 ? "" : `$${datos.ingresosExtras}`
                  } // Si el valor es 0, mostramos campo vacío
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Solo permitir números
                    setDatos((prev) => ({
                      ...prev,
                      ingresosExtras: value !== "" ? Number(value) : 0, // Almacenar número o 0 si está vacío
                    }));
                  }}
                  placeholder="Ingresos Extras"
                />
              </div>
              <div>
                <Label htmlFor="inversiones">Inversiones</Label>
                <Input
                  id="inversiones"
                  type="text"
                  value={datos.inversiones === 0 ? "" : `$${datos.inversiones}`} // Si el valor es 0, mostramos campo vacío
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Solo permitir números
                    setDatos((prev) => ({
                      ...prev,
                      inversiones: value !== "" ? Number(value) : 0, // Almacenar número o 0 si está vacío
                    }));
                  }}
                  placeholder="Inversiones"
                />
              </div>
              <div>
                <Label htmlFor="fechaCobro">Fecha del Próximo Cobro</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !datos.fechaCobro && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datos.fechaCobro ? (
                        format(datos.fechaCobro, "PPP")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={datos.fechaCobro || undefined}
                      onSelect={(date) =>
                        setDatos((prev) => ({
                          ...prev,
                          fechaCobro: date ?? new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Dinero Disponible</Label>
                <p className="text-2xl font-bold">
                  ${formatNumber(resumen.dineroDisponible)}
                </p>
              </div>
              <div>
                <Label>Gasto Semanal Permitido</Label>
                <p className="text-2xl font-bold">
                  ${formatNumber(resumen.gastoSemanalPermitido)}
                </p>
              </div>
              <div>
                <Label>Días hasta el próximo cobro</Label>
                <p
                  className={`text-2xl font-bold ${getColorForDiasRestantes(
                    resumen.diasRestantes
                  )}`}
                >
                  {resumen.diasRestantes}
                </p>
                <Progress
                  value={(resumen.diasRestantes / 30) * 100}
                  className={`mt-2 ${getColorForDiasRestantes(
                    resumen.diasRestantes
                  )}`}
                />
              </div>
              <div>
                <Label>Gastos Fijos</Label>
                <p className="text-xl font-semibold">
                  ${formatNumber(resumen.totalGastosFijos)}
                </p>
              </div>
              <div>
                <Label>Gastos Variables</Label>
                <p className="text-xl font-semibold">
                  ${formatNumber(resumen.gastosVariables)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Gastos Fijos
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <EditIcon className="mr-2 h-4 w-4" /> Editar Gastos Fijos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Gastos Fijos</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {Object.entries(datos.gastosFijos).map(
                    ([gasto, { monto, pagado }]) => (
                      <div
                        key={gasto}
                        className="grid grid-cols-2 items-center gap-4"
                      >
                        <Label htmlFor={gasto}>{gasto}</Label>
                        <Input
                          id={gasto}
                          type="number"
                          value={monto}
                          onChange={(e) =>
                            setDatos((prev) => ({
                              ...prev,
                              gastosFijos: {
                                ...prev.gastosFijos,
                                [gasto]: {
                                  monto: Number(e.target.value),
                                  pagado,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(datos.gastosFijos).map(
              ([gasto, { monto, pagado }]) => (
                <div
                  key={gasto}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pagado}
                      onChange={() =>
                        setDatos((prev) => ({
                          ...prev,
                          gastosFijos: {
                            ...prev.gastosFijos,
                            [gasto]: {
                              ...prev.gastosFijos[gasto],
                              pagado: !pagado,
                            },
                          },
                        }))
                      }
                      className="mr-2"
                    />
                    <span
                      className={cn(
                        pagado && "line-through text-green-500",
                        "transition-colors duration-200"
                      )}
                    >
                      {gasto}
                    </span>
                  </div>
                  <span
                    className={cn("font-semibold", pagado && "text-green-500")}
                  >
                    ${formatNumber(monto)}
                  </span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Registro de Gastos Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Descripción"
              value={nuevoGasto.descripcion}
              onChange={(e) =>
                setNuevoGasto((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
            />
            <Input
              type="text"
              value={nuevoGasto.monto === 0 ? "" : `$${nuevoGasto.monto}`} // Si el valor es 0, mostramos campo vacío
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Solo permitir números
                setNuevoGasto((prev) => ({
                  ...prev,
                  monto: value !== "" ? Number(value) : 0,
                }));
              }}
              placeholder="Monto"
            />

            <Select
              value={nuevoGasto.categoria}
              onValueChange={(value: Categoria) =>
                setNuevoGasto((prev) => ({ ...prev, categoria: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias
                  .filter((cat) => cat !== "Gastos Fijos")
                  .map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddGasto}>
              {editandoGasto ? "Actualizar" : "Agregar"}
            </Button>
          </div>
          <div className="space-y-2">
            {datos.gastos.map((gasto) => (
              <div
                key={gasto.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>
                  {gasto.descripcion} ({gasto.categoria})
                </span>
                <div>
                  <span className="font-semibold mr-2">
                    ${formatNumber(gasto.monto)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditGasto(gasto)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteGasto(gasto.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end flex-wrap space-x-2 space-y-2 md:space-y-0">
        <Button onClick={guardarDatos}>
          <SaveIcon className="mr-2 h-4 w-4" /> Guardar Datos
        </Button>
        <Button onClick={descargarDatos}>
          <UploadIcon className="mr-2 h-4 w-4" /> Descargar Datos JSON
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UploadIcon className="mr-2 h-4 w-4" /> Cargar Datos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar Mes para Cargar Datos</DialogTitle>
            </DialogHeader>
            <Select
              onValueChange={(value) => {
                setMesActual(value); // Mantener el valor en YYYY-MM en el estado
                cargarDatos(); // Cargar los datos correspondientes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {mesesDisponibles.map((mes) => {
                  const [year, month] = mes.split("-"); // Ahora dividimos en [YYYY, MM]

                  const monthNames = [
                    "enero",
                    "febrero",
                    "marzo",
                    "abril",
                    "mayo",
                    "junio",
                    "julio",
                    "agosto",
                    "septiembre",
                    "octubre",
                    "noviembre",
                    "diciembre",
                  ];

                  // Convertir el número del mes (01, 02, etc.) al nombre del mes
                  const monthIndex = parseInt(month, 10) - 1; // Restar 1 para obtener el índice correcto
                  const formattedMes = `${monthNames[monthIndex]} de ${year}`; // Ejemplo: "octubre de 2024"

                  return (
                    <SelectItem key={mes} value={mes}>
                      {formattedMes}{" "}
                      {/* Mostrar el mes en formato "octubre de 2024" */}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
