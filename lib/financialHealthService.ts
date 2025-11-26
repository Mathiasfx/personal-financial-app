/* eslint-disable @typescript-eslint/no-unused-vars */
import { Finanzas } from "@/models/finanzas.model";
import { PeriodData } from "./statisticsService";

export interface FinancialHealthScore {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'needs-improvement' | 'critical';
  color: string;
  factors: HealthFactor[];
  trend: 'improving' | 'stable' | 'declining';
  recommendations: HealthRecommendation[];
}

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface HealthRecommendation {
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  potentialImpact: number;
  actionable: boolean;
}

/**
 * Calcula la puntuación de salud financiera basada en múltiples factores
 * @param periods Datos de períodos financieros
 * @returns Objeto con puntuación de salud financiera y detalles relacionados
 */
export function calculateFinancialHealthScore(periods: PeriodData[]): FinancialHealthScore {
  // Verificar datos vacíos o nulos
  if (!periods || periods.length === 0) {
    return getDefaultHealthScore();
  }

  // Ordenamos los períodos del más reciente al más antiguo
  const sortedPeriods = [...periods].sort((a, b) => b.id.localeCompare(a.id));
  
  // Verificar si los datos del período más reciente están completos
  const currentPeriod = sortedPeriods[0];
  if (!currentPeriod || !currentPeriod.data) {
    return getDefaultHealthScore();
  }
  
  // Para el análisis de tendencia, necesitamos al menos 3 períodos
  const hasTrendData = sortedPeriods.length >= 3;
  
  // Calculamos factores individuales
  const factors: HealthFactor[] = [];
  let totalScore = 0;
  
  // Factor 1: Relación gastos/ingresos (30 puntos máximo)
  const expenseToIncomeFactor = calculateExpenseToIncomeFactor(currentPeriod.data);
  factors.push(expenseToIncomeFactor);
  totalScore += expenseToIncomeFactor.score;
  
  // Factor 2: Ahorro (25 puntos máximo)
  const savingsFactor = calculateSavingsFactor(currentPeriod.data);
  factors.push(savingsFactor);
  totalScore += savingsFactor.score;
  
  // Factor 3: Diversificación de gastos (15 puntos máximo)
  const diversificationFactor = calculateDiversificationFactor(currentPeriod.data);
  factors.push(diversificationFactor);
  totalScore += diversificationFactor.score;
  
  // Factor 4: Constancia de finanzas (15 puntos máximo)
  const consistencyFactor = calculateConsistencyFactor(sortedPeriods);
  factors.push(consistencyFactor);
  totalScore += consistencyFactor.score;
  
  // Factor 5: Gestión de gastos fijos (15 puntos máximo)
  const fixedExpensesFactor = calculateFixedExpensesFactor(currentPeriod.data);
  factors.push(fixedExpensesFactor);
  totalScore += fixedExpensesFactor.score;
  
  // Determinar categoría de salud financiera
  const category = getHealthCategory(totalScore);
  const color = getHealthColor(totalScore);
  
  // Calcular tendencia
  const trend = hasTrendData ? calculateTrend(sortedPeriods) : 'stable';
  
  // Generar recomendaciones personalizadas
  const recommendations = generateRecommendations(factors, currentPeriod.data);
  
  return {
    score: totalScore,
    category,
    color,
    factors,
    trend,
    recommendations
  };
}

/**
 * Calcula el factor de relación entre gastos e ingresos
 */
function calculateExpenseToIncomeFactor(data: Finanzas): HealthFactor {
  const totalIncome = (data.ingresos || 0) + (data.ingresosExtras || 0);
  const fixedExpenses = Object.values(data.gastosFijos || {}).reduce(
    (sum, gasto) => sum + gasto.monto,
    0
  );
  const variableExpenses = (data.gastosVariables || []).reduce(
    (sum, gasto) => sum + gasto.monto,
    0
  );
  const totalExpenses = fixedExpenses + variableExpenses + (data.inversiones || 0);

  const ratio = totalIncome > 0 ? totalExpenses / totalIncome : 1;

  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'critical';

  if (ratio <= 0.5) {
    score = 30;
    status = 'excellent';
  } else if (ratio <= 0.7) {
    score = 24;
    status = 'good';
  } else if (ratio <= 0.85) {
    score = 18;
    status = 'fair';
  } else if (ratio <= 1) {
    score = 10; // Penaliza más si está cerca del límite
    status = 'poor';
  } else {
    score = Math.max(0, 10 - Math.round((ratio - 1) * 40)); // Penalización más fuerte si gasta más de lo que ingresa
    status = 'critical';
  }

  return {
    name: 'Balance Ingresos/Gastos',
    score,
    maxScore: 30,
    description: `Estás utilizando ${Math.round(ratio * 100)}% de tus ingresos en gastos`,
    status
  };
}

