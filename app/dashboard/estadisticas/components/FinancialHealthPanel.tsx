import React, { FC } from "react";
import {
  FinancialHealthScore,
  HealthFactor,
} from "@/lib/financialHealthService";

interface FinancialHealthPanelProps {
  healthScore: FinancialHealthScore;
}

const FinancialHealthPanel: FC<FinancialHealthPanelProps> = ({
  healthScore,
}) => {
  const { score, category, color, factors, trend, recommendations } =
    healthScore;

  // Helper para mapear categorías a texto descriptivo
  const getCategoryText = (category: string) => {
    switch (category) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bueno";
      case "fair":
        return "Regular";
      case "needs-improvement":
        return "Necesita Mejoras";
      case "critical":
        return "Crítico";
      default:
        return "No disponible";
    }
  };

  // Helper para mapear tendencias a texto y emoji
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case "improving":
        return { text: "Mejorando", icon: "📈", color: "#10B981" };
      case "stable":
        return { text: "Estable", icon: "📊", color: "#6B7280" };
      case "declining":
        return { text: "Declinando", icon: "📉", color: "#EF4444" };
      default:
        return { text: "No disponible", icon: "❓", color: "#6B7280" };
    }
  };

  // Obtener información de tendencia
  const trendInfo = getTrendInfo(trend);

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Índice de Salud Financiera
      </h2>

      {/* Puntuación Principal */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 mb-1">Tu puntuación actual</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold" style={{ color }}>
              {score}
            </span>
            <span className="text-lg ml-2 text-gray-600">/100</span>
          </div>
          <span
            className="mt-2 text-sm px-3 py-1 rounded-full inline-block"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {getCategoryText(category)}
          </span>
        </div>

        {/* Medidor Visual */}
        <div className="w-24 h-24 relative">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full transform -rotate-90"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray="339.292"
              strokeDashoffset={339.292 - (339.292 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {score < 40 ? "😔" : score < 70 ? "😐" : "😃"}
            </span>
          </div>
        </div>
      </div>

      {/* Tendencia */}
      <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
        <span className="text-2xl mr-2">{trendInfo.icon}</span>
        <div>
          <p className="text-sm text-gray-600">Tendencia</p>
          <p className="font-medium" style={{ color: trendInfo.color }}>
            {trendInfo.text}
          </p>
        </div>
      </div>

      {/* Factores - Versión responsiva mejorada */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Factores de Puntuación
        </h3>
        <div className="space-y-4">
          {factors.map((factor: HealthFactor, index: number) => (
            <FactorBar key={index} factor={factor} />
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Recomendaciones Personalizadas
        </h3>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((recommendation, index) => (
            <div
              key={index}
              className="bg-blue-50 p-3 rounded-lg border border-blue-100"
            >
              <div className="flex items-start">
                <span className="text-blue-600 mr-3 mt-0.5">
                  {recommendation.priority === "high"
                    ? "🔔"
                    : recommendation.priority === "medium"
                    ? "ℹ️"
                    : "💡"}
                </span>
                <p className="text-sm text-gray-700">
                  {recommendation.message}
                </p>
              </div>
              {recommendation.actionable && (
                <div className="mt-2 flex justify-end">
                  <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              )}
            </div>
          ))}

          {recommendations.length > 3 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors w-full text-center mt-2">
              Ver todas las recomendaciones ({recommendations.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar el factor individual con barra de progreso
interface FactorBarProps {
  factor: HealthFactor;
}

const FactorBar: FC<FactorBarProps> = ({ factor }) => {
  const { name, score, maxScore, description, status } = factor;

  // Calcular porcentaje de la barra
  const percentage = Math.round((score / maxScore) * 100);

  // Determinar color de la barra y fondo según el estado
  const getStylesByStatus = (status: string) => {
    switch (status) {
      case "excellent":
        return {
          bar: "#10B981", // Verde
          bg: "#D1FAE5",
          text: "#065F46",
          emoji: "🌟",
        };
      case "good":
        return {
          bar: "#3B82F6", // Azul
          bg: "#DBEAFE",
          text: "#1E40AF",
          emoji: "👍",
        };
      case "fair":
        return {
          bar: "#FBBF24", // Amarillo
          bg: "#FEF3C7",
          text: "#92400E",
          emoji: "😐",
        };
      case "poor":
        return {
          bar: "#F97316", // Naranja
          bg: "#FFEDD5",
          text: "#9A3412",
          emoji: "⚠️",
        };
      case "critical":
        return {
          bar: "#EF4444", // Rojo
          bg: "#FEE2E2",
          text: "#B91C1C",
          emoji: "❗",
        };
      default:
        return {
          bar: "#6B7280", // Gris
          bg: "#F3F4F6",
          text: "#374151",
          emoji: "ℹ️",
        };
    }
  };

  const styles = getStylesByStatus(status);

  return (
    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="mr-2">{styles.emoji}</span>
          <span className="text-sm font-medium text-gray-800">{name}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-bold" style={{ color: styles.text }}>
            {score}
          </span>
          <span className="text-xs text-gray-500">/{maxScore}</span>
        </div>
      </div>{" "}
      <div
        className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
        style={{ backgroundColor: styles.bg }}
      >
        <div
          className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%`, backgroundColor: styles.bar }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export default FinancialHealthPanel;
