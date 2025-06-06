import { useNotification } from "@/context/NotificationContext";
import { useCallback, useMemo } from "react";

/**
 * Hook personalizado para usar notificaciones de manera más sencilla
 * Proporciona métodos helper para operaciones comunes
 */
export const useToast = () => {
  const notification = useNotification();

  /**
   * Muestra una notificación de éxito para operaciones exitosas
   */
  const success = useCallback((title: string, message?: string) => {
    notification.showSuccess(title, message);
  }, [notification]);

  /**
   * Muestra una notificación de error para errores y fallos
   */
  const error = useCallback((title: string, message?: string) => {
    notification.showError(title, message);
  }, [notification]);

  /**
   * Muestra una notificación de advertencia
   */
  const warning = useCallback((title: string, message?: string) => {
    notification.showWarning(title, message);
  }, [notification]);

  /**
   * Muestra una notificación informativa
   */
  const info = useCallback((title: string, message?: string) => {
    notification.showInfo(title, message);
  }, [notification]);
  /**
   * Helpers específicos para operaciones CRUD comunes
   */
  const crud = useMemo(() => ({
    // Operaciones exitosas
    created: (item: string = "elemento") => success("Creado", `${item} creado exitosamente`),
    updated: (item: string = "elemento") => success("Actualizado", `${item} actualizado exitosamente`),
    deleted: (item: string = "elemento") => success("Eliminado", `${item} eliminado exitosamente`),
    saved: (item: string = "elemento") => success("Guardado", `${item} guardado exitosamente`),
    
    // Operaciones con errores
    createError: (item: string = "elemento") => error("Error al crear", `No se pudo crear ${item}`),
    updateError: (item: string = "elemento") => error("Error al actualizar", `No se pudo actualizar ${item}`),
    deleteError: (item: string = "elemento") => error("Error al eliminar", `No se pudo eliminar ${item}`),
    saveError: (item: string = "elemento") => error("Error al guardar", `No se pudo guardar ${item}`),
    loadError: (item: string = "elemento") => error("Error al cargar", `No se pudo cargar ${item}`),
    
    // Validaciones
    validation: (message: string) => warning("Validación", message),
    required: (field: string) => warning("Campo requerido", `${field} es obligatorio`),
    
    // Información
    loading: (item: string = "datos") => info("Cargando", `Cargando ${item}...`),
    processing: (action: string = "acción") => info("Procesando", `Procesando ${action}...`),
  }), [success, error, warning, info]);
  /**
   * Helpers para autenticación
   */
  const auth = useMemo(() => ({
    loginSuccess: () => success("Bienvenido", "Has iniciado sesión exitosamente"),
    loginError: () => error("Error de autenticación", "Credenciales incorrectas"),
    logoutSuccess: () => info("Sesión cerrada", "Has cerrado sesión exitosamente"),
    registerSuccess: () => success("Cuenta creada", "Tu cuenta ha sido creada exitosamente"),
    registerError: () => error("Error al registrar", "No se pudo crear la cuenta"),
    sessionExpired: () => warning("Sesión expirada", "Tu sesión ha expirado. Inicia sesión nuevamente"),
  }), [success, error, info, warning]);
  /**
   * Helpers para finanzas específicas de tu app
   */
  const finance = useMemo(() => ({
    // Categorías
    categoryCreated: () => crud.created("la categoría"),
    categoryUpdated: () => crud.updated("la categoría"),
    categoryDeleted: () => crud.deleted("la categoría"),
    categoryError: () => crud.createError("la categoría"),
    
    // Gastos
    expenseAdded: () => crud.created("el gasto"),
    expenseUpdated: () => crud.updated("el gasto"),
    expenseDeleted: () => crud.deleted("el gasto"),
    expenseError: () => crud.createError("el gasto"),
    
    // Períodos
    periodCreated: () => crud.created("el período"),
    periodUpdated: () => crud.updated("el período"),
    periodDeleted: () => crud.deleted("el período"),
    
    // Validaciones específicas
    budgetExceeded: (amount: string) => warning("Presupuesto excedido", `Has excedido tu presupuesto en ${amount}`),
    insufficientFunds: () => warning("Fondos insuficientes", "No tienes suficientes fondos para esta operación"),
    invalidAmount: () => warning("Monto inválido", "El monto debe ser mayor a cero"),
  }), [crud, warning]);
  return useMemo(() => ({
    success,
    error,
    warning,
    info,
    crud,
    auth,
    finance,
    // Acceso directo al contexto completo si necesitas más control
    ...notification,
  }), [success, error, warning, info, crud, auth, finance, notification]);
};
