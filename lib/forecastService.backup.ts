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

// Helper function to calculate average income
export function calculateAverageIncome(periods: PeriodData[]): number {
  if (!periods.length) return 0;
  const total = periods.reduce((sum, period) => {
    return sum + (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
  }, 0);
  return total / periods.length;

// Helper function to calculate expense breakdown
function calculateExpenseBreakdown(periods: PeriodData[], forecastMonths: number, avgIncome: number) {
  const categories = new Map<string, {amount: number, count: number, trend: number}>();
  
  periods.forEach(period => {
    // Process fixed expenses
    Object.values(period.data.gastosFijos || {}).forEach(expense => {
      const category = expense.categoria?.nombre || 'Otros';
      const entry = categories.get(category) || { amount: 0, count: 0, trend: 0 };
      entry.amount += expense.monto || 0;
      entry.count++;
      categories.set(category, entry);
    });
    
    // Process variable expenses
 // Process variable expenses
(period.data.gastosVariables || []).forEach(expense => {
  const category = expense.categoria?.nombre || 'Otros';  
  const entry = categories.get(category) || { amount: 0, count: 0, trend: 0 };
  entry.amount += expense.monto || 0;
  entry.count++;
  categories.set(category, entry);
});
  });
  
  // Calculate averages and trends
  return Array.from(categories.entries()).map(([category, data]) => {
    const avgAmount = data.amount / Math.max(1, data.count) * forecastMonths;
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

// Helper function to calculate current balance
function calculateCurrentBalance(period: PeriodData): number {
  const income = (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
  const fixedExpenses = Object.values(period.data.gastosFijos || {}).reduce(
    (sum, exp) => sum + (exp.monto || 0), 0
  );
  const variableExpenses = (period.data.gastosVariables || []).reduce(
    (sum, exp) => sum + (exp.monto || 0), 0
  );
  return income - fixedExpenses - variableExpenses;

// Helper function to calculate cash runway in days
function calculateCashRunway(currentBalance: number, totalExpenses: number, months: number): number {
  const avgMonthlyExpense = totalExpenses / months;
  return avgMonthlyExpense > 0 ? (currentBalance / avgMonthlyExpense) * 30 : 0;

// Helper function to calculate confidence score (0-1)
function calculateConfidenceScore(periods: PeriodData[], forecastMonths: number): number {
  // Base score based on data points
  let score = Math.min(100, periods.length * 10) / 100;
  
  // Adjust based on forecast horizon
  if (forecastMonths > 3) score *= 0.9;
  if (forecastMonths > 6) score *= 0.8;
  
  // Adjust based on income consistency
  const consistency = calculateIncomeConsistency(periods);
  score = score * 0.5 + (consistency * 0.5);
  
  return Math.max(0, Math.min(1, score));

// Helper function to calculate income consistency (0-1)
function calculateIncomeConsistency(periods: PeriodData[]): number {
  if (periods.length < 2) return 0.5;
  
  const incomes = periods.map(p => (p.data.ingresos || 0) + (p.data.ingresosExtras || 0));
  const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const variance = incomes.reduce((sum, income) => sum + Math.pow(income - avgIncome, 2), 0) / incomes.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to 0-1 scale where 1 is most consistent
  return Math.max(0, 1 - (stdDev / Math.max(1, avgIncome)));

// Helper function to generate recommendations
function generateRecommendations(metrics: {
  savingsRate: number;
  cashRunway: number;
  expenseBreakdown: Array<{category: string, percentageOfIncome: number}>;
}): string[] {
  const recommendations: string[] = [];
  
  if (metrics.savingsRate < 20) {
    recommendations.push(
      `Tu tasa de ahorro es del ${metrics.savingsRate.toFixed(0)}%. Intenta ahorrar al menos el 20% de tus ingresos.`
    );
    
  if (metrics.cashRunway < 90) {
    recommendations.push(
      `Tienes efectivo para ${Math.round(metrics.cashRunway)} días. El objetivo es tener al menos 90 días de reserva.`
    );
    
  // Check for high-expense categories
  const highExpense = metrics.expenseBreakdown
    .filter(e => e.percentageOfIncome > 30)
    .sort((a, b) => b.percentageOfIncome - a.percentageOfIncome)[0];
    
  if (highExpense) {
    recommendations.push(
      `El gasto en ${highExpense.category} es alto (${highExpense.percentageOfIncome.toFixed(0)}% de tus ingresos). Considera reducirlo.`
    );
    
  return recommendations.length > 0 
    ? recommendations 
    : ["¡Buen trabajo! Tus finanzas parecen estar en buen estado."];

// Main function to generate financial forecast
export function generateFinancialForecast(periods: PeriodData[], forecastMonths: number): ForecastData {
  if (!periods || periods.length === 0) {
    return createDefaultForecast(forecastMonths);
  
  // Calculate basic metrics
  const latestPeriod = periods[0];
  const avgIncome = calculateAverageIncome(periods.slice(0, 3));
  
  // Calculate expense breakdown
  const expenseBreakdown = calculateExpenseBreakdown(periods, forecastMonths, avgIncome);
  
  // Calculate cash flow
  const projectedIncome = avgIncome * forecastMonths;
  const totalProjectedExpenses = expenseBreakdown.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate end of month balance
  const currentBalance = calculateCurrentBalance(latestPeriod);
  const endOfMonthBalance = currentBalance + projectedIncome - totalProjectedExpenses;
  
  // Calculate confidence score (0-100)
  const confidenceScore = calculateConfidenceScore(periods, forecastMonths);
  
  // Generate recommendations
  const recommendations = generateRecommendations({
    savingsRate: (projectedIncome - totalProjectedExpenses) / Math.max(1, projectedIncome) * 100,
    cashRunway: calculateCashRunway(currentBalance, totalProjectedExpenses, forecastMonths),
    expenseBreakdown
  });

  return {
    endOfMonthBalance,
    minExpectedBalance: endOfMonthBalance * 0.8,  // 20% buffer
    maxExpectedBalance: endOfMonthBalance * 1.2,  // 20% buffer
    savingsRate: Math.max(0, (projectedIncome - totalProjectedExpenses) / Math.max(1, projectedIncome) * 100),
    cashRunway: calculateCashRunway(currentBalance, totalProjectedExpenses, forecastMonths),
    projectedExpenses: expenseBreakdown,
    confidenceScore: confidenceScore * 100, // Convert to 0-100 scale
    confidenceFactors: [
      {
        name: "Datos históricos",
        impact: periods.length >= 6 ? "positive" : "negative",
        description: periods.length >= 6 
          ? `Datos suficientes (${periods.length} meses)` 
          : `Pocos datos históricos (solo ${periods.length} meses)`
      },
      {
        name: "Consistencia de ingresos",
        impact: calculateIncomeConsistency(periods) > 0.8 ? "positive" : "neutral",
        description: calculateIncomeConsistency(periods) > 0.8 
          ? "Ingresos consistentes" 
          : "Variabilidad en los ingresos"
          ],
    recommendations
  };

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

// Function to calculate expense trends
function calculateExpenseTrends(data: { amounts: number[], isFixedExpense: boolean }, isRecurring: boolean) {
  // Para otros gastos, usamos el promedio
  const averageAmount = data.amounts.reduce((sum, val) => sum + val, 0) / data.amounts.length;
  
  // Return the array after mapping and sorting
  return [{
    name: '',  // Add a default name since it's used in the return object
    amounts: data.amounts,
    isFixedExpense: data.isFixedExpense
  }].map(({ name, amounts, isFixedExpense }) => {
  
  let trend = 0;
  if (data.amounts.length >= 2) {
        // Calcular tendencia usando regresión lineal simple
        const n = data.amounts.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        // Convertir montos a logaritmo para manejar mejor los saltos grandes
        const logAmounts = data.amounts.map(amount => Math.log(Math.max(0.01, amount)));
        
        // Calcular sumatorias para la regresión
        for (let i = 0; i < n; i++) {
          sumX += i;
          sumY += logAmounts[i];
          sumXY += i * logAmounts[i];
          sumX2 += i * i;
                
        // Calcular pendiente (tendencia)
        const numerator = n * sumXY - sumX * sumY;
        const denominator = n * sumX2 - sumX * sumX;
        
        if (denominator !== 0) {
          // Convertir la pendiente a una tasa de crecimiento porcentual
          const slope = numerator / denominator;
          // Convertir a tasa de crecimiento mensual (aproximada)
          trend = Math.exp(slope) - 1;
          
          // Limitar la tendencia máxima a ±50% mensual para evitar valores extremos
          trend = Math.max(-0.5, Math.min(0.5, trend));
          
          // Suavizar la tendencia con un promedio móvil simple
          if (n > 3) {
            // Usar los últimos 3-4 períodos para una tendencia más estable
            const recentTrends = [];
            for (let i = Math.max(0, n-4); i < n-1; i++) {
              const change = (data.amounts[i] - data.amounts[i+1]) / Math.max(data.amounts[i+1], 1);
              recentTrends.push(change);
                        const avgRecentTrend = recentTrends.reduce((a, b) => a + b, 0) / recentTrends.length;
            // Promediar con la tendencia calculada previamente
            trend = (trend + avgRecentTrend) / 2;
                          
        // Ajustes específicos para tipos de gastos
        if (data.isFixedExpense) {
          if (isRecurring) {
            // Para gastos fijos recurrentes, limitar aún más la tendencia
            trend = trend * 0.1; // Muy pequeña variación permitida
          } else {
            // Para otros gastos fijos, reducir la tendencia
            trend = trend * 0.3;
                  } else {
          // Para gastos variables, limitar la tendencia máxima al 30% mensual
          trend = Math.max(-0.3, Math.min(0.3, trend));
                    
      return {
        name,
        averageAmount,
        trend,
        isFixedExpense: data.isFixedExpense
      };
    })
    .sort((a, b) => b.averageAmount - a.averageAmount); // Ordenar por monto promedio

/**
 * Calcula la tendencia general de una serie de valores
 * @returns Porcentaje de cambio promedio
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  let changes = 0;
  for (let i = 0; i < values.length - 1; i++) {
    changes += (values[i] - values[i+1]) / values[i+1];
    
  return changes / (values.length - 1);

/**
 * Calcula la variabilidad (coeficiente de variación) de una serie de valores
 */
function calculateVariability(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev / mean; // Coeficiente de variación

/**
 * Determina el tipo de tendencia basado en el valor numérico
 */
function determineTrendType(trendValue: number): 'increasing' | 'stable' | 'decreasing' {
  if (trendValue > 0.03) return 'increasing';
  if (trendValue < -0.03) return 'decreasing';
  return 'stable';

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
      { category: 'Entretenimiento', amount: 60000 * months, trend: 'decreasing', percentageOfIncome: 15     ],
    confidenceFactors: [
      {
        name: 'Datos limitados',
        impact: 'negative',
        description: 'No hay suficientes datos históricos para una predicción precisa'
          ],
    recommendations: [
      'Considera agregar más datos históricos para mejorar la precisión de las predicciones',
      'Revisa tus gastos regularmente para mantener un control financiero adecuado'
    ]
  };
