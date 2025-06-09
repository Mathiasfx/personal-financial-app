"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import { listAllPeriods } from "@/lib/finanzasService";
import { Finanzas } from "@/models/finanzas.model";
import {
  //processCategoryData,
  //processTrendData,
  processFixedExpenseIncreaseData,
  PeriodData,
} from "@/lib/statisticsService";
import ChartContainer from "./components/ChartContainer";
import InflationLineChart from "./components/InflationLineChart";
//import CategoryDistributionChart from "./components/CategoryDistributionChart";
//import AvailableMoneyTrendChart from "./components/AvailableMoneyTrendChart";
//import FixedVsVariableExpensesChart from "./components/FixedVsVariableExpensesChart";
import KeyMetrics from "./components/KeyMetrics";
import TrendIndicator from "./components/TrendIndicator";

export default function EstadisticasPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "3" | "6" | "12" | "all"
  >("6");

  // Cargar datos de todos los períodos
  useEffect(() => {
    const loadAllPeriodsData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const allPeriods = await listAllPeriods(user.uid);
        const formattedData = allPeriods.map((period) => ({
          id: period.id,
          data: period.data as Finanzas,
        }));

        // Ordenar por fecha (más reciente primero)
        formattedData.sort((a, b) => b.id.localeCompare(a.id));
        setPeriodData(formattedData);
      } catch (error) {
        console.error("Error cargando datos de períodos:", error);
        toast.showError("Error al cargar los datos para estadísticas");
      } finally {
        setLoading(false);
      }
    };

    loadAllPeriodsData();
  }, [user, toast]);

  // Filtrar datos según el timeframe seleccionado
  const getFilteredData = () => {
    if (selectedTimeframe === "all") return periodData;

    const months = parseInt(selectedTimeframe);
    return periodData.slice(0, months);
  };
  const filteredData = getFilteredData();
  // Procesar datos para los gráficos
  const fixedExpenseIncreaseData =
    processFixedExpenseIncreaseData(filteredData);
  //const categoryData = processCategoryData(filteredData);
  //const trendData = processTrendData(filteredData);

  return (
    <div className="p-0 md:p-6 w-full max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Estadísticas Financieras
          </h1>
          <p className="text-gray-600">
            Análisis detallado de tus finanzas personales
          </p>
        </div>

        {/* Selector de período */}
        <div className="mt-4 md:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de análisis:
          </label>
          <select
            value={selectedTimeframe}
            onChange={(e) =>
              setSelectedTimeframe(e.target.value as "3" | "6" | "12" | "all")
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Últimos 12 meses</option>
            <option value="all">Todos los períodos</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="bg-white shadow-md rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : periodData.length === 0 ? (
        // Empty State
        <div className="bg-white shadow-md rounded-xl p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay datos suficientes
          </h3>
          <p className="text-gray-600 mb-6">
            Necesitas al menos un período con datos para generar estadísticas.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      ) : (
        // Main Content
        <div className="space-y-6">
          {" "}
          {/* Resumen general */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Resumen General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">
                  Períodos Analizados
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.length}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">
                  Período más Reciente
                </h3>
                <p className="text-xl font-bold text-blue-600">
                  {filteredData[0]?.id || "N/A"}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">
                  Período más Antiguo
                </h3>
                <p className="text-xl font-bold text-purple-600">
                  {filteredData[filteredData.length - 1]?.id || "N/A"}
                </p>
              </div>
              <TrendIndicator data={filteredData} />
            </div>
          </div>
          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Evolución de Inflación */}
            <ChartContainer title="Evolución de Inflación de Gastos Fijos">
              <InflationLineChart data={fixedExpenseIncreaseData} />
            </ChartContainer>
          </div>
          {/* Métricas clave */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Métricas Clave
            </h2>
            <KeyMetrics data={filteredData} />
          </div>
        </div>
      )}
    </div>
  );
}
