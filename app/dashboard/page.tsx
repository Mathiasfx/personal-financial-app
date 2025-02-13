"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { getFinancialData } from "@/lib/finanzasService";
import { Timestamp } from "firebase/firestore";
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
  }
  const [finanzas, setFinanzas] = useState<Finanzas | null>(null);
  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [diasCobro, setDiasCobro] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchFinanzas = async () => {
      const data = (await getFinancialData(user.uid, "2025-2")) as Finanzas;

      if (data !== null) {
        setFinanzas(data);

        const gastos = Object.entries(data.gastosFijos).map(
          ([categoria, info]) => ({
            categoria,
            ...info,
            fechaVencimiento: info.fechaVencimiento.toDate(),
          })
        );
        const ingresosTotales = data.ingresos + data.ingresosExtras;
        const gastosPagados = gastos
          .filter((g) => g.pagado)
          .reduce((sum, g) => sum + g.monto, 0);
        //Dinero disponible
        setDineroDisponible(ingresosTotales - gastosPagados);
        const fechaCobro = dayjs(data.fechaCobro.toDate());
        const diasRestantes = fechaCobro.diff(dayjs(), "day");
        //Dias para el proximo cobro
        setDiasCobro(diasRestantes);
      }
    };
    fetchFinanzas();
  }, [user]);
  return (
    <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card sx={{ boxShadow: "1", borderRadius: "24px", minHeight: "180px" }}>
        <CardContent>
          <h6 className="text-xl font-bold text-gray-800">
            Estado del mes de Febrero
          </h6>
          <Typography>Ingresos: ${finanzas?.ingresos}</Typography>
          <Typography>Inversiones: ${finanzas?.inversiones}</Typography>
          <Typography>
            Fecha de Cobro:{" "}
            {finanzas
              ? dayjs(finanzas.fechaCobro.toDate()).format("DD/MM/YYYY")
              : "-"}
          </Typography>
        </CardContent>
      </Card>
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
            Disponible: ${dineroDisponible}
          </p>
          <p className="text-lg font-normal">Dias restantes: {diasCobro}</p>
          <p>Gastos Fijos</p>
          <p>Gastos Variables</p>
        </CardContent>
      </Card>
    </div>
  );
}
