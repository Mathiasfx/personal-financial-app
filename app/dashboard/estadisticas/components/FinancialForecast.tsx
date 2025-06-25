import React, { FC, useState, useMemo } from "react";
import { PeriodData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";
import { generateFinancialForecast } from "@/lib/forecastService";

interface FinancialForecastProps {
  periodData: PeriodData[];
}

const FinancialForecast: FC<FinancialForecastProps> = ({ periodData }) => {
  const [forecastPeriod, setForecastPeriod] = useState<"1" | "3" | "6">("1");

  // Generar predicciones usando el servicio de pronósticos
  const predictions = useMemo(() => {
    return {
      "1": generateFinancialForecast(periodData, 1),
      "3": generateFinancialForecast(periodData, 3),
      "6": generateFinancialForecast(periodData, 6),
    };
  }, [periodData]);

  const currentPrediction = predictions[forecastPeriod];
  const confidencePercentage = Math.round(
    currentPrediction.confidenceScore * 100
  );

  // Configurar colores según el nivel de confianza
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "#10B981"; // Verde
    if (score >= 0.7) return "#22D3EE"; // Azul claro
    if (score >= 0.6) return "#FBBF24"; // Amarillo
    return "#F97316"; // Naranja
  };

  const confidenceColor = getConfidenceColor(currentPrediction.confidenceScore);

  // Helper para iconos de tendencia
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "↗️";
      case "decreasing":
        return "↘️";
      default:
        return "➡️";
    }
  };

  // Helper para iconos de riesgo
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return "🔴";
      case "medium":
        return "🟠";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  if (periodData.length < 3) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Pronóstico Financiero
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-700">
            Se necesitan al menos 3 períodos de datos para generar pronósticos
            precisos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Pronóstico Financiero
        </h2>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Proyección:</span>
          <select
            value={forecastPeriod}
            onChange={(e) =>
              setForecastPeriod(e.target.value as "1" | "3" | "6")
            }
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 mes</option>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Balance proyectado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <p className="text-sm text-blue-700 mb-1">Balance Proyectado</p>
          <p className="text-2xl font-bold text-blue-800">
            {formatCurrency(currentPrediction.endOfMonthBalance)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Al final de{" "}
            {forecastPeriod === "1" ? "este mes" : `${forecastPeriod} meses`}
          </p>
        </div>

        {/* Ahorro potencial */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg shadow-sm border border-green-100">
          <p className="text-sm text-green-700 mb-1">Ahorro Potencial</p>
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(currentPrediction.potentialSavings)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Con optimización de gastos
          </p>
        </div>

        {/* Confianza del pronóstico */}
        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-lg shadow-sm border border-purple-100">
          <p className="text-sm text-purple-700 mb-1">
            Confianza de la Predicción
          </p>
          <div className="flex items-center">
            <p
              className="text-2xl font-bold"
              style={{ color: confidenceColor }}
            >
              {confidencePercentage}%
            </p>
            <div className="ml-3 bg-gray-200 w-16 h-2 rounded-full">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${confidencePercentage}%`,
                  backgroundColor: confidenceColor,
                }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Basado en patrones históricos
          </p>
        </div>
      </div>

      {/* Gastos proyectados */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Gastos Proyectados
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {currentPrediction.projectedExpenses.map((expense, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200"
            >
              <div className="flex items-center">
                <span className="mr-2">{getTrendIcon(expense.trend)}</span>
                <span>{expense.category}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {expense.trend === "increasing"
                    ? "+"
                    : expense.trend === "decreasing"
                    ? "-"
                    : "="}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Áreas de riesgo */}
      {currentPrediction.riskAreas.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3">
            Áreas de Atención
          </h3>
          <div className="space-y-3">
            {currentPrediction.riskAreas.map((area, index) => (
              <div
                key={index}
                className="bg-red-50 p-3 rounded-lg border border-red-100"
              >
                <div className="flex items-start">
                  <span className="mr-2">{getRiskIcon(area.risk)}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {area.name}
                    </p>
                    <p className="text-sm text-gray-700">{area.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialForecast;
