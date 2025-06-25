import { PeriodData } from "./statisticsService";
import { Gasto } from "@/models/gasto.model";

/**
 * Interfaz para los patrones de gasto diario
 */
export interface DailySpendingPattern {
  day: number;
  amount: number;
  description: string;
}

/**
 * Interfaz para patrones por categoría
 */
export interface CategoryPattern {
  category: string;
  frequency: string;
  avgAmount: number;
  consistency: 'Alta' | 'Media' | 'Baja';
}

/**
 * Interfaz para análisis de gastos impulsivos vs planificados
 */
export interface ImpulseAnalysis {
  impulsive: {
    percentage: number;
    amount: number;
    mostCommon: string[];
  };
  planned: {
    percentage: number;
    amount: number;
    mostCommon: string[];
  };
}

/**
 * Analiza los patrones de gasto diario
 * @param periodData Datos de los períodos
 * @returns Patrones de gasto por día del mes
 */
export function analyzeDailySpendingPatterns(periodData: PeriodData[]): DailySpendingPattern[] {
  // Crear registro de gastos por día del mes
  const dayPatterns: Record<number, { totalAmount: number; count: number }> = {};
  
  // Recorrer todos los períodos
  periodData.forEach(period => {
    const { gastosVariables } = period.data;
    
    if (!gastosVariables) return;
    
    // Agrupar gastos por día del mes
    gastosVariables.forEach((gasto: Gasto) => {
      if (!gasto.fecha) return;
      
      try {
        // Extraer el día del mes de la fecha
        const date = new Date(gasto.fecha);
        const dayOfMonth = date.getDate();
        
        if (!dayPatterns[dayOfMonth]) {
          dayPatterns[dayOfMonth] = { totalAmount: 0, count: 0 };
        }
        
        dayPatterns[dayOfMonth].totalAmount += gasto.monto;
        dayPatterns[dayOfMonth].count += 1;
      } catch (error) {
        console.error('Error procesando fecha de gasto:', error);
      }
    });
  });
  
  // Crear descripciones basadas en los patrones
  const descriptions: Record<number, string> = {
    1: 'Inicio de mes - Pagos recurrentes',
    5: 'Compra de alimentos quincenales',
    10: 'Mitad de mes - Salidas de fin de semana',
    15: 'Mitad de mes - Pagos varios',
    20: 'Compra de alimentos quincenales',
    25: 'Finales de mes - Salidas de fin de semana',
    30: 'Cierre de mes - Gastos pequeños',
    31: 'Cierre de mes - Gastos pequeños'
  };
  
  // Convertir a array y ordenar por día
  return Object.entries(dayPatterns)
    .map(([day, data]) => {
      const dayNumber = parseInt(day);
      // Calcular promedio por día
      const avgAmount = data.totalAmount / data.count;
      
      // Asignar descripción o usar genérica
      let description = descriptions[dayNumber] || '';
      if (!description) {
        if (dayNumber <= 5) description = 'Inicio de mes';
        else if (dayNumber <= 10) description = 'Primera quincena';
        else if (dayNumber <= 20) description = 'Medio mes';
        else description = 'Fin de mes';
      }
      
      return {
        day: dayNumber,
        amount: Math.round(avgAmount),
        description
      };
    })
    .sort((a, b) => a.day - b.day); // Ordenar por día
}

/**
 * Analiza los patrones de gasto por categoría
 * @param periodData Datos de los períodos
 * @returns Patrones de gasto por categoría
 */