/**
 * Calcula el factor de ahorro
 */
function calculateSavingsFactor(data: Finanzas): HealthFactor {
  const totalIncome = (data.ingresos || 0) + (data.ingresosExtras || 0);

  if (totalIncome === 0) {
    return {
      name: 'Capacidad de Ahorro',
      score: 0,
      maxScore: 25,
      description: 'No hay ingresos registrados para calcular capacidad de ahorro',
      status: 'critical'
    };
  }

  const fixedExpenses = Object.values(data.gastosFijos || {}).reduce(
    (sum, gasto) => sum + gasto.monto,
    0
  );
  const variableExpenses = (data.gastosVariables || []).reduce(
    (sum, gasto) => sum + gasto.monto,
    0
  );
  const totalExpenses = fixedExpenses + variableExpenses;

  // Solo cuenta el ahorro real disponible (no inversiones)
  const savings = totalIncome - totalExpenses;
  const savingsRate = savings / totalIncome;

  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'critical';

  if (savingsRate >= 0.25) {
    score = 25;
    status = 'excellent';
  } else if (savingsRate >= 0.15) {
    score = 20;
    status = 'good';
  } else if (savingsRate >= 0.10) {
    score = 15;
    status = 'fair';
  } else if (savingsRate >= 0.05) {
    score = 10;
    status = 'poor';
  } else if (savingsRate >= 0) {
    score = 5;
    status = 'poor';
  } else {
    score = 0;
    status = 'critical';
  }

  return {
    name: 'Capacidad de Ahorro',
    score,
    maxScore: 25,
    description: savingsRate >= 0
      ? `Ahorras ${Math.round(savingsRate * 100)}% de tus ingresos`
      : 'Tus gastos superan tus ingresos',
    status
  };
}

/**
 * Calcula el factor de diversificación de gastos
 */
function calculateDiversificationFactor(data: Finanzas): HealthFactor {
  // Extraer todos los gastos variables con su categoría
  const variableExpenses = (data.gastosVariables || []).filter(gasto => gasto.categoria?.nombre);
  
  // Extraer todos los gastos fijos con su categoría
  const fixedExpenses = Object.values(data.gastosFijos || {}).filter(gasto => gasto.categoria?.nombre);
  
  // Si no hay suficientes datos para analizar
  if (variableExpenses.length + fixedExpenses.length < 3) { // Reducido para ser más flexible
    return {
      name: 'Diversificación de Gastos',
      score: 7, // Puntuación neutral
      maxScore: 15,
      description: 'No hay suficientes datos para analizar la diversificación',
      status: 'fair'
    };
  }
  
  // Agrupar gastos por categoría
  const categoryTotals: Record<string, number> = {};
  let totalExpenses = 0;
  
  // Procesar gastos variables
  variableExpenses.forEach(gasto => {
    if (gasto.categoria?.nombre) {
      const categoria = gasto.categoria.nombre;
      categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
      totalExpenses += gasto.monto;
    }
  });
  
  // Procesar gastos fijos
  fixedExpenses.forEach(gasto => {
    if (gasto.categoria?.nombre) {
      const categoria = gasto.categoria.nombre;
      categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
      totalExpenses += gasto.monto;
    }
  });
  
  // Calcular concentración de gastos (Índice Herfindahl-Hirschman simplificado)
  // Valores más bajos indican mejor diversificación (menos concentración)
  const categoryPercentages = Object.values(categoryTotals).map(amount => 
    totalExpenses > 0 ? (amount / totalExpenses) : 0
  );
  
  const concentrationScore = categoryPercentages.reduce((sum, percentage) => sum + percentage * percentage, 0);
  
  // Interpretar la concentración: valores más bajos son mejores (mayor diversificación)
  // HHI típico: < 0.15 es diversificado, > 0.25 es concentrado
  
  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'fair';
  
  if (concentrationScore <= 0.1) {
    score = 15; // Excelente diversificación
    status = 'excellent';
  } else if (concentrationScore <= 0.15) {
    score = 12; // Buena diversificación
    status = 'good';
  } else if (concentrationScore <= 0.2) {
    score = 9; // Diversificación moderada
    status = 'fair';
  } else if (concentrationScore <= 0.3) {
    score = 6; // Poca diversificación
    status = 'poor';
  } else {
    score = 3; // Muy concentrado
    status = 'critical';
  }
  
  // Encontrar la categoría con mayor concentración
  let topCategory = '';
  let topPercentage = 0;
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) : 0;
    if (percentage > topPercentage) {
      topCategory = category;
      topPercentage = percentage;
    }
  });
  
  return {
    name: 'Diversificación de Gastos',
    score,
    maxScore: 15,
    description: topCategory 
      ? `Tu categoría principal (${topCategory}) representa el ${Math.round(topPercentage * 100)}% de tus gastos` 
      : 'Diversificación de gastos por categorías',
    status
  };
}

