import React, { FC, useState, useMemo } from "react";
import { PeriodData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";
import {
  analyzeDailySpendingPatterns,
  analyzeCategoryPatterns,
  analyzeImpulsiveSpending,
} from "@/lib/spendingPatternService";

interface SpendingPatternAnalysisProps {
  periodData: PeriodData[];
}

const SpendingPatternAnalysis: FC<SpendingPatternAnalysisProps> = ({
  periodData,
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<
    "daily" | "category" | "impulse"
  >("daily");

  // Usar datos reales calculados a partir de periodData
  const { dailyPatterns, categoryPatterns, impulseAnalysis, topSpendingDays } =
    useMemo(() => {
      // Generar patrones solo si hay datos suficientes
      if (periodData.length < 2) {
        return {
          dailyPatterns: [],
          categoryPatterns: [],
          impulseAnalysis: {
            impulsive: { percentage: 0, amount: 0, mostCommon: [] },
            planned: { percentage: 0, amount: 0, mostCommon: [] },
          },
          topSpendingDays: [],
        };
      }

      // Calcular patrones usando los servicios
      const dailyPatterns = analyzeDailySpendingPatterns(periodData);
      const categoryPatterns = analyzeCategoryPatterns(periodData);
      const impulseAnalysis = analyzeImpulsiveSpending(periodData);

      // Encontrar días de mayor gasto
      const topSpendingDays = [...dailyPatterns]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 2);

      return {
        dailyPatterns,
        categoryPatterns,
        impulseAnalysis,
        topSpendingDays,
      };
    }, [periodData]);

  if (periodData.length < 2) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Patrones de Consumo
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-700">
            Se necesitan al menos 2 períodos con datos completos para analizar
            patrones de consumo.
          </p>
        </div>
      </div>
    );
  }

  // Helper para determinar el color según la consistencia
  const getConsistencyColor = (consistency: string) => {
    switch (consistency) {
      case "Alta":
        return "#10B981";
      case "Media":
        return "#FBBF24";
      case "Baja":
        return "#F97316";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🔍</span>Patrones de Consumo
        </h2>

        {/* Selector de análisis */}
        <div className="mt-3 md:mt-0 flex space-x-2">
          <button
            onClick={() => setSelectedAnalysis("daily")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedAnalysis === "daily"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Por día
          </button>
          <button
            onClick={() => setSelectedAnalysis("category")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedAnalysis === "category"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Por categoría
          </button>
          <button
            onClick={() => setSelectedAnalysis("impulse")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedAnalysis === "impulse"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Impulso
          </button>
        </div>
      </div>

      {/* Contenido basado en la selección */}
      <div className="mt-4 flex-grow overflow-auto">
        {selectedAnalysis === "daily" && (
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Patrones de Gasto por Día del Mes
            </h3>

            {/* Visualización de patrón diario */}
            <div className="mb-5">
              <div className="relative pt-5 max-w-full overflow-x-auto">
                {/* Días del mes (eje x) */}
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>1</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                </div>

                {/* Línea de tiempo */}
                <div className="h-1 bg-gray-200 w-full relative mb-6">
                  {dailyPatterns.map((day, index) => (
                    <div
                      key={index}
                      className="absolute bottom-0 transform -translate-x-1/2"
                      style={{
                        left: `${(day.day / 30) * 100}%`,
                        height: `${Math.max(10, (day.amount / 80000) * 30)}px`,
                        width: "8px",
                        backgroundColor: "#3B82F6",
                        borderRadius: "4px 4px 0 0",
                      }}
                      title={`Día ${day.day}: ${formatCurrency(day.amount)}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Insights de patrones diarios */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                📊 Insights Principales
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    Los{" "}
                    <strong>
                      días {topSpendingDays[0].day} y {topSpendingDays[1].day}
                    </strong>{" "}
                    son cuando más gastas en el mes.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    Tus gastos se concentran en{" "}
                    <strong>inicio y mitad de mes</strong>, principalmente por
                    pagos recurrentes.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    Los <strong>fines de semana</strong> muestran un patrón
                    consistente de gastos en entretenimiento.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        )}

        {selectedAnalysis === "category" && (
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Frecuencia de Gastos por Categoría
            </h3>

            {/* Tabla de frecuencias */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Categoría
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Frecuencia
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Promedio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Consistencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryPatterns.map((cat, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cat.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cat.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(cat.avgAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{
                            backgroundColor: `${getConsistencyColor(
                              cat.consistency
                            )}20`,
                            color: getConsistencyColor(cat.consistency),
                          }}
                        >
                          {cat.consistency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Insights de patrones por categoría */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                🔍 Insights Principales
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    Tus gastos más predecibles son en{" "}
                    <strong>Alimentos, Transporte y Servicios</strong>.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    La categoría de <strong>Ropa</strong> muestra baja
                    consistencia, indicando compras esporádicas.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <p>
                    El <strong>Entretenimiento</strong> se concentra en fines de
                    semana con montos variables.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        )}

        {selectedAnalysis === "impulse" && (
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Gastos Planificados vs. Impulsivos
            </h3>

            {/* Visualización gráfica y estadísticas en layout mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex justify-center items-center">
                <div className="w-48 h-48 relative">
                  {/* Gráfico circular */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full transform -rotate-90"
                  >
                    {/* Segmento de gastos planificados */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray={`${impulseAnalysis.planned.percentage} ${
                        100 - impulseAnalysis.planned.percentage
                      }`}
                      strokeLinecap="round"
                    />
                    {/* Segmento de gastos impulsivos */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="20"
                      strokeDasharray={`${
                        impulseAnalysis.impulsive.percentage
                      } ${100 - impulseAnalysis.impulsive.percentage}`}
                      strokeDashoffset={`-${impulseAnalysis.planned.percentage}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm text-gray-600">Planificado</span>
                    <span className="text-lg font-bold text-green-600">
                      {impulseAnalysis.planned.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles de gastos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Gastos planificados */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                    Gastos Planificados
                  </h4>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-medium">
                      {formatCurrency(impulseAnalysis.planned.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">
                      Categorías principales:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {impulseAnalysis.planned.mostCommon.map(
                        (category, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full"
                          >
                            {category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Gastos impulsivos */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    Gastos Impulsivos
                  </h4>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-medium">
                      {formatCurrency(impulseAnalysis.impulsive.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">
                      Categorías principales:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {impulseAnalysis.impulsive.mostCommon.map(
                        (category, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full"
                          >
                            {category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  💡 Insights y Recomendaciones
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <p>
                      El{" "}
                      <strong>{impulseAnalysis.impulsive.percentage}%</strong>{" "}
                      de tus gastos son impulsivos, principalmente en comida
                      rápida y compras online.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <p>
                      Reducir tus gastos impulsivos en un 50% te permitiría
                      ahorrar aproximadamente{" "}
                      <strong>
                        {formatCurrency(impulseAnalysis.impulsive.amount * 0.5)}
                      </strong>{" "}
                      al mes.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <p>
                      Considera establecer un límite semanal para gastos no
                      planificados.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingPatternAnalysis;