export function analyzeCategoryPatterns(periodData: PeriodData[]): CategoryPattern[] {
  // Crear registro de gastos por categoría
  interface CategoryData {
    totalAmount: number;
    occurrences: number;
    intervals: number[];
    lastDate: Date | null;
  }
  
  const categoryStats: Record<string, CategoryData> = {};
  
  // Recorrer todos los períodos para recopilar datos
  periodData.forEach(period => {
    const { gastosVariables } = period.data;
    
    if (!gastosVariables) return;
    
    // Procesar cada gasto
    gastosVariables.forEach((gasto: Gasto) => {
      if (!gasto.categoria?.nombre || !gasto.fecha) return;
      
      const categoryName = gasto.categoria.nombre;
      const date = new Date(gasto.fecha);
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          totalAmount: 0,
          occurrences: 0,
          intervals: [],
          lastDate: null
        };
      }
      
      // Actualizar estadísticas
      categoryStats[categoryName].totalAmount += gasto.monto;
      categoryStats[categoryName].occurrences += 1;
      
      // Calcular intervalo si hay fecha anterior
      if (categoryStats[categoryName].lastDate) {
        const daysDiff = Math.floor((categoryStats[categoryName].lastDate.getTime() - date.getTime()) 
          / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          categoryStats[categoryName].intervals.push(daysDiff);
        }
      }
      
      categoryStats[categoryName].lastDate = date;
    });
  });
  
  // Determinar la frecuencia basada en intervalos
  function getFrequencyDescription(intervals: number[]): string {
    if (intervals.length === 0) return 'Única vez';
    
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    if (avgInterval <= 2) return 'Diario';
    if (avgInterval <= 7) return 'Semanal';
    if (avgInterval <= 14) return 'Quincenal';
    if (avgInterval <= 31) return 'Mensual';
    return 'Ocasional';
  }
  
  // Determinar consistencia basada en variabilidad de intervalos
  function calculateConsistency(intervals: number[]): 'Alta' | 'Media' | 'Baja' {
    if (intervals.length < 2) return 'Baja';
    
    // Calcular media y desviación estándar
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Coeficiente de variación (CV)
    const cv = stdDev / mean;
    
    if (cv < 0.3) return 'Alta';
    if (cv < 0.7) return 'Media';
    return 'Baja';
  }
  
  // Convertir a array y ordenar por monto promedio
  return Object.entries(categoryStats)
    .map(([category, data]) => {
      const avgAmount = data.totalAmount / data.occurrences;
      const frequency = getFrequencyDescription(data.intervals);
      const consistency = calculateConsistency(data.intervals);
      
      return {
        category,
        frequency,
        avgAmount: Math.round(avgAmount),
        consistency
      };
    })
    .sort((a, b) => b.avgAmount - a.avgAmount)
    .slice(0, 5); // Limitar a las 5 categorías principales
}

/**
 * Analiza los gastos impulsivos vs planificados
 * @param periodData Datos de los períodos
 * @returns Análisis de gastos impulsivos
 */
export function analyzeImpulsiveSpending(periodData: PeriodData[]): ImpulseAnalysis {
  // Categorías típicamente asociadas con gastos impulsivos
  const impulsiveCategories = [
    'comida rápida', 'restaurante', 'fast food', 'snacks', 'golosinas',
    'entretenimiento', 'cine', 'juegos', 'streaming', 'suscripciones',
    'ropa', 'accesorios', 'tecnología', 'gadgets', 'aplicaciones', 
    'delivery', 'compras online'
  ];
  
  let totalImpulsiveAmount = 0;
  let totalPlannedAmount = 0;
  
  const impulsiveCategoriesCount: Record<string, number> = {};
  const plannedCategoriesCount: Record<string, number> = {};
  
  // Analizar gastos
  periodData.forEach(period => {
    const { gastosVariables } = period.data;
    const { gastosFijos } = period.data;
    
    // Gastos variables (pueden ser impulsivos o planificados)
    if (gastosVariables) {
      gastosVariables.forEach((gasto: Gasto) => {
        if (!gasto.categoria?.nombre) return;
        
        const categoryName = gasto.categoria.nombre.toLowerCase();
        
        // Verificar si la categoría es típicamente impulsiva
        const isImpulsive = impulsiveCategories.some(impCat => 
          categoryName.includes(impCat.toLowerCase())
        );
        
        if (isImpulsive) {
          totalImpulsiveAmount += gasto.monto;
          impulsiveCategoriesCount[categoryName] = (impulsiveCategoriesCount[categoryName] || 0) + 1;
        } else {
          totalPlannedAmount += gasto.monto;
          plannedCategoriesCount[categoryName] = (plannedCategoriesCount[categoryName] || 0) + 1;
        }
      });
    }
    
    // Gastos fijos (siempre son planificados)
    if (gastosFijos) {
      Object.values(gastosFijos).forEach(gasto => {
        if (gasto.categoria?.nombre) {
          const categoryName = gasto.categoria.nombre.toLowerCase();
          totalPlannedAmount += gasto.monto;
          plannedCategoriesCount[categoryName] = (plannedCategoriesCount[categoryName] || 0) + 1;
        }
      });
    }
  });
  
  // Calcular totales
  const totalAmount = totalImpulsiveAmount + totalPlannedAmount;
  
  // Evitar división por cero
  if (totalAmount === 0) {
    return {
      impulsive: { percentage: 0, amount: 0, mostCommon: [] },
      planned: { percentage: 0, amount: 0, mostCommon: [] }
    };
  }
  
  // Obtener categorías más comunes
  const mostCommonImpulsive = Object.entries(impulsiveCategoriesCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([category]) => category);
  
  const mostCommonPlanned = Object.entries(plannedCategoriesCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([category]) => category);
  
  // Calcular porcentajes
  const impulsivePercentage = Math.round((totalImpulsiveAmount / totalAmount) * 100);
  const plannedPercentage = 100 - impulsivePercentage;
  
  return {
    impulsive: {
      percentage: impulsivePercentage,
      amount: Math.round(totalImpulsiveAmount),
      mostCommon: mostCommonImpulsive
    },
    planned: {
      percentage: plannedPercentage,
      amount: Math.round(totalPlannedAmount),
      mostCommon: mostCommonPlanned
    }
  };
}
