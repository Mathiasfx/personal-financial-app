import { Finanzas } from "@/models/finanzas.model";

export interface PeriodData {
  id: string;
  data: Finanzas;
}

export interface IncomeVsExpenseData {
  periodo: string;
  ingresos: number;
  gastos: number;
  disponible: number;
}

export interface CategoryData {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface TrendData {
  periodo: string;
  disponible: number;
  cambio: number; // Cambio respecto al período anterior
}

export interface FixedExpenseIncreaseData {
  periodo: string;
  totalGastosFijos: number;
  incrementoPorcentual: number;
  categoriasMasAfectadas: {
    categoria: string;
    montoAnterior: number;
    montoActual: number;
    incrementoPorcentual: number;
  }[];
}

/**
 * Procesa los datos de períodos para generar estadísticas de ingresos vs gastos
 */
export const processIncomeVsExpenseData = (periods: PeriodData[]): IncomeVsExpenseData[] => {
  return periods.map(period => {
    const { data } = period;
    
    // Calcular total de gastos fijos
    const totalGastosFijos = Object.values(data.gastosFijos || {}).reduce(
      (sum, gasto) => sum + (gasto.pagado ? gasto.monto : 0),
      0
    );
    
    // Calcular total de gastos variables
    const totalGastosVariables = (data.gastosVariables || []).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );
    
    const totalIngresos = (data.ingresos || 0) + (data.ingresosExtras || 0);
    const totalGastos = totalGastosFijos + totalGastosVariables + (data.inversiones || 0);
    const disponible = totalIngresos - totalGastos;
    
    return {
      periodo: period.id,
      ingresos: totalIngresos,
      gastos: totalGastos,
      disponible
    };
  });
};

/**
 * Procesa los datos para generar estadísticas por categoría
 */
export const processCategoryData = (periods: PeriodData[]): CategoryData[] => {
  const categoryTotals: Record<string, number> = {};
  let totalGastos = 0;
  
  periods.forEach(period => {
    const { data } = period;
    
    // Procesar gastos variables
    (data.gastosVariables || []).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
        totalGastos += gasto.monto;
      }
    });
      // Procesar gastos fijos (incluir todos, independientemente del estado de pago)
    Object.values(data.gastosFijos || {}).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        categoryTotals[categoria] = (categoryTotals[categoria] || 0) + gasto.monto;
        totalGastos += gasto.monto;
      }
    });
  });
  
  // Convertir a array y calcular porcentajes
  return Object.entries(categoryTotals)
    .map(([categoria, monto]) => ({
      categoria,
      monto,
      porcentaje: totalGastos > 0 ? (monto / totalGastos) * 100 : 0
    }))
    .sort((a, b) => b.monto - a.monto); // Ordenar por monto descendente
};

/**
 * Procesa los datos para generar tendencias de dinero disponible
 */
export const processTrendData = (periods: PeriodData[]): TrendData[] => {
  const incomeExpenseData = processIncomeVsExpenseData(periods);
  
  return incomeExpenseData.map((current, index) => {
    const previous = incomeExpenseData[index + 1]; // El anterior en el tiempo
    const cambio = previous ? current.disponible - previous.disponible : 0;
    
    return {
      periodo: current.periodo,
      disponible: current.disponible,
      cambio
    };
  });
};

/**
 * Calcula métricas clave del período
 */
