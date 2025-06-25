import { PeriodData } from "./statisticsService";

export interface Prediction {
  endOfMonthBalance: number;
  confidenceScore: number;
  potentialSavings: number;
  projectedExpenses: {
    category: string;
    amount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }[];
  riskAreas: {
    name: string;
    risk: 'high' | 'medium' | 'low';
    explanation: string;
  }[];
}

/**
 * Genera una predicción financiera basada en datos históricos
 * @param periodData Datos de períodos anteriores
 * @param forecastMonths Número de meses a predecir (1, 3, o 6)
 * @returns Una predicción financiera
 */
export function generateFinancialForecast(periodData: PeriodData[], forecastMonths: number): Prediction {
  // Si no hay suficientes datos, retornar una predicción con confianza baja
  if (periodData.length < 3) {
    return createDefaultPrediction(forecastMonths);
  }

  // Ordenamos los períodos del más reciente al más antiguo
  const sortedPeriods = [...periodData].sort((a, b) => b.id.localeCompare(a.id));

  // Calcular tendencias de gastos e ingresos
  const incomeTrend = calculateTrend(sortedPeriods.map(p => 
    (p.data.ingresos || 0) + (p.data.ingresosExtras || 0)
  ));
  
  // Obtener la media de ingresos de los últimos 3 períodos
  const averageIncome = sortedPeriods
    .slice(0, Math.min(3, sortedPeriods.length))
    .reduce((sum, period) => 
      sum + ((period.data.ingresos || 0) + (period.data.ingresosExtras || 0)),
      0
    ) / Math.min(3, sortedPeriods.length);
    
  // Verificar si hay ingresos recurrentes en el período más reciente
  const latestPeriod = sortedPeriods[0];
  const hasRecurringIncome = latestPeriod.data.ingresos && latestPeriod.data.ingresos > 0;
  
  // Proyectar ingresos futuros
  // Si hay ingresos recurrentes, multiplicamos por el número de meses para proyectar correctamente
  let projectedIncome;
  
  if (hasRecurringIncome) {
    // Para ingresos recurrentes, multiplicamos por el número de meses y aplicamos un ligero ajuste por tendencia
    const baseIncome = latestPeriod.data.ingresos || 0;
    const extraIncome = sortedPeriods
      .slice(0, Math.min(3, sortedPeriods.length))
      .reduce((sum, period) => sum + (period.data.ingresosExtras || 0), 0) 
      / Math.min(3, sortedPeriods.length);
      
    // Los ingresos fijos se multiplican por el número de meses de la proyección
    // Los ingresos extras se proyectan basados en la tendencia
    projectedIncome = (baseIncome * forecastMonths) + (extraIncome * (1 + incomeTrend * forecastMonths));
  } else {
    // Si no hay patrón de ingresos recurrentes, usamos el método anterior
    projectedIncome = averageIncome * (1 + incomeTrend * forecastMonths);
  }
  
  // Analizar gastos por categoría y sus tendencias
  const categoryExpenseTrends = analyzeExpenseTrends(sortedPeriods);
  
  // Proyectar gastos futuros
  const projectedExpenses = categoryExpenseTrends.map(category => {
    let projectedAmount;
    
    // Si es un gasto fijo conocido como "Alquiler" o contiene "expensas", tratarlo como fijo sin tendencia
    if (category.isFixedExpense && isRecurringFixedExpense(category.name)) {
      // Para gastos fijos recurrentes (alquiler, expensas, etc.), multiplicar el último valor conocido por los meses
      // Pero mantener el mismo valor para cada mes, sin aplicar tendencia
      // Esto asume que estos gastos no cambian de mes a mes en un horizonte de predicción corto
      projectedAmount = category.averageAmount * forecastMonths;
    } else if (category.isFixedExpense) {
      // Para otros gastos fijos, aplicar una tendencia reducida
      projectedAmount = category.averageAmount * forecastMonths * (1 + (category.trend * 0.5));
    } else {
      // Para gastos variables, aplicar la tendencia completa
      projectedAmount = category.averageAmount * (1 + (category.trend * forecastMonths));
    }
    
    return {
      category: category.name,
      amount: projectedAmount,
      trend: determineTrendType(category.trend)
    };
  });
  
  // Calcular total de gastos proyectados
  const totalProjectedExpenses = projectedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calcular balance final proyectado
  let projectedBalance = projectedIncome - totalProjectedExpenses;
  
  // Verificar si el balance proyectado es excesivamente negativo
  // Esto podría indicar un problema en los cálculos o datos muy variables
  if (projectedBalance < -averageIncome * forecastMonths) {
    // Ajustar la proyección para que no sea tan extremadamente negativa
    // Limitamos el balance negativo a como máximo el total de ingresos promedio
    const reasonableNegativeLimit = -averageIncome * forecastMonths * 0.8;
    
    if (projectedBalance < reasonableNegativeLimit) {
      // console.log(`Ajustando proyección excesivamente negativa: ${projectedBalance} → ${reasonableNegativeLimit}`);
      projectedBalance = reasonableNegativeLimit;
    }
  }
  
  // Calcular ahorros potenciales
  const potentialSavings = projectedBalance > 0 ? projectedBalance * 0.8 : 0;
  
  // Identificar áreas de riesgo
  const riskAreas = categoryExpenseTrends
    .filter(cat => cat.trend > 0.05) // Filtrar solo categorías con tendencia creciente
    .map(cat => {
      const risk = cat.trend > 0.15 ? 'high' : cat.trend > 0.1 ? 'medium' : 'low';
      const percentIncrease = Math.round(cat.trend * 100);
      return {
        name: cat.name,
        risk: risk as 'high' | 'medium' | 'low',
        explanation: `${cat.name} muestra un incremento del ${percentIncrease}% ${
          forecastMonths === 1 ? 'mensual' : forecastMonths === 3 ? 'trimestral' : 'semestral'
        }`
      };
    })
    .sort((a, b) => {
      // Ordenar por nivel de riesgo
      const riskValues = { 'high': 3, 'medium': 2, 'low': 1 };
      return riskValues[b.risk] - riskValues[a.risk];
    })
    .slice(0, 3); // Tomar los 3 mayores riesgos
  
  // Calcular nivel de confianza
  let confidenceScore = 0.9;
  
  // Reducir confianza basado en la cantidad de datos
  if (periodData.length < 6) confidenceScore -= 0.1;
  if (periodData.length < 4) confidenceScore -= 0.1;
  
  // Reducir confianza según horizonte de predicción
  if (forecastMonths === 3) confidenceScore -= 0.15;
  if (forecastMonths === 6) confidenceScore -= 0.25;
  
  // Reducir confianza si hay alta variabilidad
  const incomeVariability = calculateVariability(sortedPeriods.map(p => 
    (p.data.ingresos || 0) + (p.data.ingresosExtras || 0)
  ));
  
  confidenceScore -= (incomeVariability * 0.5);
  
  // Asegurar que el score esté entre 0 y 1
  confidenceScore = Math.min(1, Math.max(0, confidenceScore));
  
  return {
    endOfMonthBalance: Math.round(projectedBalance),
    confidenceScore,
    potentialSavings: Math.round(potentialSavings),
    projectedExpenses,
    riskAreas
  };
}

