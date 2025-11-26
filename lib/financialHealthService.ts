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
 * Calcula la puntuaci√≥n de salud financiera basada en m√∫ltiples factores
 * @param periods Datos de per√≠odos financieros
 * @returns Objeto con puntuaci√≥n de salud financiera y detalles relacionados
 */
export function calculateFinancialHealthScore(periods: PeriodData[]): FinancialHealthScore {
  // Verificar datos vac√≠os o nulos
  if (!periods || periods.length === 0) {
    return getDefaultHealthScore();
  }

  // Ordenamos los per√≠odos del m√°s reciente al m√°s antiguo
  const sortedPeriods = [...periods].sort((a, b) => b.id.localeCompare(a.id));
  
  // Verificar si los datos del per√≠odo m√°s reciente est√°n completos
  const currentPeriod = sortedPeriods[0];
  if (!currentPeriod || !currentPeriod.data) {
    return getDefaultHealthScore();
  }
  
  // Para el an√°lisis de tendencia, necesitamos al menos 3 per√≠odos
  const hasTrendData = sortedPeriods.length >= 3;
  
  // Calculamos factores individuales
  const factors: HealthFactor[] = [];
  let totalScore = 0;
  
  // Factor 1: Relaci√≥n gastos/ingresos (30 puntos m√°ximo)
  const expenseToIncomeFactor = calculateExpenseToIncomeFactor(currentPeriod.data);
  factors.push(expenseToIncomeFactor);
  totalScore += expenseToIncomeFactor.score;
  
  // Factor 2: Ahorro (25 puntos m√°ximo)
  const savingsFactor = calculateSavingsFactor(currentPeriod.data);
  factors.push(savingsFactor);
  totalScore += savingsFactor.score;
  
  // Factor 3: Diversificaci√≥n de gastos (15 puntos m√°ximo)
  const diversificationFactor = calculateDiversificationFactor(currentPeriod.data);
  factors.push(diversificationFactor);
  totalScore += diversificationFactor.score;
  
  // Factor 4: Constancia de finanzas (15 puntos m√°ximo)
  const consistencyFactor = calculateConsistencyFactor(sortedPeriods);
  factors.push(consistencyFactor);
  totalScore += consistencyFactor.score;
  
  // Factor 5: Gesti√≥n de gastos fijos (15 puntos m√°ximo)
  const fixedExpensesFactor = calculateFixedExpensesFactor(currentPeriod.data);
  factors.push(fixedExpensesFactor);
  totalScore += fixedExpensesFactor.score;
  
  // Determinar categor√≠a de salud financiera
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
 * Calcula el factor de relaci√≥n entre gastos e ingresos
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
    score = 10; // Penaliza m√°s si est√° cerca del l√≠mite
    status = 'poor';
  } else {
    score = Math.max(0, 10 - Math.round((ratio - 1) * 40)); // Penalizaci√≥n m√°s fuerte si gasta m√°s de lo que ingresa
    status = 'critical';
  }

  return {
    name: 'Balance Ingresos/Gastos',
    score,
    maxScore: 30,
    description: `Est√°s utilizando ${Math.round(ratio * 100)}% de tus ingresos en gastos`,
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
 * Calcula el factor de diversificaci√≥n de gastos
 */
function calculateDiversificationFactor(data: Finanzas): HealthFactor {
  // Extraer todos los gastos variables con su categor√≠a
  const variableExpenses = (data.gastosVariables || []).filter(gasto => gasto.categoria?.nombre);
  
  // Extraer todos los gastos fijos con su categor√≠a
  const fixedExpenses = Object.values(data.gastosFijos || {}).filter(gasto => gasto.categoria?.nombre);
  
  // Si no hay suficientes datos para analizar
  if (variableExpenses.length + fixedExpenses.length < 3) { // Reducido para ser m√°s flexible
    return {
      name: 'Diversificaci√≥n de Gastos',
      score: 7, // Puntuaci√≥n neutral
      maxScore: 15,
      description: 'No hay suficientes datos para analizar la diversificaci√≥n',
      status: 'fair'
    };
  }
  
  // Agrupar gastos por categor√≠a
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
  
  // Calcular concentraci√≥n de gastos (√çndice Herfindahl-Hirschman simplificado)
  // Valores m√°s bajos indican mejor diversificaci√≥n (menos concentraci√≥n)
  const categoryPercentages = Object.values(categoryTotals).map(amount => 
    totalExpenses > 0 ? (amount / totalExpenses) : 0
  );
  
  const concentrationScore = categoryPercentages.reduce((sum, percentage) => sum + percentage * percentage, 0);
  
  // Interpretar la concentraci√≥n: valores m√°s bajos son mejores (mayor diversificaci√≥n)
  // HHI t√≠pico: < 0.15 es diversificado, > 0.25 es concentrado
  
  let score = 0;
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'fair';
  
  if (concentrationScore <= 0.1) {
    score = 15; // Excelente diversificaci√≥n
    status = 'excellent';
  } else if (concentrationScore <= 0.15) {
    score = 12; // Buena diversificaci√≥n
    status = 'good';
  } else if (concentrationScore <= 0.2) {
    score = 9; // Diversificaci√≥n moderada
    status = 'fair';
  } else if (concentrationScore <= 0.3) {
    score = 6; // Poca diversificaci√≥n
    status = 'poor';
  } else {
    score = 3; // Muy concentrado
    status = 'critical';
  }
  
  // Encontrar la categor√≠a con mayor concentraci√≥n
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
    name: 'Diversificaci√≥n de Gastos',
    score,
    maxScore: 15,
    description: topCategory 
      ? `Tu categor√≠a principal (${topCategory}) representa el ${Math.round(topPercentage * 100)}% de tus gastos` 
      : 'Diversificaci√≥n de gastos por categor√≠as',
    status
  };
}

