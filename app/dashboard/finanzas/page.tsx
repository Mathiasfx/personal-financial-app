/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  saveExpence,
  updateExpenseStatus,
  getFinancialData,
  getLatestFinancialPeriod,
} from "@/lib/finanzasService";
import { useAuth } from "@/context/AuthContext";
import {
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function FinanzasPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [yearMonth, setYearMonth] = useState("");

  useEffect(() => {
    if (user) {
      getLatestFinancialPeriod(user.uid)
        .then((latestPeriod) => {
          setYearMonth(latestPeriod);
          return getFinancialData(user.uid, latestPeriod);
        })
        .then((finanzas) => {
          setData(finanzas);
          setLoading(false);
        });
    }
  }, [user]);

  const handleTogglePago = async (expenseKey: string, pagado: boolean) => {
    if (user) {
      await updateExpenseStatus(user.uid, yearMonth, expenseKey, pagado);
      setData((prevData: any) => ({
        ...prevData,
        gastosFijos: {
          ...prevData.gastosFijos,
          [expenseKey]: { ...prevData.gastosFijos[expenseKey], pagado },
        },
      }));
    }
  };

  const handleEditMonto = async (expenseKey: string, newAmount: number) => {
    if (user) {
      const updatedData = { ...data };
      updatedData.gastosFijos[expenseKey].monto = newAmount;
      await saveExpence(user.uid, yearMonth, updatedData);
      setData(updatedData);
    }
  };

  const rows = data?.gastosFijos
    ? Object.entries(data.gastosFijos).map(([key, value]: any) => ({
        id: key,
        descripcion: key,
        monto: value.monto,
        pagado: value.pagado,
      }))
    : [];

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6">
      <h4>{yearMonth}</h4>
      <h1 className="text-xl font-bold">Administración Financiera</h1>
      <TableContainer component={Paper} sx={{ marginTop: "1rem" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Pagado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.descripcion}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    defaultValue={row.monto}
                    onBlur={(e) =>
                      handleEditMonto(row.id, Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={row.pagado}
                    onChange={(e) => handleTogglePago(row.id, e.target.checked)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
