/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PeriodData } from "./statisticsService";

interface Prediction {
  endOfMonthBalance: number;
  confidenceScore: number;
  potentialSavings: number;
  projectedExpenses: Array<{
    category: string;
    amount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    percentageOfIncome: number;
  }>;
  confidenceFactors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
}

export interface ForecastData {
  endOfMonthBalance: number;
  minExpectedBalance: number;
  maxExpectedBalance: number;
  savingsRate: number;
  cashRunway: number;
  projectedExpenses: Array<{
    category: string;
    amount: number;
    trend: 'up' | 'down' | 'stable';
    percentageOfIncome: number;
  }>;
  confidenceScore: number;
  confidenceFactors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
}

// Helper function to calculate average income
export function calculateAverageIncome(periods: PeriodData[]): number {
  if (!periods.length) return 0;
  const total = periods.reduce((sum, period) => {
    return sum + (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
  }, 0);
  return total / periods.length;
}

// Helper function to calculate expense breakdown
interface ExpenseEntry {
  amount: number;
  count: number;
  trend: number;
}

function calculateExpenseBreakdown(periods: PeriodData[], forecastMonths: number, avgIncome: number) {
  const categories = new Map<string, ExpenseEntry>();

  periods.forEach(period => {
    // Process fixed expenses
    Object.values(period.data.gastosFijos || {}).forEach((expense: any) => {
      const category = expense.categoria?.nombre || 'Otros';
      const entry = categories.get(category) || { amount: 0, count: 0, trend: 0 };
      entry.amount += expense.monto || 0;
      entry.count++;
      categories.set(category, entry);
    });

    // Process variable expenses
    ((period.data.gastosVariables as any[]) || []).forEach((expense: any) => {
      const category = expense.categoria?.nombre || 'Otros';
      const entry = categories.get(category) || { amount: 0, count: 0, trend: 0 };
      entry.amount += expense.monto || 0;
      entry.count++;
      categories.set(category, entry);
    });
  });

  // Calculate averages and trends
  return Array.from(categories.entries()).map(([category, data]) => {
    const avgAmount = (data.amount / Math.max(1, data.count)) * forecastMonths;
    const percentageOfIncome = (avgAmount / Math.max(1, avgIncome * forecastMonths)) * 100;

    // Simple trend calculation (could be enhanced)
    const trend: 'up' | 'down' | 'stable' = Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'stable');

    return {
      category,
      amount: avgAmount,
      trend,
      percentageOfIncome
    };
  });
}

// Helper function to calculate current balance
function calculateCurrentBalance(period: PeriodData): number {
  const income = (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
  const fixedExpenses = Object.values(period.data.gastosFijos || {}).reduce(
    (sum, exp: any) => sum + (exp.monto || 0), 0
  );
  const variableExpenses = (period.data.gastosVariables || []).reduce(
    (sum: number, exp: any) => sum + (exp.monto || 0), 0
  );
  return income - fixedExpenses - variableExpenses;
}

// Helper function to calculate cash runway in days
function calculateCashRunway(currentBalance: number, totalExpenses: number, months: number): number {
  const avgMonthlyExpense = totalExpenses / Math.max(1, months);
  return avgMonthlyExpense > 0 ? (currentBalance / avgMonthlyExpense) * 30 : 0;
}

// Helper function to calculate confidence score (0-1)
function calculateConfidenceScore(periods: PeriodData[], forecastMonths: number): number {
  let score = Math.min(100, periods.length * 10) / 100;

  if (forecastMonths > 3) score *= 0.9;
  if (forecastMonths > 6) score *= 0.8;

  const consistency = calculateIncomeConsistency(periods);
  score = score * 0.5 + (consistency * 0.5);

  return Math.max(0, Math.min(1, score));
}

// Helper function to calculate income consistency (0-1)
function calculateIncomeConsistency(periods: PeriodData[]): number {
  if (periods.length < 2) return 0.5;

  const incomes = periods.map(p => (p.data.ingresos || 0) + (p.data.ingresosExtras || 0));
  const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const variance = incomes.reduce((sum, income) => sum + Math.pow(income - avgIncome, 2), 0) / incomes.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0, 1 - (stdDev / Math.max(1, avgIncome)));
}

// Helper function to generate recommendations
function generateRecommendations(metrics: {
  savingsRate: number;
  cashRunway: number;
  expenseBreakdown: Array<{ category: string, percentageOfIncome: number }>;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.savingsRate < 20) {
    recommendations.push(
      `Tu tasa de ahorro es del ${metrics.savingsRate.toFixed(0)}%. Intenta ahorrar al menos el 20% de tus ingresos.`
    );
  }

  if (metrics.cashRunway < 90) {
    recommendations.push(
      `Tienes efectivo para ${Math.round(metrics.cashRunway)} días. El objetivo es tener al menos 90 días de reserva.`
    );
  }

  const highExpense = metrics.expenseBreakdown
    .filter(e => e.percentageOfIncome > 30)
    .sort((a, b) => b.percentageOfIncome - a.percentageOfIncome)[0];

  if (highExpense) {
    recommendations.push(
      `El gasto en ${highExpense.category} es alto (${highExpense.percentageOfIncome.toFixed(0)}% de tus ingresos). Considera reducirlo.`
    );
  }

  return recommendations.length > 0
    ? recommendations
    : ["¡Buen trabajo! Tus finanzas parecen estar en buen estado."];
}