/**
 * Calcula el factor de consistencia financiera
 */
function calculateConsistencyFactor(periods: PeriodData[]): HealthFactor {
  // Necesitamos al menos 3 per√≠odos para analizar la consistencia
  if (periods.length < 3) {
    return {
      name: 'Consistencia Financiera',
      score: 7, // Puntuaci√≥n neutral
      maxScore: 15,
      description: 'No hay suficientes per√≠odos para analizar la consistencia',
      status: 'fair'
    };
  }
  
  // Analizar la variaci√≥n de la relaci√≥n gastos/ingresos
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
  
  // Calcular la desviaci√≥n est√°ndar de las ratios
  const mean = expenseIncomeRatios.reduce((sum, ratio) => sum + ratio, 0) / expenseIncomeRatios.length;
  const squaredDiffs = expenseIncomeRatios.map(ratio => Math.pow(ratio - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / expenseIncomeRatios.length;
  const stdDev = Math.sqrt(variance);
  
  // Coeficiente de variaci√≥n (normalizado)
  const cv = mean > 0 ? stdDev / mean : stdDev;
  
  // Interpretar: menor variaci√≥n es mejor
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
 * Calcula el factor de gesti√≥n de gastos fijos
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

  // Penaliza m√°s si los gastos fijos son altos
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
    name: 'Gesti√≥n de Gastos Fijos',
    score,
    maxScore: 15,
    description: `Los gastos fijos representan ${Math.round(fixedExpenseRatio * 100)}% de tus ingresos con ${Math.round(paidRatio * 100)}% pagados`,
    status
  };
}

/**
 * Determina la categor√≠a de salud financiera seg√∫n la puntuaci√≥n total
 */
function getHealthCategory(score: number): 'excellent' | 'good' | 'fair' | 'needs-improvement' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needs-improvement';
  return 'critical';
}

/**
 * Devuelve el color asociado a la puntuaci√≥n de salud financiera
 */
function getHealthColor(score: number): string {
  if (score >= 85) return '#10B981'; // Excelente - Verde
  if (score >= 70) return '#22D3EE'; // Bueno - Azul claro
  if (score >= 55) return '#FBBF24'; // Regular - Amarillo
  if (score >= 40) return '#F97316'; // Necesita mejoras - Naranja
  return '#EF4444'; // Cr√≠tico - Rojo
}

/**
 * Calcula la tendencia de la salud financiera
 */