/**
 * Calcula el factor de consistencia financiera
 */
function calculateConsistencyFactor(periods: PeriodData[]): HealthFactor {
  // Necesitamos al menos 3 períodos para analizar la consistencia
  if (periods.length < 3) {
    return {
      name: 'Consistencia Financiera',
      score: 7, // Puntuación neutral
      maxScore: 15,
      description: 'No hay suficientes períodos para analizar la consistencia',
      status: 'fair'
    };
  }
  
  // Analizar la variación de la relación gastos/ingresos
  const expenseIncomeRatios = periods.slice(0, Math.min(6, periods.length)).map(period => {
    const data = period.data;
    const totalIncome = (data.ingresos || 0) + (data.ingresosExtras || 0);
    
    const fixedExpenses = Object.values(data.gastosFijos || {}).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );
    
    const variableExpenses = (data.gastosVariables || []).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );
    
    const totalExpenses = fixedExpenses + variableExpenses + (data.inversiones || 0);
    
    return totalIncome > 0 ? totalExpenses / totalIncome : 1;
  });
  
  // Calcular la desviación estándar de las ratios
  const mean = expenseIncomeRatios.reduce((sum, ratio) => sum + ratio, 0) / expenseIncomeRatios.length;
  const squaredDiffs = expenseIncomeRatios.map(ratio => Math.pow(ratio - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / expenseIncomeRatios.length;
  const stdDev = Math.sqrt(variance);
  
  // Coeficiente de variación (normalizado)
  const cv = mean > 0 ? stdDev / mean : stdDev;
  
  // Interpretar: menor variación es mejor
  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'fair';
  
  if (cv <= 0.05) {
    score = 15; // Excelente consistencia
    status = 'excellent';
  } else if (cv <= 0.1) {
    score = 12; // Buena consistencia
    status = 'good';
  } else if (cv <= 0.2) {
    score = 9; // Consistencia moderada
    status = 'fair';
  } else if (cv <= 0.3) {
    score = 6; // Inconsistencia moderada
    status = 'poor';
  } else {
    score = 3; // Muy inconsistente
    status = 'critical';
  }
  
  return {
    name: 'Consistencia Financiera',
    score,
    maxScore: 15,
    description: `Tu nivel de consistencia en gastos vs. ingresos es ${getConsistencyDescription(cv)}`,
    status
  };
}

/**
 * Calcula el factor de gestión de gastos fijos
 */
function calculateFixedExpensesFactor(data: Finanzas): HealthFactor {
  const totalIncome = (data.ingresos || 0) + (data.ingresosExtras || 0);
  const fixedExpenses = Object.values(data.gastosFijos || {}).reduce(
    (sum, gasto) => sum + gasto.monto,
    0
  );
  const fixedExpenseRatio = totalIncome > 0 ? fixedExpenses / totalIncome : 1;

  const totalFixedExpenseItems = Object.keys(data.gastosFijos || {}).length;
  const paidFixedExpenseItems = Object.values(data.gastosFijos || {}).filter(gasto => gasto.pagado).length;
  const paidRatio = totalFixedExpenseItems > 0 ? paidFixedExpenseItems / totalFixedExpenseItems : 1;

  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'fair';

  // Penaliza más si los gastos fijos son altos
  let ratioScore = 0;
  if (fixedExpenseRatio <= 0.3) {
    ratioScore = 7.5;
  } else if (fixedExpenseRatio <= 0.4) {
    ratioScore = 6;
  } else if (fixedExpenseRatio <= 0.5) {
    ratioScore = 4.5;
  } else if (fixedExpenseRatio <= 0.6) {
    ratioScore = 2;
  } else if (fixedExpenseRatio <= 0.7) {
    ratioScore = 0.5;
  } else {
    ratioScore = 0;
  }

  let paidScore = 0;
  if (paidRatio >= 0.9) {
    paidScore = 7.5;
  } else if (paidRatio >= 0.8) {
    paidScore = 6;
  } else if (paidRatio >= 0.7) {
    paidScore = 4.5;
  } else if (paidRatio >= 0.6) {
    paidScore = 2;
  } else if (paidRatio >= 0.5) {
    paidScore = 0.5;
  } else {
    paidScore = 0;
  }

  score = ratioScore + paidScore;

  if (score >= 12) {
    status = 'excellent';
  } else if (score >= 9) {
    status = 'good';
  } else if (score >= 6) {
    status = 'fair';
  } else if (score >= 3) {
    status = 'poor';
  } else {
    status = 'critical';
  }

  return {
    name: 'Gestión de Gastos Fijos',
    score,
    maxScore: 15,
    description: `Los gastos fijos representan ${Math.round(fixedExpenseRatio * 100)}% de tus ingresos con ${Math.round(paidRatio * 100)}% pagados`,
    status
  };
}

/**
 * Determina la categoría de salud financiera según la puntuación total
 */
function getHealthCategory(score: number): 'excellent' | 'good' | 'fair' | 'needs-improvement' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needs-improvement';
  return 'critical';
}