// Helper: obtiene ingresos y gastos del último período
function getLatestPeriodMetrics(period: PeriodData) {
  const ingresos = (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);

  // Gastos fijos
  const gastosFijosArr = Object.values(period.data.gastosFijos || {}) as any[];
  const gastosFijos = gastosFijosArr.reduce((sum, exp) => sum + (exp.monto || 0), 0);

  // Gastos variables
  const gastosVariablesArr = (period.data.gastosVariables || []) as any[];
  const gastosVariables = gastosVariablesArr.reduce((sum, exp) => sum + (exp.monto || 0), 0);

  // Desglose por categoría
  const categoriaMap = new Map<string, number>();
  gastosFijosArr.forEach(exp => {
    const cat = exp.categoria?.nombre || "Otros";
    categoriaMap.set(cat, (categoriaMap.get(cat) || 0) + (exp.monto || 0));
  });
  gastosVariablesArr.forEach(exp => {
    const cat = exp.categoria?.nombre || "Otros";
    categoriaMap.set(cat, (categoriaMap.get(cat) || 0) + (exp.monto || 0));
  });

  return {
    ingresos,
    gastosFijos,
    gastosVariables,
    totalGastos: gastosFijos + gastosVariables,
    categorias: Array.from(categoriaMap.entries()).map(([category, amount]) => ({ category, amount })),
  };
}

// Main function: pronóstico realista para el próximo mes
export function generateFinancialForecast(periods: PeriodData[], forecastMonths: number): ForecastData {
  if (!periods || periods.length === 0) {
    return createDefaultForecast(forecastMonths);
  }

  // Solo usamos el último período para la proyección mensual
  const latestPeriod = periods[0];
  const metrics = getLatestPeriodMetrics(latestPeriod);

  // Saldo estimado = ingresos - gastos
  const endOfMonthBalance = metrics.ingresos - metrics.totalGastos;

  // Rango esperado: ±20% del saldo estimado
  const minExpectedBalance = endOfMonthBalance * 0.8;
  const maxExpectedBalance = endOfMonthBalance * 1.2;

  // Tasa de ahorro: % de ingresos que queda después de gastos
  const savingsRate = metrics.ingresos > 0 ? ((metrics.ingresos - metrics.totalGastos) / metrics.ingresos) * 100 : 0;

  // Reserva de efectivo: días que puedes cubrir con tu saldo actual
  const cashRunway = metrics.totalGastos > 0 ? (endOfMonthBalance / metrics.totalGastos) * 30 : 0;

  // Desglose de gastos por categoría (solo último mes)
  const projectedExpenses = metrics.categorias.map(cat => ({
    category: cat.category,
    amount: cat.amount,
    trend: "stable" as const, // Solo último mes, no calculamos tendencia
    percentageOfIncome: metrics.ingresos > 0 ? (cat.amount / metrics.ingresos) * 100 : 0,
  }));

  // Nivel de confianza: alto si hay datos, bajo si no
  const confidenceScore = periods.length >= 3 ? 90 : 50;

  // Factores de confianza
  const confidenceFactors: { name: string; impact: "positive" | "negative" | "neutral"; description: string; }[] = [
    {
      name: "Datos del último mes",
      impact: "positive",
      description: "El pronóstico se basa en tus datos más recientes.",
    },
    {
      name: "Histórico disponible",
      impact: periods.length >= 6 ? "positive" : "neutral",
      description: periods.length >= 6
        ? `Tienes ${periods.length} meses de historial.`
        : `Solo ${periods.length} meses de historial.`,
    },
  ];

  // Recomendaciones
  const recommendations: string[] = [];
  if (savingsRate < 0) {
    recommendations.push("Advertencia: Estás gastando más de lo que ingresas. Revisa tus gastos y ajusta tu presupuesto.");
  } else if (savingsRate < 20) {
    recommendations.push("Intenta ahorrar al menos el 20% de tus ingresos.");
  } else {
    recommendations.push("¡Buen trabajo! Estás ahorrando una buena parte de tus ingresos.");
  }
  if (cashRunway < 30) {
    recommendations.push("Tu reserva de efectivo es baja. Intenta aumentar tu saldo disponible.");
  }

  return {
    endOfMonthBalance,
    minExpectedBalance,
    maxExpectedBalance,
    savingsRate,
    cashRunway,
    projectedExpenses,
    confidenceScore,
    confidenceFactors,
    recommendations,
  };
}