/**
 * Analiza las tendencias de gastos por categoría
 */
function analyzeExpenseTrends(periods: PeriodData[]): {
  name: string;
  averageAmount: number;
  trend: number; // Porcentaje de cambio por mes
  isFixedExpense: boolean; // Indica si es un gasto fijo
}[] {
  const categories: Record<string, { amounts: number[], periods: string[], isFixedExpense: boolean }> = {};
  
  // Recopilar datos de gastos por categoría
  periods.forEach(period => {
    const { data } = period;
    
    // Procesar gastos variables
    (data.gastosVariables || []).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        if (!categories[categoria]) {
          categories[categoria] = { amounts: [], periods: [], isFixedExpense: false };
        }
        categories[categoria].amounts.push(gasto.monto);
        categories[categoria].periods.push(period.id);
      }
    });
    
    // Procesar gastos fijos - Marcados como gastos fijos para tratamiento especial
    Object.values(data.gastosFijos || {}).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        if (!categories[categoria]) {
          categories[categoria] = { amounts: [], periods: [], isFixedExpense: true };
        } else {
          categories[categoria].isFixedExpense = true; // Marcar como gasto fijo si aparece en gastos fijos
        }
        categories[categoria].amounts.push(gasto.monto);
        categories[categoria].periods.push(period.id);
      }
    });
  });
  
  // Calcular tendencias
  return Object.entries(categories)
    .filter(([, data]) => data.amounts.length >= 2) // Solo categorías con datos suficientes
    .map(([name, data]) => {
      // Para gastos fijos recurrentes, usar el valor más reciente en lugar del promedio
      let averageAmount;
      const isRecurring = isRecurringFixedExpense(name);
      
      if (data.isFixedExpense && isRecurring) {
        // Para gastos recurrentes fijos, usamos el valor más reciente
        // El primer valor en el array sería el más reciente ya que ordenamos los períodos
        averageAmount = data.amounts[0];
      } else {
        // Para otros gastos, usamos el promedio
        averageAmount = data.amounts.reduce((sum, val) => sum + val, 0) / data.amounts.length;
      }
      
      let trend = 0;
      if (data.amounts.length >= 2) {
        // Calcular tendencia como porcentaje de cambio promedio
        let changes = 0;
        for (let i = 0; i < data.amounts.length - 1; i++) {
          // Evitar división por cero
          if (data.amounts[i+1] !== 0) {
            changes += (data.amounts[i] - data.amounts[i+1]) / data.amounts[i+1];
          }
        }
        trend = changes / (data.amounts.length - 1);
        
        // Para gastos fijos, moderamos o eliminamos la tendencia según el tipo
        if (data.isFixedExpense) {
          if (isRecurring) {
            // Para gastos fijos recurrentes, la tendencia es prácticamente cero
            trend = 0;
          } else {
            // Para otros gastos fijos, reducimos el impacto de la tendencia
            trend = trend * 0.5;
          }
        }
      }
      
      return {
        name,
        averageAmount,
        trend,
        isFixedExpense: data.isFixedExpense
      };
    })
    .sort((a, b) => b.averageAmount - a.averageAmount); // Ordenar por monto promedio
}

/**
 * Calcula la tendencia general de una serie de valores
 * @returns Porcentaje de cambio promedio
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  let changes = 0;
  for (let i = 0; i < values.length - 1; i++) {
    changes += (values[i] - values[i+1]) / values[i+1];
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
  
  return stdDev / mean; // Coeficiente de variación
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
      { category: 'Alimentos', amount: 120000 * months, trend: 'stable' },
      { category: 'Transporte', amount: 80000 * months, trend: 'increasing' },
      { category: 'Entretenimiento', amount: 60000 * months, trend: 'decreasing' }
    ],
    riskAreas: [
      {
        name: 'Transporte',
        risk: 'medium',
        explanation: 'Datos insuficientes para un análisis detallado'
      }
    ]
  };
}