/**
 * Devuelve el color asociado a la puntuación de salud financiera
 */
function getHealthColor(score: number): string {
  if (score >= 85) return '#10B981'; // Excelente - Verde
  if (score >= 70) return '#22D3EE'; // Bueno - Azul claro
  if (score >= 55) return '#FBBF24'; // Regular - Amarillo
  if (score >= 40) return '#F97316'; // Necesita mejoras - Naranja
  return '#EF4444'; // Crítico - Rojo
}

/**
 * Calcula la tendencia de la salud financiera
 */
function calculateTrend(periods: PeriodData[]): 'improving' | 'stable' | 'declining' {
  if (periods.length < 3) return 'stable';
  
  // Usar los últimos 3 períodos para determinar la tendencia
  const recentPeriods = periods.slice(0, 3);
  
  // Verificar si algún período tiene ingresos en cero
  const hasZeroIncome = recentPeriods.some(period => {
    const totalIncome = (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
    return totalIncome === 0;
  });
  
  if (hasZeroIncome) return 'stable'; // No podemos determinar tendencia con ingresos en cero
  
  // Calcular puntuación simplificada para cada período
  const scores = recentPeriods.map(period => {
    const data = period.data;
    
    // Ratio gastos/ingresos (simple)
    const totalIncome = (data.ingresos || 0) + (data.ingresosExtras || 0);
    
    const fixedExpenses = Object.values(data.gastosFijos || {}).reduce(
      (sum, gasto) => sum + gasto.monto, 0
    );
    
    const variableExpenses = (data.gastosVariables || []).reduce(
      (sum, gasto) => sum + gasto.monto, 0
    );
    
    const totalExpenses = fixedExpenses + variableExpenses;
    const ratio = totalExpenses / totalIncome;
    
    // Una puntuación simplificada (mejor cuando es menor)
    return ratio;
  });
  
  // Determinar la tendencia (recordar que scores[0] es el más reciente)
  const recentChange = scores[0] - scores[1];
  const previousChange = scores[1] - scores[2];
  
  // Si ambos cambios son negativos (mejora) o el cambio reciente es significativamente mejor
  if ((recentChange < 0 && previousChange < 0) || recentChange < -0.05) {
    return 'improving';
  }
  
  // Si ambos cambios son positivos (empeora) o el cambio reciente es significativamente peor
  if ((recentChange > 0 && previousChange > 0) || recentChange > 0.05) {
    return 'declining';
  }
  
  // De otra manera, consideramos estable
  return 'stable';
}

/**
 * Genera recomendaciones personalizadas basadas en los factores de salud financiera
 */
function generateRecommendations(factors: HealthFactor[], data: Finanzas): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];
  
  // Encontrar el factor con peor puntuación
  const worstFactor = [...factors].sort((a, b) => {
    const aPercentage = a.score / a.maxScore;
    const bPercentage = b.score / b.maxScore;
    return aPercentage - bPercentage;
  })[0];
  
  // Recomendación basada en el peor factor
  switch (worstFactor.name) {
    case 'Balance Ingresos/Gastos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'EXPENSE_REDUCTION',
          message: 'Tus gastos están muy cerca o superan tus ingresos. Considera reducir gastos no esenciales.',
          priority: 'high',
          potentialImpact: 0.15, // Estimado de impacto positivo
          actionable: true
        });
      }
      break;
      
    case 'Capacidad de Ahorro':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'SAVING_INCREASE',
          message: 'Tu capacidad de ahorro es baja. Intenta establecer una meta de ahorro de al menos 10% de tus ingresos.',
          priority: 'high',
          potentialImpact: 0.1,
          actionable: true
        });
      }
      break;
      
    case 'Diversificación de Gastos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'DIVERSIFICATION',
          message: 'Tus gastos están muy concentrados en pocas categorías. Revisa si puedes optimizar estos gastos principales.',
          priority: 'medium',
          potentialImpact: 0.07,
          actionable: true
        });
      }
      break;
      
    case 'Consistencia Financiera':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'CONSISTENCY',
          message: 'La variabilidad en tus gastos es alta. Considera establecer un presupuesto más estricto para tener mayor previsibilidad.',
          priority: 'medium',
          potentialImpact: 0.08,
          actionable: true
        });
      }
      break;
      
    case 'Gestión de Gastos Fijos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'FIXED_EXPENSES',
          message: 'Tus gastos fijos son altos en relación a tus ingresos o tienes varios pendientes de pago. Prioriza estos pagos y evalúa reducir compromisos fijos.',
          priority: 'high',
          potentialImpact: 0.12,
          actionable: true
        });
      }
      break;
  }
  
  // Recomendaciones adicionales basadas en análisis específicos
  
  // 1. Alto porcentaje de gastos en una sola categoría
  const variableExpenses = (data.gastosVariables || []);
  if (variableExpenses.length > 3) { // Reducido el umbral para generar recomendaciones más útiles
    // Agrupar por categoría
    const categoryTotals: Record<string, number> = {};
    let totalVariableExpenses = 0;
    
    variableExpenses.forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
        totalVariableExpenses += gasto.monto;
      }
    });
    
    // Encontrar categoría con mayor gasto
    let topCategory = '';
    let topAmount = 0;
    
    Object.entries(categoryTotals).forEach(([categoria, amount]) => {
      if (amount > topAmount) {
        topCategory = categoria;
        topAmount = amount;
      }
    });
    
    // Si una sola categoría representa más del 35% de los gastos variables
    if (topCategory && totalVariableExpenses > 0 && (topAmount / totalVariableExpenses) > 0.35) {
      recommendations.push({
        type: 'CATEGORY_OPTIMIZATION',
        message: `La categoría "${topCategory}" representa un alto porcentaje de tus gastos variables (${Math.round(topAmount / totalVariableExpenses * 100)}%). Explora opciones para optimizar este gasto.`,
        priority: 'medium',
        potentialImpact: 0.08,
        actionable: true
      });
    }
  }
  
  // 2. Gastos fijos impagos
  const unpaidFixedExpenses = Object.values(data.gastosFijos || {}).filter(gasto => !gasto.pagado);
  if (unpaidFixedExpenses.length >= 2) {
    recommendations.push({
      type: 'PAYMENT_PRIORITY',
      message: `Tienes ${unpaidFixedExpenses.length} gastos fijos sin pagar. Establece un plan para ponerte al día con estos pagos pendientes.`,
      priority: 'high',
      potentialImpact: 0.1,
      actionable: true
    });
  }
  
  return recommendations;
}

