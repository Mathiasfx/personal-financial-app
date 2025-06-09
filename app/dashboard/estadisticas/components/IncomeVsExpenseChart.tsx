import React, { useState } from "react";
import { IncomeVsExpenseData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface IncomeVsExpenseChartProps {
  data: IncomeVsExpenseData[];
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No hay datos suficientes</p>
        </div>
      </div>
    );
  }

  // Tomar los últimos 8 meses para mejor visualización
  const displayData = data.slice(-8);
  const maxValue = Math.max(
    ...displayData.map((d) => Math.max(d.ingresos, d.gastos))
  );

  // Añadir margen del 20% para mejor visualización
  const chartMax = maxValue * 1.2;

  return (
    <div className="h-80 p-4">
      {/* Información del período seleccionado */}
      {hoveredIndex !== null && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            📅 {displayData[hoveredIndex].periodo}
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-green-600">
              💰 Ingresos:{" "}
              <span className="font-bold">
                {formatCurrency(displayData[hoveredIndex].ingresos)}
              </span>
            </div>
            <div className="text-red-600">
              💸 Gastos:{" "}
              <span className="font-bold">
                {formatCurrency(displayData[hoveredIndex].gastos)}
              </span>
            </div>
            <div
              className={`${
                displayData[hoveredIndex].disponible >= 0
                  ? "text-blue-600"
                  : "text-orange-600"
              }`}
            >
              💳 Disponible:{" "}
              <span className="font-bold">
                {formatCurrency(displayData[hoveredIndex].disponible)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between h-full space-x-1">
        {displayData.map((item, index) => {
          const ingresosHeight = (item.ingresos / chartMax) * 100;
          const gastosHeight = (item.gastos / chartMax) * 100;
          const isHovered = hoveredIndex === index;
          const balancePositivo = item.disponible >= 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col items-center h-full justify-end relative">
                {/* Indicador de balance */}
                <div
                  className={`absolute -top-4 w-full flex justify-center ${
                    isHovered ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      balancePositivo ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                </div>

                {/* Barras lado a lado */}
                <div className="flex space-x-1 items-end h-full">
                  {/* Barra de Ingresos */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300 ${
                        isHovered ? "w-6 shadow-lg scale-110" : "w-5"
                      } hover:from-green-700 hover:to-green-500`}
                      style={{
                        height: `${Math.max(ingresosHeight, 3)}%`,
                        minHeight: "8px",
                      }}
                      title={`Ingresos: ${formatCurrency(item.ingresos)}`}
                    ></div>
                    {isHovered && (
                      <span className="text-xs text-green-700 font-bold mt-1">
                        {formatCurrency(item.ingresos)
                          .replace(/\$|,/g, "")
                          .slice(0, -3)}
                        k
                      </span>
                    )}
                  </div>

                  {/* Barra de Gastos */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all duration-300 ${
                        isHovered ? "w-6 shadow-lg scale-110" : "w-5"
                      } hover:from-red-700 hover:to-red-500`}
                      style={{
                        height: `${Math.max(gastosHeight, 3)}%`,
                        minHeight: "8px",
                      }}
                      title={`Gastos: ${formatCurrency(item.gastos)}`}
                    ></div>
                    {isHovered && (
                      <span className="text-xs text-red-700 font-bold mt-1">
                        {formatCurrency(item.gastos)
                          .replace(/\$|,/g, "")
                          .slice(0, -3)}
                        k
                      </span>
                    )}
                  </div>
                </div>
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
                      balancePositivo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {balancePositivo ? "✓" : "⚠"}{" "}
                    {formatCurrency(Math.abs(item.disponible))
                      .replace(/\$|,/g, "")
                      .slice(0, -3)}
                    k
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda mejorada */}
      <div className="flex justify-center space-x-8 mt-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-400 rounded shadow-sm"></div>
          <span className="text-sm text-gray-700 font-medium">Ingresos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-400 rounded shadow-sm"></div>
          <span className="text-sm text-gray-700 font-medium">Gastos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-gray-600">Balance +</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-xs text-gray-600">Balance -</span>
        </div>{" "}
      </div>
    </div>
  );
};

export default IncomeVsExpenseChart;
