import React, { useState } from "react";
import { FixedExpenseIncreaseData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface FixedExpenseIncreaseChartProps {
  data: FixedExpenseIncreaseData[];
}

const FixedExpenseIncreaseChart: React.FC<FixedExpenseIncreaseChartProps> = ({
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>No hay datos suficientes para comparar incrementos</p>
          <p className="text-sm mt-1">Se necesitan al menos 2 períodos</p>
        </div>
      </div>
    );
  }

  // Tomar los últimos 8 períodos para mejor visualización
  const displayData = data.slice(0, 8);
  const maxPercentage = Math.max(
    ...displayData.map((d) => Math.abs(d.incrementoPorcentual))
  );
  const chartMax = Math.max(maxPercentage * 1.2, 20); // Mínimo 20% para mejor escala
  const getBarGradient = (percentage: number) => {
    if (percentage > 15) return "from-red-400 to-red-600";
    if (percentage > 8) return "from-orange-400 to-orange-600";
    if (percentage > 3) return "from-yellow-400 to-yellow-600";
    if (percentage > 0) return "from-green-400 to-green-600";
    return "from-blue-400 to-blue-600";
  };

  const getInflationIndicator = (percentage: number) => {
    if (percentage > 15)
      return { emoji: "🚨", text: "Muy Alta", color: "text-red-600" };
    if (percentage > 8)
      return { emoji: "⚠️", text: "Alta", color: "text-orange-600" };
    if (percentage > 3)
      return { emoji: "📊", text: "Moderada", color: "text-yellow-600" };
    if (percentage > 0)
      return { emoji: "✅", text: "Baja", color: "text-green-600" };
    return { emoji: "📉", text: "Reducción", color: "text-blue-600" };
  };

  return (
    <div className="h-80 p-4">
      {/* Header con toggle para detalles */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-700">
            📈 Incremento de Gastos Fijos (%)
          </h3>
          <p className="text-xs text-gray-500">
            Inflación mensual de servicios
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
        >
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>

      {/* Información del período seleccionado */}
      {hoveredIndex !== null && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            📅 {displayData[hoveredIndex].periodo}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              💰 Total Gastos Fijos:{" "}
              <span className="font-bold">
                {formatCurrency(displayData[hoveredIndex].totalGastosFijos)}
              </span>
            </div>
            <div
              className={
                getInflationIndicator(
                  displayData[hoveredIndex].incrementoPorcentual
                ).color
              }
            >
              📊 Incremento:{" "}
              <span className="font-bold">
                {displayData[hoveredIndex].incrementoPorcentual > 0 ? "+" : ""}
                {displayData[hoveredIndex].incrementoPorcentual.toFixed(1)}%
              </span>{" "}
              {
                getInflationIndicator(
                  displayData[hoveredIndex].incrementoPorcentual
                ).emoji
              }{" "}
              {
                getInflationIndicator(
                  displayData[hoveredIndex].incrementoPorcentual
                ).text
              }
            </div>
          </div>

          {/* Categorías más afectadas */}
          {showDetails &&
            displayData[hoveredIndex].categoriasMasAfectadas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  🔥 Categorías más afectadas:
                </div>
                <div className="space-y-1">
                  {displayData[hoveredIndex].categoriasMasAfectadas
                    .slice(0, 3)
                    .map((categoria, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-gray-700">
                          {categoria.categoria}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            {formatCurrency(categoria.montoAnterior)} →{" "}
                            {formatCurrency(categoria.montoActual)}
                          </span>
                          <span
                            className={`font-bold ${
                              categoria.incrementoPorcentual > 10
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            +{categoria.incrementoPorcentual.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Gráfico de barras */}
      <div className="flex items-end justify-between h-48 bg-white rounded-lg p-2">
        {displayData.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const percentage = item.incrementoPorcentual;
          const barHeight = (Math.abs(percentage) / chartMax) * 100;
          const isNegative = percentage < 0;

          return (
            <div
              key={item.periodo}
              className="flex flex-col items-center flex-1 max-w-16"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Valor porcentual */}
              <div
                className={`text-xs font-bold mb-1 transition-all duration-200 ${
                  isHovered ? "scale-110 text-gray-800" : "text-gray-600"
                }`}
              >
                {percentage > 0 ? "+" : ""}
                {percentage.toFixed(1)}%
              </div>

              {/* Barra */}
              <div className="relative w-full flex flex-col justify-end h-full">
                <div
                  className={`w-full bg-gradient-to-t ${getBarGradient(
                    percentage
                  )} rounded-t-md transition-all duration-300 ${
                    isHovered ? "opacity-90 shadow-lg" : "opacity-75"
                  } ${isNegative ? "transform rotate-180" : ""}`}
                  style={{
                    height: `${Math.max(barHeight, 5)}%`,
                    minHeight: "8px",
                  }}
                >
                  {/* Indicator de inflación */}
                  {isHovered && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <span className="text-lg">
                        {getInflationIndicator(percentage).emoji}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Etiqueta del período */}
              <div
                className={`text-xs mt-2 transition-all duration-200 ${
                  isHovered ? "font-bold text-gray-800" : "text-gray-500"
                }`}
              >
                {item.periodo.split("-").slice(1).join("/")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda de interpretación */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>0-3% Inflación baja</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>3-8% Moderada</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>8-15% Alta</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>+15% Muy alta</span>
        </div>
      </div>
    </div>
  );
};

export default FixedExpenseIncreaseChart;
