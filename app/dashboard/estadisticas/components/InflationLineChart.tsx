import React, { useState } from "react";
import { FixedExpenseIncreaseData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface InflationLineChartProps {
  data: FixedExpenseIncreaseData[];
}

const InflationLineChart: React.FC<InflationLineChartProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<FixedExpenseIncreaseData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No hay datos suficientes para comparar incrementos</p>
          <p className="text-sm mt-1">Se necesitan al menos 2 períodos</p>
        </div>
      </div>
    );
  }

  // Tomar los últimos 8 períodos y ordenar cronológicamente
  const displayData = data.slice(0, 8).reverse();
  const maxPercentage = Math.max(
    ...displayData.map((d) => Math.abs(d.incrementoPorcentual))
  );
  const chartMax = Math.max(maxPercentage * 1.3, 25);

  const getColorByPercentage = (percentage: number) => {
    if (percentage > 15) return "#ef4444"; // red-500
    if (percentage > 8) return "#f97316"; // orange-500
    if (percentage > 3) return "#eab308"; // yellow-500
    if (percentage > 0) return "#22c55e"; // green-500
    return "#3b82f6"; // blue-500
  };

  const getBackgroundColor = (percentage: number) => {
    if (percentage > 15) return "bg-red-50";
    if (percentage > 8) return "bg-orange-50";
    if (percentage > 3) return "bg-yellow-50";
    if (percentage > 0) return "bg-green-50";
    return "bg-blue-50";
  };

  const getInflationLevel = (percentage: number) => {
    if (percentage > 15) return "🚨 Muy Alta";
    if (percentage > 8) return "⚠️ Alta";
    if (percentage > 3) return "📊 Moderada";
    if (percentage > 0) return "✅ Baja";
    return "📉 Reducción";
  };

  // Generar puntos para la línea SVG
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 40;

  const points = displayData.map((item, index) => {
    const x =
      padding + (index * (svgWidth - 2 * padding)) / (displayData.length - 1);
    const y =
      svgHeight -
      padding -
      ((item.incrementoPorcentual + chartMax) * (svgHeight - 2 * padding)) /
        (2 * chartMax);
    return { x, y, data: item };
  });

  // Generar path para la línea
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="h-80 p-2 space-y-1 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        {selectedPeriod && (
          <div className="text-right">
            <div className="text-sm font-bold text-gray-700">
              {selectedPeriod.periodo}
            </div>
            <div className="text-xs text-gray-500">Click para detalles</div>
          </div>
        )}
      </div>

      {/* Gráfico de líneas SVG */}
      <div className="bg-white rounded-lg border p-4">
        <svg
          width="100%"
          height="200"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          {/* Líneas de referencia horizontales */}
          {[-20, -10, 0, 10, 20].map((value) => {
            const y =
              svgHeight -
              padding -
              ((value + chartMax) * (svgHeight - 2 * padding)) / (2 * chartMax);
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={svgWidth - padding}
                  y2={y}
                  stroke={value === 0 ? "#374151" : "#e5e7eb"}
                  strokeWidth={value === 0 ? "2" : "1"}
                  strokeDasharray={value === 0 ? "none" : "5,5"}
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          {/* Línea principal */}
          <path
            d={pathData}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Área bajo la línea (gradiente) */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${
              svgHeight - padding
            } L ${points[0].x} ${svgHeight - padding} Z`}
            fill="url(#areaGradient)"
          />

          {/* Puntos interactivos */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={getColorByPercentage(point.data.incrementoPorcentual)}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-8 transition-all duration-200"
                onClick={() =>
                  setSelectedPeriod(
                    selectedPeriod?.periodo === point.data.periodo
                      ? null
                      : point.data
                  )
                }
              />
              {/* Etiqueta del período */}
              <text
                x={point.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {point.data.periodo.split("-").slice(1).join("/")}
              </text>
              {/* Valor del porcentaje */}
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="text-xs font-bold"
                fill={getColorByPercentage(point.data.incrementoPorcentual)}
              >
                {point.data.incrementoPorcentual > 0 ? "+" : ""}
                {point.data.incrementoPorcentual.toFixed(1)}%
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Panel de detalles (solo cuando se selecciona un período) */}
      {selectedPeriod && (
        <div
          className={`${getBackgroundColor(
            selectedPeriod.incrementoPorcentual
          )} rounded-lg p-4 border absolute top-0 left-0 w-full z-10`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-gray-800">
                📅 {selectedPeriod.periodo}
              </h4>
              <p className="text-sm text-gray-600">
                {getInflationLevel(selectedPeriod.incrementoPorcentual)}
              </p>
              {/* Advertencia si el total bajó pero alguna categoría principal subió */}
              {selectedPeriod.incrementoPorcentual < 0 &&
                selectedPeriod.categoriasMasAfectadas.some(
                  (cat) =>
                    ["alquiler", "expensas"].some((key) =>
                      cat.categoria.toLowerCase().includes(key)
                    ) && cat.incrementoPorcentual > 0
                ) && (
                  <p className="text-xs text-orange-600 mt-2 font-semibold">
                    ⚠️ Aunque el total bajó, alguna categoría principal aumentó.
                    Revisa los detalles.
                  </p>
                )}
            </div>
            <button
              onClick={() => setSelectedPeriod(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información general */}
            <div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">💰 Total Gastos Fijos:</span>
                  <span className="font-bold ml-2">
                    {formatCurrency(selectedPeriod.totalGastosFijos)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">📊 Incremento:</span>
                  <span
                    className="font-bold ml-2"
                    style={{
                      color: getColorByPercentage(
                        selectedPeriod.incrementoPorcentual
                      ),
                    }}
                  >
                    {selectedPeriod.incrementoPorcentual > 0 ? "+" : ""}
                    {selectedPeriod.incrementoPorcentual.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Categorías más afectadas */}
            {selectedPeriod.categoriasMasAfectadas.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">
                  🔥 Más Afectadas:
                </h5>
                <div className="space-y-1 text-sm">
                  {selectedPeriod.categoriasMasAfectadas
                    .slice(0, 3)
                    .map((categoria, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-700 truncate">
                          {categoria.categoria}
                        </span>
                        <span className="font-bold text-red-600 ml-2">
                          +{categoria.incrementoPorcentual.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leyenda de interpretación */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Reducción</span>
        </div>
        <div className="flex items-cen