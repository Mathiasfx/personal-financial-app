import React from "react";
import { calculateKeyMetrics, PeriodData } from "@/lib/statisticsService";

interface TrendIndicatorProps {
  data: PeriodData[];
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <span className="text-2xl">📊</span>
        <p className="text-sm text-gray-600 mt-2">Sin datos suficientes</p>
      </div>
    );
  }

  const metrics = calculateKeyMetrics(data);

  const getTrendInfo = () => {
    switch (metrics.tendenciaGeneral) {
      case "up":
        return {
          icon: "📈",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Tendencia Positiva",
          description: "Tus finanzas están mejorando",
        };
      case "down":
        return {
          icon: "📉",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Tendencia Descendente",
          description: "Es momento de revisar tus gastos",
        };
      default:
        return {
          icon: "➡️",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "Tendencia Estable",
          description: "Tus finanzas se mantienen constantes",
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <div
      className={`${trendInfo.bgColor} ${trendInfo.borderColor} border rounded-lg p-4 text-center`}
    >
      <div className="text-3xl mb-2">{trendInfo.icon}</div>
      <h4 className={`font-semibold ${trendInfo.color} mb-1`}>
        {trendInfo.title}
      </h4>
      <p className={`text-sm ${trendInfo.color}`}>{trendInfo.description}</p>
      <div className="mt-3 text-xs text-gray-500">
        Basado en {data.length} período{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default TrendIndicator;