export const calculateKeyMetrics = (periods: PeriodData[]) => {
  if (periods.length === 0) {
    return {
      promedioIngresos: 0,
      promedioGastos: 0,
      promedioDisponible: 0,
      mejorMes: null,
      peorMes: null,
      categoriaMasGastada: null,
      tendenciaGeneral: 'neutral' as 'up' | 'down' | 'neutral'
    };
  }
  
  const data = processIncomeVsExpenseData(periods);
  const categoryData = processCategoryData(periods);
  
  // Promedios
  const promedioIngresos = data.reduce((sum, d) => sum + d.ingresos, 0) / data.length;
  const promedioGastos = data.reduce((sum, d) => sum + d.gastos, 0) / data.length;
  const promedioDisponible = data.reduce((sum, d) => sum + d.disponible, 0) / data.length;
  
  // Mejor y peor mes
  const mejorMes = data.reduce((best, current) => 
    current.disponible > best.disponible ? current : best
  );
  const peorMes = data.reduce((worst, current) => 
    current.disponible < worst.disponible ? current : worst
  );
  
  // Categoría más gastada
  const categoriaMasGastada = categoryData[0] || null;
  
  // Tendencia general (comparando primeros y últimos 2 meses)
  let tendenciaGeneral: 'up' | 'down' | 'neutral' = 'neutral';
  if (data.length >= 4) {
    const primeros2 = data.slice(-2).reduce((sum, d) => sum + d.disponible, 0) / 2;
    const ultimos2 = data.slice(0, 2).reduce((sum, d) => sum + d.disponible, 0) / 2;
    
    if (ultimos2 > primeros2 * 1.05) tendenciaGeneral = 'up';
    else if (ultimos2 < primeros2 * 0.95) tendenciaGeneral = 'down';
  }
  
  return {
    promedioIngresos,
    promedioGastos,
    promedioDisponible,
    mejorMes,
    peorMes,
    categoriaMasGastada,
    tendenciaGeneral
  };
};

/**
 * Procesa los datos para mostrar el incremento porcentual de gastos fijos mes a mes
 */
export const processFixedExpenseIncreaseData = (periods: PeriodData[]): FixedExpenseIncreaseData[] => {
  if (periods.length < 2) return [];

  // Ordenar períodos cronológicamente (más antiguo primero)
  const sortedPeriods = [...periods].sort((a, b) => a.id.localeCompare(b.id));
  const result: FixedExpenseIncreaseData[] = [];

  for (let i = 1; i < sortedPeriods.length; i++) {
    const currentPeriod = sortedPeriods[i];
    const previousPeriod = sortedPeriods[i - 1];

    // Calcular total de gastos fijos del período actual
    const currentFixedExpenses = Object.values(currentPeriod.data.gastosFijos || {}).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );

    // Calcular total de gastos fijos del período anterior
    const previousFixedExpenses = Object.values(previousPeriod.data.gastosFijos || {}).reduce(
      (sum, gasto) => sum + gasto.monto,
      0
    );

    // Calcular incremento porcentual general
    const incrementoPorcentual = previousFixedExpenses > 0 
      ? ((currentFixedExpenses - previousFixedExpenses) / previousFixedExpenses) * 100 
      : 0;

    // Analizar incrementos por categoría
    const categoryIncreases: { [key: string]: { anterior: number; actual: number } } = {};

    // Procesar gastos fijos actuales
    Object.values(currentPeriod.data.gastosFijos || {}).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        if (!categoryIncreases[categoria]) {
          categoryIncreases[categoria] = { anterior: 0, actual: 0 };
        }
        categoryIncreases[categoria].actual += gasto.monto;
      }
    });

    // Procesar gastos fijos anteriores
    Object.values(previousPeriod.data.gastosFijos || {}).forEach(gasto => {
      if (gasto.categoria?.nombre) {
        const categoria = gasto.categoria.nombre;
        if (!categoryIncreases[categoria]) {
          categoryIncreases[categoria] = { anterior: 0, actual: 0 };
        }
        categoryIncreases[categoria].anterior += gasto.monto;
      }
    });

    // Calcular las categorías más afectadas
    const categoriasMasAfectadas = Object.entries(categoryIncreases)
      .map(([categoria, { anterior, actual }]) => ({
        categoria,
        montoAnterior: anterior,
        montoActual: actual,
        incrementoPorcentual: anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0
      }))
      .filter(item => item.incrementoPorcentual > 0) // Solo mostrar aumentos
      .sort((a, b) => b.incrementoPorcentual - a.incrementoPorcentual) // Ordenar por mayor incremento
      .slice(0, 5); // Top 5 categorías más afectadas

    result.push({
      periodo: currentPeriod.id,
      totalGastosFijos: currentFixedExpenses,
      incrementoPorcentual,
      categoriasMasAfectadas
    });
  }

  // Retornar los datos más recientes primero
  return result.reverse();
};