// Create default forecast when no data is available
function createDefaultForecast(forecastMonths: number): ForecastData {
  return {
    endOfMonthBalance: 0,
    minExpectedBalance: 0,
    maxExpectedBalance: 0,
    savingsRate: 0,
    cashRunway: 0,
    projectedExpenses: [],
    confidenceScore: 0,
    confidenceFactors: [{
      name: "Datos insuficientes",
      impact: "negative",
      description: "No hay suficientes datos históricos para generar un pronóstico preciso"
    }],
    recommendations: ["Agrega más datos históricos para obtener un pronóstico más preciso"]
  };
}

// Function to calculate expense trends
function calculateExpenseTrends(data: { amounts: number[], isFixedExpense: boolean }, isRecurring: boolean) {
  const averageAmount = data.amounts.reduce((sum, val) => sum + val, 0) / data.amounts.length;

  return [{
    name: '',
    amounts: data.amounts,
    isFixedExpense: data.isFixedExpense
  }].map(({ name, amounts, isFixedExpense }) => {
    let trend = 0;
    const n = amounts.length;
    if (n >= 2) {
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      const logAmounts = amounts.map(amount => Math.log(Math.max(0.01, amount)));
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += logAmounts[i];
        sumXY += i * logAmounts[i];
        sumX2 += i * i;
      }
      const numerator = n * sumXY - sumX * sumY;
      const denominator = n * sumX2 - sumX * sumX;
      if (denominator !== 0) {
        const slope = numerator / denominator;
        trend = Math.exp(slope) - 1;
        trend = Math.max(-0.5, Math.min(0.5, trend));
        if (n > 3) {
          const recentTrends: number[] = [];
          for (let i = Math.max(0, n - 4); i < n - 1; i++) {
            const change = (amounts[i] - amounts[i + 1]) / Math.max(amounts[i + 1], 1);
            recentTrends.push(change);
          }
          const avgRecentTrend = recentTrends.length > 0 ? recentTrends.reduce((a, b) => a + b, 0) / recentTrends.length : 0;
          trend = (trend + avgRecentTrend) / 2;
        }
        if (isFixedExpense) {
          if (isRecurring) {
            trend = trend * 0.1;
          } else {
            trend = trend * 0.3;
          }
        } else {
          trend = Math.max(-0.3, Math.min(0.3, trend));
        }
      }
    }
    return {
      name,
      averageAmount,
      trend,
      isFixedExpense
    };
  }).sort((a, b) => b.averageAmount - a.averageAmount);
}

/**
 * Calcula la tendencia general de una serie de valores
 * @returns Porcentaje de cambio promedio
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  let changes = 0;
  for (let i = 0; i < values.length - 1; i++) {
    changes += (values[i] - values[i + 1]) / values[i + 1];
  }
  return changes / (values.length - 1);
}

/**
 * Calcula la variabilidad (coeficiente de variación) de una serie de valores
 */
function calculateVariability(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean;
}

/**
 * Determina el tipo de tendencia basado en el valor numérico
 */
function determineTrendType(trendValue: number): 'increasing' | 'stable' | 'decreasing' {
  if (trendValue > 0.03) return 'increasing';
  if (trendValue < -0.03) return 'decreasing';
  return 'stable';
}

/**
 * Verifica si el nombre de categoría corresponde a un gasto fijo recurrente
 * que normalmente no cambia de un mes a otro (alquiler, expensas, etc.)
 */
function isRecurringFixedExpense(categoryName: string): boolean {
  const lowerCaseName = categoryName.toLowerCase();
  const recurringFixedCategories = [
    'alquiler', 'renta', 'expensa', 'hipoteca', 'préstamo', 'prestamo',
    'seguro', 'internet', 'wifi', 'teléfono', 'telefono', 'móvil', 'movil',
    'cable', 'streaming', 'netflix', 'spotify'
  ];
  return recurringFixedCategories.some(category => lowerCaseName.includes(category));
}

/**
 * Crea una predicción predeterminada cuando no hay suficientes datos
 */
function createDefaultPrediction(forecastMonths: number): Prediction {
  const baseAmount = 350000;
  const months = forecastMonths === 1 ? 1 : forecastMonths === 3 ? 3 : 6;
  return {
    endOfMonthBalance: baseAmount * months,
    confidenceScore: 0.5,
    potentialSavings: baseAmount * months * 0.15,
    projectedExpenses: [
      { category: 'Alimentos', amount: 120000 * months, trend: 'stable', percentageOfIncome: 30 },
      { category: 'Transporte', amount: 80000 * months, trend: 'increasing', percentageOfIncome: 20 },
      { category: 'Entretenimiento', amount: 60000 * months, trend: 'decreasing', percentageOfIncome: 15 }
    ],
    confidenceFactors: [
      {
        name: 'Datos limitados',
        impact: 'negative',
        description: 'No hay suficientes datos históricos para una predicción precisa'
      }
    ],
    recommendations: [
      'Considera agregar más datos históricos para mejorar la precisión de las predicciones',
      'Revisa tus gastos regularmente para mantener un control financiero adecuado'
    ]
  };
}