/**
 * Retorna una descripción basada en el coeficiente de variación
 */
function getConsistencyDescription(cv: number): string {
  if (cv <= 0.05) return 'excelente';
  if (cv <= 0.1) return 'bueno';
  if (cv <= 0.2) return 'moderado';
  if (cv <= 0.3) return 'bajo';
  return 'muy bajo';
}

/**
 * Retorna un objeto de puntuación de salud financiera por defecto
 */
function getDefaultHealthScore(): FinancialHealthScore {
  return {
    score: 50,
    category: 'fair',
    color: '#FBBF24',
    factors: [
      {
        name: 'Balance Ingresos/Gastos',
        score: 15,
        maxScore: 30,
        description: 'No hay datos suficientes para análisis',
        status: 'fair'
      },
      {
        name: 'Capacidad de Ahorro',
        score: 12,
        maxScore: 25,
        description: 'No hay datos suficientes para análisis',
        status: 'fair'
      },
      {
        name: 'Diversificación de Gastos',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para análisis',
        status: 'fair'
      },
      {
        name: 'Consistencia Financiera',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para análisis',
        status: 'fair'
      },
      {
        name: 'Gestión de Gastos Fijos',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para análisis',
        status: 'fair'
      }
    ],
    trend: 'stable',
    recommendations: [
      {
        type: 'DATA_COLLECTION',
        message: 'Registra al menos un período completo de datos financieros para obtener un análisis personalizado.',
        priority: 'high',
        potentialImpact: 0.2,
        actionable: true
      }
    ]
  };
}
