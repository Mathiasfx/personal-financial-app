import React, { useState } from "react";
import { PeriodData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface FixedVsVariableExpensesChartProps {
  data: PeriodData[];
}

interface ProcessedExpenseData {
  periodo: string;
  gastosFijos: number;
  gastosVariables: number;
  total: number;
  incrementoFijos: number;
  incrementoVariables: number;
  gastosDetalladosFijos: { [key: string]: number };
}

const FixedVsVariableExpensesChart: React.FC<
  FixedVsVariableExpensesChartProps
> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚖️</div>
          <p>No hay datos suficientes</p>
        </div>
      </div>
    );
  }

  // Procesar datos con incrementos y detalles
  const processedData: ProcessedExpenseData[] = data
    .slice(-8)
    .map((period, index, arr) => {
      // Calcular gastos fijos detallados por categoría
      const gastosDetalladosFijos: { [key: string]: number } = {};
      let gastosFijos = 0;

      Object.values(period.data.gastosFijos || {}).forEach((gasto) => {
        if (gasto.pagado) {
          const categoria = gasto.categoria?.nombre || "Sin categoría";
          gastosDetalladosFijos[categoria] =
            (gastosDetalladosFijos[categoria] || 0) + gasto.monto;
          gastosFijos += gasto.monto;
        }
      });

      const gastosVariables = (period.data.gastosVariables || []).reduce(
        (sum, gasto) => sum + gasto.monto,
        0
      );

      // Calcular incrementos respecto al período anterior
      const previousPeriod = index > 0 ? arr[index - 1] : null;
      let incrementoFijos = 0;
      let incrementoVariables = 0;

      if (previousPeriod) {
        const prevGastosFijos = Object.values(
          previousPeriod.data.gastosFijos || {}
        ).reduce((sum, gasto) => sum + (gasto.pagado ? gasto.monto : 0), 0);
        const prevGastosVariables = (
          previousPeriod.data.gastosVariables || []
        ).reduce((sum, gasto) => sum + gasto.monto, 0);

        incrementoFijos = gastosFijos - prevGastosFijos;
        incrementoVariables = gastosVariables - prevGastosVariables;
      }

      return {
        periodo: period.id,
        gastosFijos,
        gastosVariables,
        total: gastosFijos + gastosVariables,
        incrementoFijos,
        incrementoVariables,
        gastosDetalladosFijos,
      };
    });

  const maxTotal = Math.max(...processedData.map((d) => d.total)) * 1.2;

  return (
    <div className="h-80 p-4">
      {/* Información detallada del período seleccionado */}
      {hoveredIndex !== null && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            📅 {processedData[hoveredIndex].periodo}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-blue-700 font-semibold mb-1">
                💼 Gastos Fijos
              </div>
              <div className="text-blue-900 font-bold">
                {formatCurrency(processedData[hoveredIndex].gastosFijos)}
              </div>
              {processedData[hoveredIndex].incrementoFijos !== 0 && (
                <div
                  className={`text-xs mt-1 ${
                    processedData[hoveredIndex].incrementoFijos > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {processedData[hoveredIndex].incrementoFijos > 0
                    ? "↗️"
                    : "↘️"}
                  {formatCurrency(
                    Math.abs(processedData[hoveredIndex].incrementoFijos)
                  )}{" "}
                  vs anterior
                </div>
              )}
            </div>

            <div className="bg-orange-50 p-2 rounded">
              <div className="text-orange-700 font-semibold mb-1">
                🛒 Gastos Variables
              </div>
              <div className="text-orange-900 font-bold">
                {formatCurrency(processedData[hoveredIndex].gastosVariables)}
              </div>
              {processedData[hoveredIndex].incrementoVariables !== 0 && (
                <div
                  className={`text-xs mt-1 ${
                    processedData[hoveredIndex].incrementoVariables > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {processedData[hoveredIndex].incrementoVariables > 0
                    ? "↗️"
                    : "↘️"}
                  {formatCurrency(
                    Math.abs(processedData[hoveredIndex].incrementoVariables)
                  )}{" "}
                  vs anterior
                </div>
              )}
            </div>
          </div>

          {/* Detalles de gastos fijos */}
          {showDetails &&
            Object.keys(processedData[hoveredIndex].gastosDetalladosFijos)
              .length > 0 && (
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div className="font-semibold text-blue-800 mb-1">
                  Desglose gastos fijos:
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(
                    processedData[hoveredIndex].gastosDetalladosFijos
                  ).map(([categoria, monto]) => (
                    <div
                      key={categoria}
                      className="flex justify-between text-blue-700"
                    >
                      <span className="truncate">{categoria}:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(monto)
                          .replace(/[$,]/g, "")
                          .slice(0, -3)}
                        k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      <div className="flex items-end justify-between h-full space-x-1">
        {processedData.map((item, index) => {
          const fixedHeight =
            maxTotal > 0 ? (item.gastosFijos / maxTotal) * 100 : 0;
          const variableHeight =
            maxTotal > 0 ? (item.gastosVariables / maxTotal) * 100 : 0;
          const isHovered = hoveredIndex === index;
          const hasIncrement =
            item.incrementoFijos !== 0 || item.incrementoVariables !== 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col items-center h-full justify-end relative">
                {/* Indicadores de incremento */}
                {hasIncrement && (
                  <div className="absolute -top-6 flex space-x-1">
                    {item.incrementoFijos > 0 && (
                      <div
                        className="w-2 h-2 bg-red-400 rounded-full"
                        title="Gastos fijos aumentaron"
                      ></div>
                    )}
                    {item.incrementoFijos < 0 && (
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        title="Gastos fijos disminuyeron"
                      ></div>
                    )}
                    {item.incrementoVariables > 0 && (
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full"
                        title="Gastos variables aumentaron"
                      ></div>
                    )}
                    {item.incrementoVariables < 0 && (
                      <div
                        className="w-2 h-2 bg-teal-400 rounded-full"
                        title="Gastos variables disminuyeron"
                      ></div>
                    )}
                  </div>
                )}

                {/* Barra apilada mejorada */}
                <div
                  className={`flex flex-col relative transition-all duration-300 ${
                    isHovered ? "w-8 shadow-lg" : "w-6"
                  }`}
                >
                  {/* Gastos Variables (arriba) */}
                  {item.gastosVariables > 0 && (
                    <div
                      className="bg-gradient-to-t from-orange-600 to-orange-400 rounded-t transition-all duration-300 hover:from-orange-700 hover:to-orange-500 flex items-center justify-center relative overflow-hidden"
                      style={{
                        height: `${Math.max(variableHeight, 3)}%`,
                        minHeight: "6px",
                      }}
                      title={`Gastos Variables: ${formatCurrency(
                        item.gastosVariables
                      )}`}
                    >
                      {/* Patrón animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                      {isHovered && (
                        <span className="text-xs text-white font-bold transform rotate-90 z-10">
                          V
                        </span>
                      )}
                    </div>
                  )}

                  {/* Gastos Fijos (abajo) */}
                  {item.gastosFijos > 0 && (
                    <div
                      className={`bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:from-blue-700 hover:to-blue-500 flex items-center justify-center relative overflow-hidden ${
                        item.gastosVariables === 0 ? "rounded-t" : ""
                      }`}
                      style={{
                        height: `${Math.max(fixedHeight, 3)}%`,
                        minHeight: "6px",
                      }}
                      title={`Gastos Fijos: ${formatCurrency(
                        item.gastosFijos
                      )}`}
                    >
                      {/* Patrón animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                      {isHovered && (
                        <span className="text-xs text-white font-bold transform rotate-90 z-10">
                          F
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Etiqueta del mes con información adicional */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isHovered ? "text-gray-800 font-bold" : "text-gray-600"
                  }`}
                >
                  {item.periodo.split("-")[1]}/
                  {item.periodo.split("-")[0].slice(-2)}
                </span>
                {isHovered && (
                  <div className="text-xs text-gray-700 mt-1 font-medium">
                    {formatCurrency(item.total)
                      .replace(/[$,]/g, "")
                      .slice(0, -3)}
                    k
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles y leyenda */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
          >
            {showDetails
              ? "🔼 Ocultar detalles"
              : "🔽 Ver detalles de gastos fijos"}
          </button>
        </div>

        <div className="flex justify-center space-x-6 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded shadow-sm"></div>
            <span className="text-sm text-gray-700 font-medium">
              Gastos Fijos
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-600 to-orange-400 rounded shadow-sm"></div>
            <span className="text-sm text-gray-700 font-medium">
              Gastos Variables
            </span>
          </div>
        </div>

        {/* Indicadores de cambios */}
        <div className="flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-gray-600">Aumento</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-600">Disminución</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedVsVariableExpensesChart;