function calculateTrend(periods: PeriodData[]): 'improving' | 'stable' | 'declining' {
  if (periods.length < 3) return 'stable';
  
  // Usar los √∫ltimos 3 per√≠odos para determinar la tendencia
  const recentPeriods = periods.slice(0, 3);
  
  // Verificar si alg√∫n per√≠odo tiene ingresos en cero
  const hasZeroIncome = recentPeriods.some(period => {
    const totalIncome = (period.data.ingresos || 0) + (period.data.ingresosExtras || 0);
    return totalIncome === 0;
  });
  
  if (hasZeroIncome) return 'stable'; // No podemos determinar tendencia con ingresos en cero
  
  // Calcular puntuaci√≥n simplificada para cada per√≠odo
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
    
    // Una puntuaci√≥n simplificada (mejor cuando es menor)
    return ratio;
  });
  
  // Determinar la tendencia (recordar que scores[0] es el m√°s reciente)
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
  
  // Encontrar el factor con peor puntuaci√≥n
  const worstFactor = [...factors].sort((a, b) => {
    const aPercentage = a.score / a.maxScore;
    const bPercentage = b.score / b.maxScore;
    return aPercentage - bPercentage;
  })[0];
  
  // Recomendaci√≥n basada en el peor factor
  switch (worstFactor.name) {
    case 'Balance Ingresos/Gastos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'EXPENSE_REDUCTION',
          message: 'Tus gastos est√°n muy cerca o superan tus ingresos. Considera reducir gastos no esenciales.',
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
      
    case 'Diversificaci√≥n de Gastos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'DIVERSIFICATION',
          message: 'Tus gastos est√°n muy concentrados en pocas categor√≠as. Revisa si puedes optimizar estos gastos principales.',
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
          message: 'La variabilidad en tus gastos es alta. Considera establecer un presupuesto m√°s estricto para tener mayor previsibilidad.',
          priority: 'medium',
          potentialImpact: 0.08,
          actionable: true
        });
      }
      break;
      
    case 'Gesti√≥n de Gastos Fijos':
      if (worstFactor.status === 'critical' || worstFactor.status === 'poor') {
        recommendations.push({
          type: 'FIXED_EXPENSES',
          message: 'Tus gastos fijos son altos en relaci√≥n a tus ingresos o tienes varios pendientes de pago. Prioriza estos pagos y eval√∫a reducir compromisos fijos.',
          priority: 'high',
          potentialImpact: 0.12,
          actionable: true
        });
      }
      break;
  }
  
  // Recomendaciones adicionales basadas en an√°lisis espec√≠ficos
  
  // 1. Alto porcentaje de gastos en una sola categor√≠a
  const variableExpenses = (data.gastosVariables || []);
  if (variableExpenses.length > 3) { // Reducido el umbral para generar recomendaciones m√°s √∫tiles
    // Agrupar por categor√≠a
    const categoryTotals: Record<string, number> = {};
    let totalVariableExpenses = 0;
    
    variableExpenses.forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
        totalVariableExpenses += gasto.monto;
      }
    });
    
    // Encontrar categor√≠a con mayor gasto
    let topCategory = '';
    let topAmount = 0;
    
    Object.entries(categoryTotals).forEach(([categoria, amount]) => {
      if (amount > topAmount) {
        topCategory = categoria;
        topAmount = amount;
      }
    });
    
    // Si una sola categor√≠a representa m√°s del 35% de los gastos variables
    if (topCategory && totalVariableExpenses > 0 && (topAmount / totalVariableExpenses) > 0.35) {
      recommendations.push({
        type: 'CATEGORY_OPTIMIZATION',
        message: `La categor√≠a "${topCategory}" representa un alto porcentaje de tus gastos variables (${Math.round(topAmount / totalVariableExpenses * 100)}%). Explora opciones para optimizar este gasto.`,
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
      message: `Tienes ${unpaidFixedExpenses.length} gastos fijos sin pagar. Establece un plan para ponerte al d√≠a con estos pagos pendientes.`,
      priority: 'high',
      potentialImpact: 0.1,
      actionable: true
    });
  }
  
  return recommendations;
}

/**
 * Retorna una descripci√≥n basada en el coeficiente de variaci√≥n
 */
function getConsistencyDescription(cv: number): string {
  if (cv <= 0.05) return 'excelente';
  if (cv <= 0.1) return 'bueno';
  if (cv <= 0.2) return 'moderado';
  if (cv <= 0.3) return 'bajo';
  return 'muy bajo';
}

