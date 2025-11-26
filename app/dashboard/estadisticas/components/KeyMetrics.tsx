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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* Promedio Mensual */}
      <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <h4 className="font-semibold text-blue-800 mb-2">
          Promedio Disponible
        </h4>
        <p className="text-2xl font-bold text-blue-600">
          {formatCurrency(metrics.promedioDisponible)}
        </p>
        <div className="flex justify-between mt-2 text-sm text-blue-700">
          <p>Ingresos: {formatCurrency(metrics.promedioIngresos)}</p>
          <p>Gastos: {formatCurrency(metrics.promedioGastos)}</p>
        </div>
        <div className="mt-3 flex justify-center">
          <div
            className={`px-3 py-1 rounded-full text-xs inline-flex items-center ${
              metrics.promedioDisponible > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {metrics.promedioDisponible > 0 ? (
              <>
                <span className="mr-1">✓</span>
                {(
                  (metrics.promedioDisponible / metrics.promedioIngresos) *
                  100
                ).toFixed(1)}
                % disponible
              </>
            ) : (
              <>
                <span className="mr-1">⚠️</span>
                Déficit de{" "}
                {(
                  (Math.abs(metrics.promedioDisponible) /
                    metrics.promedioIngresos) *
                  100
                ).toFixed(1)}
                %
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mejor Mes */}
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <span className="text-3xl">🏆</span>
          </div>
        </div>
        <h4 className="font-semibold text-green-800 mb-2">Mejor Mes</h4>
        <p className="text-lg font-bold text-green-600">
          {metrics.mejorMes?.periodo || "N/A"}
        </p>
        <p className="text-2xl font-bold text-green-600">
          {metrics.mejorMes
            ? formatCurrency(metrics.mejorMes.disponible)
            : "N/A"}
        </p>
        <p className="text-sm text-green-700 mt-2">Disponible más alto</p>
        {metrics.mejorMes && (
          <div className="mt-3 bg-green-100 px-3 py-1 rounded-full text-xs text-green-800 inline-block">
            {(
              (metrics.mejorMes.disponible / metrics.mejorMes.ingresos) *
              100
            ).toFixed(1)}
            % de ahorro
          </div>
        )}
      </div>

      {/* Peor Mes */}
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <span className="text-3xl">📉</span>
          </div>
        </div>
        <h4 className="font-semibold text-red-800 mb-2">Mes Más Difícil</h4>
        <p className="text-lg font-bold text-red-600">
          {metrics.peorMes?.periodo || "N/A"}
        </p>
        <p className="text-2xl font-bold text-red-600">
          {metrics.peorMes ? formatCurrency(metrics.peorMes.disponible) : "N/A"}
        </p>
        <p className="text-sm text-red-700 mt-2">Disponible más bajo</p>
        {metrics.peorMes && (
          <div className="mt-3 bg-red-100 px-3 py-1 rounded-full text-xs text-red-800 inline-block">
            {(
              (metrics.peorMes.disponible / metrics.peorMes.ingresos) *
              100
            ).toFixed(1)}
            % de ahorro
          </div>
        )}
      </div>

      {/* Categoría Más Gastada */}
      <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
            <span className="text-3xl">🎯</span>
          </div>
        </div>
        <h4 className="font-semibold text-purple-800 mb-2">Top Categoría</h4>
        <p className="text-lg font-bold text-purple-600 truncate max-w-full px-2">
          {metrics.categoriaMasGastada?.categoria || "N/A"}
        </p>
        <p className="text-2xl font-bold text-purple-600">
          {metrics.categoriaMasGastada
            ? formatCurrency(metrics.categoriaMasGastada.monto)
            : "-"}
        </p>
        <p className="text-sm text-purple-700 mt-2">
          {metrics.categoriaMasGastada
            ? `${metrics.categoriaMasGastada.porcentaje.toFixed(1)}% del total`
            : "Sin datos"}
        </p>
        {metrics.categoriaMasGastada && (
          <div className="mt-3 bg-purple-100 px-3 py-1 rounded-full text-xs text-purple-800 inline-block">
            Foco de ahorro potencial
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyMetrics;
