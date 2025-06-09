import React, { useState } from "react";
import { CategoryData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🥧</div>
          <p>No hay datos suficientes</p>
        </div>
      </div>
    );
  }

  const colors = [
    {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      gradient: "from-blue-500 to-blue-400",
    },
    {
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
      gradient: "from-green-500 to-green-400",
    },
    {
      bg: "bg-yellow-500",
      hover: "hover:bg-yellow-600",
      gradient: "from-yellow-500 to-yellow-400",
    },
    {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-600",
      gradient: "from-purple-500 to-purple-400",
    },
    {
      bg: "bg-pink-500",
      hover: "hover:bg-pink-600",
      gradient: "from-pink-500 to-pink-400",
    },
    {
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      gradient: "from-indigo-500 to-indigo-400",
    },
    {
      bg: "bg-red-500",
      hover: "hover:bg-red-600",
      gradient: "from-red-500 to-red-400",
    },
    {
      bg: "bg-teal-500",
      hover: "hover:bg-teal-600",
      gradient: "from-teal-500 to-teal-400",
    },
  ];

  const topCategories = data.slice(0, 8);
  const totalAmount = data.reduce((sum, cat) => sum + cat.monto, 0);

  return (
    <div className="h-80 p-4">
      {/* Información de categoría seleccionada */}
      {hoveredCategory && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          {(() => {
            const category = topCategories.find(
              (c) => c.categoria === hoveredCategory
            );
            if (!category) return null;
            return (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  🏷️ {category.categoria}
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-gray-600">
                    💰 Monto:{" "}
                    <span className="font-bold text-gray-800">
                      {formatCurrency(category.monto)}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    📊 Porcentaje:{" "}
                    <span className="font-bold text-gray-800">
                      {category.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex h-full">
        {/* Gráfico de barras horizontales mejorado */}
        <div className="flex-1 flex flex-col justify-between space-y-1">
          {topCategories.map((category, index) => {
            const percentage = category.porcentaje;
            const colorConfig = colors[index % colors.length];
            const isHovered = hoveredCategory === category.categoria;

            return (
              <div
                key={index}
                className={`flex items-center cursor-pointer transition-all duration-200 p-1 rounded ${
                  isHovered ? "bg-gray-100 scale-102" : ""
                }`}
                onMouseEnter={() => setHoveredCategory(category.categoria)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Nombre de categoría - ancho fijo para evitar superposiciones */}
                <div className="w-20 flex-shrink-0">
                  <div
                    className={`text-xs font-medium text-gray-700 truncate transition-all duration-200 ${
                      isHovered ? "text-gray-900 font-bold" : ""
                    }`}
                  >
                    {category.categoria}
                  </div>
                  {isHovered && (
                    <div className="text-xs text-gray-500 mt-1">
                      #{index + 1}
                    </div>
                  )}
                </div>

                {/* Barra con animación */}
                <div className="flex-1 mx-2">
                  <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        colorConfig.gradient
                      } rounded-full transition-all duration-700 ease-out flex items-center justify-end relative ${
                        isHovered ? "shadow-lg" : ""
                      }`}
                      style={{
                        width: `${Math.max(percentage, 5)}%`,
                        transform: isHovered ? "scaleY(1.1)" : "scaleY(1)",
                      }}
                    >
                      {/* Patrón de barras para mayor dinamismo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>

                      {/* Porcentaje dentro de la barra */}
                      <span className="text-xs text-white font-bold px-2 z-10">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monto - ancho fijo */}
                <div className="w-16 flex-shrink-0 text-right">
                  <div
                    className={`text-xs text-gray-600 transition-all duration-200 ${
                      isHovered ? "text-gray-800 font-bold" : ""
                    }`}
                  >
                    {formatCurrency(category.monto)
                      .replace(/[$,]/g, "")
                      .slice(0, -3)}
                    k
                  </div>
                  {isHovered && (
                    <div className="text-xs text-gray-500">
                      {formatCurrency(category.monto)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen mejorado */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              💰 Total Analizado
            </p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">📊 Categorías</p>
            <p className="text-lg font-bold text-purple-600">
              {data.length} {data.length > 8 && `(top 8)`}
            </p>
          </div>
        </div>

        {data.length > 8 && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Mostrando las 8 categorías principales de {data.length} total
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