/**
 * Retorna un objeto de puntuaci√≥n de salud financiera por defecto
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
        description: 'No hay datos suficientes para an√°lisis',
        status: 'fair'
      },
      {
        name: 'Capacidad de Ahorro',
        score: 12,
        maxScore: 25,
        description: 'No hay datos suficientes para an√°lisis',
        status: 'fair'
      },
      {
        name: 'Diversificaci√≥n de Gastos',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para an√°lisis',
        status: 'fair'
      },
      {
        name: 'Consistencia Financiera',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para an√°lisis',
        status: 'fair'
      },
      {
        name: 'Gesti√≥n de Gastos Fijos',
        score: 7,
        maxScore: 15,
        description: 'No hay datos suficientes para an√°lisis',
        status: 'fair'
      }
    ],
    trend: 'stable',
    recommendations: [
      {
        type: 'DATA_COLLECTION',
        message: 'Registra al menos un per√≠odo completo de datos financieros para obtener un an√°lisis personalizado.',
        priority: 'high',
        potentialImpact: 0.2,
        actionable: true
      }
    ]
  };
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             wtãÄMÿ>∞N!¯#>\àîï-Qˇë>u˜™âÏ˝˘#æ™'2°O˙u©¢Zçﬂ?|ÑQ•uƒ √ñ¯Ã Õ&Eç”ëµ®Cc“ÓäîvóÈI≈ôÕ_S}”íx£ÖÈ5cQù¬Æ3Ω…°BÖA#∆•)ùGb¬ÎoªA‹4«2⁄äx∞∆íL0aı≥õQ ÛWÉÏ\bÙHnöÁ"¬"RtV‹¨\È:MZp∞L∫π·‰Äµ£Ÿ√R'∂ΩÂÙ]…ñ∏ã˛q6äîÃØ ùƒ˘v√R≈Z±Mﬂ™9o≠jıVıY?â÷>q˙{ ≥—∏Wòπ2À†OÕ¡VyÀìíöí+—"ïXÕa0W«Â·c‚?jlvÒ!tÜyScpå?,4êó†¥>CIyÕ“õ8≥º∑≈ÚÊiIõ¬z©å»s#Ø∞Ôõ~Í¡j≥¶¿ê8Ü0òÅÔPlä5<án¶Q‘uÚ\´fz‰˝/Ù·ét2CW£lF
I∞‘Î åÄïhƒ˜OÑn£%`‚x∫©åGñÁ4Ôß/Ú€P¢Ö"ùdˇKˇu’<
FÚ≈¨ôÕ`	¯p~°Â@·ä√ÁÛ2∂}€ƒ
PYƒ§¨6ò@µkl+–¯5qË#Ï6ë5¬ªIõ”√b{&d≤∆@\ˆîﬁZÓ◊ôòÂ‚™çå˛H˘L∞ÕRı≈ïmDΩU·oÏq`Ø3—Ω¡aø¿K â÷+$Àgù¿~ï?sÒ˙pÕÄ‡’è!’"OóxH˛¯v—ŒÄxøHã	«ú∞+j ]ˇˆ~	ÌQR√,≤u…≠>î^ÖXäˆ)ÒÉŒ
XÃyŸªY”ï—≥ÂIÌ,[õ: R`÷∆ıV∫kEÆŒÒ{¶4%ƒd%¬¥dﬁ™ûaÿ)%∫E'y3q*
(<Ì∞w™vósÍ ≥ﬁØ,Çf'‡.q™9„]ºX«d¯Ì„-©@nµÈjÿ ~‚/Ê◊qµbëÏeŒƒ2±2†ë?¢∞ﬂD¢ö„&fÌÔ.mûµfÕ ¨„/Cå.E˙∑–yK%{ﬁ=◊ Üú–ú¶ÉÉë$—‰Øﬂ˚Eµ?˝a
G⁄¸môÌÒçÕJÿÁ«{"`ƒ ·1ó|ä◊ÿ§≥¸¬UaïˆSÚâluáëdÓøze@æœÎÎ“l⁄Y_Ë=® ‘ËÖÓN®ü„u◊>vuk¬IDUéÅ Û="ƒÙìïÙfôtÆºÜo^Tt8~ÎŸ5õ>Váº?•A¶>É”«Ä¸¢0aáïAÉÚΩxö`&§"§CÊ˚Õ+}∂[JH‹ﬁª»qÚÀıÙ4«ÇªÔ&Ó°∑í¿¯{ºÒ=∏øﬂ:Ì¬ë;·ì∑äLŒ‘Ÿ¡ Êè,[+Û%ÿpa}Ó.÷Ê mmgmñH3$Öƒá Ë