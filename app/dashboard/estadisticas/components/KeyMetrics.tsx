import React from "react";
import { calculateKeyMetrics, PeriodData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";

interface KeyMetricsProps {
  data: PeriodData[];
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700">Sin datos</h4>
            <p className="text-xl font-bold text-gray-400">-</p>
          </div>
        ))}
      </div>
    );
  }

  const metrics = calculateKeyMetrics(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Promedio Mensual */}
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">
          💰 Promedio Disponible
        </h4>
        <p className="text-xl font-bold text-blue-600">
          {formatCurrency(metrics.promedioDisponible)}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Ingresos: {formatCurrency(metrics.promedioIngresos)}
        </p>
        <p className="text-sm text-blue-700">
          Gastos: {formatCurrency(metrics.promedioGastos)}
        </p>
      </div>

      {/* Mejor Mes */}
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2">🏆 Mejor Mes</h4>{" "}
        <p className="text-lg font-bold text-green-600">
          {metrics.mejorMes?.periodo || "N/A"}
        </p>
        <p className="text-xl font-bold text-green-600">
          {metrics.mejorMes
            ? formatCurrency(metrics.mejorMes.disponible)
            : "N/A"}
        </p>
        <p className="text-sm text-green-700">Disponible más alto</p>
      </div>

      {/* Peor Mes */}
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <h4 className="font-semibold text-red-800 mb-2">📉 Mes Más Difícil</h4>{" "}
        <p className="text-lg font-bold text-red-600">
          {metrics.peorMes?.periodo || "N/A"}
        </p>
        <p className="text-xl font-bold text-red-600">
          {metrics.peorMes ? formatCurrency(metrics.peorMes.disponible) : "N/A"}
        </p>
        <p className="text-sm text-red-700">Disponible más bajo</p>
      </div>

      {/* Categoría Más Gastada */}
      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-2">🎯 Top Categoría</h4>
        <p className="text-lg font-bold text-purple-600">
          {metrics.categoriaMasGastada?.categoria || "N/A"}
        </p>
        <p className="text-xl font-bold text-purple-600">
          {metrics.categoriaMasGastada
            ? formatCurrency(metrics.categoriaMasGastada.monto)
            : "-"}
        </p>
        <p className="text-sm text-purple-700">
          {metrics.categoriaMasGastada
            ? `${metrics.categoriaMasGastada.porcentaje.toFixed(1)}% del total`
            : "Sin datos"}
        </p>
      </div>
    </div>
  );
};

export default KeyMetrics;
