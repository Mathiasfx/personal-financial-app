import React, { useState } from "react";
import { TrendData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface AvailableMoneyTrendChartProps {
  data: TrendData[];
}

const AvailableMoneyTrendChart: React.FC<AvailableMoneyTrendChartProps> = ({
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>No hay datos suficientes</p>
        </div>
      </div>
    );
  }

  const displayData = data.slice(-8);
  const maxValue = Math.max(...displayData.map((d) => Math.abs(d.disponible)));
  const minValue = Math.min(...displayData.map((d) => d.disponible));
  const range = Math.max(maxValue - minValue, 1000);

  const trendDirection =
    displayData.length >= 2
      ? displayData[displayData.length - 1].disponible -
        displayData[0].disponible
      : 0;

  return (
    <div className="h-80 p-4">
      {/* Información del período seleccionado */}
      {hoveredIndex !== null && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            📅 {displayData[hoveredIndex].periodo}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div
              className={
                displayData[hoveredIndex].disponible >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              💰 Disponible:{" "}
              <span className="font-bold">
                {formatCurrency(displayData[hoveredIndex].disponible)}
              </span>
            </div>
            <div
              className={
                displayData[hoveredIndex].cambio >= 0
                  ? "text-blue-600"
                  : "text-orange-600"
              }
            >
              📊 Cambio:{" "}
              <span className="font-bold">
                {displayData[hoveredIndex].cambio >= 0 ? "+" : ""}
                {formatCurrency(displayData[hoveredIndex].cambio)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico simplificado con barras */}
      <div className="flex items-end justify-between h-full space-x-1">
        {displayData.map((item, index) => {
          const normalizedHeight = Math.max(
            ((item.disponible - minValue) / range) * 100,
            5
          );
          const isHovered = hoveredIndex === index;
          const isPositive = item.disponible >= 0;
          const changeIcon =
            item.cambio > 0 ? "📈" : item.cambio < 0 ? "📉" : "➡️";

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col items-center h-full justify-end relative">
                {/* Indicador de cambio */}
                <div
                  className={`absolute -top-6 text-sm transition-all duration-200 ${
                    isHovered ? "text-lg" : "text-xs"
                  }`}
                >
                  {changeIcon}
                </div>

                {/* Barra del gráfico */}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPositive
                      ? "bg-gradient-to-t from-green-600 to-green-400"
                      : "bg-gradient-to-t from-red-600 to-red-400"
                  } ${isHovered ? "shadow-lg scale-110" : ""}`}
                  style={{
                    height: `${normalizedHeight}%`,
                    minHeight: "8px",
                  }}
                  title={`${item.periodo}: ${formatCurrency(item.disponible)}`}
                />

                {/* Valor al hacer hover */}
                {isHovered && (
                  <div className="absolute -top-12 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-30">
                    {formatCurrency(item.disponible)}
                  </div>
                )}
              </div>

              {/* Etiqueta del mes */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isHovered
                      ? "text-gray-800 font-bold text-sm"
                      : "text-gray-600"
                  }`}
                >
                  {item.periodo.split("-")[1]}/
                  {item.periodo.split("-")[0].slice(-2)}
                </span>
                {isHovered && (
                  <div
                    className={`text-xs font-bold mt-1 ${
                      item.cambio > 0
                        ? "text-green-600"
                        : item.cambio < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.cambio !== 0 && (
                      <>
                        {item.cambio > 0 ? "+" : ""}
                        {formatCurrency(item.cambio)}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de tendencia */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">
              📊 Tendencia General:
            </span>
            <span
              className={`font-bold ${
                trendDirection > 0
                  ? "text-green-600"
                  : trendDirection < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {trendDirection > 0
                ? "📈 Mejorando"
                : trendDirection < 0
                ? "📉 Empeorando"
                : "➡️ Estable"}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Cambio total:{" "}
            <span
              className={`font-bold ${
                trendDirection >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendDirection >= 0 ? "+" : ""}
              {formatCurrency(trendDirection)}
            </span>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Positivo</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Negativo</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">📈 Mejora | 📉 Decline</span>
        </div>
      </div>
    </div>
  );
};

export default AvailableMoneyTrendChart;
