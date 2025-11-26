import React, { FC, useMemo } from "react";
import { PeriodData } from "@/lib/statisticsService";
import { formatCurrency } from "@/lib/utils";
import { generateFinancialForecast } from "@/lib/forecastService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Info, TrendingDown, TrendingUp } from "lucide-react";

// Helper function to format percentages
const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface FinancialForecastProps {
  periodData: PeriodData[];
}

const FinancialForecast: FC<FinancialForecastProps> = ({ periodData }) => {
  // Solo proyecta a 1 mes
  const currentPrediction = useMemo(
    () => generateFinancialForecast(periodData, 1),
    [periodData]
  );

  // Helper para iconos de tendencia
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return (
          <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
        );
    }
  };

  if (periodData.length < 3) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pronóstico Financiero</CardTitle>
          <p className="text-sm text-muted-foreground">
            Se necesitan al menos 3 períodos de datos para generar un pronóstico
            mensual.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pronóstico Financiero (Próximo mes)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen principal */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Saldo estimado */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Saldo Estimado</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Estimación basada en tus ingresos y gastos históricos para
                      el próximo mes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2">
              <p
                className={`text-2xl font-bold ${
                  currentPrediction.endOfMonthBalance < 0 ? "text-red-600" : ""
                }`}
              >
                {formatCurrency(currentPrediction.endOfMonthBalance)}
              </p>
              <p className="text-sm text-muted-foreground">
                Rango esperado:{" "}
                {formatCurrency(currentPrediction.minExpectedBalance)} -{" "}
                {formatCurrency(currentPrediction.maxExpectedBalance)}
              </p>
              {currentPrediction.endOfMonthBalance < 0 && (
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  Advertencia: El saldo estimado es negativo. Revisa tus gastos
                  y ajusta tu presupuesto.
                </p>
              )}
            </div>
          </div>
          {/* Tasa de ahorro */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Tasa de Ahorro</h3>
            <div className="mt-2">
              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  {formatPercentage(currentPrediction.savingsRate / 100)}
                </p>
                {currentPrediction.savingsRate > 20 ? (
                  <TrendingUp className="ml-2 h-5 w-5 text-green-500" />
                ) : currentPrediction.savingsRate > 0 ? (
                  <TrendingDown className="ml-2 h-5 w-5 text-yellow-500" />
                ) : (
                  <TrendingDown className="ml-2 h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPrediction.savingsRate > 20
                  ? "¡Excelente! Estás ahorrando más del 20%"
                  : currentPrediction.savingsRate > 0
                  ? "Intenta ahorrar al menos el 20% de tus ingresos"
                  : "Advertencia: No estás ahorrando, revisa tus gastos y ajusta tu presupuesto"}
              </p>
            </div>
          </div>
          {/* Reserva de efectivo */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Reserva de Efectivo</h3>
            <div className="mt-2">
              <p className="text-2xl font-bold">
                {Math.round(currentPrediction.cashRunway)} días
              </p>
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${
                      currentPrediction.cashRunway >= 90
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (currentPrediction.cashRunway / 90) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentPrediction.cashRunway >= 90
                    ? "¡Excelente! Tienes más de 3 meses de reserva"
                    : `Objetivo: 90 días (${Math.max(
                        0,
                        90 - Math.round(currentPrediction.cashRunway)
                      )} días restantes)`}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Desglose de gastos */}
        <div>
          <h3 className="mb-3 text-lg font-medium">Desglose de Gastos</h3>
          <div className="space-y-3">
            {currentPrediction.projectedExpenses
              .sort(
                (
                  a: (typeof currentPrediction.projectedExpenses)[number],
                  b: (typeof currentPrediction.projectedExpenses)[number]
                ) => b.amount - a.amount
              )
              .map(
                (
                  expense: (typeof currentPrediction.projectedExpenses)[number],
                  index: number
                ) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {expense.category}
                        </span>
                        {getTrendIcon(expense.trend)}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercentage(expense.percentageOfIncome / 100)}{" "}
                          de ingresos
                        </p>
                        {/* Advertencia si el gasto parece bajo */}
                        {["alquiler", "expensas"].some((cat) =>
                          expense.category.toLowerCase().includes(cat)
                        ) &&
                          expense.amount < 100000 && (
                            <span className="block text-xs text-red-500 mt-1">
                              ⚠️ El gasto proyectado parece bajo. Verifica tus
                              datos históricos.
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full ${
                          expense.percentageOfIncome > 30
                            ? "bg-red-500"
                            : expense.percentageOfIncome > 15
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            expense.percentageOfIncome
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
        {/* Recomendaciones */}
        {currentPrediction.recommendations.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="mb-2 flex items-center text-sm font-medium">
              <AlertCircle className="mr-2 h-4 w-4" />
              Recomendaciones
            </h3>
            <ul className="space-y-2">
              {currentPrediction.recommendations.map(
                (rec: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
        {/* Nivel de confianza */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Nivel de Confianza</h3>
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">
                {Math.round(currentPrediction.confidenceScore)}%
              </span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${
                    currentPrediction.confidenceScore > 70
                      ? "bg-green-500"
                      : currentPrediction.confidenceScore > 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${currentPrediction.confidenceScore}%` }}
                />
              </div>
            </div>
          </div>
          {currentPrediction.confidenceFactors.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                Factores que afectan la confianza:
              </p>
              <ul className="space-y-1 text-sm">
                {currentPrediction.confidenceFactors.map(
                  (
                    factor: {
                      impact: string;
                      description: string;
                    },
                    i: number
                  ) => (
                    <li key={i} className="flex items-start">
                      {factor.impact === "positive" ? (
                        <span className="mr-2 text-green-500">✓</span>
                      ) : factor.impact === "negative" ? (
                        <span className="mr-2 text-red-500">✗</span>
                      ) : (
                        <span className="mr-2">•</span>
                      )}
                      <span>{factor.description}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialForecast;
