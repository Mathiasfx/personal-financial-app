"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import { listAllPeriods } from "@/lib/finanzasService";
import { Finanzas } from "@/models/finanzas.model";
import {
  processFixedExpenseIncreaseData,
  PeriodData,
} from "@/lib/statisticsService";
import { calculateFinancialHealthScore } from "@/lib/financialHealthService";
import ChartContainer from "./components/ChartContainer";
import InflationLineChart from "./components/InflationLineChart";
import FinancialHealthPanel from "./components/FinancialHealthPanel";
import FinancialForecast from "./components/FinancialForecast";
import SpendingPatternAnalysis from "./components/SpendingPatternAnalysis";
import KeyMetrics from "./components/KeyMetrics";

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

        // Filtrar períodos con datos incompletos o inválidos
        const validData = formattedData.filter(
          (period) =>
            period.data &&
            typeof period.data.ingresos === "number" &&
            Array.isArray(period.data.gastosVariables) &&
            period.data.gastosFijos
        );

        setPeriodData(validData);
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

  // Calcular puntuación de salud financiera
  const healthScore = calculateFinancialHealthScore(filteredData);
  return (
    <div className="p-0 md:p-6 w-full max-w-7xl">
      {/* Header con animación mejorada */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Centro de Inteligencia Financiera
          </h1>
          <p className="text-gray-600">
            Análisis avanzado e insights personalizados para tus finanzas
          </p>
        </div>

        {/* Selector de período */}
        <div
          className="mt-4 md:mt-0 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
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
      </div>{" "}
      {/* Loading State - Enhanced Skeleton UI */}
      {loading ? (
        <div className="space-y-6">
          {/* Skeleton para el Panel de Salud y Previsión */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skeleton Panel de Salud */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                    <div className="h-5 bg-gray-300 rounded w-24 mt-2"></div>
                  </div>
                  <div className="rounded-full bg-gray-300 h-20 w-20"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-20 bg-gray-300 rounded"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Skeleton Previsión Financiera */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/5 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
                <div className="h-28 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton para gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="bg-white shadow-md rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-3/5 mb-4"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : periodData.length === 0 ? (
        // Empty State
        <div className="bg-white shadow-md rounded-xl p-12 text-center animate-fadeIn">
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
          {/* Puntuación de Salud Financiera y Pronóstico */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fadeIn" style={{ animationDelay: "0.1s" }}>
              <FinancialHealthPanel healthScore={healthScore} />
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <FinancialForecast periodData={filteredData} />
            </div>
          </div>
          {/* Espacio eliminado - Ya no mostramos el gráfico de Ingresos vs Gastos */}{" "}
          {/* Sección de ancho completo para análisis detallados - Nueva organización */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Análisis Detallado
            </h2>

            {/* Patrones de Consumo - Ancho Completo */}
            <div
              className="mb-6 animate-fadeIn"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                  <span className="mr-2">🔍</span>Patrones de Consumo
                </h2>
                <div className="overflow-x-auto">
                  <SpendingPatternAnalysis periodData={filteredData} />
                </div>
              </div>
            </div>

            {/* Evolución de Inflación - Ancho Completo */}
            <div
              className="mb-6 animate-fadeIn"
              style={{ animationDelay: "0.9s" }}
            >
              <ChartContainer
                title="Evolución de Inflación de Gastos Fijos"
                icon="📈"
                className="w-full"
              >
                <InflationLineChart data={fixedExpenseIncreaseData} />
              </ChartContainer>
            </div>

            {/* Métricas clave - Ancho completo */}
            <div
              className="bg-white shadow-md rounded-xl p-6 mt-6 animate-fadeIn w-full"
              style={{ animationDelay: "1s" }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Métricas Clave
              </h2>
              {/* Las cards ocupan el 100% del ancho, sin columnas */}
              <KeyMetrics data={filteredData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
